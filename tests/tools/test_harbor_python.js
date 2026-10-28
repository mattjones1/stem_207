// Harbor Python lab (assets/js/labs/lab-python.js): every level can be solved, read levels' answers are right,
// Parsons lines in the right order and indent win, and each Fix it program fails until it's fixed.
//   node tests/tools/test_harbor_python.js
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "../..");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };
const sandbox = { window: {}, console };
sandbox.window.SE = { icon: () => "", esc: (s) => String(s), labs: { register() {}, goals(levels, g) { levels.forEach((L, i) => { if (g[i]) [L.learn, L.why] = g[i]; }); } } };
sandbox.SE = sandbox.window.SE;
vm.createContext(sandbox);
for (const f of ["assets/js/labs/minipy.js", "assets/js/labs/lab-coding.js", "assets/js/labs/lab-python.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
const { harborPython: HP } = sandbox.window.SE;
ok("the lab loads with 12 levels", !!HP && HP.LEVELS.length === 12);
ok("every level has learn, why, two hints, and what was learned", HP.LEVELS.every((L) => L.learn && L.why && L.hints && L.hints.length === 2 && L.learned));

// The right answer for each level (reference solutions; students may find others).
const SOLUTIONS = {
  3: "move()\nmove()\nturn_right()\nmove()\nmove()",
  4: "for i in range(3):\n    move()\nturn_right()\nfor i in range(2):\n    move()",
  5: "for i in range(5):\n    move()\n    if at_buoy():\n        haul()",
  6: "for i in range(5):\n    move()",
  7: "for i in range(2):\n    move()\n    move()\n    turn_left()\nmove()\nmove()",
  8: "for i in range(5):\n    move()\n    if at_buoy():\n        haul()",
  9: "for i in range(9):\n    move()",
  10: "while not at_wharf():\n    if ledge_ahead():\n        turn_right()\n    else:\n        move()",
  11: "def zig():\n    move()\n    turn_left()\n    move()\n    turn_right()\n\nzig()\nzig()\nmove()\nmove()\nzig()\nzig()",
};
HP.LEVELS.forEach((L, i) => {
  if (L.kind === "read") ok(`level ${i + 1} (read): the answer ${L.answer} is where the boat really stops`, HP.predictEnd(i) === L.answer, HP.predictEnd(i));
  else { const r = HP.check(i, SOLUTIONS[i]); ok(`level ${i + 1} (${L.kind}): the reference solution wins`, r.ok, r.reason); }
  if (L.kind === "parsons") ok(`level ${i + 1}: the solution uses exactly the given lines`, SOLUTIONS[i].split("\n").map((x) => x.trim()).sort().join("|") === L.lines.slice().sort().join("|"));
  if (L.kind === "fix") ok(`level ${i + 1} (fix): the buggy program doesn't win as given`, !HP.check(i, L.code).ok);
});
ok("a Parsons answer with the wrong indent doesn't win", !HP.check(4, "for i in range(3):\nmove()\nturn_right()\nfor i in range(2):\n    move()").ok);
ok("Write it: too many lines is refused, with the count", (HP.check(9, Array(9).fill("move()").join("\n")).reason || "").includes("9 lines"));
ok("Write it: must use def on the function level", (HP.check(11, "move()\nturn_left()\nmove()\nturn_right()\nmove()\nturn_left()\nmove()\nturn_right()\nmove()\nmove()\nmove()\nturn_left()\nmove()\nturn_right()\nmove()\nturn_left()\nmove()\nturn_right()").reason || "").includes("def"));
ok("the missing-colon level shows Python's error with its line", (HP.check(7, HP.LEVELS[7].code).errors[0] || {}).line === 1);
console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
