// Contra-style weapons: M, S, F, H, L + Bomb
import { spawnPlayerBullet } from './projectiles.js';
import { spawnSmoke } from '../engine/particles.js';
import { sfx } from '../engine/audio.js';

export const WEAPONS = {
  M: {  // Metralleta
    id:'M', name:'METRALLETA',
    fireRate: 0.09,
    shoot(x, y, dx, dy) {
      const sp = 360;
      spawnPlayerBullet({ x, y, vx: dx * sp, vy: dy * sp, damage: 6, sprite:'bullet_basic', ttl: 0.9 });
      sfx.shoot();
    }
  },
  S: {  // Spread (Confeti)
    id:'S', name:'CONFETI',
    fireRate: 0.14,
    shoot(x, y, dx, dy) {
      const base = Math.atan2(dy, dx);
      const sp = 320;
      for (let i = -2; i <= 2; i++) {
        const a = base + i * 0.22;
        spawnPlayerBullet({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, damage: 5, sprite:'bullet_spread', ttl: 0.8 });
      }
      sfx.shootSpread();
    }
  },
  F: {  // Fuego (Molotov)
    id:'F', name:'MOLOTOV',
    fireRate: 0.11,
    shoot(x, y, dx, dy) {
      const sp = 240;
      for (let i = -1; i <= 1; i++) {
        const jitter = i * 0.12 + (Math.random() - 0.5) * 0.1;
        const base = Math.atan2(dy, dx) + jitter;
        spawnPlayerBullet({ x, y, vx: Math.cos(base)*sp, vy: Math.sin(base)*sp, damage: 4, sprite:'bullet_fire', ttl: 0.5, pierce: 1 });
      }
      spawnSmoke(x, y);
      sfx.shootFire();
    }
  },
  H: {  // Homing (Bombarda)
    id:'H', name:'BOMBARDA',
    fireRate: 0.22,
    shoot(x, y, dx, dy) {
      const sp = 200;
      spawnPlayerBullet({ x, y, vx: dx * sp, vy: dy * sp, damage: 14, sprite:'bullet_homing', ttl: 3, homing: true });
      sfx.shootHoming();
    }
  },
  L: {  // Laser (Vizcacha)
    id:'L', name:'VIZCACHA',
    fireRate: 0.22,
    shoot(x, y, dx, dy) {
      const sp = 700;
      spawnPlayerBullet({ x, y, vx: dx * sp, vy: dy * sp, damage: 22, sprite:'bullet_laser', ttl: 0.5, pierce: 8 });
      sfx.shootLaser();
    }
  },
};

export const WEAPON_ORDER = ['M','S','F','H','L'];
