#!/usr/bin/env python3
"""Rebuild the exact Chinese notebook font subset with fontTools.

Original font (Google Fonts official repository):
https://raw.githubusercontent.com/google/fonts/main/ofl/longcang/LongCang-Regular.ttf
Original license:
https://github.com/google/fonts/blob/main/ofl/longcang/OFL.txt

Usage:
  python build_handwriting_subset.py --source LongCang-Regular.ttf --output-dir subset

Requires fontTools. The original TTF is intentionally not included in the production
subset. The script verifies its SHA-256 before generating a deterministic subset.
"""
from pathlib import Path
import argparse
import hashlib
import json
from fontTools.ttLib import TTFont
from fontTools import subset

SOURCE_SHA256 = 'e5bf2c3f24ef2327c6f136d8f73e2f9dfdf44896fdbeb35a9515f44777bb91bc'
PHRASES = [
    '保安 · 采访提纲',
    '为何不怕苦，不怕死？',
    '贫苦农民出身',
    '劳作、受辱与参军',
    '艰苦没有消失',
    '为何仍敢面对苦难？',
]
# Include original review phrases plus punctuation that may occur in note grouping.
EXTRA_TEXT = '为什么不怕苦、不怕死？；。'
FONT_FAMILY = 'Baoan Notebook Handwriting Subset'
FONT_POSTSCRIPT_NAME = 'BaoanNotebookHandwritingSubset-Regular'


def build(source: Path, output_dir: Path) -> None:
    original_hash = hashlib.sha256(source.read_bytes()).hexdigest()
    if original_hash != SOURCE_SHA256:
        raise ValueError(f'Original font SHA-256 mismatch: {original_hash}')
    font = TTFont(source, recalcTimestamp=False)
    cmap = font.getBestCmap()
    requested = set(''.join(PHRASES) + EXTRA_TEXT)
    missing = requested - {chr(c) for c in cmap}
    if missing != {'·'}:
        raise ValueError(f'Unexpected missing characters: {sorted(missing)}')
    # The middle dot is rendered from the pre-existing Caveat face.
    selected = requested - missing
    options = subset.Options()
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    options.notdef_glyph = True
    options.notdef_outline = True
    options.recommended_glyphs = True
    options.recalc_timestamp = False
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=''.join(sorted(selected)))
    subsetter.subset(font)
    # Explicitly distinguish this current-copy subset from the original full font.
    name = font['name']
    renamed_ids = {1, 2, 3, 4, 6, 16, 17}
    name.names = [n for n in name.names if n.nameID not in renamed_ids]
    names = {
        1: FONT_FAMILY, 2: 'Regular',
        3: 'LongCang-2.001;BaoanNotebookHandwritingSubset-1.0',
        4: FONT_FAMILY + ' Regular', 6: FONT_POSTSCRIPT_NAME,
        16: FONT_FAMILY, 17: 'Regular',
    }
    for name_id, value in names.items():
        name.setName(value, name_id, 3, 1, 0x409)
        name.setName(value, name_id, 1, 0, 0)
    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / 'BaoanNotebookHandwritingSubset-Regular.ttf'
    font.save(output, reorderTables=True)
    final = TTFont(output)
    if any(ord(c) not in final.getBestCmap() for c in selected):
        raise RuntimeError('Generated subset lost required characters')
    report = {
        'font': FONT_FAMILY, 'source_family': 'Long Cang Regular',
        'source_version': '2.001', 'source_sha256': original_hash,
        'source_url': 'https://github.com/google/fonts/blob/main/ofl/longcang/LongCang-Regular.ttf',
        'download_url': 'https://raw.githubusercontent.com/google/fonts/main/ofl/longcang/LongCang-Regular.ttf',
        'license': 'SIL Open Font License 1.1',
        'license_url': 'https://github.com/google/fonts/blob/main/ofl/longcang/OFL.txt',
        'copyright': 'Copyright 2018 The Long Cang Project Authors (https://github.com/googlefonts/longcang)',
        'reserved_font_names': [],
        'modification': 'Current notebook Chinese character subset; internal family and PostScript names changed. Glyph outlines unchanged.',
        'phrases': PHRASES, 'extra_text': EXTRA_TEXT,
        'included_characters': ''.join(sorted(selected)),
        'codepoints': [f'U+{ord(c):04X}' for c in sorted(selected)],
        'caveat_fallback_characters': ['U+00B7 MIDDLE DOT'],
        'output_file': output.name, 'output_size_bytes': output.stat().st_size,
        'output_sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
    }
    (output_dir / 'FONT-SOURCE.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    (output_dir / 'notebook-font-characters.txt').write_text('\n'.join(PHRASES) + '\n' + EXTRA_TEXT + '\n')
    print(json.dumps(report, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=Path(__file__).parent / 'LongCang-Regular.ttf')
    parser.add_argument('--output-dir', type=Path, default=Path(__file__).parent / 'subset')
    args = parser.parse_args()
    build(args.source, args.output_dir)
