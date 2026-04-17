import { KEYS, VIEW_W, VIEW_H } from '../config.js';

const keys = new Set();
const justPressed = new Set();
const justReleased = new Set();

export function initInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if (!keys.has(e.key)) justPressed.add(e.key);
    keys.add(e.key);
  });
  window.addEventListener('keyup', (e) => {
    keys.delete(e.key);
    justReleased.add(e.key);
  });
  window.addEventListener('blur', () => keys.clear());
}

export function endFrameInput() {
  justPressed.clear();
  justReleased.clear();
}

function any(group, set) { return KEYS[group] && KEYS[group].some(k => set.has(k)); }

export const input = {
  pressed(g) { return any(g, keys); },
  justPressed(g) { return any(g, justPressed); },
  justReleased(g) { return any(g, justReleased); },
  dx() {
    let x = 0;
    if (this.pressed('left')) x -= 1;
    if (this.pressed('right')) x += 1;
    return x;
  },
  dy() {
    let y = 0;
    if (this.pressed('up')) y -= 1;
    if (this.pressed('down')) y += 1;
    return y;
  },
  anyJust() { return justPressed.size > 0; },
  // aim direction: 8-way based on dx/dy
  aimDir() {
    const dx = this.dx(), dy = this.dy();
    if (dx === 0 && dy === 0) return null; // no aim override, use facing
    return { dx, dy };
  },
};
