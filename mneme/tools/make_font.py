#!/usr/bin/env python3
"""Rebuild the bundled watch font: a Noto Sans subset with Latin, Greek and
polytonic Greek Extended (about 130 KB instead of 430 KB).

  pip install fonttools
  python3 tools/make_font.py /path/to/NotoSans-Regular.ttf

Noto Sans (OFL) is at https://github.com/notofonts/notofonts.github.io
(fonts/NotoSans/unhinted/ttf/NotoSans-Regular.ttf). Any TTF with Greek
Extended coverage works; keep the output name or update utils/layout.js.
"""
import os
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

RANGES = ",".join(
    [
        "U+0020-007E",  # Basic Latin
        "U+00A0-00FF",  # Latin-1 Supplement
        "U+0100-017F",  # Latin Extended-A
        "U+0300-036F",  # Combining diacritics
        "U+0370-03FF",  # Greek and Coptic
        "U+1F00-1FFF",  # Greek Extended (polytonic)
        "U+2000-206F",  # General punctuation
        "U+2190-2193",  # Arrows
        "U+2022,U+2026,U+20AC",
    ]
)
CHECK = [0x1F00, 0x1FB6, 0x1FE5, 0x1FF6, 0x1FC3, 0x1F94, 0x03C2]


def main(src, out):
    subset.main(
        [
            src,
            f"--output-file={out}",
            f"--unicodes={RANGES}",
            "--layout-features=*",
            "--no-hinting",
            "--desubroutinize",
            "--name-IDs=*",
            "--notdef-outline",
        ]
    )
    cmap = TTFont(out).getBestCmap()
    missing = [hex(c) for c in CHECK if c not in cmap]
    if missing:
        print("missing glyphs:", ", ".join(missing), file=sys.stderr)
        return 1
    print(f"{out}: {os.path.getsize(out)} bytes, {len(cmap)} code points")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    target = Path(__file__).resolve().parent.parent / "assets" / "active2r" / "fonts" / "NotoSansGreek-Regular.ttf"
    target.parent.mkdir(parents=True, exist_ok=True)
    sys.exit(main(sys.argv[1], str(sys.argv[2] if len(sys.argv) > 2 else target)))
