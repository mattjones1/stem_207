"""
Build a single, self-contained HTML file of STEM Explorers.

Usage (from the repo folder):
    python tools/build_single_file.py

Creates dist/STEM Explorers.html. Double-click it to run the app in a browser,
with no server or internet needed (fonts fall back to system fonts offline).
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
html = (ROOT / "index.html").read_text(encoding="utf-8")

for css in re.findall(r'<link rel="stylesheet" href="(assets/css/[^"]+)">', html):
    html = html.replace(f'<link rel="stylesheet" href="{css}">',
                        "<style>\n" + (ROOT / css).read_text(encoding="utf-8") + "\n</style>")

scripts = re.findall(r'<script src="(assets/js/[^"]+)"></script>', html)
bundle = "\n".join(f"/* ---- {s} ---- */\n" + (ROOT / s).read_text(encoding="utf-8") for s in scripts)
html = re.sub(r'\s*<script src="assets/js/[^"]+"></script>', "", html)
html = html.replace("</body>", "<script>\n" + bundle.replace("</script", "<\\/script") + "\n</script>\n</body>")

out = ROOT / "dist" / "STEM Explorers.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding="utf-8")
print(f"Built {out} ({len(scripts)} scripts, {len(html) // 1024} KB)")
