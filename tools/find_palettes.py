#!/usr/bin/env python3
"""Scan ROM for probable SNES palette blocks.
SNES color = 16-bit BGR555: 0bbbbbgggggrrrrr
Palette = 32 bytes (16 colors).
Heuristic: look for 32-byte blocks where bytes stay under 0x80 (high bit of each color byte = 0),
no consecutive 0xFF, and entropy is reasonable.
"""
import sys

def score_palette(block):
    if len(block) != 32: return 0
    # High bit of each word must be 0 (valid SNES color)
    score = 0
    for i in range(0, 32, 2):
        w = block[i] | (block[i+1] << 8)
        if w & 0x8000 == 0: score += 1
    # avoid all-zero or all-FF
    if block == b'\x00' * 32: return 0
    if block == b'\xFF' * 32: return 0
    return score

def bgr555_to_rgb(w):
    r = (w & 0x1F) << 3
    g = ((w >> 5) & 0x1F) << 3
    b = ((w >> 10) & 0x1F) << 3
    return (r, g, b)

def dump_palette(block):
    out = []
    for i in range(0, 32, 2):
        w = block[i] | (block[i+1] << 8)
        r, g, b = bgr555_to_rgb(w)
        out.append(f"#{r:02X}{g:02X}{b:02X}")
    return ' '.join(out)

if __name__ == '__main__':
    path = sys.argv[1]
    with open(path, 'rb') as f:
        data = f.read()
    min_score = 15
    print(f"Scanning {path} for palette blocks (score >= {min_score}/16)")
    for off in range(0, len(data) - 32, 16):
        block = data[off:off+32]
        sc = score_palette(block)
        if sc >= min_score:
            colors = dump_palette(block)
            print(f"0x{off:06X}  score={sc}/16  {colors}")
