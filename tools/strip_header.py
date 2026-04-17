#!/usr/bin/env python3
"""Strip 512-byte copier header from SNES ROM."""
import sys, os

src = sys.argv[1]
dst = sys.argv[2]

with open(src, 'rb') as f:
    data = f.read()

if (len(data) % 1024) == 512:
    print(f"[+] Stripping 512-byte copier header from {src} ({len(data)} -> {len(data)-512} bytes)")
    data = data[512:]
else:
    print(f"[*] {src} has no copier header, copying as-is")

with open(dst, 'wb') as f:
    f.write(data)

print(f"[+] Wrote clean ROM to {dst}")
