/*
 * STEM 207 — educator pathways (categories-pathways Phase 3).
 *
 *   #/teach/pathways              your pathways and the curated templates
 *   #/teach/pathways/new          a blank draft (opens the editor)
 *   #/teach/pathways/<id>         a pathway or template: preview, publish, assign, versions
 *   #/teach/pathways/<id>/edit    the editor: goal first, then steps from any category
 *
 * A pathway is the educator's working copy. Publishing saves an immutable version that pins every
 * mission step to the mission's current version; assigning pins a class to one published version.
 * Templates (data/templates.js) are copied, never edited. Pure rules for tests: SE.pathways.*.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const { icon, esc, plural } = SE;
  const app = () => document.getElementById("app");

  /* ───────── Rules (pure, for tests) ───────── */
  const stepAct = (s) => (s.kind === "mission" ? SE.activityById[s.activityId] || null : null);
  const range = (a) => (a.time && a.time.core ? a.time.core : [a.duration, a.duration]);
  const template = (id) => (STEM.pathwayTemplates || []).find((t) => t.id === id) || null;

  /* Time (required steps; optional steps separately), prep, equipment across all steps, and long or lab steps. */
  function totals(steps) {
    const t = { min: 0, max: 0, optMin: 0, optMax: 0, prep: 0, prepMissing: 0, untimed: 0, equipment: [], long: [], labs: [], areas: [] };
    const equip = new Set(), areas = new Set();
    steps.forEach((s) => {
      if (s.kind === "synthesis") {
        if (s.minutes) { if (s.required) { t.min += s.minutes[0]; t.max += s.minutes[1]; } else { t.optMin += s.minutes[0]; t.optMax += s.minutes[1]; } }
        else t.untimed++;
        return;
      }
      const a = stepAct(s);
      if (!a || a.placeholder) return;
      const [lo, hi] = range(a);
      if (s.required) { t.min += lo; t.max += hi; } else { t.optMin += lo; t.optMax += hi; }
      if (a.time && a.time.prep != null) t.prep += a.time.prep; else t.prepMissing++;
      (a.equipment || []).forEach((e) => equip.add(e));
      areas.add(a.area);
      if (hi > 60) t.long.push(a);
      if (a.launch.status === "lab") t.labs.push(a);
    });
    t.equipment = [...equip];
    t.areas = [...areas];
    return t;
  }

  /* Advice (never a lock): grade fit, missing resources on optional steps, accounts and supervision,
     long or full-lab steps, and coding-stage order. Safety and account limits are shown as they are. */
  function warnings(p) {
    const out = [];
    const grades = (p.audience && p.audience.grades) || [];
    let lastStage = 0, lastTitle = "";
    p.steps.forEach((s) => {
      const a = stepAct(s);
      if (!a) return;
      const miss = grades.filter((g) => !(a.grades || []).includes(g));
      if (grades.length && miss.length && a.grades && a.grades.length) out.push(`${a.title} is written for ${SE.gradesText(a.grades).toLowerCase()}, not ${miss.map((g) => SE.gradeById[g].name.toLowerCase()).join(" or ")}.`);
      if (!s.required && SE.content.readiness(a) === "missing-resource") out.push(`${a.title} has no resource yet. It's optional here, so students can skip it.`);
      if (a.access && a.access.account === "required") out.push(`${a.title} needs an account${a.access.accountNote ? `: ${a.access.accountNote}` : "."}`);
      if (a.access && a.access.cost === "paid") out.push(`${a.title} is a paid resource.`);
      if (a.access && a.access.supervision) out.push(`${a.title} needs an adult to guide or monitor it.`);
      if (a.launch.status === "lab") out.push(`${a.title} is a full lab. Choose the levels to use and set your own time estimate.`);
      if (range(a)[1] > 60) out.push(`${a.title} takes ${range(a)[0]}–${range(a)[1]} minutes. Plan more than one session.`);
      if (a.pathwayStage) {
        if (a.pathwayStage < lastStage) out.push(`${a.title} (coding stage ${a.pathwayStage}) comes after ${lastTitle} (stage ${lastStage}). Check that students are ready.`);
        if (a.pathwayStage >= lastStage) { lastStage = a.pathwayStage; lastTitle = a.title; }
      }
    });
    return [...new Set(out)];
  }

  /* What stops publishing: a missing goal or final product, no steps, or a required step that isn't ready. */
  function publishBlockers(p) {
    const out = [];
    if (!/[a-z0-9]/i.test(p.goal || "")) out.push("Add a goal: what students should understand or be able to do.");
    if (!/[a-z0-9]/i.test(p.finalProduct || "")) out.push("Describe the final product or demonstration.");
    if (!p.steps.length) out.push("Add at least one step.");
    p.steps.forEach((s, i) => {
      if (s.kind === "synthesis") { if (!/[a-z0-9]/i.test(s.prompt || "")) out.push(`Step ${i + 1}: write the synthesis task.`); return; }
      const a = stepAct(s);
      if (!a) { out.push(`Step ${i + 1}: this mission no longer exists. Remove it.`); return; }
      if (!s.required) return;
      if (!SE.content.isPublished(a)) out.push(`Step ${i + 1}: ${a.title} isn't published. Make it optional or remove it.`);
      else if (SE.content.readiness(a) === "missing-resource") out.push(`Step ${i + 1}: ${a.title} has no resource yet. Make it optional or remove it.`);
    });
    return out;
  }

  /* Mission steps whose library mission has a newer version than the one pinned in this snapshot. */
  const staleSteps = (snapshot) => (snapshot ? snapshot.steps : []).filter((s) => s.kind === "mission" && s.missionVersion)
    .map((s) => ({ step: s, activity: stepAct(s) })).filter((x) => x.activity && SE.content.version(x.activity) !== x.step.missionVersion)
    .map((x) => ({ ...x, from: x.step.missionVersion, to: SE.content.version(x.activity) }));

  /* Has the working copy changed since the last published version? */
  const unpublished = (p) => {
    if (!p.version) return true;
    const snap = SE.store.pathwayVersion(p.id, p.version);
    const strip = (o) => JSON.stringify({ ...o, steps: o.steps.map(({ missionVersion, ...s }) => s) });
    return !snap || strip({ title: p.title, essentialQuestion: p.essentialQuestion, goal: p.goal, finalProduct: p.finalProduct, audience: p.audience, steps: p.steps }) !== strip(snap);
  };

  SE.pathways = { totals, warnings, publishBlockers, staleSteps, unpublished, template };

  /* ───────── Shared pieces ───────── */
  const timeText = (lo, hi) => (lo === hi ? `${lo} min` : `${lo}–${hi} min`);
  const statusChip = (p) => p.status === "archived" ? `<span class="chip">Archived</span>`
    : p.version ? `<span class="chip chip--ok">Published v${p.version}</span>${unpublished(p) ? ` <span class="chip chip--warn">Unpublished changes</span>` : ""}`
    : `<span class="chip chip--soon">Draft</span>`;
  const areaChip = (a) => `<span class="pw-area">${icon(SE.areaById[a.area].icon)}${esc(SE.areaById[a.area].short)}</span>`;
  const evidenceOf = (s, a) => s.evidence || (a && (a.check || a.reflect)) || "";

  function totalsBox(p) {
    const t = totals(p.steps);
    return `
      <dl class="facts pw-totals">
        <div><dt>Student time</dt><dd>${timeText(t.min, t.max)}${t.untimed ? ` + ${plural(t.untimed, "untimed step", "untimed steps")}` : ""}${t.optMax ? `<small>Optional steps: ${timeText(t.optMin, t.optMax)} more</small>` : ""}</dd></div>
        <div><dt>Teacher prep</dt><dd>${t.prep ? `About ${t.prep} min` : "—"}${t.prepMissing ? `<small>Not recorded for ${plural(t.prepMissing, "mission", "missions")}</small>` : ""}</dd></div>
        <div><dt>Categories</dt><dd>${t.areas.length ? esc(t.areas.map((id) => SE.areaById[id].short).join(", ")) : "—"}</dd></div>
        <div><dt>Equipment</dt><dd>${t.equipment.length ? esc(SE.equipmentText(t.equipment)) : "—"}</dd></div>
      </dl>
      <p class="muted small">Plan extra time for transitions, sharing, and setup. Times are student activity time from each mission.</p>`;
  }
  const listBox = (cls, title, items, ic) => items.length ? `<div class="pw-box ${cls}"><h3>${icon(ic)}${esc(title)}</h3><ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "";

  function stepsPreview(steps) {
    return `<ol class="pw-steps">${steps.map((s, i) => {
      const a = stepAct(s);
      return `
        <li class="pw-step ${s.required ? "" : "pw-step--optional"}">
          <span class="pw-step__n" aria-hidden="true">${i + 1}</span>
          <div>
            <p class="pw-step__head">${s.label ? `<span class="pw-step__label">${esc(s.label)}</span>` : ""}
              ${s.kind === "synthesis" ? `<strong>Synthesis</strong>${s.minutes ? ` <span class="muted">${timeText(s.minutes[0], s.minutes[1])}</span>` : ""}`
                : a ? `<a href="#/activity/${a.id}">${esc(a.title)}</a> ${areaChip(a)} <span class="muted">${SE.timeText(a)}</span>${SE.content.readiness(a) === "missing-resource" ? ` <span class="chip chip--soon">No resource yet</span>` : ""}`
                : `<strong>Missing mission</strong>`}
              <span class="chip ${s.required ? "" : "chip--soon"}">${s.required ? "Required" : "Optional"}</span></p>
            ${s.bridge ? `<p class="pw-step__bridge">${icon("arrowRight")}<span>${esc(s.bridge)}</span></p>` : ""}
            ${s.kind === "synthesis" ? `<p><strong>Task:</strong> ${esc(s.prompt || "")}</p>` : evidenceOf(s, a) ? `<p><strong>Evidence:</strong> ${esc(evidenceOf(s, a))}${s.evidence ? "" : ` <span class="muted small">(the mission's own check)</span>`}</p>` : ""}
            ${s.adaptation ? `<p class="muted"><strong>Teacher adaptation:</strong> ${esc(s.adaptation)}</p>` : ""}
          </div>
        </li>`;
    }).join("")}</ol>`;
  }

  function summaryList(p) {
    const g = (p.audience && p.audience.grades) || [];
    return `
      <dl class="pw-summary">
        ${p.essentialQuestion ? `<div><dt>Essential question</dt><dd>${esc(p.essentialQuestion)}</dd></div>` : ""}
        <div><dt>Goal</dt><dd>${esc(p.goal || "Not set yet")}</dd></div>
        <div><dt>Final product</dt><dd>${esc(p.finalProduct || "Not set yet")}</dd></div>
        <div><dt>Students</dt><dd>${g.length ? SE.gradesText(g) : "Any grade"}${p.audience && p.audience.minutes ? ` · about ${p.audience.minutes} min per session` : ""}${p.audience && p.audience.prior ? ` · ${esc(p.audience.prior)}` : ""}</dd></div>
      </dl>`;
  }

  function page(user, active, body) {
    const { classes, cls } = SE.teachClass(user);
    app().innerHTML = SE.teachFrame(user, cls, classes, active, body, { title: cls ? undefined : "Pathways" });
    SE.teachBindFrame(user);
    return cls;
  }
  function rerender(focusSel, msg) {
    const y = window.scrollY;
    SE.route(true);
    window.scrollTo(0, y);
    if (msg) SE.toast(msg);
    const el = focusSel && document.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }

  /* ───────── Router entry ───────── */
  SE.views.teachPathways = function (user, rest) {
    flushSave();
    const [id, sub] = rest || [];
    if (!id) return listView(user);
    if (id === "new") {
      const p = SE.store.createPathway({});
      return location.replace(`#/teach/pathways/${p.id}/edit`);
    }
    const t = template(id);
    const p = t || SE.store.pathwayById(id);
    if (!p || (!t && p.educatorId !== user.id)) return SE.views.notFound();
    if (sub === "edit" && !t) return editView(user, p);
    return detailView(user, p, !!t);
  };

  /* ───────── List ───────── */
  function listView(user) {
    const mine = SE.store.pathwaysFor(user.id);
    const active = mine.filter((p) => p.status !== "archived"), archived = mine.filter((p) => p.status === "archived");
    const card = (p, isTpl) => {
      const t = totals(p.steps);
      return `
        <li class="pw-card">
          <h3><a href="#/teach/pathways/${p.id}">${esc(p.title)}</a></h3>
          <p class="pw-card__meta">${isTpl ? `<span class="chip chip--ok">${p.reviewed ? "Reviewed template" : "Proposed: review before teaching"}</span>` : statusChip(p)}</p>
          <p>${esc(p.goal || "No goal yet")}</p>
          <p class="muted small">${plural(p.steps.length, "step", "steps")} · ${plural(t.areas.length, "category", "categories")} · ${timeText(t.min, t.max)}${p.audience && p.audience.grades && p.audience.grades.length ? ` · ${SE.gradesText(p.audience.grades)}` : ""}</p>
          <div class="pw-card__actions">
            ${isTpl ? `<a class="btn btn--ghost btn--small" href="#/teach/pathways/${p.id}">${icon("eye")}Preview<span class="visually-hidden"> ${esc(p.title)}</span></a>
              <button type="button" class="btn btn--primary btn--small" data-use="${p.id}">${icon("plus")}Use this template<span class="visually-hidden">: ${esc(p.title)}</span></button>`
              : `<a class="btn btn--ghost btn--small" href="#/teach/pathways/${p.id}/edit">${icon("tools")}Edit<span class="visually-hidden"> ${esc(p.title)}</span></a>`}
          </div>
        </li>`;
    };
    page(user, "pathways", `
      <section class="wrap section" aria-labelledby="pw-mine">
        <div class="section__head">
          <div><span class="eyebrow">Goal-first sequences of missions</span><h2 id="pw-mine">Your pathways</h2></div>
          <a class="btn btn--primary" href="#/teach/pathways/new">${icon("plus")}New pathway</a>
        </div>
        <p class="muted section-note">Start with a goal and a final product, then add missions from any category. Publish a version, then assign it to a class. Later edits never change what an assigned class is working on.</p>
        ${active.length ? `<ul class="pw-cards">${active.map((p) => card(p, false)).join("")}</ul>` : `<div class="empty">${icon("map")}<h3>No pathways yet</h3><p>Start from a template below, or make a new one.</p></div>`}
        ${archived.length ? `<details class="pw-archived"><summary>Archived (${archived.length})</summary><ul class="pw-cards">${archived.map((p) => card(p, false)).join("")}</ul></details>` : ""}
      </section>
      <section class="wrap section" aria-labelledby="pw-tpl">
        <div class="section__head"><div><span class="eyebrow">Ready to adapt</span><h2 id="pw-tpl">Templates</h2></div>
          <p>Using a template makes your own copy. The template never changes.</p></div>
        <ul class="pw-cards">${(STEM.pathwayTemplates || []).map((t) => card(t, true)).join("")}</ul>
      </section>`);
    bindUse(user);
  }

  function bindUse(user) {
    app().querySelectorAll("[data-use]").forEach((b) => b.addEventListener("click", () => {
      const t = template(b.dataset.use);
      const p = t && SE.store.duplicatePathway(t);
      if (!p) return;
      SE.toast(`Copied “${t.title}”. It's your draft now.`);
      location.hash = `#/teach/pathways/${p.id}/edit`;
    }));
  }

  /* ───────── Detail: preview, publish, assign, versions ───────── */
  function detailView(user, p, isTpl) {
    const { cls } = SE.teachClass(user);
    const blockers = isTpl ? [] : publishBlockers(p);
    const asg = !isTpl && cls ? SE.store.pathwayAssignmentFor(cls.id, p.id) : null;
    const pinned = asg ? SE.store.pathwayVersion(p.id, asg.version) : null;
    const stale = staleSteps(pinned);
    const versions = isTpl ? [] : SE.store.pathwayVersionsOf(p.id);
    const canPublish = !isTpl && p.status !== "archived" && unpublished(p);
    const body = `
      <section class="wrap section" aria-labelledby="pw-title">
        <div class="backbar pw-back">${SE.backLink("#/teach/pathways", "All pathways")}</div>
        <div class="section__head">
          <div><span class="eyebrow">${isTpl ? "Template" : "Pathway"}</span><h2 id="pw-title" tabindex="-1">${esc(p.title)}</h2>
            <p class="pw-card__meta">${isTpl ? `<span class="chip chip--ok">${p.reviewed ? "Reviewed template" : "Proposed: review before teaching"}</span>` : statusChip(p)}</p></div>
          <div class="pw-actions">
            ${isTpl ? `<button type="button" class="btn btn--primary" data-use="${p.id}">${icon("plus")}Use this template</button>` : `
              ${p.status !== "archived" ? `<a class="btn btn--ghost" href="#/teach/pathways/${p.id}/edit">${icon("tools")}Edit</a>` : ""}
              ${canPublish ? `<button type="button" class="btn btn--primary" id="pw-publish" ${blockers.length ? 'aria-disabled="true"' : ""}>${icon("flag")}Publish v${p.version + 1}</button>` : ""}
              <button type="button" class="btn btn--ghost" id="pw-dup">${icon("plus")}Duplicate</button>
              <button type="button" class="btn btn--ghost" id="pw-archive">${icon(p.status === "archived" ? "refresh" : "box")}${p.status === "archived" ? "Restore" : "Archive"}</button>`}
          </div>
        </div>
        ${canPublish && blockers.length ? listBox("pw-box--block", "Before you can publish", blockers, "alert") : ""}
      </section>
      <div class="wrap pw-layout">
        <div class="pw-main">
          <section class="block" aria-labelledby="pw-about"><h2 id="pw-about">${icon("target")}Goal and final product</h2>${summaryList(p)}</section>
          <section class="block" aria-labelledby="pw-seq"><h2 id="pw-seq">${icon("list")}Steps</h2>${stepsPreview(p.steps)}</section>
        </div>
        <aside class="aside" aria-label="Pathway at a glance">
          <div class="block"><h2>At a glance</h2>${totalsBox(p)}</div>
          ${listBox("pw-box--warn", "Check before teaching", warnings(p), "alert")}
          ${!isTpl && cls ? `
          <div class="block">
            <h2>In ${esc(cls.name)}</h2>
            ${asg ? `<p>Assigned: version ${asg.version}${asg.version < p.version ? ` (latest is v${p.version})` : ""}.</p>
              ${asg.version < p.version ? `<button type="button" class="btn btn--primary btn--small" id="pw-move">${icon("refresh")}Move the class to v${p.version}</button>` : ""}
              ${stale.length ? `<div class="pw-box pw-box--warn"><h3>${icon("alert")}Updated since assigned</h3><ul>${stale.map((x) => `<li>${esc(x.activity.title)}: v${esc(x.from)} → v${esc(x.to)}</li>`).join("")}</ul>
                <p class="small">Students see the current mission with an “updated” note. To accept the new versions, publish again and move the class to it.</p></div>` : ""}
              <button type="button" class="btn btn--ghost btn--small" id="pw-unassign">Unassign</button>`
            : p.version && p.status !== "archived" ? `<button type="button" class="btn btn--primary btn--small" id="pw-assign">${icon("plus")}Assign v${p.version} to ${esc(cls.name)}</button>`
            : `<p class="muted small">Publish a version to assign it.</p>`}
          </div>` : ""}
          ${versions.length ? `<div class="block"><h2>Versions</h2><ol class="pw-versions">${versions.map((v) => `<li>v${v.version} · ${SE.dateShort(v.publishedAt)}</li>`).join("")}</ol></div>` : ""}
        </aside>
      </div>`;
    page(user, "pathways", body);
    if (isTpl) return bindUse(user);
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
    on("pw-publish", () => {
      if (blockers.length) { SE.toast("Fix the items under “Before you can publish” first."); return; }
      const v = SE.store.publishPathway(p.id);
      rerender("#pw-title", `Published version ${v.version}`);
    });
    on("pw-dup", () => { const c = SE.store.duplicatePathway(p, { title: `${p.title} (copy)` }); SE.toast("Copied. It's a new draft."); location.hash = `#/teach/pathways/${c.id}/edit`; });
    on("pw-archive", () => { SE.store.archivePathway(p.id, p.status !== "archived"); rerender("#pw-title", p.status === "archived" ? "Archived" : "Restored"); });
    on("pw-assign", () => { SE.store.assignPathway(cls.id, p.id); rerender("#pw-title", `Assigned to ${cls.name}`); });
    on("pw-move", () => { SE.store.assignPathway(cls.id, p.id); rerender("#pw-title", `${cls.name} moved to version ${p.version}`); });
    on("pw-unassign", () => { SE.store.unassignPathway(cls.id, p.id); rerender("#pw-title", `Removed from ${cls.name}`); });
  }

  /* ───────── Editor ───────── */
  let ed = null;        // { id, steps } — the step list being edited (saved automatically)
  let saveTimer = null, pendingSave = null;

  function editView(user, p) {
    if (!ed || ed.id !== p.id) ed = { id: p.id, steps: JSON.parse(JSON.stringify(p.steps)) };
    const aud = Object.assign({ grades: [], minutes: null, prior: "" }, p.audience);
    const field = (id, label, control, help) => `<div class="form__field"><label for="${id}">${label}</label>${control}${help ? `<p class="field-help">${help}</p>` : ""}</div>`;
    page(user, "pathways", `
      <section class="wrap section">
        <div class="backbar pw-back">${SE.backLink(`#/teach/pathways/${p.id}`, "Preview and publish")}</div>
        <div class="section__head"><div><span class="eyebrow">Editing</span><h2 id="pw-edit-title" tabindex="-1">${esc(p.title)}</h2></div>
          <p class="pw-saved" id="pw-saved" role="status" aria-live="polite">Changes save automatically.</p></div>
      </section>
      <div class="wrap pw-layout">
        <div class="pw-main">
          <section class="block" aria-labelledby="pw-goal-h">
            <h2 id="pw-goal-h">${icon("target")}1. Start with the goal</h2>
            <form id="pw-form" class="pw-form" novalidate>
              ${field("pw-goal", "What should students understand or be able to do?", `<textarea id="pw-goal" rows="2" maxlength="600">${esc(p.goal)}</textarea>`)}
              ${field("pw-product", "What will they make or show at the end?", `<textarea id="pw-product" rows="2" maxlength="600">${esc(p.finalProduct)}</textarea>`, "The final artifact or demonstration, for example an exhibit, a project, or a presentation.")}
              ${field("pw-name", "Pathway title", `<input id="pw-name" class="input" maxlength="120" value="${esc(p.title)}">`)}
              ${field("pw-question", "Essential question (optional)", `<input id="pw-question" class="input" maxlength="300" value="${esc(p.essentialQuestion)}">`)}
              <fieldset class="pw-group"><legend>Students</legend>
                <div class="pw-checks">${STEM.gradeBands.map((g) => `<label class="pw-check"><input type="checkbox" name="pw-grade" value="${g.id}" ${aud.grades.includes(g.id) ? "checked" : ""}><span>${esc(g.name)}</span></label>`).join("")}</div>
                ${field("pw-minutes", "Minutes per session (optional)", `<input id="pw-minutes" class="input input--small" type="number" min="10" max="180" value="${aud.minutes || ""}">`)}
                ${field("pw-prior", "Prior skills (optional)", `<input id="pw-prior" class="input" maxlength="200" value="${esc(aud.prior)}">`)}
              </fieldset>
            </form>
          </section>
          <section class="block" aria-labelledby="pw-steps-h">
            <h2 id="pw-steps-h">${icon("list")}2. Steps</h2>
            <p class="muted">Use Move up and Move down (or drag) to change the order. Each step can have a bridge (why it follows the last one), evidence to collect, and your own adaptation.</p>
            <div id="pw-steps"></div>
            <p class="visually-hidden" id="pw-live" aria-live="polite"></p>
            <button type="button" class="btn btn--ghost" id="pw-add-syn">${icon("plus")}Add a synthesis step</button>
          </section>
          <section class="block" aria-labelledby="pw-add-h">
            <h2 id="pw-add-h">${icon("search")}3. Add missions from any category</h2>
            <div class="pw-search">
              <div class="form__field"><label for="pw-q">Search missions</label><input id="pw-q" class="input" type="search" placeholder="Title or keyword"></div>
              <div class="form__field"><label for="pw-area">Category</label><select id="pw-area" class="input"><option value="">All categories</option>${SE.liveAreas.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select></div>
            </div>
            <ul class="pw-results" id="pw-results"></ul>
          </section>
        </div>
        <aside class="aside" aria-label="Preview">
          <div class="block"><h2>Preview</h2><div id="pw-preview"></div>
            <a class="btn btn--primary" href="#/teach/pathways/${p.id}">${icon("eye")}Preview and publish</a></div>
        </aside>
      </div>`);
    renderSteps();
    renderResults();
    bindEditor(p);
  }

  function stepEditor(s, i, n) {
    const a = stepAct(s);
    const id = s.id;
    return `
      <li class="pw-edit-step ${s.required ? "" : "pw-step--optional"}" draggable="true" data-i="${i}" data-id="${id}">
        <div class="pw-edit-step__head">
          <span class="pw-step__n" aria-hidden="true">${i + 1}</span>
          <h3>${s.kind === "synthesis" ? "Synthesis step" : a ? `${esc(a.title)} ${areaChip(a)}` : "Missing mission"}<span class="visually-hidden"> (step ${i + 1} of ${n})</span></h3>
          <div class="pw-edit-step__tools">
            <button type="button" class="btn btn--ghost btn--small" data-up="${id}" ${i === 0 ? "disabled" : ""}>Move up<span class="visually-hidden">: step ${i + 1}</span></button>
            <button type="button" class="btn btn--ghost btn--small" data-down="${id}" ${i === n - 1 ? "disabled" : ""}>Move down<span class="visually-hidden">: step ${i + 1}</span></button>
            <button type="button" class="btn btn--ghost btn--small" data-remove="${id}">Remove<span class="visually-hidden"> step ${i + 1}</span></button>
          </div>
        </div>
        ${a && SE.content.readiness(a) === "missing-resource" ? `<p class="small">${icon("alert")} No resource yet: this step can only be optional.</p>` : ""}
        <div class="pw-edit-step__fields">
          <label class="pw-check"><input type="checkbox" data-f="required" data-sid="${id}" ${s.required ? "checked" : ""}><span>Required</span></label>
          <div class="form__field"><label for="pw-label-${id}">Short label (optional)</label><input id="pw-label-${id}" class="input" maxlength="40" data-f="label" data-sid="${id}" value="${esc(s.label || "")}" placeholder="For example: Observe"></div>
          ${s.kind === "synthesis" ? `
          <div class="form__field"><label for="pw-prompt-${id}">Synthesis task</label><textarea id="pw-prompt-${id}" rows="2" maxlength="600" data-f="prompt" data-sid="${id}">${esc(s.prompt || "")}</textarea></div>
          <div class="pw-mins">
            <div class="form__field"><label for="pw-mlo-${id}">Minutes (from)</label><input id="pw-mlo-${id}" class="input input--small" type="number" min="5" max="180" data-f="mlo" data-sid="${id}" value="${s.minutes ? s.minutes[0] : ""}"></div>
            <div class="form__field"><label for="pw-mhi-${id}">Minutes (to)</label><input id="pw-mhi-${id}" class="input input--small" type="number" min="5" max="180" data-f="mhi" data-sid="${id}" value="${s.minutes ? s.minutes[1] : ""}"></div>
          </div>` : `
          <div class="form__field"><label for="pw-ev-${id}">Evidence to collect</label><textarea id="pw-ev-${id}" rows="2" maxlength="400" data-f="evidence" data-sid="${id}" placeholder="${esc(evidenceOf({}, a) ? `Leave empty to use the mission's check: ${evidenceOf({}, a)}` : "")}">${esc(s.evidence || "")}</textarea></div>`}
          <div class="form__field"><label for="pw-bridge-${id}">Bridge: why this step follows the last one (optional)</label><textarea id="pw-bridge-${id}" rows="2" maxlength="400" data-f="bridge" data-sid="${id}">${esc(s.bridge || "")}</textarea></div>
          <div class="form__field"><label for="pw-adapt-${id}">Your adaptation (optional; the mission itself doesn't change)</label><textarea id="pw-adapt-${id}" rows="2" maxlength="400" data-f="adaptation" data-sid="${id}">${esc(s.adaptation || "")}</textarea></div>
        </div>
      </li>`;
  }

  function renderSteps(focusSel) {
    const box = document.getElementById("pw-steps");
    if (!box) return;
    box.innerHTML = ed.steps.length ? `<ol class="pw-edit-steps">${ed.steps.map((s, i) => stepEditor(s, i, ed.steps.length)).join("")}</ol>`
      : `<p class="muted">No steps yet. Add missions below, or a synthesis step.</p>`;
    renderPreview();
    // focusSel: a selector, or a list tried in order (first enabled match wins).
    const el = [].concat(focusSel || []).map((sel) => document.querySelector(sel)).find((x) => x && !x.disabled);
    if (el) el.focus();
  }

  function currentPathway() {
    const p = SE.store.pathwayById(ed.id);
    return { ...p, ...readForm(), steps: ed.steps };
  }
  function renderPreview() {
    const box = document.getElementById("pw-preview");
    if (!box) return;
    const p = currentPathway();
    box.innerHTML = `${totalsBox(p)}${listBox("pw-box--block", "Before you can publish", publishBlockers(p), "alert")}${listBox("pw-box--warn", "Check before teaching", warnings(p), "alert")}`;
  }

  function renderResults() {
    const list = document.getElementById("pw-results");
    if (!list) return;
    const q = (document.getElementById("pw-q").value || "").trim().toLowerCase();
    const area = document.getElementById("pw-area").value;
    const inPath = new Set(ed.steps.map((s) => s.activityId));
    const hits = SE.sortActivities(STEM.activities.filter((a) => (!area || a.area === area || (a.alsoIn || []).includes(area))
      && (!q || `${a.title} ${a.summary} ${(a.keywords || []).join(" ")}`.toLowerCase().includes(q)))).slice(0, 12);
    list.innerHTML = hits.length ? hits.map((a) => `
      <li><span><strong>${esc(a.title)}</strong> ${areaChip(a)} <span class="muted small">${SE.timeText(a)} · ${SE.gradesText(a.grades)}</span>${SE.content.readiness(a) === "missing-resource" ? ` <span class="chip chip--soon">No resource yet</span>` : ""}</span>
        <button type="button" class="btn btn--ghost btn--small" data-add="${a.id}">${icon("plus")}${inPath.has(a.id) ? "Add again" : "Add"}<span class="visually-hidden">: ${esc(a.title)}</span></button></li>`).join("")
      : `<li class="muted">No missions match. Try another word or category.</li>`;
  }

  function readForm() {
    const v = (id) => (document.getElementById(id) || {}).value || "";
    const mins = parseInt(v("pw-minutes"), 10);
    return {
      title: v("pw-name"), essentialQuestion: v("pw-question"), goal: v("pw-goal"), finalProduct: v("pw-product"),
      audience: { grades: [...document.querySelectorAll("input[name=pw-grade]:checked")].map((x) => x.value), minutes: mins > 0 ? mins : null, equipment: [], prior: v("pw-prior").trim().slice(0, 200) }
    };
  }

  function save(msg) {
    const out = document.getElementById("pw-saved");
    if (out) out.textContent = "Saving…";
    clearTimeout(saveTimer);
    // Read the form now: if the teacher leaves the page before the timer, the form is gone.
    const id = ed.id, patch = { ...readForm(), steps: JSON.parse(JSON.stringify(ed.steps)) };
    pendingSave = () => {
      pendingSave = null;
      const p = SE.store.savePathway(id, patch);
      const h = document.getElementById("pw-edit-title");
      if (h && p) h.textContent = p.title;
      if (out) out.textContent = msg || "All changes saved.";
    };
    saveTimer = setTimeout(pendingSave, 600);
  }
  /* Save right away (before any pathway page renders, so previews never show an older copy). */
  function flushSave() { if (pendingSave) { clearTimeout(saveTimer); pendingSave(); } }

  function bindEditor(p) {
    const root = app().querySelector(".pw-layout");   // per render (app() itself persists across pages)
    const live = (t) => { const el = document.getElementById("pw-live"); if (el) el.textContent = t; };
    const idx = (id) => ed.steps.findIndex((s) => s.id === id);
    const titleOf = (s) => (s.kind === "synthesis" ? "Synthesis step" : (stepAct(s) || {}).title || "Step");
    const move = (id, d) => {
      const i = idx(id), j = i + d;
      if (i < 0 || j < 0 || j >= ed.steps.length) return;
      [ed.steps[i], ed.steps[j]] = [ed.steps[j], ed.steps[i]];
      renderSteps([`[data-${d < 0 ? "up" : "down"}="${id}"]`, `[data-${d < 0 ? "down" : "up"}="${id}"]`]);
      live(`${titleOf(ed.steps[j])} moved to step ${j + 1} of ${ed.steps.length}.`);
      save();
    };
    document.getElementById("pw-form").addEventListener("input", () => { renderPreview(); save(); });
    root.addEventListener("click", (e) => {
      const up = e.target.closest("[data-up]"), down = e.target.closest("[data-down]"), rm = e.target.closest("[data-remove]"), add = e.target.closest("[data-add]");
      if (up) return move(up.dataset.up, -1);
      if (down) return move(down.dataset.down, 1);
      if (rm) {
        const i = idx(rm.dataset.remove), gone = ed.steps[i];
        ed.steps.splice(i, 1);
        renderSteps(ed.steps.length ? `[data-remove="${ed.steps[Math.min(i, ed.steps.length - 1)].id}"]` : "#pw-add-syn");
        renderResults();
        live(`Removed ${titleOf(gone)}.`);
        return save();
      }
      if (add) {
        const a = SE.activityById[add.dataset.add];
        const s = { id: SE.uid("st"), kind: "mission", activityId: a.id, required: SE.content.readiness(a) !== "missing-resource", label: null, bridge: null, evidence: null, adaptation: null };
        ed.steps.push(s);
        renderSteps();
        renderResults();
        live(`Added ${a.title} as step ${ed.steps.length}.`);
        return save();
      }
    });
    document.getElementById("pw-add-syn").addEventListener("click", () => {
      const s = { id: SE.uid("st"), kind: "synthesis", required: true, label: "Synthesize", bridge: null, prompt: "", minutes: null, adaptation: null };
      ed.steps.push(s);
      renderSteps(`#pw-prompt-${s.id}`);
      live(`Added a synthesis step as step ${ed.steps.length}.`);
      save();
    });
    // Step fields: update the step in place (no re-render, so typing isn't interrupted).
    document.getElementById("pw-steps").addEventListener("input", (e) => {
      const el = e.target.closest("[data-f]");
      if (!el) return;
      const s = ed.steps[idx(el.dataset.sid)];
      const f = el.dataset.f;
      if (f === "required") {
        const a = stepAct(s);
        if (el.checked && a && SE.content.readiness(a) === "missing-resource") { el.checked = false; SE.toast("This mission has no resource yet, so it can only be optional."); return; }
        s.required = el.checked;
      } else if (f === "mlo" || f === "mhi") {
        const lo = parseInt(document.getElementById(`pw-mlo-${s.id}`).value, 10), hi = parseInt(document.getElementById(`pw-mhi-${s.id}`).value, 10);
        s.minutes = lo > 0 ? [lo, hi >= lo ? hi : lo] : null;
      } else s[f] = el.value.trim() ? el.value.slice(0, 600) : null;
      renderPreview();
      save();
    });
    document.getElementById("pw-q").addEventListener("input", renderResults);
    document.getElementById("pw-area").addEventListener("change", renderResults);
    // Drag and drop (the Move buttons do the same with a keyboard).
    let dragId = null;
    const steps = document.getElementById("pw-steps");
    steps.addEventListener("dragstart", (e) => { const li = e.target.closest("[data-id]"); if (li) { dragId = li.dataset.id; e.dataTransfer.effectAllowed = "move"; } });
    steps.addEventListener("dragover", (e) => { if (dragId) e.preventDefault(); });
    steps.addEventListener("drop", (e) => {
      const li = e.target.closest("[data-id]");
      if (!dragId || !li) return;
      e.preventDefault();
      const from = idx(dragId), to = idx(li.dataset.id);
      const [s] = ed.steps.splice(from, 1);
      ed.steps.splice(to, 0, s);
      dragId = null;
      renderSteps();
      live(`${titleOf(s)} moved to step ${to + 1}.`);
      save();
    });
  }
})();
