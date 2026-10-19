"""Build STEM 207's starter Scratch projects (.sb3) into assets/starters/.

Each .sb3 is a zip with project.json plus costume files named by their MD5, which is the
Scratch 3 format. Costumes are drawn here (no Scratch library assets are copied).
Run: python3 tools/build_starters.py
"""
import hashlib, json, zipfile, pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "starters"

WATER = '''<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3e8"/><stop offset="1" stop-color="#24476b"/></linearGradient></defs>
<rect width="480" height="360" fill="url(#g)"/>
<path d="M0 330 Q60 310 120 330 T240 330 T360 330 T480 330 V360 H0 Z" fill="#c9b27a"/>
<path d="M60 330 q5 -40 -6 -70 M70 330 q10 -30 4 -55 M410 330 q-6 -45 8 -80" stroke="#2f5d3a" stroke-width="6" fill="none" stroke-linecap="round"/>
<g fill="#fff" opacity=".35"><circle cx="100" cy="80" r="5"/><circle cx="112" cy="60" r="3"/><circle cx="380" cy="120" r="4"/></g></svg>'''
FISH = '''<svg xmlns="http://www.w3.org/2000/svg" width="96" height="60" viewBox="0 0 96 60">
<path d="M8 30 L-4 12 L-4 48 Z" transform="translate(12 0)" fill="#e9822b" stroke="#1d1647" stroke-width="3" stroke-linejoin="round"/>
<ellipse cx="52" cy="30" rx="36" ry="22" fill="#f2c14e" stroke="#1d1647" stroke-width="3"/>
<path d="M44 10 Q52 2 62 9" fill="#e9822b" stroke="#1d1647" stroke-width="3"/>
<circle cx="72" cy="24" r="5" fill="#fff" stroke="#1d1647" stroke-width="2"/><circle cx="73" cy="24" r="2.4" fill="#1d1647"/>
<path d="M80 36 Q76 40 70 38" stroke="#1d1647" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>'''
PEN = '''<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
<path d="M6 8 L34 20 L6 32 L12 20 Z" fill="#8cc832" stroke="#302568" stroke-width="3" stroke-linejoin="round"/></svg>'''
STAGE_WHITE = '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="#ffffff"/></svg>'

def costume(name, svg, cx, cy):
    data = svg.encode()
    md5 = hashlib.md5(data).hexdigest()
    return {"name": name, "dataFormat": "svg", "assetId": md5, "md5ext": md5 + ".svg", "rotationCenterX": cx, "rotationCenterY": cy}, (md5 + ".svg", data)

def num(v): return [1, [4, str(v)]]
def whole(v): return [1, [6, str(v)]]
def block(op, nxt=None, parent=None, inputs=None, fields=None, top=False, x=0, y=0):
    b = {"opcode": op, "next": nxt, "parent": parent, "inputs": inputs or {}, "fields": fields or {}, "shadow": False, "topLevel": top}
    if top: b.update({"x": x, "y": y})
    return b

def stage(costumes):
    return {"isStage": True, "name": "Stage", "variables": {}, "lists": {}, "broadcasts": {}, "blocks": {}, "comments": {},
            "currentCostume": 0, "costumes": costumes, "sounds": [], "volume": 100, "layerOrder": 0, "tempo": 60,
            "videoTransparency": 50, "videoState": "on", "textToSpeechLanguage": None}

def sprite(name, costumes, blocks, comments=None, rotation="all around"):
    return {"isStage": False, "name": name, "variables": {}, "lists": {}, "broadcasts": {}, "blocks": blocks, "comments": comments or {},
            "currentCostume": 0, "costumes": costumes, "sounds": [], "volume": 100, "layerOrder": 1, "visible": True,
            "x": 0, "y": 0, "size": 100, "direction": 90, "draggable": False, "rotationStyle": rotation}

def write(fname, targets, extensions, files):
    project = {"targets": targets, "monitors": [], "extensions": extensions, "meta": {"semver": "3.0.0", "vm": "0.2.0", "agent": "STEM 207 starter"}}
    OUT.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(OUT / fname, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("project.json", json.dumps(project))
        for n, d in files: z.writestr(n, d)
    print("wrote", OUT / fname)

# 1. Debug the Broken Animation: the broken fish script from the activity, exactly as written.
#    when flag clicked -> go to x:0 y:0 -> repeat 10 [ move 100 steps -> if on edge, bounce ]
#    Rotation style left at "all around" so the fish flips upside down (bug 3).
bk, bkf = costume("water", WATER, 240, 180)
fk, fkf = costume("fish", FISH, 52, 30)
blocks = {
    "flag": block("event_whenflagclicked", "goto", None, top=True, x=40, y=40),
    "goto": block("motion_gotoxy", "rep", "flag", {"X": num(0), "Y": num(0)}),
    "rep": block("control_repeat", None, "goto", {"TIMES": whole(10), "SUBSTACK": [2, "move"]}),
    "move": block("motion_movesteps", "bounce", "rep", {"STEPS": num(100)}),
    "bounce": block("motion_ifonedgebounce", None, "move"),
}
comments = {"note": {"blockId": None, "x": 300, "y": 40, "width": 260, "height": 140, "minimized": False,
    "text": "Debugging crew: this fish should swim back and forth forever, flipping at each edge. Run it, watch closely, and fix one bug at a time. Write each fix in your bug log."}}
write("debug-the-fish.sb3", [stage([bk]), sprite("Fish", [fk], blocks, comments)], [], [bkf, fkf])

# 2. Pattern Studio: Pen extension already added, a turtle sprite, and the square script from step 1,
#    so students start at step 2 (make a custom block).
wk, wkf = costume("white", STAGE_WHITE, 240, 180)
pk, pkf = costume("turtle", PEN, 20, 20)
blocks = {
    "flag": block("event_whenflagclicked", "clear", None, top=True, x=40, y=40),
    "clear": block("pen_clear", "home", "flag"),
    "home": block("motion_gotoxy", "down", "clear", {"X": num(0), "Y": num(0)}),
    "down": block("pen_penDown", "rep", "home"),
    "rep": block("control_repeat", None, "down", {"TIMES": whole(4), "SUBSTACK": [2, "mv"]}),
    "mv": block("motion_movesteps", "turn", "rep", {"STEPS": num(50)}),
    "turn": block("motion_turnright", None, "mv", {"DEGREES": num(90)}),
}
comments = {"note": {"blockId": None, "x": 300, "y": 40, "width": 260, "height": 140, "minimized": False,
    "text": "This script draws one square. Next: My Blocks > Make a Block. Name it square, add a number input called size, and move the square code under it."}}
write("pattern-studio.sb3", [stage([wk]), sprite("Turtle", [pk], blocks, comments)], ["pen"], [wkf, pkf])

# 3. Loop Dance Choreographers: a dancer with five move costumes and the long 16-move dance from
#    the lesson, written out one move at a time, so students can shorten it with repeat blocks.
FLOOR = '''<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#302568"/><stop offset="1" stop-color="#4a3ba6"/></linearGradient></defs>
<rect width="480" height="360" fill="url(#s)"/>
<g fill="#ffffff" opacity=".5"><circle cx="60" cy="50" r="2"/><circle cx="150" cy="30" r="1.5"/><circle cx="300" cy="60" r="2"/><circle cx="420" cy="35" r="1.5"/></g>
<path d="M0 270 H480 V360 H0 Z" fill="#1d1647"/>
<g stroke="#8cc832" stroke-width="2" opacity=".6"><path d="M0 270 H480"/><path d="M40 360 L160 270 M240 360 V270 M440 360 L320 270"/></g></svg>'''
def dancer(arms, legs, lift=0, extra=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150">
<g transform="translate(0 {-lift})" stroke="#1d1647" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
{extra}<path d="{legs}" fill="none"/>
<rect x="40" y="52" width="40" height="46" rx="10" fill="#8cc832"/><path d="{arms}" fill="none"/>
<rect x="38" y="14" width="44" height="34" rx="10" fill="#e9e6f6"/>
<circle cx="52" cy="31" r="4" fill="#1d1647" stroke="none"/><circle cx="68" cy="31" r="4" fill="#1d1647" stroke="none"/>
<path d="M60 14 V4" /><circle cx="60" cy="4" r="3" fill="#f2c14e"/></g></svg>'''
LEGS = "M50 98 V140 M70 98 V140"
COST = {
    "ready": dancer("M44 62 L28 92 M76 62 L92 92", LEGS),
    "clap": dancer("M44 62 L24 40 L50 10 M76 62 L96 40 L70 10", LEGS, extra='<path d="M60 2 l-10 -0 M60 2 l10 0" stroke="#f2c14e"/>'),
    "stomp": dancer("M44 62 L24 80 M76 62 L96 80", "M50 98 V140 M70 98 L88 118 L76 128", extra='<path d="M30 142 h20 M74 142 h22" stroke="#f2c14e"/>'),
    "spin": dancer("M44 64 L12 62 M76 64 L108 62", LEGS, extra='<path d="M14 40 A50 22 0 0 0 106 40" fill="none" stroke="#f2c14e"/>'),
    "jump": dancer("M44 62 L22 36 M76 62 L98 36", "M50 98 L42 124 M70 98 L78 124", lift=12, extra='<path d="M44 150 h32" stroke="#f2c14e" transform="translate(0 6)"/>'),
}
fl, flf = costume("dance floor", FLOOR, 240, 180)
dcs, dfiles = [], []
for n, svg in COST.items():
    c, f = costume(n, svg, 60, 90); dcs.append(c); dfiles.append(f)
DANCE = ["clap", "stomp", "clap", "stomp", "clap", "stomp", "spin", "jump"] * 2
blocks = {"flag": block("event_whenflagclicked", None, None, top=True, x=40, y=40)}
seq = [("ready", False)] + [(m, True) for m in DANCE] + [("ready", False)]
prev = "flag"
for i, (m, wait) in enumerate(seq):
    sid, mid, wid = f"sw{i}", f"menu{i}", f"wt{i}"
    blocks[prev]["next"] = sid
    blocks[sid] = block("looks_switchcostumeto", None, prev, {"COSTUME": [1, mid]})
    blocks[mid] = {"opcode": "looks_costume", "next": None, "parent": sid, "inputs": {}, "fields": {"COSTUME": [m, None]}, "shadow": True, "topLevel": False}
    prev = sid
    if wait:
        blocks[sid]["next"] = wid
        blocks[wid] = block("control_wait", None, sid, {"DURATION": [1, [5, "0.4"]]})
        prev = wid
comments = {"note": {"blockId": None, "x": 320, "y": 40, "width": 270, "height": 170, "minimized": False,
    "text": "Dance crew: this dance is written out one move at a time, 16 moves long. Click the green flag to watch it. Your job: make the program shorter with repeat blocks, without changing the dance. Count your blocks before and after."}}
write("dance-crew.sb3", [stage([fl]), sprite("Dancer", dcs, blocks, comments, rotation="don't rotate")], [], [flf] + dfiles)
