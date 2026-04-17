#!/usr/bin/env python3
"""Find printable ASCII strings in ROM."""
import sys, re

path = sys.argv[1]
min_len = int(sys.argv[2]) if len(sys.argv) > 2 else 4

with open(path, 'rb') as f:
    data = f.read()

pat = re.compile(rb'[ -~]{%d,}' % min_len)
for m in pat.finditer(data):
    offset = m.start()
    s = m.group().decode('ascii', errors='replace')
    print(f"0x{offset:06X}  {s}")
