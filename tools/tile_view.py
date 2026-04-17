#!/usr/bin/env python3
"""Render a chunk of ROM bytes as SNES 4bpp tiles to a PNG.
Usage: tile_view.py <rom> <offset_hex> <num_tiles> <out.png> [palette_offset_hex]

SNES 4bpp tile = 32 bytes per 8x8 tile, planar:
  bytes 0..15: bit0 and bit1 interleaved by line (2 bytes per line)
  bytes 16..31: bit2 and bit3 interleaved by line
"""
import sys
from PIL import Image

DEFAULT_PAL = [
    (0, 0, 0), (40, 30, 20), (80, 50, 30), (140, 80, 40),
    (200, 130, 70), (240, 180, 110), (255, 220, 160), (255, 255, 230),
    (30, 20, 80), (70, 40, 140), (130, 70, 200), (200, 110, 240),
    (20, 60, 20), (50, 140, 60), (100, 220, 120), (255, 255, 255),
]

def decode_4bpp(tile_bytes):
    """Return 8x8 list of palette indices."""
    rows = []
    for y in range(8):
        b01_lo = tile_bytes[y*2]
        b01_hi = tile_bytes[y*2 + 1]
        b23_lo = tile_bytes[16 + y*2]
        b23_hi = tile_bytes[16 + y*2 + 1]
        row = []
        for x in range(8):
            bit = 7 - x
            p = ((b01_lo >> bit) & 1) | (((b01_hi >> bit) & 1) << 1) | (((b23_lo >> bit) & 1) << 2) | (((b23_hi >> bit) & 1) << 3)
            row.append(p)
        rows.append(row)
    return rows

def bgr555_to_rgb(w):
    r = (w & 0x1F) << 3
    g = ((w >> 5) & 0x1F) << 3
    b = ((w >> 10) & 0x1F) << 3
    return (r, g, b)

def read_palette(data, offset, num_colors=16):
    pal = []
    for i in range(num_colors):
        w = data[offset + i*2] | (data[offset + i*2 + 1] << 8)
        pal.append(bgr555_to_rgb(w))
    return pal

if __name__ == '__main__':
    rom_path = sys.argv[1]
    offset = int(sys.argv[2], 16)
    num_tiles = int(sys.argv[3])
    out = sys.argv[4]
    pal_offset = int(sys.argv[5], 16) if len(sys.argv) > 5 else None

    with open(rom_path, 'rb') as f:
        data = f.read()

    pal = read_palette(data, pal_offset) if pal_offset else DEFAULT_PAL

    # layout: 16 tiles per row
    cols = 16
    rows_of_tiles = (num_tiles + cols - 1) // cols
    img_w = cols * 8
    img_h = rows_of_tiles * 8
    img = Image.new('RGB', (img_w, img_h), (255, 0, 255))
    for t in range(num_tiles):
        tile_bytes = data[offset + t*32 : offset + t*32 + 32]
        if len(tile_bytes) < 32: break
        pixels = decode_4bpp(tile_bytes)
        tx = (t % cols) * 8
        ty = (t // cols) * 8
        for y in range(8):
            for x in range(8):
                idx = pixels[y][x]
                img.putpixel((tx + x, ty + y), pal[idx % len(pal)])
    img = img.resize((img_w * 4, img_h * 4), Image.NEAREST)
    img.save(out)
    print(f"[+] Rendered {num_tiles} tiles from 0x{offset:06X} to {out}")
