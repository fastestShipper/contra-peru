// Tile-based platformer map with AABB collision and parallax background image
import { TILE, VIEW_W, VIEW_H } from '../config.js';
import { camera } from './camera.js';
import { getSprite } from './sprites.js';

export const T = {
  EMPTY: 0,
  GROUND: 1,
  GROUND_TOP: 2,
  WALL: 3,
  PLATFORM: 4,
  STEEL: 5,
  PIPE: 6,
  LAVA: 7,
  DECOR_BG: 10,
  DECOR_DK: 11,
  SIGN: 12,
  FLAG: 13,
  DEBRIS: 14,
  WINDOW: 15,
};
export const SOLID = new Set([T.GROUND, T.GROUND_TOP, T.WALL, T.STEEL]);
export const ONEWAY = new Set([T.PLATFORM]);
export const HANGABLE = new Set([T.PIPE]);
export const HAZARD = new Set([T.LAVA]);

export let map = {
  w: 0, h: 0, tiles: null, widthPx: 0, heightPx: 0, themeId: 'lima', bgKey: 'bg-lima',
};

export function loadMap(stageData) {
  map.w = stageData.tiles[0].length;
  map.h = stageData.tiles.length;
  map.tiles = stageData.tiles;
  map.widthPx = map.w * TILE;
  map.heightPx = map.h * TILE;
  map.themeId = stageData.theme || 'lima';
  map.bgKey = stageData.bgKey || ('bg-' + (map.themeId === 'lima' ? 'lima' : map.themeId));
}

export function tileAt(tx, ty) {
  if (ty < 0) return T.EMPTY;
  if (ty >= map.h) return T.GROUND;
  if (tx < 0) return T.WALL;
  if (tx >= map.w) return T.WALL;
  return map.tiles[ty][tx];
}
export function isSolidAt(x, y) { return SOLID.has(tileAt(Math.floor(x / TILE), Math.floor(y / TILE))); }
export function isOneWayAt(x, y) { return ONEWAY.has(tileAt(Math.floor(x / TILE), Math.floor(y / TILE))); }
export function isHazardAt(x, y) { return HAZARD.has(tileAt(Math.floor(x / TILE), Math.floor(y / TILE))); }

export function moveX(entity, dx) {
  if (dx === 0) return false;
  const sign = Math.sign(dx);
  const targetX = entity.x + dx;
  const edgeX = sign > 0 ? targetX + entity.w : targetX;
  const topY = entity.y + 1;
  const midY = entity.y + entity.h / 2;
  const botY = entity.y + entity.h - 1;
  for (const ty of [topY, midY, botY]) {
    const tx = Math.floor((edgeX - (sign > 0 ? 0.01 : -0.01)) / TILE);
    if (SOLID.has(tileAt(tx, Math.floor(ty / TILE)))) {
      if (sign > 0) entity.x = tx * TILE - entity.w - 0.01;
      else entity.x = (tx + 1) * TILE + 0.01;
      return true;
    }
  }
  entity.x = targetX;
  return false;
}

export function moveY(entity, dy, allowDropThrough = false) {
  if (dy === 0) return { onGround: entity.onGround || false, hitCeiling: false };
  const sign = Math.sign(dy);
  const targetY = entity.y + dy;
  const edgeY = sign > 0 ? targetY + entity.h : targetY;
  const leftX = entity.x + 1;
  const midX = entity.x + entity.w / 2;
  const rightX = entity.x + entity.w - 1;
  let result = { onGround: false, hitCeiling: false };
  for (const tx of [leftX, midX, rightX]) {
    const ty = Math.floor((edgeY - (sign > 0 ? 0.01 : -0.01)) / TILE);
    const tile = tileAt(Math.floor(tx / TILE), ty);
    if (SOLID.has(tile)) {
      if (sign > 0) { entity.y = ty * TILE - entity.h - 0.01; result.onGround = true; }
      else { entity.y = (ty + 1) * TILE + 0.01; result.hitCeiling = true; }
      return result;
    }
    if (sign > 0 && !allowDropThrough && ONEWAY.has(tile)) {
      const prevBottom = entity.y + entity.h;
      const platTop = ty * TILE;
      if (prevBottom <= platTop + 0.5) {
        entity.y = platTop - entity.h - 0.01;
        result.onGround = true;
        return result;
      }
    }
  }
  entity.y = targetY;
  return result;
}

// Tile theme (colors for concrete tiles that overlay the parallax bg)
export const THEMES = {
  lima: {
    groundBase: '#6a4a2a', groundTop: '#8a6a3a', groundHi: '#b08a5a', groundDark: '#3a2418',
    wallBase: '#5a3a20', wallDark: '#2a1a0c',
    platBase: '#6a6a5a', platHi: '#a0a090', platShadow: '#2a2a20',
    window: '#ffb347', windowDark: '#7a3a08', windowHi: '#ffd08a',
  },
  congreso: {
    groundBase: '#5a5a5a', groundTop: '#8a8a8a', groundHi: '#a0a0a0', groundDark: '#2a2a2a',
    wallBase: '#c8b884', wallDark: '#6a5a30',
    platBase: '#8a8a8a', platHi: '#c0c0c0', platShadow: '#3a3a3a',
    window: '#ff7a1f', windowDark: '#7a3a08', windowHi: '#ffd08a',
  },
};

function paintTile(ctx, tile, sx, sy, themeId) {
  const theme = THEMES[themeId] || THEMES.lima;
  switch (tile) {
    case T.GROUND:
      ctx.fillStyle = theme.groundBase; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = theme.groundDark;
      ctx.fillRect(sx+2, sy+3, 2, 2);
      ctx.fillRect(sx+9, sy+6, 2, 1);
      ctx.fillRect(sx+12, sy+11, 2, 2);
      ctx.fillRect(sx+4, sy+12, 2, 1);
      break;
    case T.GROUND_TOP:
      ctx.fillStyle = theme.groundBase; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = theme.groundTop; ctx.fillRect(sx, sy, TILE, 3);
      ctx.fillStyle = theme.groundHi; ctx.fillRect(sx, sy, TILE, 1);
      ctx.fillStyle = theme.groundDark;
      ctx.fillRect(sx+3, sy+7, 2, 2);
      ctx.fillRect(sx+10, sy+9, 2, 2);
      break;
    case T.WALL:
      ctx.fillStyle = theme.wallBase; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = theme.wallDark;
      ctx.fillRect(sx, sy, TILE, 1);
      ctx.fillRect(sx, sy+7, TILE, 1);
      ctx.fillRect(sx, sy+8, 1, TILE);
      ctx.fillRect(sx+7, sy, 1, 7);
      ctx.fillRect(sx+11, sy+8, 1, 7);
      break;
    case T.PLATFORM:
      ctx.fillStyle = theme.platBase; ctx.fillRect(sx, sy, TILE, 5);
      ctx.fillStyle = theme.platHi; ctx.fillRect(sx, sy, TILE, 1);
      ctx.fillStyle = theme.platShadow; ctx.fillRect(sx, sy+4, TILE, 1);
      ctx.fillStyle = theme.wallDark;
      ctx.fillRect(sx+2, sy+5, 1, 3);
      ctx.fillRect(sx+13, sy+5, 1, 3);
      break;
    case T.STEEL:
      ctx.fillStyle = '#3a3a44'; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#6a6a7a'; ctx.fillRect(sx, sy, TILE, 1); ctx.fillRect(sx, sy, 1, TILE);
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(sx, sy+15, TILE, 1); ctx.fillRect(sx+15, sy, 1, TILE);
      ctx.fillStyle = '#a0a0b0';
      ctx.fillRect(sx+2, sy+2, 2, 2); ctx.fillRect(sx+12, sy+2, 2, 2);
      ctx.fillRect(sx+2, sy+12, 2, 2); ctx.fillRect(sx+12, sy+12, 2, 2);
      break;
    case T.LAVA: {
      const t = performance.now() / 300;
      ctx.fillStyle = '#ff5a1f'; ctx.fillRect(sx, sy+4, TILE, TILE-4);
      ctx.fillStyle = '#ffd040';
      for (let i = 0; i < 3; i++) {
        const off = Math.sin(t + i) * 2;
        ctx.fillRect(sx + i*6, sy + 4 + off, 4, 1);
      }
      break;
    }
    default: break;
  }
}

// ---------------------------------
// Parallax BG rendering (image-based)
// ---------------------------------
export function renderParallax(ctx, themeId) {
  const bg = getSprite(map.bgKey) || getSprite('bg-lima');
  if (!bg) return;
  // scroll at half speed of camera
  const scrollSpeed = 0.5;
  const bgW = bg.w;
  const bgH = bg.h;
  const scaleY = VIEW_H / bgH;   // stretch to full viewport
  const drawH = VIEW_H;
  const drawW = Math.ceil(bgW * scaleY);
  const offset = (camera.x * scrollSpeed) % drawW;
  // tile horizontally
  ctx.imageSmoothingEnabled = false;
  for (let x = -offset; x < VIEW_W; x += drawW) {
    ctx.drawImage(bg.img, Math.floor(x), 0, drawW, drawH);
  }
  // darken slightly for atmosphere
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // bottom gradient for ground-level atmosphere
  const grd = ctx.createLinearGradient(0, VIEW_H - 80, 0, VIEW_H);
  grd.addColorStop(0, 'rgba(0,0,0,0)');
  grd.addColorStop(1, 'rgba(40,10,4,0.65)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, VIEW_H - 80, VIEW_W, 80);
}

export function renderMap(ctx, themeId) {
  const startX = Math.max(0, Math.floor(camera.x / TILE) - 1);
  const endX = Math.min(map.w - 1, Math.ceil((camera.x + VIEW_W) / TILE) + 1);
  const startY = Math.max(0, Math.floor(camera.y / TILE) - 1);
  const endY = Math.min(map.h - 1, Math.ceil((camera.y + VIEW_H) / TILE) + 1);
  for (let ty = startY; ty <= endY; ty++) {
    for (let tx = startX; tx <= endX; tx++) {
      const tile = map.tiles[ty][tx];
      if (tile === T.EMPTY) continue;
      const sx = Math.floor(tx * TILE - camera.x + camera.shakeX);
      const sy = Math.floor(ty * TILE - camera.y + camera.shakeY);
      paintTile(ctx, tile, sx, sy, themeId);
    }
  }
}
