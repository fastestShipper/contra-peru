export const PI2 = Math.PI * 2;
export const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a=1, b) => b === undefined ? Math.random()*a : a + Math.random()*(b-a);
export const randi = (a, b) => Math.floor(rand(a, b + 1));
export const pick = arr => arr[Math.floor(Math.random()*arr.length)];
export const chance = p => Math.random() < p;
export const sign = v => v < 0 ? -1 : v > 0 ? 1 : 0;
export const dist = (x1,y1,x2,y2) => Math.hypot(x2-x1, y2-y1);
export const angle = (x1,y1,x2,y2) => Math.atan2(y2-y1, x2-x1);
export function aabb(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
export function normalize(x, y) {
  const m = Math.hypot(x, y) || 1;
  return [x / m, y / m];
}
