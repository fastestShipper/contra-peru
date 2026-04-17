// procedural SFX with Web Audio
let ctx = null;
let muted = false;
const master = { gain: 0.45 };

function ensure() {
  if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { ctx = null; } }
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(()=>{});
  return ctx;
}
export function unlockAudio() { ensure(); }
export function setMuted(m) { muted = !!m; }
export function isMuted() { return muted; }

function tone({ freq=440, type='square', attack=0.005, decay=0.08, gain=0.2, slide=0 }) {
  if (muted) return;
  const c = ensure(); if (!c) return;
  const osc = c.createOscillator(); const g = c.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq * slide), c.currentTime + attack + decay);
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain * master.gain, c.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + attack + decay);
  osc.connect(g).connect(c.destination);
  osc.start(); osc.stop(c.currentTime + attack + decay + 0.03);
}
function noise({ attack=0.003, decay=0.12, gain=0.25, filter=1200, type='lowpass' }) {
  if (muted) return;
  const c = ensure(); if (!c) return;
  const bufSize = 0.2 * c.sampleRate;
  const buf = c.createBuffer(1, bufSize, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = type; f.frequency.value = filter;
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain * master.gain, c.currentTime + attack);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + attack + decay);
  src.connect(f).connect(g).connect(c.destination);
  src.start(); src.stop(c.currentTime + attack + decay + 0.03);
}

export const sfx = {
  shoot() { tone({freq:1100, type:'square', attack:0.002, decay:0.05, gain:0.14, slide:0.35}); noise({attack:0.002, decay:0.03, gain:0.06, filter:3000, type:'highpass'}); },
  shootSpread() { tone({freq:900, type:'triangle', attack:0.002, decay:0.07, gain:0.18, slide:0.4}); tone({freq:1400, type:'triangle', attack:0.002, decay:0.07, gain:0.12, slide:0.4}); },
  shootFire() { noise({attack:0.002, decay:0.15, gain:0.2, filter:800, type:'lowpass'}); tone({freq:320, type:'sawtooth', attack:0.002, decay:0.12, gain:0.14, slide:0.6}); },
  shootLaser() { tone({freq:1800, type:'square', attack:0.003, decay:0.22, gain:0.25, slide:0.2}); tone({freq:2400, type:'square', attack:0.005, decay:0.2, gain:0.1, slide:0.3}); },
  shootHoming() { tone({freq:520, type:'sine', attack:0.005, decay:0.3, gain:0.18, slide:1.8}); },
  jump() { tone({freq:620, type:'square', attack:0.002, decay:0.1, gain:0.18, slide:1.4}); },
  land() { noise({attack:0.002, decay:0.08, gain:0.15, filter:400, type:'lowpass'}); tone({freq:140, type:'square', attack:0.002, decay:0.06, gain:0.12, slide:0.4}); },
  hit() { noise({attack:0.002, decay:0.1, gain:0.2, filter:700, type:'lowpass'}); tone({freq:180, type:'square', attack:0.002, decay:0.08, gain:0.12, slide:0.4}); },
  enemyDeath() { tone({freq:420, type:'sawtooth', attack:0.005, decay:0.22, gain:0.2, slide:0.3}); noise({attack:0.002, decay:0.16, gain:0.12, filter:600, type:'lowpass'}); },
  explosion() { noise({attack:0.003, decay:0.4, gain:0.4, filter:450, type:'lowpass'}); tone({freq:80, type:'sawtooth', attack:0.005, decay:0.3, gain:0.25, slide:0.3}); },
  bomb() { tone({freq:160, type:'sawtooth', attack:0.01, decay:0.8, gain:0.35, slide:0.15}); noise({attack:0.01, decay:0.7, gain:0.25, filter:500, type:'lowpass'}); },
  powerup() { tone({freq:880, type:'triangle', attack:0.002, decay:0.08, gain:0.22, slide:1.6}); tone({freq:1320, type:'triangle', attack:0.02, decay:0.1, gain:0.18, slide:1.4}); tone({freq:1760, type:'triangle', attack:0.04, decay:0.12, gain:0.14, slide:1.2}); },
  die() { tone({freq:220, type:'sawtooth', attack:0.005, decay:0.7, gain:0.3, slide:0.1}); noise({attack:0.005, decay:0.5, gain:0.2, filter:400, type:'lowpass'}); },
  stageStart() { tone({freq:440, type:'sawtooth', attack:0.01, decay:0.3, gain:0.28, slide:1.7}); tone({freq:660, type:'sawtooth', attack:0.05, decay:0.4, gain:0.2, slide:1.5}); },
  bossIntro() { tone({freq:70, type:'sawtooth', attack:0.02, decay:1.2, gain:0.4, slide:1.2}); noise({attack:0.04, decay:1, gain:0.3, filter:500, type:'lowpass'}); },
  menu() { tone({freq:680, type:'square', attack:0.002, decay:0.08, gain:0.18, slide:1.5}); },
  select() { tone({freq:900, type:'square', attack:0.002, decay:0.1, gain:0.2, slide:1.7}); },
  empty() { tone({freq:160, type:'triangle', attack:0.002, decay:0.06, gain:0.08}); },
  oneUp() { tone({freq:880, type:'square', attack:0.003, decay:0.12, gain:0.25, slide:1.6}); setTimeout(()=>tone({freq:1320, type:'square', attack:0.003, decay:0.12, gain:0.22, slide:1.5}), 120); setTimeout(()=>tone({freq:1760, type:'square', attack:0.003, decay:0.18, gain:0.2, slide:1.4}), 240); },
};
