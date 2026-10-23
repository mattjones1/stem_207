// Wording rules (CLAUDE.md "Wording"): text people see never says "mission", "expedition", or "pathway".
// Checks every activity's visible fields, the category intros, rank mottos and patch names, and the visible
// strings in the view files. Internal ids, routes, event names, and code comments are fine.
// Also: student steps are written to students, not to the teacher ("Give each team…", "Show the first…").
//   node tests/tools/test_wording.js
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "../..");
global.window = {};
["areas", "activities", "pathway", "moxie-content", "moxie", "drafts-3d-printing", "imported", "deeper", "templates", "progression"].forEach((f) => require(path.join(ROOT, "assets/js/data", `${f}.js`)));
const STEM = window.STEM;
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };
const BANNED = /(?<![\/\w])(missions?|expeditions?|pathways?)\b(?!\/)/i;   // a folder path like missions/ai/... is fine

// Activity text people see.
const FIELDS = ["title", "summary", "mission", "learn", "steps", "reflect", "extend", "teacherNotes", "why", "realWorld", "stopAt", "check", "stuck", "before"];
const flat = (v) => (v == null ? [] : typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(flat) : typeof v === "object" ? Object.values(v).flatMap(flat) : []);
const hits = [];
STEM.activities.concat(STEM.drafts || []).forEach((a) => FIELDS.forEach((k) => flat(a[k]).forEach((t) => { if (BANNED.test(t)) hits.push(`${a.id}.${k}: ${t.slice(0, 90)}`); })));
ok("activity text never says mission, expedition, or pathway", !hits.length, "\n  " + hits.join("\n  "));

const areaHits = STEM.areas.flatMap((a) => flat([a.name, a.short, a.blurb, a.description, a.intro]).filter((t) => BANNED.test(t)).map((t) => `${a.id}: ${t.slice(0, 90)}`));
ok("category text is clean", !areaHits.length, areaHits.join("; "));
const P = STEM.progression;
const progHits = flat([(P.ranks || []).map((r) => [r.name, r.motto]), (P.patches || []).map((p) => [p.name, p.desc, p.how])]).filter((t) => BANNED.test(t));
ok("rank mottos and patch names are clean", !progHits.length, progHits.join("; "));

// Visible strings in the views: text between > and <, and toast/heading strings. Comments are skipped.
const VIEWS = ["views-library.js", "views-student.js", "views-teacher.js", "views-plans.js", "views-moxie.js", "views-auth.js", "base.js", "certificate.js", "main.js", "labs/lab-shell.js"]
  .map((f) => path.join(ROOT, "assets/js", f)).filter((f) => fs.existsSync(f));
const viewHits = [];
VIEWS.forEach((f) => {
  const src = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
  for (const m of src.matchAll(/>([^<>{}`]*?)</g)) if (BANNED.test(m[1])) viewHits.push(`${path.basename(f)}: ${m[1].trim().slice(0, 80)}`);
});
ok("view text between tags is clean", !viewHits.length, "\n  " + viewHits.join("\n  "));

// Student steps speak to the student.
const TEACHER_VOICE = /^(Give each|Show (the|one)|Reveal|Hand out|Have (students|each|teams)|Tell students|Ask students|Pass out|Distribute|Divide the class)|\bstudents (write|call out)\b/i;
const voice = [];
STEM.activities.forEach((a) => (a.steps || []).forEach((s, i) => { const t = typeof s === "string" ? s : s.text || ""; if (TEACHER_VOICE.test(t)) voice.push(`${a.id} step ${i + 1}: ${t.slice(0, 80)}`); }));
ok("student steps are written to students", !voice.length, "\n  " + voice.join("\n  "));

console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
