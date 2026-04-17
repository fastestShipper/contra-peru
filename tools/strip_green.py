#!/usr/bin/env python3
"""Strip green-screen chroma key from sprite images and save as PNG with alpha."""
import sys, os
from PIL import Image

def strip_green(src, dst, tolerance=80):
    img = Image.open(src).convert('RGBA')
    w, h = img.size
    px = img.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # green screen: dominant green channel
            if g > 120 and g > r + 40 and g > b + 40:
                # fully transparent
                px[x, y] = (0, 0, 0, 0)
            elif g > r + 20 and g > b + 20 and g > 100:
                # edge pixel - partial transparency + despill
                # de-spill: reduce green channel
                nr = r
                ng = min(g, max(r, b))  # clamp green to max of r/b
                nb = b
                # alpha based on how green
                greenness = g - max(r, b)
                alpha = max(0, min(255, 255 - greenness * 2))
                px[x, y] = (nr, ng, nb, alpha)
    img.save(dst)
    print(f"[+] {src} -> {dst}")

if __name__ == '__main__':
    for src in sys.argv[1:]:
        if not os.path.exists(src):
            print(f"[!] skip: {src}")
            continue
        base = os.path.splitext(src)[0]
        dst = base + '.png'
        strip_green(src, dst)
