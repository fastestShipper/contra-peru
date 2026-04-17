// Image-based sprite system (loads AI-generated pixel art)
const CACHE = new Map();

// list of (key, path) pairs to preload
const MANIFEST = [
  ['greg-idle',        'assets/processed/greg-idle.png'],
  ['greg-run-0',       'assets/processed/greg-run-0.png'],
  ['greg-run-1',       'assets/processed/greg-run-1.png'],
  ['greg-shoot',       'assets/processed/greg-shoot.png'],
  ['greg-jump',        'assets/processed/greg-jump.png'],
  ['greg-crouch',      'assets/processed/greg-crouch.png'],

  ['enemy-congresista', 'assets/processed/enemy-congresista.png'],
  ['enemy-ciudadano',   'assets/processed/enemy-ciudadano.png'],
  ['enemy-turret',      'assets/processed/enemy-turret.png'],
  ['enemy-roller',      'assets/processed/enemy-roller.png'],

  ['boss-combi',        'assets/processed/boss-combi.png'],

  ['bg-lima',           'assets/processed/bg-lima.png'],
  ['bg-plaza',          'assets/processed/bg-plaza.png'],
  ['bg-congreso',       'assets/processed/bg-congreso.png'],
];

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('[sprites] failed:', path);
      resolve(null);
    };
    img.src = path;
  });
}

export async function loadAllSprites() {
  await Promise.all(MANIFEST.map(async ([key, path]) => {
    const img = await loadImage(path);
    if (img) CACHE.set(key, { img, w: img.naturalWidth, h: img.naturalHeight });
  }));
  // build placeholder flyer sprite since AI didn't produce one reliably
  buildFlyerSprite();
  buildPowerupSprites();
  buildFxSprites();
  return CACHE;
}

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function buildFlyerSprite() {
  const w = 20, h = 12;
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  // Orange drone body
  ctx.fillStyle = '#080402'; ctx.fillRect(3, 4, w - 6, 5);       // outline body
  ctx.fillStyle = '#ff7a1f'; ctx.fillRect(4, 5, w - 8, 3);       // body fill
  ctx.fillStyle = '#ffd040'; ctx.fillRect(4, 5, w - 8, 1);       // highlight
  // eye (red sensor)
  ctx.fillStyle = '#ff3a14'; ctx.fillRect(w - 5, 6, 2, 2);
  // rotor blur top
  ctx.fillStyle = 'rgba(200,200,200,0.6)';
  ctx.fillRect(1, 1, w - 2, 1);
  ctx.fillRect(1, 2, w - 2, 1);
  // arms
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(2, 3, 2, 1);
  ctx.fillRect(w - 4, 3, 2, 1);
  // under-gun
  ctx.fillRect(w/2 - 1, 9, 2, 2);
  CACHE.set('enemy-flyer', { img: c, w, h });
}

function buildPowerupSprites() {
  const colors = {
    M: '#3a3a4a', S: '#ff7a1f', F: '#ff3a14', H: '#7a3aff', L: '#ff3aff', B: '#ffd040',
  };
  for (const k in colors) {
    const c = makeCanvas(12, 12);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    // outline box
    ctx.fillStyle = '#080402'; ctx.fillRect(0, 0, 12, 12);
    // inner
    ctx.fillStyle = colors[k]; ctx.fillRect(1, 1, 10, 10);
    // highlight
    ctx.fillStyle = '#ffffff'; ctx.fillRect(1, 1, 10, 1); ctx.fillRect(1, 1, 1, 10);
    // shadow
    ctx.fillStyle = '#000000'; ctx.fillRect(1, 10, 10, 1); ctx.fillRect(10, 1, 1, 10);
    // letter
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(k, 6, 7);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    CACHE.set('powerup_' + k, { img: c, w: 12, h: 12 });
  }
}

function buildFxSprites() {
  // muzzle flash
  {
    const c = makeCanvas(12, 12);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#ffd040'; ctx.fillRect(4, 2, 4, 8); ctx.fillRect(2, 4, 8, 4);
    ctx.fillStyle = '#fff4d0'; ctx.fillRect(5, 4, 2, 4); ctx.fillRect(4, 5, 4, 2);
    CACHE.set('flash', { img: c, w: 12, h: 12 });
  }
  // bullets
  for (const [key, color, w, h] of [
    ['bullet-basic', '#ffd040', 6, 3],
    ['bullet-spread', '#ff7a1f', 4, 4],
    ['bullet-fire', '#ff3a14', 8, 5],
    ['bullet-laser', '#ff3aff', 14, 2],
    ['bullet-homing', '#8a8a9a', 6, 4],
  ]) {
    const c = makeCanvas(w, h);
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#080402'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color; ctx.fillRect(1, 1, w - 2, h - 2);
    if (h > 2) { ctx.fillStyle = '#ffffff'; ctx.fillRect(1, 1, w - 2, 1); }
    CACHE.set(key, { img: c, w, h });
  }
}

export function getSprite(key) { return CACHE.get(key); }

export function drawSprite(ctx, key, x, y, opts = {}) {
  const s = CACHE.get(key);
  if (!s) return;
  const flip = !!opts.flip;
  const alpha = opts.alpha ?? 1;
  const anchor = opts.anchor || 'topleft'; // 'topleft' or 'center' or 'bottom-center'
  let drawX = x, drawY = y;
  if (anchor === 'center') { drawX = x - s.w/2; drawY = y - s.h/2; }
  else if (anchor === 'bottom-center') { drawX = x - s.w/2; drawY = y - s.h; }

  ctx.save();
  if (alpha !== 1) ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  if (flip) {
    ctx.translate(Math.floor(drawX + s.w), Math.floor(drawY));
    ctx.scale(-1, 1);
    ctx.drawImage(s.img, 0, 0);
  } else {
    ctx.drawImage(s.img, Math.floor(drawX), Math.floor(drawY));
  }
  ctx.restore();
}
