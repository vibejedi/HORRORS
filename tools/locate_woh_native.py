#!/usr/bin/env python3
"""Locate selected YYC-compiled GameMaker script entry points in a supplied PE.

Read only. This reports PE addresses and function ranges from x64 .pdata; it
never executes, copies, or translates game logic and cannot reconstruct GML.
Usage: python3 tools/locate_woh_native.py /private/path/worldofhorror.exe
"""
from __future__ import annotations
import bisect
import hashlib
import json
import struct
import sys
from pathlib import Path

LABELS = (
    'gml_Script_event_test',
    'gml_Script_event_choice',
    'gml_Script_combat_action',
    'gml_Script_combatsequence_init',
    'gml_Script_combat_sequenceend',
    'gml_Script_mystery_init',
    'gml_Script_mystery_text',
)


def read_pe(binary: bytes):
    if binary[:2] != b'MZ':
        raise ValueError('Not an MZ executable')
    pe_at = struct.unpack_from('<I', binary, 0x3c)[0]
    if binary[pe_at:pe_at + 4] != b'PE\0\0':
        raise ValueError('PE header missing')
    header = pe_at + 4
    machine, count = struct.unpack_from('<HH', binary, header)
    optional_size = struct.unpack_from('<H', binary, header + 16)[0]
    optional_offset = header + 20
    if machine != 0x8664 or struct.unpack_from('<H', binary, optional_offset)[0] != 0x20b:
        raise ValueError('Expected PE32+ x86-64')
    image_base = struct.unpack_from('<Q', binary, optional_offset + 24)[0]
    sections = {}
    table = optional_offset + optional_size
    for i in range(count):
        offset = table + i * 40
        name = binary[offset:offset+8].split(b'\0',1)[0].decode('ascii', 'replace')
        virtual_size, rva, raw_size, raw_at = struct.unpack_from('<IIII', binary, offset+8)
        sections[name]={'rva':rva,'virtual_size':virtual_size,'raw_offset':raw_at,'raw_size':raw_size}
    for name in ('.text', '.rdata', '.pdata'):
        if name not in sections:
            raise ValueError(f'Expected section {name} missing')
    return image_base, sections


def analyze(path: Path):
    binary = path.read_bytes()
    image_base, sections = read_pe(binary)
    text, rdata, pdata = (sections[name] for name in ('.text','.rdata','.pdata'))
    functions=[]
    for pos in range(pdata['raw_offset'], pdata['raw_offset']+pdata['raw_size']-11,12):
        begin,end,_unwind=struct.unpack_from('<III',binary,pos)
        if begin and begin<end and text['rva']<=begin<text['rva']+text['virtual_size']:
            functions.append((begin,end))
    functions.sort()
    starts=[x[0] for x in functions]
    # x64 RIP-relative LEA register,[RIP+disp32] common patterns used by YYC.
    # We search all register encodings, then check exact 64-bit referenced address.
    lea_locations={}
    lo=text['raw_offset'];hi=lo+text['raw_size']
    for rex in (0x48,0x4c):
        for modrm in (0x05,0x0d,0x15,0x1d,0x25,0x2d,0x35,0x3d):
            pattern=bytes((rex,0x8d,modrm))
            pos=lo
            while True:
                pos=binary.find(pattern,pos,hi)
                if pos<0:break
                if pos+7>hi:break
                displacement=struct.unpack_from('<i',binary,pos+3)[0]
                instruction_addr=image_base+text['rva']+(pos-lo)
                target=instruction_addr+7+displacement
                lea_locations.setdefault(target,[]).append(instruction_addr)
                pos+=3
    labels=[]
    for label in LABELS:
        search=label.encode('ascii')+b'\0'
        found=[]
        pos=rdata['raw_offset'];end=rdata['raw_offset']+rdata['raw_size']
        while (pos:=binary.find(search,pos,end))!=-1:
            target=image_base+rdata['rva']+(pos-rdata['raw_offset'])
            refs=[]
            for address in lea_locations.get(target,[]):
                index=bisect.bisect_right(starts,address-image_base)-1
                fn=functions[index] if index>=0 else None
                if not fn or not(fn[0]<=address-image_base<fn[1]):continue
                refs.append({'code_reference_va':f'0x{address:x}',
                             'function_start_va':f'0x{image_base+fn[0]:x}',
                             'function_end_va':f'0x{image_base+fn[1]:x}',
                             'function_bytes':fn[1]-fn[0]})
            found.append({'literal_va':f'0x{target:x}','references':refs})
            pos+=len(search)
        labels.append({'script':label,'locations':found})
    return {'source_file':path.name,'sha256':hashlib.sha256(binary).hexdigest(),
            'arch':'PE32+ x86-64', 'image_base':f'0x{image_base:x}',
            'native_unwind_entries':len(functions),'sections':{k:{'va':f'0x{image_base+v["rva"]:x}','size':v['virtual_size']} for k,v in sections.items() if k in ('.text','.rdata','.pdata')},
            'script_function_candidates':labels,
            'limits':'Names and RVA mappings only. Exact gameplay operations, branch semantics and formulas require deeper disassembly/runtime validation.'}


if __name__ == '__main__':
    if len(sys.argv)!=2:
        print(__doc__,file=sys.stderr);sys.exit(2)
    print(json.dumps(analyze(Path(sys.argv[1])),indent=2))
