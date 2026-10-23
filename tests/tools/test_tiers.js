// The free tier (assets/js/data/tiers.js): every free id is real, every live category has something free,
// the free share stays near 20%, every lab has a tier, and a "full" lab's activity is free.
//   node tests/tools/test_tiers.js
"use strict";
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
global.window = {};
["areas", "activities", "pathway", "moxie-content", "moxie", "drafts-3d-printing", "imported", "templates", "tiers"].forEach((f) => require(path.join(ROOT, "assets/js/data", `${f}.js`)));
const STEM = window.STEM, T = STEM.tiers;
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };

const acts = STEM.activities, byId = Object.fromEntries(acts.map((a) => [a.id, a]));
const unknown = T.activities.filter((id) => !byId[id]);
ok("every free activity is a published activity", !unknown.length, unknown.join(", "));
ok("no free activity is listed twice", new Set(T.activities).size === T.activities.length);
const share = T.activities.length / acts.length;
ok(`free share is 15–25% (${T.activities.length} of ${acts.length} = ${Math.round(share * 100)}%)`, share >= 0.15 && share <= 0.25);
const live = STEM.areas.filter((a) => a.status !== "coming-soon").map((a) => a.id);
const bare = live.filter((area) => !T.activities.some((id) => byId[id] && byId[id].area === area));
ok("every live category has a free activity", !bare.length, bare.join(", "));
const soon = T.activities.filter((id) => byId[id] && byId[id].launch.status === "coming-soon");
ok("no free activity is a coming-soon placeholder", !soon.length, soon.join(", "));

const labIds = [...new Set(acts.filter((a) => a.launch.labId).map((a) => a.launch.labId))];
const noTier = labIds.filter((id) => !(id in T.labs));
ok(`every lab has a tier (${labIds.length})`, !noTier.length, noTier.join(", "));
const extra = Object.keys(T.labs).filter((id) => !labIds.includes(id));
ok("no tier for a lab that doesn't exist", !extra.length, extra.join(", "));
const badVal = Object.entries(T.labs).filter(([, v]) => v !== "full" && v !== 1);
ok('lab tiers are "full" or 1', !badVal.length, badVal.map(([k]) => k).join(", "));
const full = Object.entries(T.labs).filter(([, v]) => v === "full").map(([k]) => k);
ok(`3 labs are free in full (${full.join(", ")})`, full.length === 3);
const fullLocked = full.filter((lab) => !acts.some((a) => a.launch.labId === lab && T.activities.includes(a.id)));
ok("a full lab's activity is free", !fullLocked.length, fullLocked.join(", "));
const previewFree = acts.filter((a) => T.labs[a.launch.labId] === 1 && T.activities.includes(a.id)).map((a) => a.id);
ok("a level-1 preview lab's activity stays paid", !previewFree.length, previewFree.join(", "));

const tplIds = new Set(STEM.pathwayTemplates.map((t) => t.id));
ok("free templates exist", T.templates.every((id) => tplIds.has(id)));
const tplPaid = STEM.pathwayTemplates.filter((t) => T.templates.includes(t.id))
  .filter((t) => t.steps.some((s) => s.activityId && !T.activities.includes(s.activityId))).map((t) => t.id);
ok("a free template has only free activities", !tplPaid.length, tplPaid.join(", "));
const moxieIds = new Set(STEM.moxieSessions.map((s) => s.id));
ok("free Moxie sessions exist", T.moxie.every((id) => moxieIds.has(id)));

console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
