// Harbor Level Designer (assets/js/labs/lab-builder.js): the route finder is right, every level's starting
// map fails its rules (so there's design work to do), a good design passes, the playtest checks real code,
// and the difficulty-curve answer matches the routes.
//   node tests/tools/test_level_designer.js
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "../..");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };
const sandbox = { window: {}, console };
sandbox.window.SE = { icon: () => "", esc: (s) => String(s), labs: { register() {}, goals(levels, g) { levels.forEach((L, i) => { if (g[i]) [L.learn, L.why] = g[i]; }); } } };
sandbox.SE = sandbox.window.SE;
vm.createContext(sandbox);
for (const f of ["assets/js/labs/minipy.js", "assets/js/labs/lab-coding.js", "assets/js/labs/lab-builder.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
const LD = sandbox.window.SE.levelDesigner;
ok("the lab loads with 6 levels", !!LD && LD.LEVELS.length === 6);
ok("every level has learn, why, two hints, and what was learned", LD.LEVELS.every((L) => L.learn && L.why && L.hints.length === 2 && L.learned));

// Route finder
ok("a straight channel is 5 moves", LD.route(["########", "#S....G#", "########"]).moves === 5);
ok("traps on the way are counted in the route", LD.route(["########", "#S.*..G#", "########"]).buoys === 1 && LD.route(["########", "#S.*..G#", "########"]).moves === 5);
ok("a trap off the route makes it longer", LD.route(["########", "#S....G#", "#*.....#", "########"]).moves === 7);
ok("a walled-off wharf is impossible", !LD.route(["########", "#S.#..G#", "########"]).ok);
ok("an unreachable trap is caught", /can't reach every trap/.test(LD.route(["########", "#S....G#", "########", "#*.....#", "########"]).why || ""));

// Each level's starting map needs work.
LD.LEVELS.forEach((L, i) => { if (L.start) ok(`level ${i + 1}: the starting map doesn't pass yet`, !LD.check(i, L.start).ok, LD.check(i, L.start).reason); });

// Good designs
const designs = {
  0: ["########", "#S.....#", "#...#..#", "#####..#", "#....#G#", "########"],   // one ledge opened at the top
  1: ["########", "#S.....#", "######.#", "#......#", "#G######", "########"],
  2: ["########", "#S.*...#", "#.###..#", "#*.....#", "#....*G#", "########"],
  3: ["########", "#S.....#", "#####*.#", "#*.....#", "#.....G#", "########"],
};
for (const [i, g] of Object.entries(designs)) { const r = LD.check(Number(i), g); ok(`level ${Number(i) + 1}: a good design passes`, r.ok, `${r.reason} ${JSON.stringify(r.route)}`); }
ok("level 1: clearing almost every ledge is refused", !LD.check(0, ["########", "#S.....#", "#......#", "#......#", "#.....G#", "########"]).ok);

// Playtest: a design plus the student's own Python
const pg = ["########", "#S.*...#", "#####..#", "#####..#", "#####.G#", "########"];
const d5 = LD.check(4, pg);
ok("level 5: the playtest design passes its rules", d5.ok, d5.reason + " " + JSON.stringify(d5.route));
const sol = "for i in range(5):\n    move()\n    if at_buoy():\n        haul()\nturn_right()\nfor i in range(3):\n    move()";
ok("level 5: a program that solves the design is accepted", LD.solves(pg, sol).ok, LD.solves(pg, sol).reason);
ok("level 5: a program that skips the trap is refused", !LD.solves(pg, "for i in range(5):\n    move()\nturn_right()\nfor i in range(3):\n    move()").ok);

// Difficulty curve
const right = LD.curve(5);
ok("level 6: the curve answer is B → C → A (8, 14, then 16 moves)", right.join("") === "BCA", right.join(""));
const moves = Object.fromEntries(LD.LEVELS[5].choices.map((c) => [c.id, LD.route(c.grid).moves]));
ok("level 6: the three levels have different difficulty", new Set(Object.values(moves)).size === 3, JSON.stringify(moves));
console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
