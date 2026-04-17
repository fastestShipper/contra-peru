// Stage 1 — Lima Centro, side-scroll
// Hand-designed tilemap with enemy spawn triggers
import { T } from '../engine/tilemap.js';

// Build map as a 2D array of tile IDs. Height 14, width 180 tiles (~2880 px)
// Ground at y=11 by default. Variation with platforms, pits, walls.

const W = 220;
const H = 14;
const GROUND_Y = 11;

function blank() {
  const rows = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) row.push(T.EMPTY);
    rows.push(row);
  }
  return rows;
}

function fillGround(tiles, xStart, xEnd, topY = GROUND_Y) {
  for (let x = xStart; x < xEnd; x++) {
    for (let y = topY; y < H; y++) {
      tiles[y][x] = y === topY ? T.GROUND_TOP : T.GROUND;
    }
  }
}

function wall(tiles, x, topY, bottomY, tile = T.WALL) {
  for (let y = topY; y <= bottomY; y++) tiles[y][x] = tile;
}

function platform(tiles, xStart, xEnd, y) {
  for (let x = xStart; x < xEnd; x++) tiles[y][x] = T.PLATFORM;
}

function decor(tiles, x, y, tile) {
  if (y >= 0 && y < H && x >= 0 && x < W) tiles[y][x] = tile;
}

function buildMap() {
  const tiles = blank();

  // Main ground
  fillGround(tiles, 0, 48);
  // small pit
  fillGround(tiles, 52, 80);
  // pit (must jump)
  fillGround(tiles, 84, 120);
  // bigger pit with floating platforms
  platform(tiles, 122, 126, 8);
  platform(tiles, 130, 134, 6);
  platform(tiles, 138, 142, 8);
  fillGround(tiles, 144, 180);
  // elevated section
  fillGround(tiles, 150, 180, 9);  // higher ground starting at 150
  // mini boss arena
  fillGround(tiles, 184, 220);
  // walls around boss
  wall(tiles, 215, 2, 10);

  // Decorations: windows on walls, signs, flags
  for (let x = 5; x < 48; x += 8) {
    decor(tiles, x, GROUND_Y - 2, T.WINDOW);
    decor(tiles, x, GROUND_Y - 3, T.WINDOW);
  }
  // signs + flags scattered
  decor(tiles, 10, GROUND_Y - 1, T.SIGN);
  decor(tiles, 26, GROUND_Y - 1, T.FLAG);
  decor(tiles, 60, GROUND_Y - 1, T.SIGN);
  decor(tiles, 90, GROUND_Y - 1, T.FLAG);
  decor(tiles, 170, 8, T.FLAG);
  decor(tiles, 200, GROUND_Y - 1, T.SIGN);
  // debris
  decor(tiles, 14, GROUND_Y - 1, T.DEBRIS);
  decor(tiles, 34, GROUND_Y - 1, T.DEBRIS);
  decor(tiles, 70, GROUND_Y - 1, T.DEBRIS);
  decor(tiles, 100, GROUND_Y - 1, T.DEBRIS);

  // platforms in the open area
  platform(tiles, 30, 34, 7);
  platform(tiles, 40, 44, 8);
  platform(tiles, 60, 64, 8);
  platform(tiles, 66, 70, 6);
  platform(tiles, 72, 76, 8);
  platform(tiles, 90, 94, 7);
  platform(tiles, 100, 104, 7);

  return tiles;
}

// Spawn triggers: when camera crosses a trigger X, spawn an enemy
export const spawnScript = [
  // Early waves — grunts coming from right
  { at:  80, kind:'grunt', x: 400, y: 150 },
  { at: 130, kind:'grunt', x: 520, y: 150 },
  { at: 160, kind:'jumper', x: 560, y: 150 },
  { at: 240, kind:'flyer', x: 640, y: 80 },
  { at: 280, kind:'grunt', x: 720, y: 150 },
  { at: 320, kind:'grunt', x: 760, y: 150 },
  { at: 380, kind:'roller', x: 820, y: 150 },
  { at: 430, kind:'jumper', x: 880, y: 120 },
  { at: 510, kind:'turret', x: 950, y: 90 },
  { at: 560, kind:'grunt', x: 1000, y: 120 },
  { at: 620, kind:'flyer', x: 1060, y: 60 },
  { at: 700, kind:'jumper', x: 1140, y: 130 },
  { at: 780, kind:'grunt', x: 1220, y: 130 },
  { at: 830, kind:'roller', x: 1280, y: 130 },
  { at: 900, kind:'grunt', x: 1360, y: 130 },
  { at: 960, kind:'grunt', x: 1420, y: 130 },
  { at: 1040, kind:'jumper', x: 1500, y: 130 },
  { at: 1080, kind:'flyer', x: 1540, y: 60 },
  { at: 1120, kind:'grunt', x: 1580, y: 100 },
  { at: 1200, kind:'turret', x: 1660, y: 140 },
  { at: 1280, kind:'jumper', x: 1740, y: 100 },
  { at: 1340, kind:'grunt', x: 1800, y: 100 },
  { at: 1400, kind:'grunt', x: 1860, y: 100 },
  { at: 1500, kind:'flyer', x: 1960, y: 40 },
  { at: 1560, kind:'jumper', x: 2020, y: 100 },
  { at: 1620, kind:'grunt', x: 2080, y: 100 },
  { at: 1680, kind:'roller', x: 2140, y: 130 },
  { at: 1740, kind:'grunt', x: 2200, y: 100 },
  // boss zone
  { at: 2200, kind:'boss', x: 2800, y: 120 },
];

export const stage1 = {
  id: 'lima',
  name: 'LIMA CENTRO',
  subtitle: 'Jirón de la Unión',
  theme: 'lima',
  playerStart: { x: 40, y: 80 },
  bossLockX: 2640,   // camera locks here for boss
  endX: 3200,
  tiles: buildMap(),
  spawnScript,
};
