// Procedural pixel sprites
const CACHE = new Map();

function bake(key, rows, palette, opts = {}) {
  if (CACHE.has(key)) return CACHE.get(key);
  const w = rows[0].length, h = rows.length;
  const scale = opts.scale || 1;
  const cvs = document.createElement('canvas');
  cvs.width = w * scale; cvs.height = h * scale;
  const ctx = cvs.getContext('2d'); ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = rows[y][x];
      if (k === '.' || k === ' ' || !k) continue;
      const c = palette[k]; if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(x*scale, y*scale, scale, scale);
    }
  }
  const out = { canvas: cvs, w: cvs.width, h: cvs.height, pw: w, ph: h };
  CACHE.set(key, out);
  return out;
}
const r = str => str.split('');

// =========================================================
// GREGORIO — Alianza Lima cap, leather jacket, white shirt
// =========================================================
const GP = {
  O: '#080402',  // outline
  S: '#c0895a',  // skin
  s: '#8a5a34',  // skin shadow
  H: '#1a1014',  // hair/beard
  W: '#e8e0d0',  // white shirt
  w: '#a89888',  // shirt shadow
  R: '#c01a1a',  // blood
  L: '#14141c',  // leather jacket black
  l: '#3a3a4a',  // leather hi
  J: '#1a2a48',  // jean
  j: '#0a152a',  // jean shadow
  Z: '#e0e0e0',  // shoe white
  z: '#2a2a2a',  // shoe shadow
  B: '#002f6c',  // alianza blue
  b: '#00152e',  // alianza blue dark
  c: '#ffffff',  // alianza white stripe
  E: '#1a1a1a',  // eye
  g: '#2a1a0a',  // gun body
  G: '#5a4a3a',  // gun hi
};

// idle stand right (14w x 26h)
const gregIdle = [
  '...BBBBBBB....',
  '..BBBccBBB....',  // cap with white stripe
  '.BcBBBBBBb....',
  '.BBBBBBBbB....',
  '.OsSSSsOH.....',  // face
  '.OEssEsO.Hb...',  // eye + side
  '.OHHHHHO......',  // beard
  '..LLLLLL.g....',  // jacket collar
  '.LLWWWWLL.GGgg',  // gun out
  '.LWWRRWWL..gGg',
  '.LWWRRWWL...g.',
  '.LLWWWWLL.....',
  '.LLLWWLLL.....',
  '..LjJJjL......',
  '..JJJJJJ......',
  '..JJJJJJ......',
  '..JJjjJJ......',
  '..Jj..jJ......',
  '..j....j......',
  '..Zz..zZ......',
  '.ZZZ..ZZZ.....',
  '.OO....OO.....',
  '..............',
  '..............',
  '..............',
  '..............',
];

// run right frame 0
const gregRun0 = [
  '...BBBBBBB....',
  '..BBBccBBB....',
  '.BcBBBBBBb....',
  '.BBBBBBBbB....',
  '.OsSSSsOH.....',
  '.OEssEsOHb....',
  '.OHHHHHO......',
  '..LLLLLLL.....',
  '.LLWWWWLL.gGgg',
  '.LWWRRWWL..gGg',
  '.LWWRRWWL...g.',
  '.LLWWWWLL.....',
  '.LLLWWLLL.....',
  '..LjJJjL......',
  '..JJJJJJ......',
  '..JJJJJJ......',
  '..JJjjJJ......',
  '..jj..j.......',
  '..j....Jj.....',
  '.Zz...zZz.....',
  '.OZ....OZ.....',
  '.O.....O......',
  '..............',
  '..............',
  '..............',
  '..............',
];

// run right frame 1
const gregRun1 = [
  '...BBBBBBB....',
  '..BBBccBBB....',
  '.BcBBBBBBb....',
  '.BBBBBBBbB....',
  '.OsSSSsOH.....',
  '.OEssEsOHb....',
  '.OHHHHHO......',
  '..LLLLLLL.....',
  '.LLWWWWLL.gGgg',
  '.LWWRRWWL..gGg',
  '.LWWRRWWL...g.',
  '.LLWWWWLL.....',
  '.LLLWWLLL.....',
  '..LjJJjL......',
  '..JJJJJJ......',
  '..JJJJJJ......',
  '..jJJJj.......',
  '..Jj..Jj......',
  '..j....j......',
  '.Zz....zZ.....',
  '.O......Oz....',
  '.........O....',
  '..............',
  '..............',
  '..............',
  '..............',
];

// jump right
const gregJump = [
  '...BBBBBBB....',
  '..BBBccBBB....',
  '.BcBBBBBBb....',
  '.BBBBBBBbB....',
  '.OsSSSsOH.....',
  '.OEssEsOHb....',
  '.OHHHHHO......',
  '..LLLLLLL.....',
  '.LLWWWWLL.gGgg',
  '.LWWRRWWL..gGg',
  '.LWWRRWWL...g.',
  '.LLWWWWLL.....',
  '.LLLWWLLL.....',
  '..JJJJJJ......',
  '..JJJJJJ......',
  '..JJJJJJ......',
  '.jjJJJJjj.....',
  'jJ......Jj....',
  'j........j....',
  'Zz........Z...',
  'OZ........O...',
  '.O............',
  '..............',
  '..............',
  '..............',
  '..............',
];

// crouch right
const gregCrouch = [
  '..............',
  '..............',
  '..............',
  '...BBBBBBB....',
  '..BBBccBBB....',
  '.BcBBBBBBb....',
  '.BBBBBBBbB....',
  '.OsSSSsOH.....',
  '.OEssEsOHb....',
  '.OHHHHHO......',
  '.LLLLLLLL.gGgg',
  'LLWWRRWWLL.gGg',
  'LLWWRRWWLL..g.',
  '.LLLWWLLL.....',
  '..JJJJJJJ.....',
  '.JJJjjJJJ.....',
  'ZZZJ..JZZZ....',
  'OOO....OOO....',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
];

// aim up right (shooting upward)
const gregAimUp = [
  '........g.....',
  '........Gg....',
  '........g.....',
  '...BBBBBBB....',
  '..BBBccBBB....',
  '.BcBBBBBBb....',
  '.BBBBBBBbB....',
  '.OsSSSsOH.....',
  '.OEssEsOHb....',
  '.OHHHHHO......',
  '..LLLLLLL.....',
  '.LLWWWWLL.....',
  '.LWWRRWWL.....',
  '.LWWRRWWL.....',
  '.LLWWWWLL.....',
  '.LLLWWLLL.....',
  '..LjJJjL......',
  '..JJJJJJ......',
  '..JJJJJJ......',
  '..JJjjJJ......',
  '..Jj..jJ......',
  '..j....j......',
  '..Zz..zZ......',
  '.ZZZ..ZZZ.....',
  '.OO....OO.....',
  '..............',
];

// dead / hit
const gregHit = [
  '..............',
  '..............',
  '..............',
  '..............',
  '.OOOOOOOOOO...',  // fallen on ground
  'OcBBBBBBBBBO..',
  'OsSsSHHHHBBO..',
  'OEEHHWWWRRlO..',
  'OLLWWWRWWRjO..',
  'OLWWRWRWWLjO..',
  'OLLWWWWLLJjO..',
  '.OLJJJJJLJJO..',
  '..OJJjjJJjJO..',
  '..OZZ..ZZZZO..',
  '..OO....OOO...',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
];

// =========================================================
// ENEMIES
// =========================================================

// Grunt: congresista with suit + gun
const grunt0 = [
  '....OOOO....',
  '...OFFFFO...', // greenish face
  '...OFlFFO...',
  '...OEMMEO...',
  '...OFfFFO...',
  '....OTTO....', // white collar
  '..OCCCCCO...',
  '.OCCtRtCCO..',
  'OCCCCCCCCCO.',
  'OCcCCCCCcCO.',
  '.OCCCCCCCO..',
  '..OCCCCCO...',
  '..OJJJJJO...',
  '..OJJJJJO...',
  '..OJJjJJO...',
  '..OJj.jJO...',
  '..OZz.zZO...',
  '.OZZ..ZZO...',
  '.OO...OO....',
  '............',
  '............',
  '............',
  '............',
  '............',
];
const gruntPal = {
  O: '#080402', F: '#3a6030', f: '#1a3010', l: '#5a8040',
  E: '#e8d040', M: '#4a0a0a', T: '#e0dcd0',
  C: '#1a1a28', c: '#3a3a4a', R: '#c01a1a', t: '#ffffff',
  J: '#0a0a0a', j: '#1a1a1a', Z: '#080808', z: '#1a1a1a',
};

// Jumper: ciudadano with orange vincha + pistol
const jumper = [
  '....OOOO....',
  '...OVVVVO...',  // vincha
  '...OFlFFO...',
  '...OEMMEO...',
  '...OFfFFO...',
  '....OFFO....',
  '..OSSSSSO...',  // polo
  '.OSSsSSsSO..',
  'OSSSSRSSSO..',
  'OSSSSRSSSO..',
  '.OSSSSSSSO..',
  '..OSSSSSO...',
  '..OJJJJJO...',
  '..OJJJJJO...',
  '..OJJjJJO...',
  '..OJ...JO...',
  '..OZ...ZO...',
  '.OZZ...ZZO..',
  '.OO.....OO..',
  '............',
  '............',
  '............',
  '............',
  '............',
];
const jumperPal = {
  O: '#080402', V: '#ff7a1f', F: '#3a6030', f: '#1a3010', l: '#5a8040',
  E: '#e8d040', M: '#4a0a0a',
  S: '#e0dcd0', s: '#a89888', R: '#c01a1a',
  J: '#1a2a48', j: '#0a152a', Z: '#1a1a1a',
};

// Turret: stationary with big gun
const turret = [
  '................',
  '................',
  '.....gGGGGGG....',
  '....gGGGgggggG..',
  '.....gGGGGGG....',
  '......OO........',
  '.OOOOOOOOOOOO...',
  'OCCCCCCCCCCCCO..',
  'OCtCCCCCCCCtCO..',
  'OCCCCCCCCCCCCO..',
  'OCCCtCtCtCtCCO..',
  'OCCCCCCCCCCCCO..',
  'OCCCCCCCCCCCCO..',
  '.OOOOOOOOOOOO...',
  '................',
  '................',
];
const turretPal = { O: '#080402', C: '#4a4a5a', c: '#6a6a7a', t: '#8a8a9a', g: '#2a2a2a', G: '#6a6a6a' };

// Roller: spherical enemy rolling toward player
const roller = [
  '...OOOO....',
  '..OVVVVVO..',
  '.OVcVVVcVO.',
  'OVVVVVVVVVO',
  'OVcVVVVVcVO',
  'OVVVVVVVVVO',
  'OVcVVVVVcVO',
  'OVVVVVVVVVO',
  '.OVcVVVcVO.',
  '..OVVVVVO..',
  '...OOOO....',
];
const rollerPal = { O: '#080402', V: '#ff7a1f', c: '#ffd040' };

// Flyer: small drone
const flyer = [
  '....OOOO....',
  '.OOgGGGGgOO.',
  'OGGGggggGGGO',
  'OGgG.gg.GgGO',
  '.OOgGGGGgOO.',
  '....OOOO....',
];
const flyerPal = { O: '#080402', g: '#3a3a4a', G: '#6a6a7a' };

// Powerup letters
function makeLetterBox(letter, col) {
  const box = [
    '.OOOOOO.',
    'ORRRRRRO',
    'ORLLLLRO',
    'ORLcccRO',
    'ORLcccRO',
    'ORLLLLRO',
    'ORRRRRRO',
    '.OOOOOO.',
  ];
  return { rows: box, pal: { O: '#080402', R: col, L: '#fff4d0', c: col } };
}

// =========================================================
// PROJECTILES & EFFECTS
// =========================================================
const bullet_basic = ['yYy', 'YYY', 'yYy'];
const bulletPal = { y: '#ffb347', Y: '#fff4d0' };
const bullet_spread = ['.Y.','YYY','.Y.'];
const bullet_fire = ['.RR.','RffR','RfFR','RRR.'];
const firePal = { R: '#ff3a14', f: '#ffd040', F: '#ffffff' };
const bullet_laser = ['LLLLLLLL'];
const laserPal = { L: '#ff3aff' };
const bullet_homing = ['.gG.','ggGg','Rggg','.RR.'];
const homingPal = { g: '#3a3a4a', G: '#8a8a9a', R: '#ff3a14' };

// Muzzle flash
const flash = [
  '.YY.',
  'YRRY',
  'YRRRY',
  'YRRY',
  '.YY.',
];
const flashPal = { Y: '#fff4d0', R: '#ff7a1f' };

export function initSprites() {
  // Gregorio variants
  bake('greg_idle', gregIdle.map(r), GP);
  bake('greg_run0', gregRun0.map(r), GP);
  bake('greg_run1', gregRun1.map(r), GP);
  bake('greg_jump', gregJump.map(r), GP);
  bake('greg_crouch', gregCrouch.map(r), GP);
  bake('greg_aimup', gregAimUp.map(r), GP);
  bake('greg_hit', gregHit.map(r), GP);

  bake('enemy_grunt', grunt0.map(r), gruntPal);
  bake('enemy_jumper', jumper.map(r), jumperPal);
  bake('enemy_turret', turret.map(r), turretPal);
  bake('enemy_roller', roller.map(r), rollerPal);
  bake('enemy_flyer', flyer.map(r), flyerPal);

  bake('bullet_basic', bullet_basic.map(r), bulletPal);
  bake('bullet_spread', bullet_spread.map(r), bulletPal);
  bake('bullet_fire', bullet_fire.map(r), firePal);
  bake('bullet_laser', bullet_laser.map(r), laserPal);
  bake('bullet_homing', bullet_homing.map(r), homingPal);
  bake('flash', flash.map(r), flashPal);

  // Powerup boxes
  const weaponColors = { M: '#3a3a4a', S: '#ff7a1f', F: '#ff3a14', H: '#7a3aff', L: '#ff3aff', B: '#ffd040' };
  for (const k in weaponColors) {
    const lb = makeLetterBox(k, weaponColors[k]);
    bake('powerup_' + k, lb.rows.map(r), lb.pal);
  }
}

export function getSprite(key) { return CACHE.get(key); }
export function drawSprite(ctx, key, x, y, { flip = false, alpha = 1 } = {}) {
  const s = CACHE.get(key); if (!s) return;
  ctx.save();
  if (alpha !== 1) ctx.globalAlpha = alpha;
  ctx.translate(Math.floor(x), Math.floor(y));
  if (flip) { ctx.scale(-1, 1); ctx.translate(-s.w, 0); }
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(s.canvas, 0, 0);
  ctx.restore();
}
