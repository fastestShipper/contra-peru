#!/usr/bin/env python3
"""Process AI-generated sprites: resize to game pixel sizes, preserve transparency, crop.
Also splits the Gregorio sprite sheet (2 frames) into individual images.
"""
import os
from PIL import Image

CHARS = 'game/assets/chars'
BG = 'game/assets/bg'
OUT = 'game/assets/processed'
os.makedirs(OUT, exist_ok=True)

def trim_transparent(img):
    """Crop transparent border."""
    bbox = img.getbbox()
    if bbox: return img.crop(bbox)
    return img

def fit_to_height(img, target_h):
    """Resize preserving aspect to target height (pixel-perfect nearest)."""
    w, h = img.size
    if h == target_h: return img
    new_w = max(1, int(w * target_h / h))
    return img.resize((new_w, target_h), Image.NEAREST)

def save(img, name):
    out_path = os.path.join(OUT, name)
    img.save(out_path)
    print(f"[+] {name}  {img.size}")

# --- Gregorio sprite sheet: split into 2 frames ---
src = Image.open(os.path.join(CHARS, 'gregorio-idle.png')).convert('RGBA')
w, h = src.size
# Assume 2 characters side by side, split at midpoint
left = src.crop((0, 0, w // 2, h))
right = src.crop((w // 2, 0, w, h))
# trim transparency and resize
left = trim_transparent(left)
right = trim_transparent(right)
idle = fit_to_height(left, 40)
shoot = fit_to_height(right, 40)
save(idle, 'greg-idle.png')
save(shoot, 'greg-shoot.png')

# Use the shooting frame as "run" (has gun visible)
save(shoot, 'greg-run-0.png')
save(shoot, 'greg-run-1.png')

# --- Other Gregorio poses ---
for src_name, out_name in [
    ('gregorio-jump.png', 'greg-jump.png'),
    ('gregorio-crouch.png', 'greg-crouch.png'),
]:
    src_path = os.path.join(CHARS, src_name)
    if not os.path.exists(src_path): continue
    img = Image.open(src_path).convert('RGBA')
    img = trim_transparent(img)
    if 'crouch' in out_name:
        img = fit_to_height(img, 28)
    else:
        img = fit_to_height(img, 40)
    save(img, out_name)

# --- Enemies ---
for src_name, out_name, target_h in [
    ('zombie-congresista.png', 'enemy-congresista.png', 36),
    ('zombie-ciudadano.png', 'enemy-ciudadano.png', 36),
    ('turret.png', 'enemy-turret.png', 24),
    ('roller.png', 'enemy-roller.png', 18),
    ('flyer.png', 'enemy-flyer.png', 14),
]:
    src_path = os.path.join(CHARS, src_name)
    if not os.path.exists(src_path):
        print(f"[!] missing {src_path}")
        continue
    img = Image.open(src_path).convert('RGBA')
    img = trim_transparent(img)
    img = fit_to_height(img, target_h)
    save(img, out_name)

# --- Boss Combi ---
src_path = os.path.join(CHARS, 'boss-combi.png')
if os.path.exists(src_path):
    img = Image.open(src_path).convert('RGBA')
    img = trim_transparent(img)
    # Boss is wide (horizontal vehicle)
    img = fit_to_height(img, 72)
    save(img, 'boss-combi.png')

# --- Backgrounds ---
for src_name, out_name in [
    ('bg-jiron-union.jpeg', 'bg-lima.png'),
    ('bg-plaza-sanmartin.jpeg', 'bg-plaza.png'),
    ('bg-congreso.jpeg', 'bg-congreso.png'),
]:
    src_path = os.path.join(BG, src_name)
    if not os.path.exists(src_path):
        print(f"[!] missing {src_path}")
        continue
    img = Image.open(src_path).convert('RGB')
    # Target height for parallax: 224 (full viewport) or 180 (leaves room for ground)
    img = fit_to_height(img, 224)
    save(img, out_name)

print("\n[+] Done. Processed sprites in:", OUT)
