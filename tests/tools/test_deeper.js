// Go deeper (assets/js/data/deeper.js): every activity has a stretch challenge and at least one vetted link,
// and every link is complete, https, from an approved provider, and dated. Lists every URL for the term re-check.
//   node tests/tools/test_deeper.js [--list]
"use strict";
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
global.window = {};
["areas", "activities", "drafts-3d-printing", "imported", "deeper"].forEach((f) => require(path.join(ROOT, "assets/js/data", `${f}.js`)));
const STEM = window.STEM;
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };

const PROVIDERS = new Set(["Code.org", "Scratch (MIT)", "Blockly Games", "CS Unplugged", "Google", "National Park Service", "Gulf of Maine Research Institute",
  "NOAA", "PhET (University of Colorado)", "TeachEngineering", "PBS KIDS", "Piskel", "American Lighthouse Foundation", "Maine Maple Producers Association", "Tinkercad (Autodesk)", "MDN (Mozilla)"]);
const acts = STEM.activities;
const missing = acts.filter((a) => !a.deeper);
ok(`every activity has Go deeper (${acts.length})`, !missing.length, missing.map((a) => a.id).join(", "));
const noChallenge = acts.filter((a) => a.deeper && !String(a.deeper.challenge || "").trim());
ok("every Go deeper has a challenge", !noChallenge.length, noChallenge.map((a) => a.id).join(", "));
const noLinks = acts.filter((a) => a.deeper && !(a.deeper.links || []).length);
ok("every Go deeper has at least one link", !noLinks.length, noLinks.map((a) => a.id).join(", "));
const tooMany = acts.filter((a) => a.deeper && a.deeper.links.length > 2);
ok("no more than two links per activity", !tooMany.length, tooMany.map((a) => a.id).join(", "));

const links = acts.flatMap((a) => (a.deeper ? a.deeper.links.map((l) => ({ a, l })) : []));
const bad = links.filter(({ l }) => !(l.title && l.provider && l.url && l.why && l.verified && Array.isArray(l.grades) && l.grades.length && ["none", "teacher", "student"].includes(l.account)));
ok("every link has title, provider, url, why, grades, account, and verified", !bad.length, bad.map(({ a, l }) => `${a.id}: ${l.url}`).join(", "));
const http = links.filter(({ l }) => !/^https:\/\/[^\s]+$/.test(l.url));
ok("every link is https", !http.length, http.map(({ l }) => l.url).join(", "));
const prov = links.filter(({ l }) => !PROVIDERS.has(l.provider));
ok("every link is from an approved provider", !prov.length, prov.map(({ l }) => l.provider).join(", "));
const dated = links.filter(({ l }) => !/^\d{4}-\d{2}-\d{2}$/.test(l.verified));
ok("every link has a verified date", !dated.length);
const dup = acts.filter((a) => a.deeper && new Set(a.deeper.links.map((l) => l.url)).size !== a.deeper.links.length);
ok("no activity lists the same link twice", !dup.length, dup.map((a) => a.id).join(", "));
const grades = links.filter(({ a, l }) => !l.grades.some((g) => (a.grades || []).includes(g)));
ok("every link suits at least one of its activity's grade bands", !grades.length, grades.map(({ a, l }) => `${a.id} → ${l.title}`).join(", "));
const self = links.filter(({ a, l }) => a.launch && a.launch.url && a.launch.url === l.url);
ok("no link just repeats the activity's own launch", !self.length, self.map(({ a }) => a.id).join(", "));
const faces = links.filter(({ l }) => /camera|webcam/i.test(l.why) && !/not faces/i.test(l.why));
ok("camera tools say hands or objects, not faces", !faces.length, faces.map(({ l }) => l.title).join(", "));

if (process.argv.includes("--list")) {
  const urls = [...new Set(links.map(({ l }) => `${l.verified}  ${l.url}`))].sort();
  console.log(`\n${urls.length} distinct links:\n${urls.join("\n")}`);
}
console.log(`\n${R.filter(Boolean).length}/${R.length} passed`);
process.exit(R.every(Boolean) ? 0 : 1);
