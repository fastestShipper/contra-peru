// Contra Perú · constants tuned for Contra III feel
// Internal resolution 384x224 (SNES-ish) scaled to window
export const VIEW_W = 384;
export const VIEW_H = 224;
export const TILE = 16;
export const PIXEL_SCALE = 1;
export const FIXED_DT = 1 / 60;

// Physics tuned to Contra III: big gravity, strong jump, high ground speed
export const GRAVITY = 1900;           // px/s^2
export const JUMP_VEL = -580;          // px/s  -> peak ~200px (about 12.5 tiles)
export const JUMP_SHORT_VEL = -280;    // release early
export const MOVE_SPEED = 150;         // px/s
export const CROUCH_SPEED = 0;         // can't move while crouching
export const MAX_FALL = 780;
export const GROUND_FRICTION = 2800;
export const AIR_FRICTION = 400;

// player body
export const PLAYER_W = 14;
export const PLAYER_H = 26;
export const CROUCH_H = 14;

// input
export const KEYS = {
  up: ['w','W','ArrowUp'],
  down: ['s','S','ArrowDown'],
  left: ['a','A','ArrowLeft'],
  right: ['d','D','ArrowRight'],
  jump: [' ','z','Z'],
  shoot: ['x','X','j','J'],
  bomb: ['c','C','k','K','b','B'],
  swap: ['v','V','q','Q'],
  pause: ['Escape','p','P'],
  start: ['Enter'],
};

export const COLORS = {
  hpBar: '#ff3a14',
  uiBg: 'rgba(0,0,0,0.82)',
  uiBorder: '#3a2418',
  uiText: '#f4ede4',
  accent: '#ff3a14',
  accent2: '#ffb347',
  score: '#ffd040',
  lives: '#ff8c1f',
};

// stage configs
export const STAGES = [
  { id:'lima',     name:'LIMA CENTRO',       subtitle:'Jirón de la Unión',  type:'side' },
  { id:'congreso', name:'CONGRESO',          subtitle:'Plaza Bolívar',      type:'top'  },
  { id:'highway',  name:'VÍA EXPRESA',       subtitle:'Techo de la combi',  type:'side' },
  { id:'callao',   name:'CALLAO PUERTO',     subtitle:'Muelle 5',           type:'top'  },
  { id:'onpe',     name:'ONPE JESÚS MARÍA',  subtitle:'Sede central',       type:'side' },
];
