/*
 * STEM 207 — 3D Printing placeholders (category "3d-printing", coming soon).
 *
 * Exactly five unpublished placeholders with generic labels. Every content field is left
 * empty on purpose: objectives, descriptions, steps, grades, time, equipment, prerequisites,
 * deliverables, and assessments arrive only when the program supplies real exercises.
 * Placeholders are drafts (STEM.drafts): educators see them on the 3D Printing area page;
 * students and guests never do; they can't be launched, assigned, counted, or earn XP.
 * To publish one, replace it with a complete record (see README, "Adding an activity").
 */
(function () {
  const STEM = window.STEM;
  const seen = new Set(STEM.activities.concat(STEM.drafts).map((a) => a.id));
  for (let n = 1; n <= 5; n++) {
    const id = `3d-printing-exercise-${String(n).padStart(2, "0")}`;
    if (seen.has(id)) throw new Error(`STEM 207: duplicate activity id ${id}`);
    seen.add(id);
    STEM.drafts.push({ id, title: `Exercise ${n} — placeholder`, area: "3d-printing", pub: "draft", placeholder: true, version: "0", launch: { status: "none" } });
  }
})();
