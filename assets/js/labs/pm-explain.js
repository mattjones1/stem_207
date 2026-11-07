/*
 * Pattern Machine Lab: Inside the Machine and Change One Thing (SE.pmExplain).
 *
 * Inside the Machine walks a student through one real prediction of the k-nearest-neighbors model in
 * ml-kit.js, in five steps: examine the features → compare with every training example (distance) →
 * find the nearest K → count the votes → predict right or wrong, then reveal. Every number comes from
 * SE.mlKit.rank / knn; nothing here is a separate approximation.
 *
 * Change One Thing changes exactly one trait of the creature and asks the model again, then shows what
 * changed: the prediction, and which neighbors came in or left. It shows what the model is sensitive to,
 * not what makes a creature a Glim.
 *
 * The host stage owns the view state and re-renders. It calls:
 *   insideHtml(v)   v: { train, x: { id, traits }, truth (label or null), K, features, step, feature, guess, revealed }
 *   act(v, act, id) apply an Inside-the-Machine action ("iv-step", "iv-feat", "iv-guess", "iv-reveal", "iv-reset");
 *                   returns true when it handled it
 *   cfHtml(c)       c: { train, x, K, features, trait, value, result }
 *   cfAct(c, act, id) "cf-trait", "cf-value", "cf-run", "cf-reset"; returns true when handled
 * Pure, for tests: steps(train, traits, opts), counterfactual(train, traits, trait, value, opts).
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const M = SE.mlKit;
  const { tag, b, chips, pct } = SE.pmUI;
  const STEPS = ["Examine the creature", "Compare with the examples", "Find the nearest", "Count the votes", "Reveal"];

  /* ───────── Pure model views ───────── */
  function steps(train, traits, opts = {}) {
    const features = M.featuresOf(opts.features);
    const ranked = M.rank(train, traits, { features });
    const p = M.knn(train, traits, { K: opts.K, features });
    return { features, ranked, p };
  }
  function counterfactual(train, traits, trait, value, opts = {}) {
    const after = Object.assign({}, traits, { [trait]: value });
    const o = { K: opts.K, features: opts.features };
    const p0 = M.knn(train, traits, o), p1 = M.knn(train, after, o);
    const ids0 = p0 ? p0.neighbors.map((n) => n.ex.id) : [], ids1 = p1 ? p1.neighbors.map((n) => n.ex.id) : [];
    return {
      trait, from: traits[trait], to: value, traits: after,
      before: p0, after: p1,
      changed: !!(p0 && p1 && p0.label !== p1.label),
      neighborsIn: ids1.filter((id) => !ids0.includes(id)),
      neighborsOut: ids0.filter((id) => !ids1.includes(id))
    };
  }

  /* ───────── Inside the Machine ───────── */
  const mini = (ex, size = 36) => M.creature(ex.traits, size, " ");
  const featureWord = (k) => M.TRAIT_NAME[k].toLowerCase();
  function insideHtml(v) {
    const { ranked, p, features } = steps(v.train, v.x.traits, { K: v.K, features: v.features });
    if (!p) return `<p class="muted">The machine has no examples yet, so it can't predict anything.</p>`;
    const step = Math.max(1, Math.min(5, v.step || 1));
    const K = p.K, near = new Set(p.neighbors.map((n) => n.ex.id));
    const ignored = M.KEYS.filter((k) => !features.includes(k));
    const nav = `<div class="pm-iv__nav">
      ${b("iv-step", "back", `${icon("arrowLeft")}Back`, "btn btn--ghost btn--small", step === 1 ? "disabled" : "")}
      <span class="pm-iv__count" aria-live="polite">Step ${step} of 5: ${esc(STEPS[step - 1])}</span>
      ${step < 5 ? b("iv-step", "next", `Next step${icon("arrowRight")}`, "btn btn--primary btn--small") : ""}
    </div>`;
    const dots = `<ol class="pm-iv__dots" aria-label="Steps">${STEPS.map((t, i) => `<li class="${i + 1 === step ? "is-here" : i + 1 < step ? "is-done" : ""}"><button type="button" class="pm-iv__dot" data-act="iv-step" data-id="${i + 1}" data-k="iv-dot:${i + 1}" ${i + 1 > (v.reached || 1) ? "disabled" : ""} aria-current="${i + 1 === step ? "step" : "false"}">${i + 1}<span class="visually-hidden"> ${esc(t)}</span></button></li>`).join("")}</ol>`;
    let body = "";
    if (step === 1) {
      body = `<div class="pm-iv__examine">
        <div class="pm-hl ${v.feature ? `pm-hl--on pm-hl--${v.feature}` : ""}">${M.creature(v.x.traits, 120)}</div>
        <div><p>The machine can't see a creature the way you do. It only gets <strong>six features</strong>. Tap one to find it.</p>
          <div class="pm-chips" role="group" aria-label="Features">${M.KEYS.map((k) => b("iv-feat", k, `<span>${esc(M.TRAIT_NAME[k])}</span> <small>${esc(M.traitText(k, v.x.traits[k]))}</small>`, "pm-chip pm-chip--feat", `aria-pressed="${v.feature === k}"`)).join("")}</div>
          <p class="muted pm-small">A <strong>feature</strong> is a kind of thing, like horns. Its <strong>value</strong> is what this creature has, like ${esc(M.traitText("horns", v.x.traits.horns))}.${ignored.length ? ` Advanced setting: the model is ignoring ${ignored.map(featureWord).join(", ")}.` : ""}</p></div>
      </div>`;
    } else if (step === 2) {
      const first = ranked.find((r) => r.order === 0) || ranked[0];
      const m = features.length - first.distance;
      body = `<p>The machine compares this creature with <strong>every</strong> training example, one feature at a time. Each feature that's different adds 1 to the <strong>distance</strong>.</p>
        <p class="pm-iv__say">Example 1 has <strong>${m} matching</strong> trait${m === 1 ? "" : "s"} and <strong>${first.distance} different</strong>. Its distance is <strong>${first.distance}</strong>.</p>
        <div class="pm-tablewrap pm-iv__scroll"><table class="pm-table pm-iv__cmp"><caption>This creature compared with each training example (in the order it learned them)</caption>
          <thead><tr><th scope="col">Example</th>${features.map((k) => `<th scope="col">${esc(M.TRAIT_NAME[k])}</th>`).join("")}<th scope="col">Distance</th></tr></thead>
          <tbody>${ranked.slice().sort((a, c) => a.order - c.order).map((r) => `<tr><th scope="row"><span class="pm-iv__ex">${r.order + 1}. ${mini(r.ex)}${tag(r.ex.label)}</span></th>${features.map((k) => r.diffs.includes(k) ? `<td class="is-diff">${icon("alert")}<span>${esc(M.traitText(k, r.ex.traits[k]))}</span></td>` : `<td class="is-same">${icon("check")}<span class="visually-hidden">same</span></td>`).join("")}<td><strong>${r.distance}</strong></td></tr>`).join("")}</tbody></table></div>`;
    } else if (step === 3) {
      body = `<p>Now it sorts the examples from closest (smallest distance) to farthest, and keeps the <strong>${K} closest</strong>. Those are its <strong>nearest neighbors</strong>.</p>
        <ol class="pm-iv__rank">${ranked.slice(0, Math.min(ranked.length, K + 3)).map((r, i) => `<li class="${near.has(r.ex.id) ? "is-near" : ""}">${mini(r.ex)}${tag(r.ex.label)}<span>Distance <strong>${r.distance}</strong>${r.diffs.length ? `: different ${r.diffs.map(featureWord).join(", ")}` : ": an exact match"}</span>${near.has(r.ex.id) ? `<b class="pm-iv__nb">Neighbor ${i + 1}</b>` : ""}</li>`).join("")}</ol>
        ${p.tieAtEdge ? `<p class="pm-why__tie">${icon("alert")}Another example was just as close as neighbor ${K}. When distances tie, this machine uses the example it learned first.</p>` : ""}
        <p class="muted pm-small">Closer means fewer different traits. The machine doesn't know which traits matter more; it counts every difference the same.</p>`;
    } else if (step === 4) {
      const g = p.votes.Glim || 0, n = p.votes.Norp || 0;
      const box = (label, count) => `<div class="pm-iv__votebox ${p.label === label ? "is-win" : ""}"><p>${tag(label)} <strong>${count} vote${count === 1 ? "" : "s"}</strong></p><div class="pm-iv__votes">${p.neighbors.filter((x) => x.ex.label === label).map((x) => mini(x.ex, 40)).join("")}</div></div>`;
      body = `<p>Each neighbor votes for its own label. The label with the most votes is the prediction.</p>
        <div class="pm-iv__vote">${box("Glim", g)}${box("Norp", n)}</div>
        <p class="pm-iv__say">Prediction: ${tag(p.label)} · <strong>Model agreement: ${pct(p.agree)}</strong> (${p.votes[p.label]} of ${p.used} neighbors agree)</p>
        <p class="muted pm-small">Agreement is how many neighbors voted the same way. It isn't the chance that the answer is right.${p.used < K ? ` There were only ${p.used} examples, fewer than ${K}.` : ""}</p>`;
    } else {
      const known = v.truth === "Glim" || v.truth === "Norp";
      const right = known && p.label === v.truth;
      body = `<p>The machine says ${tag(p.label)}. ${known ? "Is it right?" : ""}</p>
        ${known ? (!v.revealed ? `<p><strong>Your prediction:</strong> will the machine be right?</p>${chips("iv-guess", [["right", "It's right"], ["wrong", "It's wrong"]], v.guess)}
          ${b("iv-reveal", "x", `${icon("eye")}Reveal the real label`, "btn btn--primary btn--small", v.guess ? "" : "disabled")}`
          : `<p class="pm-result ${right ? "is-good" : "is-warn"}">${icon(right ? "check" : "alert")}<span>The real label is ${tag(v.truth)}. The machine was <strong>${right ? "right" : "wrong"}</strong>. You predicted it would be ${v.guess === "right" ? "right" : "wrong"}: ${(v.guess === "right") === right ? "you called it." : "it surprised you."}</span></p>
            ${right ? "" : `<p class="muted pm-small">Look back at its neighbors: they were the closest examples, but closest isn't always correct. Which examples might be missing?</p>`}`)
          : `<p class="muted">There's no known answer for this creature, so we can't say whether it's right.</p>`}`;
    }
    return `<section class="pm-iv" aria-labelledby="pm-iv-h">
      <div class="pm-iv__head"><h4 id="pm-iv-h">${icon("search")}Inside the Machine</h4>${dots}</div>
      <div class="pm-iv__body">${body}</div>
      ${nav}
    </section>`;
  }
  /* Inside the Machine actions. v.reached is the furthest step opened; v.done is set when the reveal happens
     (or step 5 is reached with no known answer). */
  function act(v, a, id) {
    if (a === "iv-step") {
      const s = v.step || 1;
      v.step = id === "next" ? Math.min(5, s + 1) : id === "back" ? Math.max(1, s - 1) : Math.max(1, Math.min(v.reached || 1, Number(id)));
      v.reached = Math.max(v.reached || 1, v.step);
      if (v.step === 5 && !(v.truth === "Glim" || v.truth === "Norp")) v.done = true;
      return true;
    }
    if (a === "iv-feat") { v.feature = v.feature === id ? null : id; return true; }
    if (a === "iv-guess") { if (!v.revealed) v.guess = id; return true; }
    if (a === "iv-reveal") { if (v.guess) { v.revealed = true; v.done = true; } return true; }
    if (a === "iv-reset") { Object.assign(v, { step: 1, reached: 1, feature: null, guess: "", revealed: false }); return true; }
    return false;
  }

  /* ───────── Change One Thing ───────── */
  function cfHtml(c) {
    const others = c.trait ? M.TRAITS[c.trait].filter((x) => x !== c.x.traits[c.trait]) : [];
    const r = c.result;
    const byId = (id) => c.train.find((e) => e.id === id);
    return `<section class="pm-cf" aria-labelledby="pm-cf-h">
      <h4 id="pm-cf-h">${icon("refresh")}Change One Thing</h4>
      <p>Change exactly one trait of this creature. Will the machine change its answer?</p>
      <p><strong>1. Pick a trait</strong></p>
      ${chips("cf-trait", M.KEYS.map((k) => [k, `${M.TRAIT_NAME[k]}: ${M.traitText(k, c.x.traits[k])}`]), c.trait)}
      ${c.trait ? `<p><strong>2. Change it to</strong></p>${chips("cf-value", others.map((x) => [String(x), M.traitText(c.trait, x)]), c.value == null ? "" : String(c.value))}` : ""}
      ${c.trait && c.value != null ? b("cf-run", "x", `${icon("ai")}Ask the machine again`, "btn btn--primary btn--small") : ""}
      ${r ? `<div class="pm-cf__out" role="status">
        <div class="pm-cf__pair">
          <figure>${M.creature(c.x.traits, 52)}<figcaption>Before: ${tag(r.before.label)} <span class="muted">${pct(r.before.agree)} agree</span></figcaption></figure>
          <span class="pm-arrow" aria-hidden="true">→</span>
          <figure>${M.creature(r.traits, 52)}<figcaption>After: ${tag(r.after.label)} <span class="muted">${pct(r.after.agree)} agree</span></figcaption></figure>
        </div>
        <p class="pm-result ${r.changed ? "is-good" : ""}">${icon(r.changed ? "refresh" : "check")}<span>You changed <strong>${esc(M.TRAIT_NAME[r.trait].toLowerCase())}</strong> from ${esc(M.traitText(r.trait, r.from))} to ${esc(M.traitText(r.trait, r.to))}. The prediction <strong>${r.changed ? "changed" : "stayed the same"}</strong>.</span></p>
        ${r.neighborsIn.length ? `<p>New neighbors: <span class="pm-cf__minis">${r.neighborsIn.map((id) => { const e = byId(id); return e ? `${mini(e)}${tag(e.label)}` : ""; }).join(" ")}</span>. Left: <span class="pm-cf__minis">${r.neighborsOut.map((id) => { const e = byId(id); return e ? `${mini(e)}${tag(e.label)}` : ""; }).join(" ")}</span></p>` : `<p>The same ${r.after.used} neighbors are still the closest.</p>`}
        <p class="muted pm-small">This shows what the model is sensitive to. It doesn't prove that ${esc(M.TRAIT_NAME[r.trait].toLowerCase())} is what really makes a Glim.</p>
        ${b("cf-reset", "x", `${icon("refresh")}Try a different change`)}
      </div>` : ""}
    </section>`;
  }
  function cfAct(c, a, id) {
    if (a === "cf-trait") { c.trait = id; c.value = null; c.result = null; return true; }
    if (a === "cf-value") { const raw = M.TRAITS[c.trait].find((x) => String(x) === id); c.value = raw; c.result = null; return true; }
    if (a === "cf-run") { if (c.trait && c.value != null) { c.result = counterfactual(c.train, c.x.traits, c.trait, c.value, { K: c.K, features: c.features }); c.runs = (c.runs || 0) + 1; } return true; }
    if (a === "cf-reset") { c.trait = null; c.value = null; c.result = null; return true; }
    return false;
  }

  SE.pmExplain = { STEPS, steps, counterfactual, insideHtml, act, cfHtml, cfAct };
})();
