#!/usr/bin/env python3
"""Core ROM editing utilities for Contra III hack.
- patch_header_title: change internal 21-char title
- recalc_checksum: fix SNES header checksum after edits
- make_ips: build IPS patch from original vs modified
- apply_ips: apply IPS patch to a ROM
"""
import sys, os, struct

def patch_header_title(rom_path, new_title, out_path, header_offset=0x7FC0):
    """Replace the internal title (21 bytes) at offset."""
    with open(rom_path, 'rb') as f:
        data = bytearray(f.read())
    assert len(new_title) <= 21, "Title max 21 chars"
    title_bytes = new_title.ljust(21, ' ').encode('ascii')
    data[header_offset:header_offset+21] = title_bytes
    with open(out_path, 'wb') as f:
        f.write(data)
    print(f"[+] Title patched: '{new_title}' -> {out_path}")

def recalc_checksum(rom_path, header_offset=0x7FC0):
    """Recalculate SNES checksum at header_offset+28..31."""
    with open(rom_path, 'rb') as f:
        data = bytearray(f.read())
    # zero out checksum + complement before summing
    data[header_offset+28:header_offset+30] = b'\xFF\xFF'
    data[header_offset+30:header_offset+32] = b'\x00\x00'
    checksum = sum(data) & 0xFFFF
    complement = checksum ^ 0xFFFF
    data[header_offset+28:header_offset+30] = struct.pack('<H', complement)
    data[header_offset+30:header_offset+32] = struct.pack('<H', checksum)
    with open(rom_path, 'wb') as f:
        f.write(data)
    print(f"[+] Checksum fixed: 0x{checksum:04X} (complement 0x{complement:04X})")

def make_ips(orig_path, mod_path, patch_path):
    """Create an IPS patch from differences."""
    with open(orig_path, 'rb') as f: orig = f.read()
    with open(mod_path, 'rb') as f: mod = f.read()
    # walk forward finding diff runs
    records = []
    i = 0
    n = min(len(orig), len(mod))
    while i < n:
        if orig[i] != mod[i]:
            start = i
            while i < n and orig[i] != mod[i] and (i - start) < 0xFFFF:
                i += 1
            end = i
            records.append((start, mod[start:end]))
        else:
            i += 1
    if len(mod) > len(orig):
        records.append((len(orig), mod[len(orig):]))
    with open(patch_path, 'wb') as f:
        f.write(b'PATCH')
        for off, payload in records:
            if off >= 0x1000000: raise Exception('offset too large for IPS')
            f.write(off.to_bytes(3, 'big'))
            size = len(payload)
            if size > 0xFFFF: raise Exception('record too big; split needed')
            f.write(size.to_bytes(2, 'big'))
            f.write(payload)
        f.write(b'EOF')
    print(f"[+] IPS patch: {patch_path} ({len(records)} records, {os.path.getsize(patch_path)} bytes)")

def apply_ips(rom_path, patch_path, out_path):
    with open(rom_path, 'rb') as f: rom = bytearray(f.read())
    with open(patch_path, 'rb') as f: patch = f.read()
    assert patch[:5] == b'PATCH', "Not an IPS file"
    i = 5
    while True:
        if patch[i:i+3] == b'EOF': break
        off = int.from_bytes(patch[i:i+3], 'big'); i += 3
        size = int.from_bytes(patch[i:i+2], 'big'); i += 2
        if size == 0:
            # RLE record
            rle_size = int.from_bytes(patch[i:i+2], 'big'); i += 2
            val = patch[i]; i += 1
            while off + rle_size > len(rom):
                rom.append(0)
            rom[off:off+rle_size] = bytes([val]) * rle_size
        else:
            payload = patch[i:i+size]; i += size
            while off + size > len(rom):
                rom.append(0)
            rom[off:off+size] = payload
    with open(out_path, 'wb') as f:
        f.write(rom)
    print(f"[+] IPS applied: {out_path}")

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'help'
    if cmd == 'title':
        patch_header_title(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == 'checksum':
        recalc_checksum(sys.argv[2])
    elif cmd == 'makeips':
        make_ips(sys.argv[2], sys.argv[3], sys.argv[4])
    elif cmd == 'applyips':
        apply_ips(sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        print("Usage:")
        print("  rom_edit.py title <rom_in> <new_title> <rom_out>")
        print("  rom_edit.py checksum <rom>")
        print("  rom_edit.py makeips <orig> <mod> <patch.ips>")
        print("  rom_edit.py applyips <rom> <patch.ips> <out>")
