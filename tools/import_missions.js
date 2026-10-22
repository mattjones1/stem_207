#!/usr/bin/env node
/*
 * Import missions into STEM 207 safely.
 *
 *   node tools/import_missions.js <missions.json>                 dry run: validate and report only
 *   node tools/import_missions.js <missions.json> --write         save accepted records
 *   node tools/import_missions.js <missions.json> --write --new-version
 *                                                                 also allow changes to published
 *                                                                 imported missions (bumps version)
 *
 * Input: a JSON array of missions, or { "missions": [...] }. Field reference: README, "Importing missions".
 * Accepted records are upserted by stable id into assets/js/data/imported.js. Hand-written records
 * (activities.js, moxie.js, drafts-3d-printing.js) are never changed: an id that belongs to one is rejected.
 * A published mission is never silently overwritten: changing one needs --new-version.
 * Text is cleaned (tags and control characters removed); attribution fields are kept as given.
 * Exit code 1 if anything was rejected.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
// STEM207_IMPORT_OUT lets tests work on a copy of imported.js instead of the real one.
const OUT = process.env.STEM207_IMPORT_OUT || path.join(ROOT, "assets/js/data/imported.js");
const DATA = ["areas", "activities", "pathway", "moxie", "drafts-3d-printing"].map((f) => path.join(ROOT, `assets/js/data/${f}.js`)).concat(OUT);

/* Load the current library the same way the browser does. */
function loadLibrary() {
  const ctx = { console };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of DATA) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  return ctx.STEM;
}

const clean = (v) => {
  if (typeof v === "string") return v.replace(/<[^>]*>/g, "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
  if (Array.isArray(v)) return v.map(clean);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]));
  return v;
};
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const stripVersion = ({ version, ...rest }) => rest;

/* Every problem with one record, as plain sentences. Drafts need only id, title, and area. */
function problems(m, STEM) {
  const out = [];
  const isStr = (v) => typeof v === "string" && v.length > 0;
  const strList = (v) => Array.isArray(v) && v.length > 0 && v.every(isStr);
  const need = (cond, msg) => { if (!cond) out.push(msg); };
  const pub = m.pub || "published";
  const STATES = ["draft", "review", "hardware", "pilot", "published"];
  need(STATES.includes(pub), `pub must be one of ${STATES.join(", ")}`);
  need(typeof m.id === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.id) && m.id.length <= 80, "id must be lowercase words joined by hyphens (80 characters at most)");
  need(isStr(m.title) && m.title.length <= 120, "title is required (120 characters at most)");
  need(STEM.areas.some((a) => a.id === m.area), `area must be one of ${STEM.areas.map((a) => a.id).join(", ")}`);
  if (m.skills !== undefined) need(Array.isArray(m.skills) && m.skills.every((s) => STEM.skills.some((x) => x.id === s)), `skills must come from STEM.skills (${STEM.skills.map((s) => s.id).join(", ")})`);
  if (m.alsoIn !== undefined) need(Array.isArray(m.alsoIn) && m.alsoIn.every((id) => id !== m.area && STEM.areas.some((a) => a.id === id)), "alsoIn must list other existing areas");
  if (m.delivery !== undefined) need(isStr(m.delivery), "delivery must be text");
  if (m.version !== undefined) need(/^\d+(\.\d+)?$/.test(String(m.version)), "version must be a number like 1 or 1.2");
  const launch = m.launch || {};
  if (m.launch !== undefined || pub === "published" || pub === "pilot") {
    need(["ready", "coming-soon", "none"].includes(launch.status), "launch.status must be ready, coming-soon, or none (labs need code, so they can't be imported)");
    if (launch.status === "ready") {
      need(/^https:\/\/[^\s<>"]+$/.test(launch.url || ""), "launch.url must be an https address");
      need(isStr(launch.label) && isStr(launch.provider), "a ready launch needs a label and a provider");
    }
  }
  if (pub !== "published" && pub !== "pilot") return out;

  // A teachable record needs everything the mission page shows.
  need(isStr(m.summary) && isStr(m.mission), "summary and mission are required");
  need(STEM.levels.some((l) => l.id === m.level), `level must be one of ${STEM.levels.map((l) => l.id).join(", ")}`);
  need(Array.isArray(m.grades) && m.grades.length > 0 && m.grades.every((g) => STEM.gradeBands.some((b) => b.id === g)), `grades must list ${STEM.gradeBands.map((g) => g.id).join(", ")}`);
  const core = m.time && m.time.core;
  need((Number.isFinite(m.duration) && m.duration >= 5 && m.duration <= 240) || (Array.isArray(core) && core.length === 2 && core[0] > 0 && core[1] >= core[0]),
    "give duration (5–240 minutes) or time.core [min, max]");
  need(Object.keys(STEM.formats).includes(m.format), `format must be one of ${Object.keys(STEM.formats).join(", ")}`);
  need(Array.isArray(m.equipment) && m.equipment.length > 0 && m.equipment.every((e) => STEM.equipment[e]), `equipment must use ${Object.keys(STEM.equipment).join(", ")}`);
  need(isStr(m.source), "source is required (for example original, adapted, or the provider)");
  need(Array.isArray(m.keywords) && m.keywords.every(isStr), "keywords must be a list of words");
  const acc = m.access || {};
  need(["none", "optional", "required"].includes(acc.account) && ["free", "paid"].includes(acc.cost) && typeof acc.supervision === "boolean" && Array.isArray(acc.hardware),
    "access needs account (none, optional, required), cost (free, paid), supervision (true or false), and hardware (a list)");
  need(strList(m.learn), "learn needs at least one learning goal");
  const b = m.before || {};
  need(Array.isArray(b.materials) && Array.isArray(b.setup) && isStr(b.prerequisites), "before needs materials, setup (lists), and prerequisites (text)");
  need(strList(m.steps), "steps needs at least one step");
  need(isStr(m.reflect) && isStr(m.extend), "reflect and extend are required");
  need(strList(m.teacherNotes), "teacherNotes needs at least one note");
  if (m.next !== undefined) need(isStr(m.next), "next must be a mission id");
  return out;
}

function run(file, { write, newVersion }) {
  const STEM = loadLibrary();
  const imported = STEM.imported.slice();
  const handWritten = new Map(STEM.activities.concat(STEM.drafts).filter((a) => !imported.includes(a)).map((a) => [a.id, a]));
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const input = (Array.isArray(raw) ? raw : raw.missions || []).map(clean);
  const report = { added: [], updated: [], unchanged: [], rejected: [] };
  const next = imported.slice();
  const seenIds = new Set();
  const allIds = () => new Set([...handWritten.keys(), ...next.map((a) => a.id)]);

  input.forEach((m, i) => {
    const label = `#${i + 1} ${m && m.id ? m.id : "(no id)"}`;
    const why = problems(m, STEM);
    if (seenIds.has(m.id)) why.push("the same id appears twice in this file");
    seenIds.add(m.id);
    if (handWritten.has(m.id)) why.push("this id belongs to a hand-written record; edit that file instead");
    const twin = [...handWritten.values(), ...next].find((a) => a.id !== m.id && a.title && m.title && a.title.toLowerCase() === m.title.toLowerCase());
    if (twin) why.push(`another record already has this title (${twin.id})`);
    if (m.next && !allIds().has(m.next) && !input.some((x) => x.id === m.next)) why.push(`next points to an unknown mission (${m.next})`);
    const old = next.find((a) => a.id === m.id);
    if (!why.length && old) {
      const wasPublished = !old.pub || old.pub === "published";
      if (same(stripVersion(old), stripVersion({ ...m, version: old.version }))) { report.unchanged.push(label); return; }
      if (wasPublished && !newVersion) why.push("this mission is published; changing it needs --new-version");
    }
    if (why.length) { report.rejected.push({ label, why }); return; }
    if (old) {
      const v = newVersion && (!old.pub || old.pub === "published") ? String(Math.floor(Number(old.version || 1)) + 1) : String(m.version || old.version || 1);
      next[next.indexOf(old)] = { ...m, version: v };
      report.updated.push(`${label} (v${v})`);
    } else {
      next.push({ ...m, version: String(m.version || 1) });
      report.added.push(label);
    }
  });

  const line = (t, list) => console.log(`${t} (${list.length})${list.length ? ":\n  " + list.join("\n  ") : ""}`);
  line("Added", report.added);
  line("Updated", report.updated);
  line("Unchanged", report.unchanged);
  console.log(`Rejected (${report.rejected.length})${report.rejected.map((r) => `\n  ${r.label}\n    - ${r.why.join("\n    - ")}`).join("")}`);
  const changed = report.added.length + report.updated.length;
  if (write && changed) {
    const src = fs.readFileSync(OUT, "utf8").replace(/window\.STEM\.imported = [\s\S]*?;(\r?\n)\(function/,
      (_, nl) => `window.STEM.imported = ${JSON.stringify(next, null, 2).replace(/\n/g, nl)};${nl}(function`);
    fs.writeFileSync(OUT, src);
    console.log(`Saved ${changed} change(s) to ${path.relative(ROOT, OUT)}.`);
  } else if (!write) console.log("Dry run: nothing saved. Add --write to save the accepted records.");
  return report;
}

module.exports = { run, problems, loadLibrary };
if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) { console.log("Usage: node tools/import_missions.js <missions.json> [--write] [--new-version]"); process.exit(2); }
  const r = run(file, { write: args.includes("--write"), newVersion: args.includes("--new-version") });
  process.exit(r.rejected.length ? 1 : 0);
}
