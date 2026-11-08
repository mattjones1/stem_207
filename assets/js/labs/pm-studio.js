/*
 * Pattern Machine Lab: the Creature and Dataset Studio (SE.pmStudio).
 *
 *   builderHtml(b, o)   design a creature with one button group per trait (no dragging), optionally label it.
 *                       b: { traits, label }  o: { labels: bool, title, note }
 *   act(b, a, id)       "st-trait" (id "trait|value"), "st-label"; returns true when handled
 *   dashboardHtml(set, o) counts, label balance, which values of each trait are covered, missing combinations of
 *                       the rule's traits, contradictions (same traits, different labels), and the last measured
 *                       test accuracy. o: { ruleTraits, lastAcc }
 *   snap(S, data) / snapsHtml(S)  experiment snapshots saved on this device: { id, stage, name, n, glims, acc, at }
 *   isTestCopy(traits, tests)  true when a designed creature is exactly a held-out test creature (refused)
 * Every number comes from SE.mlKit. Nothing here is sent anywhere.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const M = SE.mlKit;
  const { tag, b, chips, pct } = SE.pmUI;

  const START = { color: "blue", shape: "round", eyes: 2, horns: "none", antennae: 1, tail: "short" };
  function builderHtml(st, o = {}) {
    const t = Object.assign({}, START, st.traits || {});
    return `<div class="pm-build">
      <div class="pm-build__pic">${M.creature(t, 104)}<p class="muted pm-small">${esc(M.describe(t))}</p></div>
      <div class="pm-build__traits">${M.KEYS.map((k) => `<div class="pm-build__row" role="group" aria-label="${esc(M.TRAIT_NAME[k])}"><span class="pm-build__k">${esc(M.TRAIT_NAME[k])}</span>${M.TRAITS[k].map((v) => b("st-trait", `${k}|${v}`, esc(M.traitText(k, v)), "pm-chip pm-chip--sm", `aria-pressed="${t[k] === v}"`)).join("")}</div>`).join("")}
        ${o.labels ? `<div class="pm-build__row" role="group" aria-label="Label"><span class="pm-build__k">Label</span>${["Glim", "Norp"].map((l) => b("st-label", l, tag(l), "pm-chip pm-chip--sm", `aria-pressed="${st.label === l}"`)).join("")}</div>` : ""}
        ${o.note ? `<p class="muted pm-small">${o.note}</p>` : ""}</div>
    </div>`;
  }
  function act(st, a, id) {
    if (a === "st-trait") {
      const [k, raw] = id.split("|"); const v = M.TRAITS[k].find((x) => String(x) === raw);
      st.traits = Object.assign({}, START, st.traits || {}, { [k]: v }); return true;
    }
    if (a === "st-label") { st.label = id; return true; }
    return false;
  }
  const traitsOf = (st) => Object.assign({}, START, st.traits || {});
  const isTestCopy = (traits, tests) => tests.some((t) => M.key(t.traits) === M.key(traits));

  /* The dataset dashboard. Plain words; it never says a count or a balance makes a model good. */
  function dashboardHtml(set, o = {}) {
    const g = set.filter((e) => e.label === "Glim").length, n = set.length - g;
    const cover = M.KEYS.map((k) => { const have = M.TRAITS[k].filter((v) => set.some((e) => e.traits[k] === v)); return [k, have.length, M.TRAITS[k].length, M.TRAITS[k].filter((v) => !have.includes(v))]; });
    const rt = o.ruleTraits || [];
    const combos = rt.length === 2 ? M.missingCombos(set, rt[0], rt[1]) : [];
    const contra = M.contradictions(set);
    return `<div class="pm-dash">
      <div class="pm-dash__tiles">
        <p><span>Examples</span><strong>${set.length}</strong></p>
        <p><span>${tag("Glim")}</span><strong>${g}</strong></p>
        <p><span>${tag("Norp")}</span><strong>${n}</strong></p>
        <p><span>Last test</span><strong>${o.lastAcc == null ? "–" : pct(o.lastAcc)}</strong></p>
      </div>
      <details class="pm-numbers" data-k="dash-cover"><summary>Which kinds of creatures are covered?</summary>
        <ul class="pm-dash__cover">${cover.map(([k, have, all, miss]) => `<li><strong>${esc(M.TRAIT_NAME[k])}</strong>: ${have} of ${all} kinds${miss.length ? ` <span class="pm-flag">${icon("search")}missing ${miss.map((v) => esc(M.traitText(k, v))).join(", ")}</span>` : ` ${icon("check")}`}</li>`).join("")}</ul></details>
      ${combos.length ? `<p class="pm-result">${icon("search")}<span>Combinations of your rule's traits that aren't in the set: ${combos.slice(0, 6).map((c) => esc(rt.map((k) => M.traitText(k, c[k])).join(" + "))).join("; ")}${combos.length > 6 ? `, and ${combos.length - 6} more` : ""}.</span></p>` : ""}
      ${contra.length ? `<p class="pm-result is-warn">${icon("alert")}<span>${contra.length} pair${contra.length > 1 ? "s" : ""} of examples look exactly the same but have different labels. The machine can't tell them apart.</span></p>` : ""}
      <p class="muted pm-small">No number here promises a good model. Only testing on new creatures shows how it does.</p>
    </div>`;
  }

  /* Experiment snapshots: the measured result of a training set, saved so students can compare. */
  function snap(S, d) {
    S.snaps = S.snaps || [];
    const s = Object.assign({ id: `snap-${S.snaps.length + 1}`, at: Date.now() }, d);
    S.snaps.push(s);
    if (S.snaps.length > 20) S.snaps.shift();
    return s;
  }
  function snapsHtml(S, stage) {
    const list = (S.snaps || []).filter((x) => stage == null || x.stage === stage);
    if (!list.length) return `<p class="muted pm-small">No snapshots yet. Measure, then save a snapshot to compare later.</p>`;
    const first = list[0];
    return `<div class="pm-tablewrap"><table class="pm-table"><caption>Your saved experiments (same held-out test each time)</caption>
      <thead><tr><th scope="col">Experiment</th><th scope="col">Examples</th><th scope="col">Glims / Norps</th><th scope="col">Test accuracy</th><th scope="col">Change from first</th></tr></thead>
      <tbody>${list.map((x) => { const d = Math.round(x.acc * 100) - Math.round(first.acc * 100); return `<tr><th scope="row">${esc(x.name)}</th><td>${x.n}</td><td>${x.glims} / ${x.n - x.glims}</td><td>${pct(x.acc)}</td><td>${x === first ? "–" : `${d > 0 ? "+" : ""}${d} points`}</td></tr>`; }).join("")}</tbody></table></div>`;
  }

  SE.pmStudio = { START, builderHtml, act, traitsOf, isTestCopy, dashboardHtml, snap, snapsHtml };
})();
