"""
Turn the 16 Moxie session sheets (DOCX) into plain-text review drafts.

Usage (from the repo folder):
    python -I tools/extract_moxie.py <folder with Session_NN_*.docx> <output folder>

The output folder must be OUTSIDE this repo. The repo is public, and the lesson text
can't be published until reuse permissions are confirmed (planning/MOXIE_VALIDATION.md,
item 12). Reviewers use the drafts to fill in assets/js/data/moxie.js once that's done.

Each draft keeps the order of the sheet, marks headings, keeps code lines and the
____ blanks exactly, and lists the embedded diagrams so each one gets alt text and a
text version. Standard library only; nothing is run from the source folder.
"""
import pathlib
import re
import sys
import zipfile
from xml.etree import ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
HEADINGS = {"YOUR MISSION", "WHAT YOU NEED", "HOW WE WORK", "CONNECT IT", "CODE IT", "BUILD IT", "TEST IT",
            "CHECKOFF", "STRETCH", "YOUR PROJECT MUST HAVE", "CONSTRAINTS (LIMITS)"}


def paragraphs(docx):
    """Yield (text, is_code) for each paragraph and table row, in document order."""
    with zipfile.ZipFile(docx) as z:
        body = ET.fromstring(z.read("word/document.xml")).find(f"{W}body")
        media = sorted(n for n in z.namelist() if n.startswith("word/media/"))
    for block in body:
        if block.tag == f"{W}p":
            text = "".join(t.text or "" for t in block.iter(f"{W}t"))
            fonts = {f.get(f"{W}ascii", "") for f in block.iter(f"{W}rFonts")}
            yield text, any("Consol" in f or "Courier" in f or "Mono" in f for f in fonts)
        elif block.tag == f"{W}tbl":
            for row in block.iter(f"{W}tr"):
                cells = ["".join(t.text or "" for t in cell.iter(f"{W}t")).strip() for cell in row.iter(f"{W}tc")]
                if any(cells):
                    yield " | ".join(cells), False
    yield None, media


def draft(docx):
    out, media = [f"# {docx.name}", ""], []
    for text, flag in paragraphs(docx):
        if text is None:
            media = flag
            break
        t = text.rstrip()
        if not t.strip():
            continue
        if t.strip().upper() in HEADINGS or re.match(r"^SESSION \d+", t.strip()):
            out += ["", f"## {t.strip()}"]
        elif flag or re.search(r"[;{}]\s*(//.*)?$|^\s*(void|const|int|#include)\b", t):
            out.append(f"    {t}")  # code: indented, blanks kept exactly
        else:
            out.append(t.strip())
    out += ["", "## Diagrams (each needs alt text and a text version)"] + [f"- {m}" for m in media]
    return "\n".join(out) + "\n"


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, dst = pathlib.Path(sys.argv[1]).resolve(), pathlib.Path(sys.argv[2]).resolve()
    if dst == ROOT or ROOT in dst.parents:
        sys.exit("Write the drafts outside the repo: the lesson text can't be published yet.")
    files = sorted(src.glob("Session_*.docx"))
    if len(files) != 16:
        print(f"Note: found {len(files)} session files, expected 16.")
    dst.mkdir(parents=True, exist_ok=True)
    for f in files:
        (dst / (f.stem + ".md")).write_text(draft(f), encoding="utf-8")
    print(f"Wrote {len(files)} drafts to {dst}")


if __name__ == "__main__":
    main()
