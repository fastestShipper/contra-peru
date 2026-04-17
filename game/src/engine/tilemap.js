// Tile-based platformer map with AABB collision against solid tiles
import { TILE, VIEW_W, VIEW_H } from '../config.js';
import { camera } from './camera.js';

// Tile IDs
export const T = {
  EMPTY: 0,
  GROUND: 1,      // solid ground (concrete)
  GROUND_TOP: 2,  // top surface variant
  WALL: 3,        // solid wall (brick)
  PLATFORM: 4,    // one-way platform (jump through from below)
  STEEL: 5,       // steel girder
  PIPE: 6,        // pipe (hang from)
  LAVA: 7,        // kills player
  DECOR_BG: 10,   // background decor (non-solid)
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
  w: 0, h: 0,
  tiles: null,
  widthPx: 0, heightPx: 0,
  themeId: 'lima',
};

export function loadMap(stageData) {
  map.w = stageData.tiles[0].length;
  map.h = stageData.tiles.length;
  map.tiles = stageData.tiles;
  map.widthPx = map.w * TILE;
  map.heightPx = map.h * TILE;
  map.themeId = stageData.theme || 'lima';
}

export function tileAt(tx, ty) {
  if (ty < 0) return T.EMPTY;
  if (ty >= map.h) return T.GROUND;
  if (tx < 0) return T.WALL;
  if (tx >= map.w) return T.WALL;
  return map.tiles[ty][tx];
}

export function isSolidAt(x, y) {
  return SOLID.has(tileAt(Math.floor(x / TILE), Math.floor(y / TILE)));
}

export function isOneWayAt(x, y) {
  return ONEWAY.has(tileAt(Math.floor(x / TILE), Math.floor(y / TILE)));
}

export function isHazardAt(x, y) {
  return HAZARD.has(tileAt(Math.floor(x / TILE), Math.floor(y / TILE)));
}

// Resolve horizontal movement; returns if blocked
export function moveX(entity, dx) {
  if (dx === 0) return false;
  const sign = Math.sign(dx);
  const targetX = entity.x + dx;
  // check tiles at new edge
  const edgeX = sign > 0 ? targetX + entity.w : targetX;
  const topY = entity.y + 1;
  const midY = entity.y + entity.h / 2;
  const botY = entity.y + entity.h - 1;
  let blocked = false;
  for (const ty of [topY, midY, botY]) {
    const tx = Math.floor((edgeX - (sign > 0 ? 0.01 : -0.01)) / TILE);
    if (SOLID.has(tileAt(tx, Math.floor(ty / TILE)))) {
      blocked = true;
      if (sign > 0) entity.x = tx * TILE - entity.w - 0.01;
      else          entity.x = (tx + 1) * TILE + 0.01;
      return true;
    }
  }
  entity.x = targetX;
  return blocked;
}

// Resolve vertical movement; returns true if on ground
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
      if (sign > 0) {
        entity.y = ty * TILE - entity.h - 0.01;
        result.onGround = true;
      } else {
        entity.y = (ty + 1) * TILE + 0.01;
        result.hitCeiling = true;
      }
      return result;
    }
    // one-way platform (only when moving down and entity was above it last frame)
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

// Rendering -----------------------------------------------------------------
// Tile theme: paints per-tile for a given theme
function paintTile(ctx, tile, sx, sy, themeId) {
  const theme = THEMES[themeId] || THEMES.lima;
  switch (tile) {
    case T.GROUND:
      ctx.fillStyle = theme.groundBase; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = theme.groundDark;
      // speckles
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
      // brick pattern
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
      // legs
      ctx.fillStyle = theme.wallDark;
      ctx.fillRect(sx+2, sy+5, 1, 3);
      ctx.fillRect(sx+13, sy+5, 1, 3);
      break;
    case T.STEEL:
      ctx.fillStyle = '#3a3a44'; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = '#6a6a7a'; ctx.fillRect(sx, sy, TILE, 1); ctx.fillRect(sx, sy, 1, TILE);
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(sx, sy+15, TILE, 1); ctx.fillRect(sx+15, sy, 1, TILE);
      // bolts
      ctx.fillStyle = '#a0a0b0';
      ctx.fillRect(sx+2, sy+2, 2, 2); ctx.fillRect(sx+12, sy+2, 2, 2);
      ctx.fillRect(sx+2, sy+12, 2, 2); ctx.fillRect(sx+12, sy+12, 2, 2);
      break;
    case T.PIPE:
      ctx.fillStyle = '#4a4a5a'; ctx.fillRect(sx, sy+5, TILE, 6);
      ctx.fillStyle = '#8a8a9a'; ctx.fillRect(sx, sy+5, TILE, 2);
      ctx.fillStyle = '#2a2a34'; ctx.fillRect(sx, sy+10, TILE, 1);
      break;
    case T.WINDOW:
      ctx.fillStyle = theme.wallBase; ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = theme.window; ctx.fillRect(sx+2, sy+2, TILE-4, TILE-4);
      ctx.fillStyle = theme.windowDark; ctx.fillRect(sx+2, sy+TILE-4, TILE-4, 1);
      ctx.fillStyle = theme.windowHi; ctx.fillRect(sx+2, sy+2, 1, TILE-4);
      break;
    case T.SIGN:
      ctx.fillStyle = '#c01a1a'; ctx.fillRect(sx+2, sy+2, TILE-4, 6);
      ctx.fillStyle = '#ffd040'; ctx.fillRect(sx+4, sy+3, 2, 1);
      ctx.fillRect(sx+7, sy+3, 2, 1);
      ctx.fillRect(sx+10, sy+3, 2, 1);
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(sx+7, sy+8, 2, 7);
      break;
    case T.FLAG:
      ctx.fillStyle = '#0a0604'; ctx.fillRect(sx+7, sy, 1, TILE);
      ctx.fillStyle = '#c01a1a'; ctx.fillRect(sx+8, sy+2, 6, 3);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(sx+8, sy+5, 6, 3);
      ctx.fillStyle = '#c01a1a'; ctx.fillRect(sx+8, sy+8, 6, 3);
      break;
    case T.DEBRIS:
      ctx.fillStyle = theme.groundDark;
      ctx.fillRect(sx+3, sy+10, 4, 3);
      ctx.fillRect(sx+8, sy+12, 5, 2);
      ctx.fillRect(sx+2, sy+13, 3, 2);
      break;
    case T.LAVA:
      const t = performance.now() / 300;
      ctx.fillStyle = '#ff5a1f';
      ctx.fillRect(sx, sy+4, TILE, TILE-4);
      ctx.fillStyle = '#ffd040';
      for (let i = 0; i < 3; i++) {
        const off = Math.sin(t + i) * 2;
        ctx.fillRect(sx + i*6, sy + 4 + off, 4, 1);
      }
      break;
    default: break;
  }
}

export const THEMES = {
  lima: {
    skyTop: '#0a0606', skyMid: '#3a0a06', skyBot: '#8a2a10',
    groundBase: '#4a3224', groundDark: '#2a1808', groundTop: '#6a4630', groundHi: '#8a5a3a',
    wallBase: '#7a3a20', wallDark: '#3a1a0c',
    platBase: '#6a6a5a', platHi: '#a0a090', platShadow: '#2a2a20',
    window: '#ff8c1f', windowDark: '#7a3a08', windowHi: '#ffd08a',
  },
  congreso: {
    skyTop: '#1a0a08', skyMid: '#3a0a08', skyBot: '#6a0a10',
    groundBase: '#6a6a6a', groundDark: '#3a3a3a', groundTop: '#9a9a9a', groundHi: '#c0c0c0',
    wallBase: '#c8b884', wallDark: '#6a5a30',
    platBase: '#8a8a8a', platHi: '#c0c0c0', platShadow: '#3a3a3a',
    window: '#ff7a1f', windowDark: '#7a3a08', windowHi: '#ffd08a',
  },
};

export function renderMap(ctx, themeId) {
  const theme = THEMES[themeId] || THEMES.lima;
  // sky gradient
  const grd = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  grd.addColorStop(0, theme.skyTop);
  grd.addColorStop(0.5, theme.skyMid);
  grd.addColorStop(1, theme.skyBot);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // tiles visible
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

// parallax backdrop (skyline / mountains / etc per theme)
export function renderParallax(ctx, themeId) {
  const theme = THEMES[themeId] || THEMES.lima;
  if (themeId === 'lima') {
    // back silhouette mountains
    ctx.fillStyle = '#3a0a06';
    const farScroll = camera.x * 0.15;
    for (let i = 0; i < 12; i++) {
      const px = (i * 80) - (farScroll % 80);
      const w = 80, h = 40 + (i % 3) * 10;
      ctx.beginPath();
      ctx.moveTo(px, VIEW_H - 40);
      ctx.lineTo(px + w/2, VIEW_H - 40 - h);
      ctx.lineTo(px + w, VIEW_H - 40);
      ctx.closePath(); ctx.fill();
    }
    // mid skyline (buildings)
    ctx.fillStyle = '#2a0a06';
    const midScroll = camera.x * 0.3;
    for (let i = 0; i < 20; i++) {
      const px = (i * 48) - (midScroll % 48);
      const h = 40 + ((i * 7) % 5) * 14;
      ctx.fillRect(px, VIEW_H - 40 - h, 42, h);
      // windows
      ctx.fillStyle = '#ff8c1f';
      for (let wy = 0; wy < h; wy += 10) {
        for (let wx = 0; wx < 42; wx += 8) {
          if (((i * 7 + wy + wx) & 5) === 0) ctx.fillRect(px + wx + 2, VIEW_H - 40 - h + wy + 2, 3, 4);
        }
      }
      ctx.fillStyle = '#2a0a06';
    }
    // fire glow on horizon
    ctx.fillStyle = 'rgba(255, 60, 20, 0.22)';
    ctx.fillRect(0, VIEW_H - 60, VIEW_W, 60);
    // moon / sun
    ctx.fillStyle = '#ffd040';
    ctx.beginPath();
    ctx.arc(VIEW_W - 70 - camera.x * 0.05 + (camera.x * 0.05 % 300), 42, 16, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(VIEW_W - 64 - camera.x * 0.05 + (camera.x * 0.05 % 300), 38, 12, 0, Math.PI*2);
    ctx.fill();
  }
}
