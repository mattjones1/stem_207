// Captain Code level validator: every level's map is valid, its reference solution (mini-Python) compiles,
// uses only the level's blocks, fits the block budget, equals par, and sails through the real engine
// (SE.harbor.sail) to a win on EVERY channel. Known wrong programs fail for the stated reason, and a
// broken starter (debug levels) really is broken. Fog only ever shows the squares around the boat.
//   node tests/tools/test_captain_levels.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..", "..");
const sandbox = { window: {}, console };
sandbox.window.SE = { labs: { register() {}, goals: (l) => l }, icon: () => "", esc: (s) => s };
sandbox.SE = sandbox.window.SE;
vm.createContext(sandbox);
for (const f of ["assets/js/labs/harbor-engine.js", "assets/js/labs/minipy.js", "assets/js/labs/captain-levels.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
const SE = sandbox.window.SE, H = SE.harbor, PY = SE.minipy;

let pass = 0, fail = 0;
const ok = (name, c, extra = "") => { if (c) pass++; else { fail++; console.log("FAIL " + name, extra); } };
const types = (list, out = new Set()) => { list.forEach((b) => { out.add(b.type); if (b.body) types(b.body, out); if (b.else) types(b.else, out); }); return out; };
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9_]/g, "_");

const { CASCO, PENOBSCOT, DOWNEAST } = SE.captainLevels;
const ALL = [...CASCO, ...PENOBSCOT, ...DOWNEAST];
ok("Casco Bay has 10 levels", CASCO.length === 10, CASCO.length);
ok("Penobscot Bay has 12 levels", PENOBSCOT.length === 12, PENOBSCOT.length);
ok("Down East has 12 levels", DOWNEAST.length === 12, DOWNEAST.length);
ok("level ids are unique", new Set(ALL.map((L) => L.id)).size === ALL.length);
const maps = new Set();

for (const L of ALL) {
  const id = L.id, opts = { varName: L.varName, goal: "mooring" };
  ok(`${id}: has a title, concept, briefing, goal, learned, and 3 hints`, L.title && L.concept && L.briefing && L.goal && L.learned && L.hints && L.hints.length === 3);
  ok(`${id}: has at least one map`, Array.isArray(L.grids) && L.grids.length >= 1);
  L.grids.forEach((g, i) => {
    const bad = H.validateGrid(g);
    ok(`${id}: map ${i + 1} is valid`, !bad.length, bad.join(" "));
    const k = g.join("/");
    ok(`${id}: map ${i + 1} isn't a copy of another level's map`, L.design || !maps.has(k));
    maps.add(k);
  });
  if (L.grids.length > 1) ok(`${id}: names each channel`, L.worlds && L.worlds.length === L.grids.length);
  const p = PY.parse(L.reference, opts);
  ok(`${id}: reference compiles`, !p.errors.length, JSON.stringify(p.errors));
  if (p.errors.length) continue;
  const used = types(p.main); types(p.fn, used);
  const extra = [...used].filter((t) => !L.blocks.includes(t));
  ok(`${id}: reference uses only the level's blocks`, !extra.length, extra.join(","));
  if (p.fn.length) ok(`${id}: reference's function name matches the level's block`, L.fnName && slug(L.fnName) === p.fnName, `${L.fnName} vs ${p.fnName}`);
  const n = H.countBlocks(p.main) + H.countBlocks(p.fn);
  if (L.budget) ok(`${id}: reference fits the budget (${n} / ${L.budget})`, n <= L.budget, n);
  if (L.par) ok(`${id}: reference equals par (${n} / ${L.par})`, n === L.par, n);
  L.grids.forEach((g, i) => {
    const r = H.sail(L, g, p.main, p.fn).result;
    ok(`${id}: reference wins on map ${i + 1}`, r.ok, r.reason + " " + JSON.stringify(r.values));
  });
  for (const w of L.wrong || []) {
    const q = PY.parse(w.src, opts);
    ok(`${id}: wrong program compiles (${w.reason})`, !q.errors.length, JSON.stringify(q.errors));
    if (q.errors.length) continue;
    const reasons = L.grids.map((g) => H.sail(L, g, q.main, q.fn).result.reason);
    ok(`${id}: wrong program fails with "${w.reason}"`, reasons.includes(w.reason) && !reasons.every((r) => r === "ok"), reasons.join(","));
  }
  if (L.starter) {
    const s = PY.parse(L.starter, opts);
    ok(`${id}: starter compiles`, !s.errors.length);
    ok(`${id}: starter is broken`, L.grids.some((g) => !H.sail(L, g, s.main, s.fn).result.ok));
  }
  if (L.fog) {
    const g = H.parseGrid(L.grids[0]), v = H.visibleFrom(g, g.start[0], g.start[1], L.fog);
    ok(`${id}: fog shows at most the 9 squares around the boat`, v.size <= 9 && v.has(`${g.start[0]},${g.start[1]}`));
    ok(`${id}: fog hides the mooring at the start`, !v.has(`${g.goal[0]},${g.goal[1]}`));
  }
}

// Engine checks for the new pieces.
{
  const L = { dir: "E" };
  const g = ["#####", "#S.G#", "#####"];
  const r = H.sail(L, g, PY.parse("if ledge_left():\n    move()\nelse:\n    turn_left()").main).result;
  ok("ledge_left() senses the ledge on the boat's left", r.values.x === 2, JSON.stringify(r.values));
  const sense = (grid) => H.sail(L, grid, PY.parse("if ledge_right():\n    turn_left()\nelse:\n    turn_right()").main).result.values.dir;
  ok("ledge_right() senses a ledge on the boat's right", sense(["#####", "#S..#", "##.G#", "#####"]) === "N");
  ok("ledge_right() sees open water on the boat's right", sense(["#####", "#S.G#", "#.###", "#####"]) === "S");
  const r3 = H.sail({ dir: "E" }, ["#####", "#Sx.G#".slice(0, 5), "#####"], PY.parse("move()\nmove()\nmove()").main).result;
  ok("sailing over a search mark counts it", r3.values.marked === 1 && r3.ok, JSON.stringify(r3));
  ok("validateGrid names a missing mooring", H.validateGrid(["###", "#S#", "###"]).some((m) => m.includes("mooring")));
  ok("validateGrid names uneven rows", H.validateGrid(["###", "#S.G#", "###"]).some((m) => m.includes("same length")));
  ok("Python with a named variable round-trips", PY.toPython(PY.parse("distance = 2\nfor i in range(distance):\n    move()", { varName: "distance" }).main, [], "zig", { varName: "distance" }) === "distance = 2\nfor i in range(distance):\n    move()");
  ok("an infinite loop is stopped, not frozen", H.sail({ dir: "E" }, ["#####", "#S.G#", "#####"], PY.parse("while not at_mooring():\n    turn_left()", { goal: "mooring" }).main).result.reason === "loop");
}

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
