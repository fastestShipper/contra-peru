// Game state machine + main loop coordinator
import { VIEW_W, VIEW_H, STAGES, FIXED_DT } from './config.js';
import { input, endFrameInput } from './engine/input.js';
import { camera, followPlayer, updateCamera, setBounds, addShake, resetCamera } from './engine/camera.js';
import { getSprite } from './engine/sprites.js';
import { sfx, unlockAudio, setMuted, isMuted } from './engine/audio.js';
import { updateParticles, renderParticles, clearParticles } from './engine/particles.js';
import { loadMap, map, renderMap, renderParallax } from './engine/tilemap.js';
import { player, resetPlayer, updatePlayer, renderPlayer, respawn, damagePlayer } from './entities/player.js';
import { bullets, enemyBullets, updateProjectiles, renderProjectiles, clearProjectiles } from './entities/projectiles.js';
import {
  enemies, powerups, spawnEnemy, spawnPowerup, updateEnemies, renderEnemies, clearEnemies,
  handlePlayerBulletCollisions, handleEnemyBulletCollisions, bombClear,
} from './entities/enemies.js';
import { currentBoss, spawnBoss, updateBoss, renderBoss, clearBoss, handleBossBulletCollisions } from './entities/boss.js';
import { stage1 } from './stages/stage1_lima.js';
import { renderHUD, renderBanner } from './scenes/hud.js';
import { renderTitle, renderGameOver, renderVictory, renderPause } from './scenes/menus.js';

export const STATES = { TITLE:'title', PLAYING:'playing', PAUSE:'pause', DEAD:'dead', GAME_OVER:'gameover', VICTORY:'victory' };

export const game = {
  state: STATES.TITLE,
  stateT: 0,
  stage: null,
  spawnIdx: 0,
  bannerT: 0,
  bannerTitle: '',
  bannerSub: '',
  bossTriggered: false,
};

export function goTitle() {
  game.state = STATES.TITLE; game.stateT = 0;
}

export function startStage(stageData) {
  game.stage = stageData;
  game.spawnIdx = 0;
  game.bossTriggered = false;
  clearEnemies(); clearProjectiles(); clearParticles(); clearBoss();
  loadMap(stageData);
  setBounds(map.widthPx, map.heightPx);
  resetCamera();
  resetPlayer(stageData.playerStart.x, stageData.playerStart.y);
  game.state = STATES.PLAYING;
  game.stateT = 0;
  game.bannerT = 2.2;
  game.bannerTitle = stageData.name;
  game.bannerSub = stageData.subtitle.toUpperCase();
  sfx.stageStart();
}

function updatePlaying(dt) {
  if (input.justPressed('pause')) { game.state = STATES.PAUSE; sfx.select(); return; }
  // update physics
  updatePlayer(dt);
  if (player.alive) {
    followPlayer(player.x + player.w/2, player.y + player.h/2, player.facing);
  }
  updateCamera(dt);

  // spawn triggers
  while (game.spawnIdx < game.stage.spawnScript.length &&
         camera.x >= game.stage.spawnScript[game.spawnIdx].at) {
    const s = game.stage.spawnScript[game.spawnIdx];
    if (s.kind === 'boss') {
      if (!game.bossTriggered) {
        spawnBoss(s.x, s.y);
        camera.lockLeft = game.stage.bossLockX;
        game.bossTriggered = true;
      }
    } else {
      spawnEnemy(s.kind, s.x, s.y);
    }
    game.spawnIdx++;
  }

  // bomb trigger
  if (player._bombTrigger) {
    bombClear();
    player._bombTrigger = false;
  }

  updateEnemies(dt);
  updateBoss(dt);
  updateProjectiles(dt, map.widthPx, map.heightPx, [...enemies, ...(currentBoss ? [currentBoss] : [])]);
  handlePlayerBulletCollisions(bullets);
  handleBossBulletCollisions();
  handleEnemyBulletCollisions(enemyBullets);
  updateParticles(dt);

  // death
  if (!player.alive && player.respawnTimer <= 0) {
    if (player.lives <= 0) {
      game.state = STATES.GAME_OVER; game.stateT = 0;
      sfx.die();
      return;
    }
    respawn();
  }

  // victory check
  if (currentBoss && !currentBoss.alive && game.stateT > 1.5) {
    game.state = STATES.VICTORY; game.stateT = 0;
  }
}

export function updateGame(dt) {
  game.stateT += dt;
  game.bannerT = Math.max(0, game.bannerT - dt);

  switch (game.state) {
    case STATES.TITLE:
      if (input.justPressed('start') || input.justPressed('jump') || input.justPressed('shoot')) {
        unlockAudio();
        sfx.select();
        startStage(stage1);
      }
      break;
    case STATES.PLAYING: updatePlaying(dt); break;
    case STATES.PAUSE:
      if (input.justPressed('pause')) { game.state = STATES.PLAYING; sfx.select(); }
      break;
    case STATES.GAME_OVER:
      if (game.stateT > 0.6 && (input.justPressed('start') || input.justPressed('jump'))) {
        sfx.select(); startStage(stage1);
      }
      break;
    case STATES.VICTORY:
      if (game.stateT > 1 && (input.justPressed('start') || input.justPressed('jump'))) {
        sfx.select(); startStage(stage1);
      }
      break;
  }
  endFrameInput();
}

export function renderGame(ctx) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  switch (game.state) {
    case STATES.TITLE:
      renderTitle(ctx, game.stateT);
      break;
    case STATES.PLAYING:
    case STATES.PAUSE:
    case STATES.VICTORY:
    case STATES.GAME_OVER:
      if (game.stage) renderWorld(ctx);
      if (game.state === STATES.PAUSE) renderPause(ctx);
      if (game.state === STATES.GAME_OVER) renderGameOver(ctx, player.score);
      if (game.state === STATES.VICTORY) renderVictory(ctx, player.score);
      break;
  }
}

function renderWorld(ctx) {
  renderParallax(ctx, game.stage.theme);
  renderMap(ctx, game.stage.theme);
  renderEnemies(ctx);
  renderBoss(ctx);
  renderPlayer(ctx);
  renderProjectiles(ctx);
  renderParticles(ctx);
  renderHUD(ctx, game.stage.name);
  renderBanner(ctx, game.bannerT, game.bannerTitle, game.bannerSub);
}
