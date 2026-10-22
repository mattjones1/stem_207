/*
 * STEM 207 — missions added with tools/import_missions.js. GENERATED: don't edit by hand.
 * Run `node tools/import_missions.js <file.json>` (dry run), then add --write.
 * Published records join the library; anything else is a draft (educators only).
 */
window.STEM = window.STEM || {};
window.STEM.imported = [];
(function () {
  const S = window.STEM;
  S.imported.forEach((a) => (!a.pub || a.pub === "published" ? S.activities : S.drafts).push(a));
})();
