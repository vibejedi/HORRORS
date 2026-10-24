#!/usr/bin/env python3
"""Read-only, metadata-only inventory of a locally supplied GameMaker ZIP.

Usage: python3 tools/inspect_woh.py /path/to/game.zip
Outputs structural facts; does not extract, execute or reproduce assets or story.
Requires Python 3.10+ stdlib only.
"""
from __future__ import annotations
import collections
import hashlib
import json
import re
import struct
import sys
import zipfile
from pathlib import Path

RESOURCE_CHUNKS = ('SOND', 'SPRT', 'BGND', 'PATH', 'SCPT', 'SHDR',
                   'FONT', 'TMLN', 'OBJT', 'ROOM', 'TPAG', 'STRG', 'TXTR', 'AUDO')
CATEGORIES = ('combat', 'event', 'mystery', 'item', 'save', 'doom', 'enemy')


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def u32(buffer: bytes, offset: int) -> int:
    if offset < 0 or offset + 4 > len(buffer):
        raise ValueError(f'out-of-range integer at {offset}')
    return struct.unpack_from('<I', buffer, offset)[0]


def game_chunks(data: bytes) -> dict[str, tuple[int, int]]:
    if data[:4] != b'FORM' or u32(data, 4) != len(data) - 8:
        raise ValueError('Unexpected GameMaker FORM header or length')
    pos = 8
    chunks: dict[str, tuple[int, int]] = {}
    while pos < len(data):
        if pos + 8 > len(data):
            raise ValueError('Incomplete resource chunk header')
        tag = data[pos:pos+4].decode('ascii')
        size = u32(data, pos+4)
        if tag in chunks or pos + 8 + size > len(data):
            raise ValueError(f'Invalid or repeated chunk: {tag}')
        chunks[tag] = (pos+8, size)
        pos += 8 + size
    return chunks


def read_scripts(data: bytes, chunks: dict[str, tuple[int, int]]) -> list[str]:
    if 'SCPT' not in chunks:
        return []
    start, length = chunks['SCPT']
    count = u32(data, start)
    if count * 4 + 4 > length:
        raise ValueError('Invalid script pointer table length')
    names: list[str] = []
    for i in range(count):
        script_offset = u32(data, start + 4 + 4*i)
        name_offset = u32(data, script_offset)
        if name_offset >= len(data):
            raise ValueError('Invalid script name offset')
        end = data.find(b'\0', name_offset, min(len(data), name_offset+512))
        if end < 0:
            raise ValueError('Unterminated script name')
        names.append(data[name_offset:end].decode('utf-8', 'replace'))
    return names


def inspect(path: Path) -> dict:
    if not path.is_file():
        raise FileNotFoundError(path)
    with zipfile.ZipFile(path) as z:
        if 'data.win' not in z.namelist() or 'worldofhorror.exe' not in z.namelist():
            raise ValueError('Missing expected executable or GameMaker data.win')
        files = [entry for entry in z.infolist() if not entry.is_dir()]
        extensions = collections.Counter(Path(entry.filename).suffix.lower() for entry in files)
        languages = collections.Counter()
        ito_sections = collections.Counter()
        ito_fields: dict[str, set[str]] = collections.defaultdict(set)
        for entry in files:
            if entry.filename.startswith('language/') and entry.filename.endswith('.jn'):
                languages[entry.filename.split('/')[1]] += 1
            if not entry.filename.endswith('.ito'):
                continue
            section = ''
            for line in z.read(entry).decode('utf8', 'replace').splitlines():
                line = line.strip()
                if re.fullmatch(r'\[[^\[\]]+\]', line):
                    section = line[1:-1].lower()
                    ito_sections[section] += 1
                elif '=' in line and section:
                    # Only keys; never copy values/narrative.
                    ito_fields[section].add(line.split('=', 1)[0].strip().lower())
        data = z.read('data.win')
        chunks = game_chunks(data)
        names = read_scripts(data, chunks)
        counts = {key: u32(data, chunks[key][0]) for key in RESOURCE_CHUNKS if key in chunks}
        category_count = {key: sum(key in name.lower() and not name.startswith('gml_Script_') for name in names) for key in CATEGORIES}
        return {
            'source_name': path.name,
            'archive_sha256': sha256(path),
            'archive_bytes': path.stat().st_size,
            'content_file_count': len(files),
            'file_extension_counts': dict(sorted(extensions.items())),
            'language_files': dict(sorted(languages.items())),
            'game_data_bytes': len(data),
            'native_executable_bytes': z.getinfo('worldofhorror.exe').file_size,
            'gamedata_chunk_names': list(chunks),
            'gamedata_resource_counts': counts,
            'compiled_yyc_indicators': {
                'no_code_chunk': 'CODE' not in chunks,
                'no_vari_chunk': 'VARI' not in chunks,
                'no_func_chunk': 'FUNC' not in chunks,
            },
            'script_table_category_mentions_excluding_gml_wrappers': category_count,
            'custom_mod_ito_section_occurrences': dict(sorted(ito_sections.items())),
            'custom_mod_sample_field_names': {
                section: sorted(ito_fields[section]) for section in ('event', 'enemy', 'mystery', 'progress', 'character')
            },
            'caveat': 'Metadata only. Counts are table entries, not unique mechanics. No code decompilation or gameplay execution performed.'
        }


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        raise SystemExit(2)
    print(json.dumps(inspect(Path(sys.argv[1])), indent=2, ensure_ascii=False))
