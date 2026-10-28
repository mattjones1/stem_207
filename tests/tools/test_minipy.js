// Mini-Python (assets/js/labs/minipy.js): it reads the harbor's Python subset, gives friendly errors with the
// right line, turns block programs into Python (the Python view) and back, and a Python program steers the boat
// exactly like the same program in blocks (same interpreter: SE.harbor.run in lab-coding.js).
//   node tests/tools/test_minipy.js
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "../..");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };

// Load minipy and the Harbor engine in a small sandbox (the lab registers itself with a stub shell).
const sandbox = { window: {}, console };
sandbox.window.SE = { icon: () => "", esc: (s) => String(s), labs: { register() {}, goals() {} } };
sandbox.SE = sandbox.window.SE;
vm.createContext(sandbox);
for (const f of ["assets/js/labs/minipy.js", "assets/js/labs/lab-coding.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
const { minipy, harbor } = sandbox.window.SE;
ok("minipy and the Harbor engine load", !!minipy && !!harbor && typeof harbor.run === "function");

const strip = (list) => list.map((b) => {
  const o = { type: b.type };
  if (b.n != null && (b.type === "repeat" || b.type === "setVar" || b.type === "changeVar")) o.n = b.n;
  if (b.body) o.body = strip(b.body);
  if (b.type === "ifWall") o.else = strip(b.else || []);
  return o;
});
const same = (a, b) => JSON.stringify(strip(a)) === JSON.stringify(strip(b));

// 1. Every statement kind parses into the right blocks.
const all = minipy.parse(`# a tour of the harbor
def zig():
    move()
    turn_left()
    move()
    turn_right()

steps = 1
for i in range(2):
    zig()
    haul()
for i in range(steps):
    set_trap()
steps += 2
steps -= 1
while not at_wharf():
    if ledge_ahead():
        turn_right()
    else:
        move()
    if at_buoy():
        haul()
    if at_spot():
        set_trap()
`);
ok("a program using every statement parses with no errors", !all.errors.length, JSON.stringify(all.errors));
ok("…into the right blocks", all.main.map((b) => b.type).join(",") === "setVar,repeat,repeatVar,changeVar,changeVar,untilGoal" && all.fnName === "zig" && all.fn.length === 4, all.main.map((b) => b.type).join(","));
ok("steps -= 1 becomes change by -1", all.main[4].n === -1);
ok("if ledge_ahead() keeps its else", all.main[5].body[0].type === "ifWall" && all.main[5].body[0].else[0].type === "move");

// 2. Friendly errors, on the right line.
const errOf = (src) => (minipy.parse(src).errors[0] || {});
const cases = [
  ["move()\nfor i in range(3)\n    move()", 2, "colon"],
  ["for i in range(3):\nmove()", 1, "indent the next line"],
  ["move()\n    move()", 2, "indented more"],
  ["mvoe()", 1, "Did you mean move()"],
  ["move", 1, "add parentheses"],
  ["if at_bouy():\n    haul()", 1, "Did you mean at_buoy()"],
  ["else:\n    move()", 1, "needs an if right above it"],
  ["if at_buoy():\n    haul()\nelse:\n    move()", 3, "only if ledge_ahead() has an else"],
  ["x = 3", 1, "one variable, steps"],
  ["while True:\n    move()", 1, "while not at_wharf()"],
  ["for i in range(50):\n    move()", 1, "1 to 20"],
  ["if ledge_ahead():\n    move()\nelif at_buoy():\n    haul()", 3, "doesn't use elif"],
  ["def zig():\n    move()\ndef zag():\n    move()", 3, "one function"],
  ["    move()", 1, "left edge"],
];
for (const [src, line, words] of cases) {
  const e = errOf(src);
  ok(`error on line ${line}: "${words}"`, e.line === line && (e.message || "").includes(words), JSON.stringify(e));
}
ok("a typo in a function call suggests the function's name", errOf("def zig():\n    move()\nzgi()").message.includes("Did you mean zig()"));
ok("tabs count as 4 spaces", !minipy.parse("for i in range(2):\n\tmove()").errors.length);

// 3. The Python view round-trips: blocks → Python → blocks.
let rt = 0, rtFail = [];
// Starters are in Harbor's shorthand; build them through the real Python text instead.
const shorthand = (src) => {
  const toks = src.match(/\[\d+|\]|F|L|R|P|D/g) || []; let i = 0;
  const read = () => { const out = []; while (i < toks.length) { const t = toks[i++]; if (t === "]") return out;
    if (t[0] === "[") out.push({ type: "repeat", n: Number(t.slice(1)), body: read() });
    else out.push({ type: { F: "move", L: "left", R: "right", P: "pick", D: "drop" }[t] }); } return out; };
  return read();
};
const tests = harbor.LEVELS.map((L) => L.starter).filter(Boolean).map(shorthand).concat([all.main]);
for (const prog of tests) {
  const py = minipy.toPython(prog, all.fn, "zig");
  const back = minipy.parse(py);
  if (!back.errors.length && same(back.main, prog)) rt++; else rtFail.push(py);
}
ok(`the Python view round-trips (${rt} of ${tests.length} programs)`, rt === tests.length, rtFail.join("\n---\n"));
ok("an empty block shows as pass and reads back", !minipy.parse(minipy.toPython([{ type: "repeat", n: 2, body: [] }])).errors.length);

// 4. Python steers the boat exactly like blocks (same interpreter).
function sail(L, main, fn) {
  const g = harbor.parseGrid(L.grid);
  const st = { x: g.start[0], y: g.start[1], dir: L.dir, ops: 0, gems: new Set(g.gems), spots: new Set(g.spots), got: new Set(), dropped: new Set(), vars: {}, error: null, done: false };
  const ctx = { g, fn: fn || [], depth: 0, carry: !!L.carry };
  for (const _ of harbor.run(main, st, ctx)) { /* step through */ }
  return { x: st.x, y: st.y, dir: st.dir, error: st.error, got: st.got.size, dropped: st.dropped.size, home: st.x === g.goal[0] && st.y === g.goal[1] };
}
let eq = 0, eqFail = [];
harbor.LEVELS.forEach((L, idx) => {
  const prog = L.starter ? shorthand(L.starter) : [{ type: "untilGoal", body: [{ type: "ifWall", body: [{ type: "right" }], else: [{ type: "move" }] }] }];
  const a = sail(L, prog, []);
  const p = minipy.parse(minipy.toPython(prog));
  const b = sail(L, p.main, p.fn);
  if (JSON.stringify(a) === JSON.stringify(b)) eq++; else eqFail.push(`level ${idx + 1}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
});
ok(`Python and blocks steer the boat the same way on all ${harbor.LEVELS.length} levels`, eq === harbor.LEVELS.length, eqFail.join("\n"));
// A real solution, typed as Python: the straight channel (start, 6 squares of water, wharf).
const L2 = harbor.LEVELS.find((L) => L.grid[1] === "#S......G#");
const sol = minipy.parse("for i in range(7):\n    move()");
ok("a typed Python solution reaches the wharf on the straight channel", !sol.errors.length && sail(L2, sol.main, []).home, JSON.stringify(sail(L2, sol.main, [])));
const forever = minipy.parse("while not at_wharf():\n    turn_left()");
ok("a loop that never ends is stopped safely", sail(L2, forever.main, []).error === "loop");

console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
