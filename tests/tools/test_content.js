// Every activity is complete: the same bones everywhere, so teachers trust it and students know what to expect.
// Checks each published activity for its lesson shape (learn, why, realWorld, vocab, check, stopAt, stuck, next,
// time, teacherNotes, steps), simple words for grades 2–3, valid skills and standards, and its place in Coding
// Foundations. Gaps that existed when this test was written are listed in tests/fixtures/content-todo.json:
// that list may only shrink. A new gap fails, and so does a listed gap that has been fixed (remove it).
//   node tests/tools/test_content.js            check
//   node tests/tools/test_content.js --report   print every gap by activity
//   node tests/tools/test_content.js --prune        take the gaps you just fixed off the list
//   node tests/tools/test_content.js --write-todo   rewrite the list (only when tightening a rule)
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../..");
global.window = {};
["areas", "activities", "pathway", "moxie-content", "moxie", "drafts-3d-printing", "imported", "deeper", "templates", "progression"]
  .forEach((f) => require(path.join(ROOT, "assets/js/data", `${f}.js`)));
const standardsFile = path.join(ROOT, "assets/js/data/standards.js");
if (fs.existsSync(standardsFile)) require(standardsFile);
const STEM = window.STEM;
const TODO_FILE = path.join(ROOT, "tests/fixtures/content-todo.json");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };

const acts = STEM.activities, byId = Object.fromEntries(acts.map((a) => [a.id, a]));
const SKILLS = new Set((STEM.skills || []).map((s) => s.id));
const STANDARDS = STEM.standards || {};   // code -> { set, text, url } (assets/js/data/standards.js)
const text = (v) => typeof v === "string" && /[a-z]/i.test(v);
const list = (v, lo, hi) => Array.isArray(v) && v.length >= lo && v.length <= hi && v.every(text);

/* The rules: each returns true when the activity meets it. */
const RULES = {
  learn: (a) => list(a.learn, 2, 6),
  why: (a) => text(a.why),
  realWorld: (a) => text(a.realWorld),
  vocab: (a) => Array.isArray(a.vocab) && a.vocab.length >= 2 && a.vocab.length <= 5 && a.vocab.every((v) => text(v.term) && text(v.def)),
  check: (a) => text(a.check),
  stopAt: (a) => text(a.stopAt),
  stuck: (a) => list(a.stuck, 2, 4),
  next: (a) => !!a.next && a.next !== a.id && !!byId[a.next],
  time: (a) => !!a.time && Array.isArray(a.time.core) && a.time.core.length === 2 && a.time.core[0] <= a.time.core[1] && typeof a.time.prep === "number",
  teacherNotes: (a) => list(a.teacherNotes, 3, 12),
  steps: (a) => Array.isArray(a.steps) && a.steps.length >= 1 && a.steps.every((s) => text(typeof s === "string" ? s : s.text)),
  // Grades 2–3 get a simple-words version: the same steps, in the same order.
  simple: (a) => !(a.grades || []).includes("2-3") || (!!a.simple && text(a.simple.mission) && Array.isArray(a.simple.steps) && a.simple.steps.length === a.steps.length && a.simple.steps.every(text)),
  // Standards: 1–4 verified codes, or [] when the activity was reviewed and nothing fits well.
  standards: (a) => Array.isArray(a.standards) && a.standards.length <= 4 && a.standards.every((c) => !!STANDARDS[c]),
};

const gaps = {};
acts.forEach((a) => Object.entries(RULES).forEach(([rule, fn]) => { if (!fn(a)) (gaps[a.id] = gaps[a.id] || []).push(rule); }));

if (process.argv.includes("--write-todo")) {
  fs.writeFileSync(TODO_FILE, JSON.stringify(gaps, null, 2) + "\n");
  console.log(`Wrote ${path.relative(ROOT, TODO_FILE)}: ${Object.keys(gaps).length} activities, ${Object.values(gaps).flat().length} gaps.`);
  process.exit(0);
}
if (process.argv.includes("--report")) {
  Object.entries(gaps).forEach(([id, g]) => console.log(id.padEnd(30), g.join(", ")));
  console.log(`\n${Object.keys(gaps).length} activities with gaps, ${Object.values(gaps).flat().length} gaps.`);
}

const todo = fs.existsSync(TODO_FILE) ? JSON.parse(fs.readFileSync(TODO_FILE, "utf8")) : {};
// --prune: take fixed gaps off the list (it never adds one), then check as usual.
if (process.argv.includes("--prune")) {
  for (const id of Object.keys(todo)) {
    todo[id] = todo[id].filter((r) => (gaps[id] || []).includes(r));
    if (!todo[id].length) delete todo[id];
  }
  fs.writeFileSync(TODO_FILE, JSON.stringify(todo, null, 2) + "\n");
}
const fresh = [], fixed = [];
Object.entries(gaps).forEach(([id, g]) => g.forEach((r) => { if (!(todo[id] || []).includes(r)) fresh.push(`${id}: ${r}`); }));
Object.entries(todo).forEach(([id, g]) => g.forEach((r) => { if (!(gaps[id] || []).includes(r)) fixed.push(`${id}: ${r}`); }));
ok("no new content gaps (every activity keeps its full lesson shape)", !fresh.length, "\n  " + fresh.join("\n  "));
ok("the to-do list is current (remove gaps you've fixed from tests/fixtures/content-todo.json)", !fixed.length, "\n  " + fixed.join("\n  "));
const left = Object.values(todo).flat().length;
console.log(`      ${left} known gaps left in ${Object.keys(todo).length} activities`);

// Always-on rules (no to-do list): data that's present must be valid.
const badSkills = acts.filter((a) => a.skills && !a.skills.every((s) => SKILLS.has(s))).map((a) => a.id);
ok("skill tags are known skills", !badSkills.length, badSkills.join(", "));
const badStd = acts.filter((a) => a.standards && !a.standards.every((c) => /^(1A|1B|2|3A|3B)-[A-Z]{2}-\d{2}$|^(K|[1-5]|K-2|3-5|MS|HS)-(ETS1|PS\d|LS\d|ESS\d)-\d+$/.test(c) && STANDARDS[c])).map((a) => a.id);
ok("standards codes are in standards.js (verified codes only)", !badStd.length, badStd.join(", "));
const badStdFile = Object.entries(STANDARDS).filter(([, s]) => !(s.set && text(s.text) && /^https:\/\//.test(s.url || ""))).map(([c]) => c);
ok("every standard in standards.js has its set, wording, and source link", !badStdFile.length, badStdFile.join(", "));

// Simple words stay simple: no sentence over 12 words.
const longSimple = [];
acts.filter((a) => a.simple).forEach((a) => [a.simple.mission, ...(a.simple.steps || [])].forEach((t) => String(t).split(/(?<=[.!?])\s+/).forEach((x) => {
  const n = x.split(/\s+/).filter(Boolean).length;
  if (n > 12) longSimple.push(`${a.id} (${n} words): ${x}`);
})));
ok("simple-words sentences have 12 words or fewer", !longSimple.length, "\n  " + longSimple.join("\n  "));

// Coding Foundations: an activity's stage lists it, and the template has no repeats.
const stageOf = Object.fromEntries((STEM.pathway || []).map((s) => [s.stage, s]));
const unlisted = acts.filter((a) => a.pathwayStage && !(stageOf[a.pathwayStage] && stageOf[a.pathwayStage].activities.includes(a.id))).map((a) => `${a.id} (stage ${a.pathwayStage})`);
ok("every activity with a Coding Foundations step is listed in that step", !unlisted.length, unlisted.join(", "));
const tpl = (STEM.pathwayTemplates || []).find((t) => t.id === "tpl-coding-foundations");
const ids = tpl ? tpl.steps.map((s) => s.activityId) : [];
ok("the Coding Foundations template lists each activity once", ids.length === new Set(ids).size, ids.filter((v, i) => ids.indexOf(v) !== i).join(", "));

console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
