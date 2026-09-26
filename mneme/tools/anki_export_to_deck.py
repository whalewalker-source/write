#!/usr/bin/env python3
"""Convert an Anki text export (or any TSV/CSV) into a Mneme deck.

In Anki: File > Export > "Notes in Plain Text (.txt)", pick the deck, and tick
"Include unique identifier" so watch progress survives later edits to a card.
HTML on or off both work; tags, note type and deck columns are detected from
the header lines Anki writes.

Examples
  anki_export_to_deck.py export.txt -o greek.json
  anki_export_to_deck.py export.txt --id greek-vocab --name "Greek vocab" -o greek.json
  anki_export_to_deck.py export.txt --js ../decks/greek-vocab.js      # bundle into the app
  anki_export_to_deck.py export.txt --front 2 --back 1 --note 0      # swap fields, no note
  anki_export_to_deck.py --selftest

Field numbers are 1-based and count only the note's own fields (metadata
columns are skipped). Output JSON: {"id", "name", "cards": [{"id","f","b","n"}]}.
"""
import argparse
import csv
import hashlib
import html
import io
import json
import re
import sys
import unicodedata
from pathlib import Path

TAG_RE = re.compile(r"<[^>]+>")
SOUND_RE = re.compile(r"\[sound:[^\]]*\]")
BREAK_RE = re.compile(r"<\s*br\s*/?\s*>|</\s*(div|p|li|tr)\s*>", re.I)
WS_RE = re.compile(r"\s+")
SEPARATORS = {
    "tab": "\t",
    "comma": ",",
    "semicolon": ";",
    "space": " ",
    "pipe": "|",
    "colon": ":",
}


def clean(text, is_html):
    t = (text or "").replace("\r", "")
    t = SOUND_RE.sub("", t)
    if is_html or "<" in t:
        t = BREAK_RE.sub(" / ", t)
        t = TAG_RE.sub("", t)
    t = html.unescape(t)
    t = t.replace("\n", " / ")
    t = WS_RE.sub(" ", t)
    t = re.sub(r"(\s*/\s*)+", " / ", t).strip()
    t = re.sub(r"^/\s*|\s*/$", "", t).strip()
    # Precomposed polytonic characters: the watch font has no shaping engine.
    return unicodedata.normalize("NFC", t)


def parse_export(text):
    """Return (rows, meta). rows are lists of raw column strings."""
    meta = {}
    lines = text.split("\n")
    start = 0
    for i, line in enumerate(lines):
        if line.startswith("#") and ":" in line:
            key, value = line[1:].split(":", 1)
            meta[key.strip().lower()] = value.strip()
            start = i + 1
        else:
            break
    sep_name = meta.get("separator", "tab").lower()
    sep = SEPARATORS.get(sep_name, sep_name if len(sep_name) == 1 else "\t")
    body = "\n".join(lines[start:])
    rows = [r for r in csv.reader(io.StringIO(body), delimiter=sep, quotechar='"') if any(c.strip() for c in r)]
    return rows, meta


def meta_column(meta, name):
    v = meta.get(name)
    return int(v) if v and v.isdigit() else None


def first_meaning(back, note):
    """Keep the first meaning on the back; move the rest to the front of the note."""
    parts = re.split(r"[;,]", back, 1)
    if len(parts) == 2 and parts[0].strip() and parts[1].strip():
        rest = parts[1].strip()
        return parts[0].strip(), (rest + " · " + note) if note else rest
    return back, note


def convert(
    text,
    front=1,
    back=2,
    note=3,
    deck_id=None,
    deck_name=None,
    fallback_name="deck",
    split_back=False,
):
    rows, meta = parse_export(text)
    is_html = meta.get("html", "false").lower() == "true"
    guid_col = meta_column(meta, "guid column")
    deck_col = meta_column(meta, "deck column")
    skip = {c for c in (guid_col, meta_column(meta, "notetype column"), deck_col, meta_column(meta, "tags column")) if c}

    cards = []
    seen = set()
    first_deck = None
    for row in rows:
        fields = [row[i] for i in range(len(row)) if (i + 1) not in skip]
        if deck_col and first_deck is None and len(row) >= deck_col:
            first_deck = row[deck_col - 1].split("::")[-1].strip() or None

        def field(n):
            return clean(fields[n - 1], is_html) if n and 0 < n <= len(fields) else ""

        f, b, n = field(front), field(back), field(note)
        if not f or not b:
            continue
        if split_back:
            b, n = first_meaning(b, n)
        guid = row[guid_col - 1].strip() if guid_col and len(row) >= guid_col else ""
        cid = guid or hashlib.sha1(f.encode("utf-8")).hexdigest()[:10]
        if cid in seen:
            continue
        seen.add(cid)
        cards.append({"id": cid, "f": f, "b": b, "n": n})

    name = deck_name or first_deck or fallback_name
    did = deck_id or re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "deck"
    return {"id": did, "name": name, "cards": cards}


def selftest():
    sample = (
        "#separator:tab\n#html:true\n#guid column:1\n#notetype column:2\n#deck column:3\n#tags column:6\n"
        "abc123\tBasic\tGreek::Vocab\tλόγος, λόγου, ὁ\tword<br>speech&nbsp;\tnoun\n"
        'def456\tBasic\tGreek::Vocab\t"ἀρχή, ἀρχῆς, ἡ"\t<div>beginning</div><div>rule</div>[sound:a.mp3]\t\n'
        "ghi789\tBasic\tGreek::Vocab\t\tmissing front\t\n"
        "abc123\tBasic\tGreek::Vocab\tλόγος, λόγου, ὁ\tduplicate\t\n"
    )
    deck = convert(sample, note=0)
    assert deck["name"] == "Vocab", deck["name"]
    assert deck["id"] == "vocab", deck["id"]
    assert [c["id"] for c in deck["cards"]] == ["abc123", "def456"], deck["cards"]
    assert deck["cards"][0]["b"] == "word / speech", deck["cards"][0]["b"]
    assert deck["cards"][1]["b"] == "beginning / rule", deck["cards"][1]["b"]
    assert deck["cards"][1]["n"] == ""
    assert all(unicodedata.normalize("NFC", c["f"]) == c["f"] for c in deck["cards"])
    # decomposed input (omicron + combining acute) becomes precomposed
    plain = "λόγος\tword\n"
    d2 = convert(plain, note=0, deck_name="Plain")
    assert d2["cards"][0]["f"] == "λόγος" and len(d2["cards"][0]["f"]) == 5
    assert d2["id"] == "plain"
    # --first-meaning keeps the first sense on the back and moves the rest to the note
    d3 = convert("λόγος\tword, speech; account\tnoun\n", deck_name="Split", split_back=True)
    assert d3["cards"][0]["b"] == "word", d3["cards"][0]
    assert d3["cards"][0]["n"] == "speech; account · noun", d3["cards"][0]
    assert first_meaning("peace", "") == ("peace", "")
    print("selftest ok")


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("export", nargs="?", help="Anki .txt export, or a TSV/CSV file")
    p.add_argument("-o", "--out", help="write JSON here (default: stdout)")
    p.add_argument("--js", help="write an ES module (export default {...}) here, for bundling")
    p.add_argument("--id", dest="deck_id", help="deck id (default: derived from the name)")
    p.add_argument("--name", dest="deck_name", help="deck name (default: Anki deck column or file name)")
    p.add_argument("--front", type=int, default=1, help="field number for the front (default 1)")
    p.add_argument("--back", type=int, default=2, help="field number for the back (default 2)")
    p.add_argument("--note", type=int, default=3, help="field number for the note, 0 for none (default 3)")
    p.add_argument(
        "--first-meaning",
        action="store_true",
        help="keep only the first meaning (up to the first comma or semicolon) on the back; move the rest into the note",
    )
    p.add_argument(
        "--max-back",
        type=int,
        default=20,
        help="warn about backs longer than this many characters (default 20, the watch band's comfortable limit)",
    )
    p.add_argument("--selftest", action="store_true")
    args = p.parse_args(argv)

    if args.selftest:
        selftest()
        return 0
    if not args.export:
        p.error("an export file is required")

    path = Path(args.export)
    text = path.read_text(encoding="utf-8-sig")
    deck = convert(
        text,
        front=args.front,
        back=args.back,
        note=args.note,
        deck_id=args.deck_id,
        deck_name=args.deck_name,
        fallback_name=path.stem,
        split_back=args.first_meaning,
    )
    if not deck["cards"]:
        print("no cards found; check --front/--back", file=sys.stderr)
        return 1
    long_backs = [c for c in deck["cards"] if len(c["b"]) > args.max_back]
    if long_backs:
        sample = "; ".join(c["b"] for c in long_backs[:3])
        print(
            f"warning: {len(long_backs)} back(s) longer than {args.max_back} characters will render small "
            f"on the watch (e.g. {sample}). Consider --first-meaning.",
            file=sys.stderr,
        )

    payload = json.dumps(deck, ensure_ascii=False, indent=1)
    if args.js:
        Path(args.js).write_text("export default " + payload + "\n", encoding="utf-8")
        print(f"wrote {len(deck['cards'])} cards to {args.js}", file=sys.stderr)
    if args.out:
        Path(args.out).write_text(payload + "\n", encoding="utf-8")
        print(f"wrote {len(deck['cards'])} cards to {args.out}", file=sys.stderr)
    if not args.js and not args.out:
        print(payload)
    return 0


if __name__ == "__main__":
    sys.exit(main())
