#!/usr/bin/env python3
"""Analyze SNES ROM header + show basic info."""
import sys, os

def read_header(data, offset):
    # SNES internal header: 21 bytes title @ offset, then mapping/type/size/etc
    title = data[offset:offset+21].decode('ascii', errors='replace')
    map_mode = data[offset+21]
    cart_type = data[offset+22]
    rom_size = data[offset+23]
    sram_size = data[offset+24]
    region = data[offset+25]
    dev_id = data[offset+26]
    version = data[offset+27]
    comp_chk = int.from_bytes(data[offset+28:offset+30], 'little')
    checksum = int.from_bytes(data[offset+30:offset+32], 'little')
    return {
        'title': title.rstrip('\x00 '),
        'map_mode': map_mode,
        'cart_type': cart_type,
        'rom_size_raw': rom_size,
        'rom_size_kb': 1 << rom_size if rom_size < 16 else 0,
        'sram_size': sram_size,
        'region': region,
        'dev_id': dev_id,
        'version': version,
        'complement': hex(comp_chk),
        'checksum': hex(checksum),
        'checksum_valid': (comp_chk ^ 0xFFFF) == checksum,
    }

def detect_format(path):
    size = os.path.getsize(path)
    with open(path, 'rb') as f:
        data = f.read()
    has_header_prefix = (size % 1024) == 512
    if has_header_prefix:
        data = data[512:]
    # try LoROM @ 0x7FC0 and HiROM @ 0xFFC0
    lorom = read_header(data, 0x7FC0)
    hirom = read_header(data, 0xFFC0) if len(data) >= 0x10000 else None
    return {
        'file_size': size,
        'has_copier_header': has_header_prefix,
        'lorom': lorom,
        'hirom': hirom,
        'data': data,
    }

if __name__ == '__main__':
    path = sys.argv[1] if len(sys.argv) > 1 else 'rom/contra3-original.sfc'
    info = detect_format(path)
    print(f"=== {path} ===")
    print(f"File size: {info['file_size']} bytes ({info['file_size']//1024} KB)")
    print(f"Copier header: {info['has_copier_header']}")
    print("\n--- LoROM candidate @ 0x7FC0 ---")
    for k, v in info['lorom'].items(): print(f"  {k}: {v}")
    if info['hirom']:
        print("\n--- HiROM candidate @ 0xFFC0 ---")
        for k, v in info['hirom'].items(): print(f"  {k}: {v}")
    # pick which one has valid checksum
    if info['lorom']['checksum_valid']:
        print("\n>>> ROM is LoROM (LoROM checksum valid)")
    elif info['hirom'] and info['hirom']['checksum_valid']:
        print("\n>>> ROM is HiROM (HiROM checksum valid)")
    else:
        print("\n!!! Neither checksum valid — check file")
