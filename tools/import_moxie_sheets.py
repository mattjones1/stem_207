"""Import the 16 Moxie ESP32 student sheets (DOCX) into STEM 207.

    python -I tools/import_moxie_sheets.py <folder with Session_01_*.docx … Session_16_*.docx> [--check]

Writes assets/js/data/moxie-content.js (STEM.moxieContent, keyed by session id) and the wiring
diagrams to assets/img/moxie/session-NN-*.png. The shared header logo is skipped.
--check compares the sheets with the current moxie-content.js and reports what changed, without writing.

The generated file is reviewed by hand (alt text and diagram text versions are added in
assets/js/data/moxie.js). Reuse permission for this content was confirmed on October 22, 2026
(planning/MOXIE_VALIDATION.md, item 12). Never add answer keys: the sheets' blanks stay blanks.
Standard library only.
"""
import glob, json, os, re, sys, zipfile, hashlib
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JS = os.path.join(ROOT, "assets", "js", "data", "moxie-content.js")
OUT_IMG = os.path.join(ROOT, "assets", "img", "moxie")

HEADINGS = [
    ("mission", r"YOUR MISSION"), ("need", r"WHAT YOU NEED"), ("howWeWork", r"HOW WE WORK"), ("before", r"BEFORE YOU WIRE"),
    ("meet", r"MEET YOUR ESP32"), ("connect", r"CONNECT IT"), ("build", r"BUILD IT"), ("plan", r"PLAN IT FIRST.*"),
    ("code", r"CODE IT"), ("test", r"TEST IT"), ("stuck", r"STUCK\? CHECK THESE FIRST"), ("stretch", r"STRETCH GOAL"),
    ("think", r"THINK ABOUT IT"), ("checkoff", r"CHECKOFF.*"),
    # capstone sheets
    ("mustHave", r"YOUR PROJECT MUST HAVE"), ("constraints", r"CONSTRAINTS.*"), ("ideaBank", r"IDEA BANK.*"),
    ("define", r"1\. DEFINE THE PROBLEM"), ("criteria", r"2\. CRITERIA.*"), ("pins", r"3\. PARTS & PIN PLAN"),
    ("sketch", r"4\. SKETCH YOUR CIRCUIT"), ("codePlan", r"5\. PLAN THE CODE.*"), ("rubric", r"HOW YOUR PROJECT WILL BE SCORED"),
    ("standup", r"STAND-UP MEETING.*"), ("subsystems", r"SUBSYSTEM CHECKLIST"), ("tips", r"BUILD TIPS"), ("bugLog", r"BUG LOG"),
    ("changed", r"WHAT CHANGED FROM OUR PLAN.*"), ("testCriteria", r"1\. TEST AGAINST YOUR CRITERIA"), ("peer", r"2\. PEER FEEDBACK"),
    ("improve", r"3\. IMPROVE IT"), ("card", r"4\. SHOWCASE CARD"), ("pitch", r"5\. PLAN YOUR 1-MINUTE PITCH"),
    ("present", r"BEFORE YOU PRESENT"), ("audience", r"AUDIENCE FEEDBACK CARDS"), ("reflection", r"MY REFLECTION"),
    ("rate", r"RATE YOURSELF.*"),
    ("concept", r"HOW .+"),   # last: "HOW X WORKS" concept panels
]


def text_of(p):
    """A paragraph's text, leaving out text boxes inside drawings (diagram labels)."""
    out = []
    for el in p.iter():
        if el.tag == W + "txbxContent":
            continue
        if el.tag == W + "t":
            # skip runs nested in a text box
            out.append(el.text or "")
        elif el.tag == W + "tab":
            out.append("\t")
    return "".join(out)


def strip_textboxes(root):
    for parent in root.iter():
        for child in list(parent):
            if child.tag == W + "txbxContent":
                parent.remove(child)


def para_info(p, rels):
    t = text_of(p)
    font = None
    for rf in p.iter(W + "rFonts"):
        font = rf.get(W + "ascii") or font
    style = p.find(f"{W}pPr/{W}pStyle")
    imgs = [rels.get(b.get(R + "embed")) for b in p.iter(A + "blip") if b.get(R + "embed")]
    return {"t": t, "code": (font or "").lower().startswith("consolas"), "list": style is not None and style.get(W + "val") == "ListParagraph", "imgs": [i for i in imgs if i]}


def blocks(doc, rels):
    """Flatten the body into paragraphs and tables, in order."""
    body = doc.find(W + "body")
    seq = []
    for el in body:
        if el.tag == W + "p":
            seq.append(("p", para_info(el, rels)))
        elif el.tag == W + "tbl":
            rows = []
            for tr in el.findall(W + "tr"):
                cells = []
                for tc in tr.findall(W + "tc"):
                    cells.append([para_info(p, rels) for p in tc.iter(W + "p")])
                rows.append(cells)
            seq.append(("tbl", rows))
    return seq


def heading_key(t):
    s = t.strip()
    if not s or s != s.upper() or not re.search("[A-Z]{3}", s):
        return None
    for key, pat in HEADINGS:
        if re.fullmatch(pat, s):
            return key
    return None


def clean(s):
    return re.sub(r"\s+", " ", s.replace(" ", " ")).strip()


def parse(path, logo):
    z = zipfile.ZipFile(path)
    doc = ET.fromstring(z.read("word/document.xml"))
    strip_textboxes(doc)
    rel_xml = ET.fromstring(z.read("word/_rels/document.xml.rels"))
    rels = {r.get("Id"): r.get("Target") for r in rel_xml}
    seq = blocks(doc, rels)
    n = int(re.search(r"Session_(\d+)", path).group(1))
    rec = {"n": n, "file": os.path.basename(path), "sections": {}, "order": [], "images": []}
    cur = "_head"
    rec["sections"][cur] = []

    def add(item):
        rec["sections"].setdefault(cur, []).append(item)

    def handle_para(info, in_table):
        nonlocal cur
        k = heading_key(info["t"]) if not info["code"] else None
        if k:
            cur = k if k not in rec["sections"] else k + "2"
            rec["sections"][cur] = [{"heading": clean(info["t"])}]
            rec["order"].append(cur)
            return
        for img in info["imgs"]:
            name = img.split("/")[-1]
            if name != logo:
                rec["images"].append({"section": cur, "media": img})
        if info["t"].strip():
            add({"text": info["t"].rstrip(), "code": info["code"], "list": info["list"]})

    for kind, item in seq:
        if kind == "p":
            handle_para(item, False)
            continue
        rows = item
        # A table that holds headings (two-column layout boxes) is read cell by cell, in order.
        has_heading = any(heading_key(p["t"]) for row in rows for cell in row for p in cell)
        if has_heading:
            for row in rows:
                for cell in row:
                    for p in cell:
                        handle_para(p, True)
            continue
        grid = [[clean(" ".join(p["t"] for p in cell if p["t"].strip())) for cell in row] for row in rows]
        add({"table": grid, "paras": [clean(p["t"]) for row in rows for cell in row for p in cell if p["t"].strip()]})
        for row in rows:
            for cell in row:
                for p in cell:
                    for img in p["imgs"]:
                        if img.split("/")[-1] != logo:
                            rec["images"].append({"section": cur, "media": img})
    return rec, z


def shape(rec):
    """Turn raw sections into the fields the app uses."""
    S = rec["sections"]
    texts = lambda key: [clean(x["text"]) for x in S.get(key, []) if "text" in x]
    out = {"n": rec["n"], "file": rec["file"]}
    head = texts("_head")
    out["unitLabel"] = head[0] if head else ""
    out["title"] = head[1] if len(head) > 1 else ""
    out["based"] = head[2] if len(head) > 2 else ""
    for key in ["mission", "need", "howWeWork", "before", "connect", "test", "stuck", "mustHave", "constraints", "tips", "present", "sketch", "codePlan", "changed", "improve"]:
        if key in S:
            out[key] = texts(key)
    for key in ["meet", "concept", "plan", "define", "criteria", "pins", "ideaBank", "rubric", "standup", "subsystems", "bugLog", "testCriteria", "peer", "card", "pitch", "audience", "reflection", "rate"]:
        if key in S:
            sec = S[key]
            out[key] = {"heading": sec[0].get("heading", ""), "text": [clean(x["text"]) for x in sec if "text" in x and not x.get("code")],
                        "tables": [x["table"] for x in sec if "table" in x]}
    if "build" in S:
        sec = S["build"]
        out["build"] = {"notes": [clean(x["text"]) for x in sec if "text" in x], "tables": [x["table"] for x in sec if "table" in x]}
    if "code" in S:
        sec = [x for x in S["code"] if "text" in x]
        lines = [x["text"] for x in sec]
        # Prose ends with a period and has no ; or { (code lines and comments don't).
        prose = lambda l: (l.rstrip().endswith(".") and ";" not in l and "{" not in l and not l.lstrip().startswith("//") and not l.startswith(" "))
        intro = [clean(l) for l in lines if prose(l) and not l.startswith("Remember")]
        code = [l for l in lines if not prose(l) and not l.startswith("Remember")]
        rem = [clean(l) for l in lines if l.startswith("Remember")]
        out["code"] = {"intro": " ".join(intro), "lines": code, "remember": rem[0] if rem else ""}
    if "stretch" in S:
        t = texts("stretch")
        hint = [x for x in t if x.startswith("Hint:")]
        out["stretch"] = {"text": " ".join(x for x in t if not x.startswith("Hint:")), "hint": hint[0][5:].strip() if hint else ""}
    if "think" in S:
        out["think"] = " ".join(x for x in texts("think") if not re.fullmatch(r"_+", x))
    if "checkoff" in S:
        t = texts("checkoff")
        explain = [x for x in t if x.startswith("Be ready to explain:")]
        boxed = [p for x in S["checkoff"] if "paras" in x for p in x["paras"] if "☐" not in p and not p.startswith("Initials")]
        out["checkoff"] = [x for x in t if not x.startswith("Be ready to explain:")] + boxed
        out["explain"] = explain[0].split(":", 1)[1].strip() if explain else ""
        tabs = [x["table"] for x in S["checkoff"] if "table" in x]
        out["signoffs"] = [clean(c.replace("☐", "")) for tab in tabs for row in tab for c in row if "☐" in c]
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    check = "--check" in sys.argv
    if not args:
        print(__doc__); return 2
    files = sorted(glob.glob(os.path.join(args[0], "Session_*.docx")))
    if len(files) != 16:
        print(f"Expected 16 Session_*.docx files, found {len(files)}"); return 2
    # The shared header logo is the image every sheet has.
    counts = {}
    for f in files:
        for name in zipfile.ZipFile(f).namelist():
            if name.startswith("word/media/") and not name.endswith("/"):
                h = hashlib.sha1(zipfile.ZipFile(f).read(name)).hexdigest()
                counts.setdefault(h, set()).add(f)
    logo_hashes = {h for h, fs in counts.items() if len(fs) == len(files)}
    content, images = {}, {}
    for f in files:
        z = zipfile.ZipFile(f)
        logo = next((n.split("/")[-1] for n in z.namelist() if n.startswith("word/media/") and not n.endswith("/") and hashlib.sha1(z.read(n)).hexdigest() in logo_hashes), None)
        rec, z = parse(f, logo)
        sid = f"moxie-{rec['n']:02d}"
        content[sid] = shape(rec)
        for i, img in enumerate(rec["images"]):
            kind = "board" if img["section"] == "meet" else "wiring"
            name = f"session-{rec['n']:02d}-{kind}.png"
            images[name] = z.read("word/" + img["media"].lstrip("/").replace("word/", ""))
            content[sid].setdefault("images", {})[kind] = f"assets/img/moxie/{name}"
    js = ("/* GENERATED by tools/import_moxie_sheets.py from the 16 Moxie student sheets. Review by hand after each import.\n"
          " * Merged onto STEM.moxieSessions in assets/js/data/moxie.js. Reuse permission confirmed October 22, 2026. */\n"
          "window.STEM = window.STEM || {};\nwindow.STEM.moxieContent = " + json.dumps(content, indent=1, ensure_ascii=False) + ";\n")
    if check:
        old = open(OUT_JS, encoding="utf-8").read() if os.path.exists(OUT_JS) else ""
        if old == js:
            print("No changes: moxie-content.js matches the sheets."); return 0
        print("The sheets differ from moxie-content.js. Re-run without --check, then review."); return 1
    os.makedirs(OUT_IMG, exist_ok=True)
    for name, data in images.items():
        open(os.path.join(OUT_IMG, name), "wb").write(data)
    open(OUT_JS, "w", encoding="utf-8", newline="\n").write(js)
    print(f"Wrote {OUT_JS} ({len(content)} sessions) and {len(images)} images.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
