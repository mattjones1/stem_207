// AI Code Review lab (assets/js/labs/lab-review.js): each "AI" program really has the bug the level is about,
// the intended fix passes every test map, wrong answers are refused with feedback that names the student's
// choice, and every level says it's a simulation.
//   node tests/tools/test_code_review.js
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "../..");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };
let registered = null;
const sandbox = { window: {}, console };
sandbox.window.SE = { icon: () => "", esc: (s) => String(s), labs: { register(l) { if (l.id === "code-review") registered = l; }, goals(levels, g) { levels.forEach((L, i) => { if (g[i]) [L.learn, L.why] = g[i]; }); } } };
sandbox.SE = sandbox.window.SE;
vm.createContext(sandbox);
for (const f of ["assets/js/labs/minipy.js", "assets/js/labs/lab-coding.js", "assets/js/labs/lab-review.js"]) vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f });
const CR = sandbox.window.SE.codeReview;
ok("the lab loads with 8 levels and a simulation label", !!CR && CR.LEVELS.length === 8 && /pretend|simulation/i.test(registered.simulation || ""));
ok("every level has learn, why, two hints, and what was learned", CR.LEVELS.every((L) => L.learn && L.why && L.hints.length === 2 && L.learned));

const FIX = {
  0: "for i in range(5):\n    move()",
  1: "for i in range(5):\n    move()\n    if at_buoy():\n        haul()",
  2: "while not at_wharf():\n    if ledge_ahead():\n        turn_right()\n    else:\n        move()",
  3: "while not at_wharf():\n    move()",
  4: "# Go east 3 squares, turn south, go 2 squares\nfor i in range(3):\n    move()\nturn_right()\nfor i in range(2):\n    move()",
  5: "while not at_wharf():\n    move()",
  7: "for i in range(5):\n    move()\n    if at_buoy():\n        haul()",
};
CR.LEVELS.forEach((L, i) => {
  if (L.kind === "prompt") {
    ok(`level ${i + 1} (prompt): the vague prompt's program fails`, !CR.check(i, { prompt: 0 }).ok && CR.runOn(i, L.vagueCode).home === false);
    ok(`level ${i + 1}: the clear prompt wins, and its program reaches the wharf`, CR.check(i, { prompt: L.answer }).ok && CR.runOn(i, L.goodCode).home);
    return;
  }
  ok(`level ${i + 1}: the AI's code fails on at least one test map`, CR.failingMaps(i).length >= 1);
  if (L.testPick) ok(`level ${i + 1}: at least one test map passes with the AI's code (so picking matters)`, CR.failingMaps(i).length < L.maps.length);
  const a = { line: L.bugLine, what: L.whatAnswer, map: CR.failingMaps(i)[0], src: FIX[i] };
  const r = CR.check(i, a);
  ok(`level ${i + 1}: the right line plus the fix wins`, r.ok, r.reason);
  const wrong = CR.check(i, { ...a, line: L.bugLine === 1 ? 2 : 1 });
  ok(`level ${i + 1}: a wrong line is refused and named`, !wrong.ok && wrong.reason.includes(`line ${L.bugLine === 1 ? 2 : 1}`), wrong.reason);
  ok(`level ${i + 1}: the AI's own code isn't accepted as the fix`, !CR.check(i, { ...a, src: L.code }).ok);
});
ok("level 6: picking the map that passes is refused", !CR.check(5, { line: 1, map: 0, src: FIX[5] }).ok);
console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
