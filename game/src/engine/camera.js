import { VIEW_W, VIEW_H } from '../config.js';
import { clamp, lerp } from './math.js';

export const camera = {
  x: 0, y: 0,
  targetX: 0, targetY: 0,
  w: VIEW_W, h: VIEW_H,
  worldW: VIEW_W, worldH: VIEW_H,
  shake: 0, shakeTime: 0, shakeX: 0, shakeY: 0,
  locked: false,
  lockLeft: 0, // for one-way scrolling (Contra III never scrolls back)
};

export function setBounds(w, h) { camera.worldW = w; camera.worldH = h; }

export function followPlayer(px, py, facing = 1) {
  // Contra III: camera locks to player but offset forward a bit based on facing
  const offset = facing * 30;
  camera.targetX = clamp(px + offset - VIEW_W/2, camera.lockLeft, camera.worldW - VIEW_W);
  camera.targetY = clamp(py - VIEW_H/2 - 20, 0, camera.worldH - VIEW_H);
}

export function updateCamera(dt) {
  camera.x = lerp(camera.x, camera.targetX, 0.12);
  camera.y = lerp(camera.y, camera.targetY, 0.12);
  // lock-left behavior: camera never goes back, player gets pushed
  if (camera.x < camera.lockLeft) camera.x = camera.lockLeft;
  camera.lockLeft = Math.max(camera.lockLeft, camera.x);

  if (camera.shakeTime > 0) {
    camera.shakeTime -= dt;
    const s = camera.shake * (camera.shakeTime > 0 ? 1 : 0);
    camera.shakeX = (Math.random()*2-1) * s;
    camera.shakeY = (Math.random()*2-1) * s;
    if (camera.shakeTime <= 0) { camera.shake = 0; camera.shakeX = 0; camera.shakeY = 0; }
  } else { camera.shakeX = 0; camera.shakeY = 0; }
}

export function addShake(amt, t = 0.2) {
  camera.shake = Math.max(camera.shake, amt);
  camera.shakeTime = Math.max(camera.shakeTime, t);
}

export function resetCamera() {
  camera.x = 0; camera.y = 0;
  camera.targetX = 0; camera.targetY = 0;
  camera.shake = 0; camera.shakeTime = 0;
  camera.shakeX = 0; camera.shakeY = 0;
  camera.lockLeft = 0;
}
