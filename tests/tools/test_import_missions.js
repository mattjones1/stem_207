// tools/import_missions.js: validation, safe upsert, and versioning, on a temporary copy of imported.js.
//   node tests/tools/test_import_missions.js
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "stem207-import-")), "imported.js");
fs.copyFileSync(path.join(ROOT, "assets/js/data/imported.js"), tmp);
process.env.STEM207_IMPORT_OUT = tmp;
const realBefore = fs.readFileSync(path.join(ROOT, "assets/js/data/imported.js"), "utf8");
const { run, loadLibrary } = require(path.join(ROOT, "tools/import_missions.js"));
const FIX = path.join(ROOT, "tests/fixtures/import");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };
const quiet = (fn) => { const log = console.log; console.log = () => {}; try { return fn(); } finally { console.log = log; } };
const reasons = (r, id) => ((r.rejected.find((x) => x.label.endsWith(id)) || {}).why || []).join(" | ");

const before = fs.readFileSync(tmp, "utf8");
let r = quiet(() => run(path.join(FIX, "valid.json"), { write: false }));
ok("dry run accepts a complete mission and a draft", r.added.length === 2 && !r.rejected.length, JSON.stringify(r));
ok("dry run saves nothing", fs.readFileSync(tmp, "utf8") === before);

r = quiet(() => run(path.join(FIX, "valid.json"), { write: true }));
let lib = loadLibrary();
const m = lib.activities.find((a) => a.id === "test-shoreline-sketch");
ok("--write adds the published mission to the library at version 1", m && m.version === "1");
ok("text is cleaned (tags removed)", m && m.mission === "Test fixture: sketch what you notice.", m && m.mission);
ok("a draft import goes to drafts, not the library", lib.drafts.some((a) => a.id === "test-draft-only") && !lib.activities.some((a) => a.id === "test-draft-only"));
ok("hand-written missions are untouched (53 + 1)", lib.activities.length === 54, lib.activities.length);

r = quiet(() => run(path.join(FIX, "valid.json"), { write: true }));
ok("importing the same file again changes nothing", r.unchanged.length === 2 && !r.added.length && !r.updated.length, JSON.stringify(r));

r = quiet(() => run(path.join(FIX, "bad.json"), { write: true }));
ok("rejects an http (not https) link", /https/.test(reasons(r, "test-bad-url")));
ok("rejects an unknown area", /area must be/.test(reasons(r, "test-unknown-area")));
ok("rejects an id that belongs to a hand-written record", /hand-written/.test(reasons(r, "robot-maze-mission")));
ok("rejects the same id twice in one file", /twice/.test(reasons(r, "test-dupe")));
ok("rejects a duplicate title", /already has this title/.test(reasons(r, "test-title-twin")));
ok("rejects a published mission with missing fields", /summary and mission/.test(reasons(r, "test-incomplete")));
ok("rejects a badly formed id", /lowercase words/.test(reasons(r, "Bad Id!")));
ok("nothing from the bad file was saved", !loadLibrary().activities.concat(loadLibrary().drafts).some((a) => /^test-(bad|unknown|title|incomplete)/.test(a.id)));

const changed = path.join(path.dirname(tmp), "changed.json");
const src = JSON.parse(fs.readFileSync(path.join(FIX, "valid.json"), "utf8")).missions[0];
fs.writeFileSync(changed, JSON.stringify([{ ...src, summary: "A changed test fixture." }]));
r = quiet(() => run(changed, { write: true }));
ok("a published import can't be changed without --new-version", /--new-version/.test(reasons(r, "test-shoreline-sketch")));
r = quiet(() => run(changed, { write: true, newVersion: true }));
lib = loadLibrary();
const m2 = lib.activities.find((a) => a.id === "test-shoreline-sketch");
ok("--new-version saves the change and bumps the version to 2", m2 && m2.version === "2" && m2.summary === "A changed test fixture.", m2 && m2.version);

ok("the real imported.js was never touched", fs.readFileSync(path.join(ROOT, "assets/js/data/imported.js"), "utf8") === realBefore);
console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
