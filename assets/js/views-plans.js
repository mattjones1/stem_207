/*
 * STEM 207 — Learning Plans (usability overhaul, Stage 4).
 *
 * A Learning Plan is an ordered set of activities assigned to a whole class. Each activity's own
 * reflection is the deliverable (Pass / Try again), so a plan step is just an activity, whether it's
 * required, and an optional note to students.
 *
 *   #/teach/plans                        Current / Finished, drafts, templates, moving old assignments
 *   #/teach/plans/new[/<activityId>]     a new plan (optionally starting with one activity)
 *   #/teach/plans/<templateId>           a template preview with "Use this template"
 *   #/teach/plans/<id>[/students|checks] a plan: Activities, Students, Checks
 *   #/teach/plans/<id>/edit              the editor
 *   #/plans                              My Learning Plans, Current / All (students)
 *   #/plans/<assignmentId>               a student's plan (students)
 *
 * Plans are stored as pathways (store.js, supabase/update-6). "Update for students" publishes the
 * working copy and moves every assigned class to it; version pinning happens underneath.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const { icon, esc, plural } = SE;
  const app = () => document.getElementById("app");

  /* ───────── Rules (pure, for tests) ───────── */
  const template = (id) => (STEM.pathwayTemplates || []).find((t) => t.id === id) || null;
  /* A plan's activity steps (older plans may hold retired synthesis steps or a "bridge" note). */
  const stepsOf = (p) => (p.steps || []).filter((s) => s.kind === "mission" && s.activityId)
    .map((s) => ({ id: s.id, kind: "mission", activityId: s.activityId, required: s.required !== false, note: s.note || s.bridge || null, missionVersion: s.missionVersion }));
  const actOf = (s) => SE.activityById[s.activityId] || null;
  const range = (a) => (a.time && a.time.core ? a.time.core : [a.duration, a.duration]);

  function totals(steps) {
    const t = { min: 0, max: 0, optMin: 0, optMax: 0, prep: 0, prepMissing: 0, equipment: [], areas: [] };
    const equip = new Set(), areas = new Set();
    steps.forEach((s) => {
      const a = actOf(s);
      if (!a || a.placeholder) return;
      const [lo, hi] = range(a);
      if (s.required) { t.min += lo; t.max += hi; } else { t.optMin += lo; t.optMax += hi; }
      if (a.time && a.time.prep != null) t.prep += a.time.prep; else t.prepMissing++;
      (a.equipment || []).forEach((e) => equip.add(e));
      areas.add(a.area);
    });
    t.equipment = [...equip];
    t.areas = [...areas];
    return t;
  }

  /* Advice for the teacher (never a lock). Account, cost, and supervision limits are shown as they are. */
  function warnings(p) {
    const out = [];
    const grades = (p.audience && p.audience.grades) || [];
    let lastStage = 0, lastTitle = "";
    stepsOf(p).forEach((s) => {
      const a = actOf(s);
      if (!a) return;
      const miss = grades.filter((g) => !(a.grades || []).includes(g));
      if (grades.length && miss.length && a.grades && a.grades.length) out.push(`${a.title} is written for ${SE.gradesText(a.grades).toLowerCase()}, not ${miss.map((g) => SE.gradeById[g].name.toLowerCase()).join(" or ")}.`);
      if (!s.required && SE.content.readiness(a) === "missing-resource") out.push(`${a.title} has no resource yet. It's optional here, so students can skip it.`);
      if (a.access && a.access.account === "required") out.push(`${a.title} needs an account${a.access.accountNote ? `: ${a.access.accountNote}` : "."}`);
      if (a.access && a.access.cost === "paid") out.push(`${a.title} is a paid resource.`);
      if (a.access && a.access.supervision) out.push(`${a.title} needs an adult to guide or monitor it.`);
      if (a.launch.status === "lab") out.push(`${a.title} is a full lab. Tell students which levels to do.`);
      if (range(a)[1] > 60) out.push(`${a.title} takes ${range(a)[0]}–${range(a)[1]} minutes. Plan more than one session.`);
      if (a.pathwayStage) {
        if (a.pathwayStage < lastStage) out.push(`${a.title} (coding step ${a.pathwayStage}) comes after ${lastTitle} (step ${lastStage}). Check that students are ready.`);
        if (a.pathwayStage >= lastStage) { lastStage = a.pathwayStage; lastTitle = a.title; }
      }
    });
    return [...new Set(out)];
  }

  /* What stops a plan from going to students: no activities, or a required one that isn't ready. */
  function blockers(p) {
    const out = [];
    const steps = stepsOf(p);
    if (!steps.length) out.push("Add at least one activity.");
    steps.forEach((s, i) => {
      const a = actOf(s);
      if (!a) { out.push(`Activity ${i + 1} no longer exists. Remove it.`); return; }
      if (!s.required) return;
      // Published activities and pilot sessions (Moxie) can be required; drafts can't.
      if (!SE.content.assignable(a)) out.push(`${a.title} isn't ready for students yet. Make it optional or remove it.`);
      else if (SE.content.readiness(a) === "missing-resource") out.push(`${a.title} has no resource yet. Make it optional or remove it.`);
    });
    return out;
  }

  /* Has the plan changed since students last got it? */
  const unpublished = (p) => {
    if (!p.version) return true;
    const snap = SE.store.pathwayVersion(p.id, p.version);
    const strip = (o) => JSON.stringify({ title: o.title, goal: o.goal, grades: (o.audience || {}).grades || [], steps: stepsOf(o).map(({ missionVersion, ...s }) => s) });
    return !snap || strip(p) !== strip(snap);
  };

  /* A student's progress through a plan snapshot: passed of required, and what to do next. */
  function progress(prof, snapshot) {
    const steps = stepsOf(snapshot || { steps: [] }).filter((s) => actOf(s));
    const rows = steps.map((s) => ({ step: s, a: actOf(s), st: SE.game.statusFor(prof, actOf(s)) }));
    const req = rows.filter((r) => r.step.required);
    const next = rows.find((r) => r.st.state === "tryagain")
      || rows.find((r) => r.step.required && !["confirmed", "submitted"].includes(r.st.state))
      || rows.find((r) => !["confirmed", "submitted"].includes(r.st.state)) || null;
    return { rows, passed: req.filter((r) => r.st.state === "confirmed").length, required: req.length, next };
  }

  SE.plans = { template, stepsOf, totals, warnings, blockers, unpublished, progress };

  /* ───────── Shared pieces ───────── */
  const STATUS = { draft: ["Draft", "chip--soon"], current: ["Current", "chip--ok"], finished: ["Finished", ""] };
  const statusChip = (p) => { const [t, c] = STATUS[SE.store.planStatus(p)]; return `<span class="chip ${c}">${t}</span>`; };
  const timeText = (lo, hi) => (lo === hi ? `${lo} min` : `${lo}–${hi} min`);
  const areaChip = (a) => `<span class="pw-area">${icon(SE.areaById[a.area].icon)}${esc(SE.areaById[a.area].short)}</span>`;
  const listBox = (cls, title, items, ic) => items.length ? `<div class="pw-box ${cls}"><h3>${icon(ic)}${esc(title)}</h3><ul>${items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "";
  const classNames = (p) => SE.store.planAssignmentsOf(p.id).map((x) => (SE.store.classById(x.classId) || {}).name).filter(Boolean);

  function totalsBox(p) {
    const t = totals(stepsOf(p));
    return `
      <dl class="facts pw-totals">
        <div><dt>Student time</dt><dd>${timeText(t.min, t.max)}${t.optMax ? `<small>Optional activities: ${timeText(t.optMin, t.optMax)} more</small>` : ""}</dd></div>
        <div><dt>Teacher prep</dt><dd>${t.prep ? `About ${t.prep} min` : "—"}${t.prepMissing ? `<small>Not recorded for ${plural(t.prepMissing, "activity", "activities")}</small>` : ""}</dd></div>
        <div><dt>Categories</dt><dd>${t.areas.length ? esc(t.areas.map((id) => SE.areaById[id].short).join(", ")) : "—"}</dd></div>
        <div><dt>Equipment</dt><dd>${t.equipment.length ? esc(SE.equipmentText(t.equipment)) : "—"}</dd></div>
      </dl>`;
  }

  function activitiesList(p) {
    const steps = stepsOf(p);
    if (!steps.length) return `<p class="muted">No activities yet.</p>`;
    return `<ol class="pw-steps">${steps.map((s, i) => {
      const a = actOf(s);
      return `
        <li class="pw-step ${s.required ? "" : "pw-step--optional"}">
          <span class="pw-step__n" aria-hidden="true">${i + 1}</span>
          <div>
            <p class="pw-step__head">${a ? `<a href="#/activity/${a.id}">${esc(a.title)}</a> ${areaChip(a)} <span class="muted">${SE.timeText(a)}</span>${SE.content.readiness(a) === "missing-resource" ? ` <span class="chip chip--soon">No resource yet</span>` : ""}` : `<strong>Missing activity</strong>`}
              <span class="chip ${s.required ? "" : "chip--soon"}">${s.required ? "Required" : "Optional"}</span></p>
            ${s.note ? `<p class="pw-step__bridge">${icon("message")}<span>${esc(s.note)}</span></p>` : ""}
          </div>
        </li>`;
    }).join("")}</ol>`;
  }

  function page(user, active, body, title) {
    app().innerHTML = SE.teachFrame(user, null, [], active, body, { title: title || "Learning Plans" });
    SE.teachBindFrame(user);
  }
  function rerender(focusSel, msg) {
    const y = window.scrollY;
    SE.route(true);
    window.scrollTo(0, y);
    if (msg) SE.toast(msg);
    const el = focusSel && document.querySelector(focusSel);
    if (el) el.focus({ preventScroll: true });
  }

  /* ───────── Router entry (educators) ───────── */
  SE.views.teachPlans = function (user, rest) {
    flushSave();
    const [id, sub] = rest || [];
    if (!id) return listView(user);
    if (id === "new") {
      const a = sub && SE.activityById[sub];
      const p = SE.store.createPathway(a ? { title: `New plan with ${a.title}`, steps: [{ kind: "mission", activityId: a.id, required: true, note: null }] } : {});
      return location.replace(`#/teach/plans/${p.id}/edit`);
    }
    const t = template(id);
    if (t) return templateView(user, t);
    const p = SE.store.pathwayById(id);
    if (!p || p.educatorId !== user.id) return SE.views.notFound();
    if (sub === "edit") return editView(user, p);
    return planView(user, p, sub || "activities");
  };

  /* ───────── List: Current / Finished ───────── */
  let listMode = "current";
  function listView(user) {
    const mine = SE.store.pathwaysFor(user.id);
    const current = mine.filter((p) => SE.store.planStatus(p) === "current");
    const drafts = mine.filter((p) => SE.store.planStatus(p) === "draft");
    const finished = mine.filter((p) => SE.store.planStatus(p) === "finished");
    // Classes that still have activities assigned the old way (one by one).
    const legacy = SE.store.classesFor(user.id).map((c) => ({ c, n: SE.store.assignmentsFor(c.id).filter((x) => SE.activityById[x.activityId]).length })).filter((x) => x.n);
    const card = (p, isTpl) => {
      const t = totals(stepsOf(p));
      const names = isTpl ? [] : classNames(p);
      return `
        <li class="pw-card">
          <h3><a href="#/teach/plans/${p.id}">${esc(p.title)}</a></h3>
          <p class="pw-card__meta">${isTpl ? `<span class="chip chip--ok">${p.reviewed ? "Reviewed template" : "Proposed: review before teaching"}</span>` : statusChip(p)}${!isTpl && SE.store.planStatus(p) === "current" && unpublished(p) ? ` <span class="chip chip--warn">Changes not sent to students</span>` : ""}</p>
          <p>${esc(p.goal || "No goal yet")}</p>
          ${isTpl && p.workshop ? `<p class="small pw-card__ws">${icon("clock")}${esc(p.workshop.format)}</p>` : ""}
          <p class="muted small">${plural(stepsOf(p).length, "activity", "activities")} · ${plural(t.areas.length, "category", "categories")} · ${timeText(t.min, t.max)}${names.length ? ` · ${esc(names.join(", "))}` : ""}</p>
          <div class="pw-card__actions">
            ${isTpl ? `<a class="btn btn--ghost btn--small" href="#/teach/plans/${p.id}">${icon("eye")}Preview<span class="visually-hidden"> ${esc(p.title)}</span></a>
              <button type="button" class="btn btn--primary btn--small" data-use="${p.id}">${icon("plus")}Use this template<span class="visually-hidden">: ${esc(p.title)}</span></button>`
              : `<a class="btn btn--ghost btn--small" href="#/teach/plans/${p.id}">${icon("arrowRight")}Open<span class="visually-hidden"> ${esc(p.title)}</span></a>`}
          </div>
        </li>`;
    };
    const section = (id, title, list, empty) => `
      <section class="wrap section" aria-labelledby="${id}">
        <div class="section__head"><div><h2 id="${id}">${esc(title)} <span class="muted">(${list.length})</span></h2></div></div>
        ${list.length ? `<ul class="pw-cards">${list.map((p) => card(p, false)).join("")}</ul>` : `<p class="muted">${empty}</p>`}
      </section>`;
    page(user, "plans", `
      <section class="wrap section">
        <div class="section__head">
          <div><span class="eyebrow">Activities in order, for a whole class</span><h2>Your Learning Plans</h2></div>
          <div class="pw-actions">
            <a class="btn btn--primary" href="#/teach/plans/new">${icon("plus")}Build your own</a>
            <a class="btn btn--ghost" href="#pw-tpl" data-jump="pw-tpl">${icon("list")}Start from a template</a>
          </div>
        </div>
        <p class="muted">Build your own: pick activities from any category, for example one coding, one VR, and one AI activity.</p>
        <div class="seg" role="group" aria-label="Show">
          <button type="button" class="seg__btn" data-mode="current" aria-pressed="${listMode === "current"}">Current and drafts</button>
          <button type="button" class="seg__btn" data-mode="finished" aria-pressed="${listMode === "finished"}">Finished (${finished.length})</button>
        </div>
        ${legacy.map(({ c, n }) => `<p class="pwk-banner">${icon("clipboard")}<span><strong>${esc(c.name)}</strong> has ${plural(n, "activity", "activities")} assigned one at a time, the old way. <button type="button" class="btn btn--primary btn--small" data-migrate="${c.id}">Move them into a Learning Plan</button></span></p>`).join("")}
      </section>
      ${listMode === "current"
        ? section("plans-current", "Current", current, "No plan is assigned to a class yet.") + section("plans-drafts", "Drafts", drafts, "No drafts. Start a new plan, or use a template below.")
        : section("plans-finished", "Finished", finished, "No finished plans yet. Finish a plan when the class is done with it.")}
      <section class="wrap section" aria-labelledby="pw-tpl">
        <div class="section__head"><div><span class="eyebrow">Ready to adapt</span><h2 id="pw-tpl" tabindex="-1">Templates</h2></div>
          <p>Using a template makes your own copy. The template never changes.</p></div>
        <h3 class="pw-group-h">${icon("star")}STEM 207 workshops</h3>
        <ul class="pw-cards">${(STEM.pathwayTemplates || []).filter((t) => t.group === "workshop").map((t) => card(t, true)).join("")}</ul>
        <h3 class="pw-group-h">${icon("list")}Classroom templates</h3>
        <ul class="pw-cards">${(STEM.pathwayTemplates || []).filter((t) => t.group !== "workshop").map((t) => card(t, true)).join("")}</ul>
      </section>`);
    app().querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { listMode = b.dataset.mode; rerender(`[data-mode="${listMode}"]`); }));
    app().querySelectorAll("[data-migrate]").forEach((b) => b.addEventListener("click", () => {
      const p = migrateLegacy(b.dataset.migrate);
      if (p) { SE.toast(`Made “${p.title}” and assigned it`); location.hash = `#/teach/plans/${p.id}`; }
    }));
    bindUse();
  }

  /* One class's single assignments become one Learning Plan, assigned to that class (notes kept). */
  function migrateLegacy(classId) {
    const cls = SE.store.classById(classId);
    const old = SE.store.assignmentsFor(classId).filter((x) => SE.activityById[x.activityId]);
    if (!cls || !old.length) return null;
    const p = SE.store.createPathway({
      title: `${cls.name}: assigned activities`, goal: "The activities this class had assigned before Learning Plans.",
      steps: old.map((x) => ({ kind: "mission", activityId: x.activityId, required: true, note: x.note || null }))
    });
    SE.store.publishPathway(p.id);
    SE.store.assignPathway(classId, p.id);
    SE.store.unassign(classId, old.map((x) => x.activityId));
    return p;
  }
  SE.plans.migrateLegacy = migrateLegacy;

  function bindUse() {
    app().querySelectorAll("[data-use]").forEach((b) => b.addEventListener("click", () => {
      const t = template(b.dataset.use);
      const p = t && SE.store.duplicatePathway({ ...t, steps: stepsOf(t) });
      if (!p) return;
      SE.toast(`Copied “${t.title}”. It's your draft now.`);
      location.hash = `#/teach/plans/${p.id}/edit`;
    }));
  }

  /* A workshop's format and sessions, and content that's coming later (text only). */
  function workshopBoxes(t, steps) {
    if (!t) return "";
    const ws = t.workshop;
    return (ws ? `
      <div class="block pw-ws"><h2>${icon("clock")}Workshop format</h2><p><strong>${esc(ws.format)}</strong></p>
        ${steps ? `<ol class="pw-ws__sessions">${ws.sessions.map((x) => `<li><strong>${esc(x.title)}</strong><span>${x.steps.map((n) => steps[n - 1] && actOf(steps[n - 1])).filter(Boolean).map((a) => esc(a.title)).join(", ")}</span></li>`).join("")}</ol>` : ""}</div>` : "")
      + (t.future && t.future.length ? `
      <div class="block pw-future"><h2>${icon("rocket")}Coming with future content</h2><ul>${t.future.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <p class="muted small">Not part of the plan yet. It's added when that content is ready.</p></div>` : "");
  }

  function templateView(user, t) {
    page(user, "plans", `
      <section class="wrap section">
        <div class="backbar pw-back">${SE.backLink("#/teach/plans", "Learning Plans")}</div>
        <div class="section__head">
          <div><span class="eyebrow">Template</span><h2 id="pw-title" tabindex="-1">${esc(t.title)}</h2>
            <p class="pw-card__meta"><span class="chip chip--ok">${t.reviewed ? "Reviewed template" : "Proposed: review before teaching"}</span></p></div>
          <button type="button" class="btn btn--primary" data-use="${t.id}">${icon("plus")}Use this template</button>
        </div>
      </section>
      <div class="wrap pw-layout">
        <div class="pw-main">
          <section class="block" aria-labelledby="pw-goal"><h2 id="pw-goal">${icon("target")}Goal</h2><p>${esc(t.goal)}</p>
            ${t.audience && t.audience.grades && t.audience.grades.length ? `<p class="muted">${SE.gradesText(t.audience.grades)}</p>` : ""}</section>
          <section class="block" aria-labelledby="pw-seq"><h2 id="pw-seq">${icon("list")}Activities</h2>${activitiesList(t)}</section>
        </div>
        <aside class="aside" aria-label="Plan at a glance">
          <div class="block"><h2>At a glance</h2>${totalsBox(t)}</div>
          ${workshopBoxes(t, stepsOf(t))}
          ${listBox("pw-box--warn", "Check before teaching", warnings(t), "alert")}
        </aside>
      </div>`, "Learning Plans");
    bindUse();
  }

  /* ───────── A plan: Activities · Students · Checks ───────── */
  function planView(user, p, tab) {
    const status = SE.store.planStatus(p);
    const asgs = SE.store.planAssignmentsOf(p.id);
    const assignedClasses = asgs.map((x) => SE.store.classById(x.classId)).filter(Boolean);
    const open = SE.store.classesFor(user.id).filter((c) => !asgs.some((x) => x.classId === c.id));
    const block = blockers(p);
    const changed = status === "current" && unpublished(p);
    const ids = new Set(stepsOf(p).map((s) => s.activityId));
    const checks = SE.teachCheckList(assignedClasses.map((c) => c.id), ids);
    const tabs = [["activities", "Activities"], ["students", "Students"], ["checks", `Checks${checks.count ? ` (${checks.count})` : ""}`]];
    let main = "";
    if (tab === "students") main = studentsTab(p, assignedClasses);
    else if (tab === "checks") main = checks.count ? `<section class="wrap section">${checks.html}</section>` : `<section class="wrap section"><div class="empty">${icon("message")}<h3>Nothing waiting</h3><p>When students send reflections for this plan's activities, they show up here.</p></div></section>`;
    else main = `
      <div class="wrap pw-layout">
        <div class="pw-main">
          <section class="block" aria-labelledby="pw-goal"><h2 id="pw-goal">${icon("target")}Goal</h2><p>${esc(p.goal || "No goal yet.")}</p>
            ${p.audience && p.audience.grades && p.audience.grades.length ? `<p class="muted">${SE.gradesText(p.audience.grades)}</p>` : ""}</section>
          <section class="block" aria-labelledby="pw-seq"><h2 id="pw-seq">${icon("list")}Activities</h2>${activitiesList(p)}</section>
        </div>
        <aside class="aside" aria-label="Plan at a glance">
          <div class="block"><h2>At a glance</h2>${totalsBox(p)}</div>
          ${workshopBoxes(template(p.basedOn), null)}
          ${listBox("pw-box--warn", "Check before teaching", warnings(p), "alert")}
        </aside>
      </div>`;
    page(user, "plans", `
      <section class="wrap section">
        <div class="backbar pw-back">${SE.backLink("#/teach/plans", "Learning Plans")}</div>
        <div class="section__head">
          <div><span class="eyebrow">Learning Plan</span><h2 id="pw-title" tabindex="-1">${esc(p.title)}</h2>
            <p class="pw-card__meta">${statusChip(p)}${assignedClasses.length ? ` <span class="muted small">${esc(assignedClasses.map((c) => c.name).join(", "))}</span>` : ""}</p></div>
          <div class="pw-actions">
            ${status !== "finished" ? `<a class="btn btn--ghost" href="#/teach/plans/${p.id}/edit">${icon("tools")}Edit</a>` : ""}
            ${changed ? `<button type="button" class="btn btn--primary" id="pl-update" ${block.length ? 'aria-disabled="true"' : ""}>${icon("refresh")}Update for students</button>` : ""}
            <button type="button" class="btn btn--ghost" id="pl-dup">${icon("plus")}Duplicate</button>
            <button type="button" class="btn btn--ghost" id="pl-finish">${icon(status === "finished" ? "refresh" : "flag")}${status === "finished" ? "Reopen" : "Finish"}</button>
          </div>
        </div>
        ${changed ? `<p class="pwk-banner">${icon("alert")}<span>You've edited this plan since students got it. Choose <strong>Update for students</strong> to send the changes to ${esc(assignedClasses.map((c) => c.name).join(", "))}.</span></p>` : ""}
        ${listBox("pw-box--block", status === "draft" ? "Before you can assign it" : "Before you can update it", block, "alert")}
        ${status !== "finished" && open.length ? `
        <form class="inline-form pl-assign" id="pl-assign">
          <label for="pl-class">Assign to a class</label>
          <select id="pl-class" class="input input--small">${open.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select>
          <button type="submit" class="btn btn--primary btn--small" ${block.length ? 'aria-disabled="true"' : ""}>${icon("plus")}Assign</button>
          <span class="muted small">Every student in the class sees it on Home.</span>
        </form>` : ""}
        <nav class="plan-tabs" aria-label="Plan sections">${tabs.map(([k, label]) => `<a href="#/teach/plans/${p.id}/${k}" ${tab === k ? 'aria-current="page"' : ""}>${label}</a>`).join("")}</nav>
      </section>
      ${main}`, "Learning Plans");
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(el.tagName === "FORM" ? "submit" : "click", (e) => { e.preventDefault(); fn(); }); };
    on("pl-update", () => {
      if (block.length) return SE.toast("Fix the items listed first.");
      SE.store.updatePlanForStudents(p.id);
      rerender("#pw-title", "Students have the updated plan");
    });
    on("pl-assign", () => {
      if (block.length) return SE.toast("Fix the items listed first.");
      const cid = document.getElementById("pl-class").value;
      if (unpublished(p)) SE.store.publishPathway(p.id);
      SE.store.assignPathway(cid, p.id);
      rerender("#pw-title", `Assigned to ${(SE.store.classById(cid) || {}).name}`);
    });
    on("pl-dup", () => { const c = SE.store.duplicatePathway({ ...p, title: `${p.title} (copy)`, steps: stepsOf(p) }); SE.toast("Copied. It's a new draft."); location.hash = `#/teach/plans/${c.id}/edit`; });
    on("pl-finish", () => { SE.store.archivePathway(p.id, status !== "finished"); rerender("#pw-title", status === "finished" ? "Reopened" : "Finished. Students see it under All."); });
    app().querySelectorAll("[data-unassign]").forEach((b) => b.addEventListener("click", () => {
      SE.store.unassignPathway(b.dataset.unassign, p.id);
      rerender("#pw-title", "Removed from the class");
    }));
    if (tab === "checks") SE.teachBindChecks();
  }

  function studentsTab(p, classes) {
    if (!classes.length) return `<section class="wrap section"><div class="empty">${icon("users")}<h3>Not assigned yet</h3><p>Assign this plan to a class to see each student's progress here.</p></div></section>`;
    return classes.map((c) => {
      const asg = SE.store.pathwayAssignmentFor(c.id, p.id);
      const steps = stepsOf(asg.snapshot || p).filter((s) => actOf(s));
      const sum = SE.game.classSummary(c.id);
      return `
        <section class="wrap section" aria-labelledby="pls-${c.id}">
          <div class="section__head"><div><h2 id="pls-${c.id}">${esc(c.name)}</h2></div>
            <button type="button" class="btn btn--ghost btn--small" data-unassign="${c.id}">Remove from ${esc(c.name)}</button></div>
          <div class="table-wrap"><table class="roster plan-grid">
            <caption class="visually-hidden">Each student's status on each activity in ${esc(p.title)}</caption>
            <thead><tr><th scope="col">Student</th>${steps.map((s, i) => `<th scope="col"><span class="visually-hidden">Activity </span>${i + 1}<small>${esc(actOf(s).title)}</small></th>`).join("")}<th scope="col" class="num">Passed</th></tr></thead>
            <tbody>${sum.profiles.map(({ student, prof }) => {
              const pr = progress(prof, asg.snapshot || p);
              return `<tr><th scope="row"><a href="#/teach/student/${student.id}">${esc(student.displayName)}</a></th>
                ${pr.rows.map((r) => `<td>${SE.teachStatusChip(r.st)}</td>`).join("")}<td class="num">${pr.passed} of ${pr.required}</td></tr>`;
            }).join("") || `<tr><td colspan="${steps.length + 2}" class="muted">No students in this class yet.</td></tr>`}</tbody>
          </table></div>
        </section>`;
    }).join("");
  }

  /* ───────── Editor: title, goal, grades, and the activities ───────── */
  let ed = null;        // { id, steps }
  const pick = { area: "coding" };   // the picker's category
  let saveTimer = null, pendingSave = null;

  function editView(user, p) {
    // Always start from the stored plan: it may have changed elsewhere (Add to a Learning Plan).
    ed = { id: p.id, steps: stepsOf(p) };
    const aud = Object.assign({ grades: [] }, p.audience);
    page(user, "plans", `
      <section class="wrap section">
        <div class="backbar pw-back">${SE.backLink(`#/teach/plans/${p.id}`, "Back to the plan")}</div>
        <div class="section__head"><div><span class="eyebrow">Editing</span><h2 id="pw-edit-title" tabindex="-1">${esc(p.title)}</h2></div>
          <p class="pw-saved" id="pw-saved" role="status" aria-live="polite">Changes save automatically.</p></div>
      </section>
      <div class="wrap pw-layout">
        <div class="pw-main">
          <section class="block" aria-labelledby="pw-about-h">
            <h2 id="pw-about-h">${icon("target")}About this plan</h2>
            <form id="pw-form" class="pw-form" novalidate>
              <div class="form__field"><label for="pw-name">Title</label><input id="pw-name" class="input" maxlength="120" value="${esc(p.title)}"></div>
              <div class="form__field"><label for="pw-goal">Goal (optional): what should students understand or be able to do?</label><textarea id="pw-goal" rows="2" maxlength="600">${esc(p.goal)}</textarea></div>
              <fieldset class="pw-group"><legend>Grades (optional)</legend>
                <div class="pw-checks">${STEM.gradeBands.map((g) => `<label class="pw-check"><input type="checkbox" name="pw-grade" value="${g.id}" ${aud.grades.includes(g.id) ? "checked" : ""}><span>${esc(g.name)}</span></label>`).join("")}</div>
              </fieldset>
            </form>
          </section>
          <section class="block" aria-labelledby="pw-steps-h">
            <h2 id="pw-steps-h">${icon("list")}Activities, in order</h2>
            <p class="muted">Use Move up and Move down (or drag) to change the order. Each activity's reflection is what students send for a check.</p>
            <div id="pw-steps"></div>
            <p class="visually-hidden" id="pw-live" aria-live="polite"></p>
          </section>
          <section class="block pk" aria-labelledby="pw-add-h" id="pw-add">
            <h2 id="pw-add-h">${icon("plus")}Add activities from any category</h2>
            <p class="muted">Mix and match. For example, one coding, one virtual reality, and one AI activity.</p>
            <div class="pk-tabs" role="group" aria-label="Category">
              ${STEM.areas.map((ar) => ar.status === "coming-soon"
                ? `<button type="button" class="pk-tab is-soon" aria-disabled="true">${icon(ar.icon)}<span>${esc(ar.short)}<small>Coming soon</small></span></button>`
                : `<button type="button" class="pk-tab" data-pick-area="${ar.id}" aria-pressed="${pick.area === ar.id}">${icon(ar.icon)}<span>${esc(ar.short)}<small>${STEM.activities.filter((a) => a.area === ar.id).length} activities</small></span></button>`).join("")}
            </div>
            <div class="pw-search pk-filters">
              <div class="form__field"><label for="pw-q">Search every category</label><input id="pw-q" class="input" type="search" placeholder="Title or keyword"></div>
              <div class="form__field"><label for="pw-fgrade">Grades</label><select id="pw-fgrade" class="input"><option value="">Any grade</option>${STEM.gradeBands.map((g) => `<option value="${g.id}">${esc(g.name)}</option>`).join("")}</select></div>
              <div class="form__field"><label for="pw-ftime">Time</label><select id="pw-ftime" class="input"><option value="">Any length</option>${STEM.durations.map((d) => `<option value="${d.max}">${esc(d.name)}</option>`).join("")}</select></div>
            </div>
            <p class="pk-count muted small" id="pw-count" role="status"></p>
            <ul class="pk-results" id="pw-results"></ul>
          </section>
        </div>
        <aside class="aside" aria-label="Preview">
          <div class="block"><h2>Preview</h2><div id="pw-preview"></div>
            <a class="btn btn--primary" href="#/teach/plans/${p.id}">${icon("check")}Done</a></div>
        </aside>
      </div>`, "Learning Plans");
    renderSteps();
    renderResults();
    bindEditor();
  }

  function stepEditor(s, i, n) {
    const a = actOf(s), id = s.id;
    return `
      <li class="pw-edit-step ${s.required ? "" : "pw-step--optional"}" draggable="true" data-id="${id}">
        <div class="pw-edit-step__head">
          <span class="pw-step__n" aria-hidden="true">${i + 1}</span>
          <h3>${a ? `${esc(a.title)} ${areaChip(a)}` : "Missing activity"}<span class="visually-hidden"> (activity ${i + 1} of ${n})</span></h3>
          <div class="pw-edit-step__tools">
            <button type="button" class="btn btn--ghost btn--small" data-up="${id}" ${i === 0 ? "disabled" : ""}>Move up<span class="visually-hidden">: activity ${i + 1}</span></button>
            <button type="button" class="btn btn--ghost btn--small" data-down="${id}" ${i === n - 1 ? "disabled" : ""}>Move down<span class="visually-hidden">: activity ${i + 1}</span></button>
            <button type="button" class="btn btn--ghost btn--small" data-remove="${id}">Remove<span class="visually-hidden"> activity ${i + 1}</span></button>
          </div>
        </div>
        ${a && SE.content.readiness(a) === "missing-resource" ? `<p class="small">${icon("alert")} No resource yet: this activity can only be optional.</p>` : ""}
        <div class="pw-edit-step__fields">
          <label class="pw-check"><input type="checkbox" data-f="required" data-sid="${id}" ${s.required ? "checked" : ""}><span>Required</span></label>
          <div class="form__field"><label for="pw-note-${id}">Note to students (optional)</label><textarea id="pw-note-${id}" rows="2" maxlength="400" data-f="note" data-sid="${id}">${esc(s.note || "")}</textarea></div>
        </div>
      </li>`;
  }

  function renderSteps(focusSel) {
    const box = document.getElementById("pw-steps");
    if (!box) return;
    box.innerHTML = ed.steps.length ? `${mixStrip()}<ol class="pw-edit-steps">${ed.steps.map((s, i) => stepEditor(s, i, ed.steps.length)).join("")}</ol>`
      : `<p class="muted">No activities yet. Pick from any category below.</p>`;
    renderPreview();
    const el = [].concat(focusSel || []).map((sel) => document.querySelector(sel)).find((x) => x && !x.disabled);
    if (el) el.focus();
  }
  function readForm() {
    const v = (id) => (document.getElementById(id) || {}).value || "";
    return { title: v("pw-name"), goal: v("pw-goal"), audience: { grades: [...document.querySelectorAll("input[name=pw-grade]:checked")].map((x) => x.value), minutes: null, equipment: [], prior: "" } };
  }
  function renderPreview() {
    const box = document.getElementById("pw-preview");
    if (!box) return;
    const p = { ...SE.store.pathwayById(ed.id), ...readForm(), steps: ed.steps };
    box.innerHTML = `${totalsBox(p)}${listBox("pw-box--block", "Before you can assign it", blockers(p), "alert")}${listBox("pw-box--warn", "Check before teaching", warnings(p), "alert")}`;
  }
  /* The picker: one category at a time (every activity in it), or a search across every category. */
  function pickList() {
    const v = (id) => (document.getElementById(id) || {}).value || "";
    const q = v("pw-q").trim().toLowerCase(), grade = v("pw-fgrade"), time = Number(v("pw-ftime")) || 0;
    return SE.sortActivities(STEM.activities.filter((a) => (q ? `${a.title} ${a.summary} ${(a.keywords || []).join(" ")}`.toLowerCase().includes(q) : (a.area === pick.area || (a.alsoIn || []).includes(pick.area)))
      && (!grade || (a.grades || []).includes(grade)) && (!time || SE.timeMax(a) <= time)));
  }
  function renderResults() {
    const list = document.getElementById("pw-results");
    if (!list) return;
    const inPlan = new Set(ed.steps.map((s) => s.activityId));
    const hits = pickList();
    const q = (document.getElementById("pw-q").value || "").trim();
    document.getElementById("pw-count").textContent = q ? `${plural(hits.length, "match", "matches")} in every category` : `${plural(hits.length, "activity", "activities")} in ${SE.areaById[pick.area].name}`;
    list.innerHTML = hits.length ? hits.map((a) => `
      <li class="pk-card ${inPlan.has(a.id) ? "is-in" : ""}">
        <div class="pk-card__main"><strong>${esc(a.title)}</strong>
          <span class="pk-card__meta">${areaChip(a)}${a.launch.status === "lab" ? ` <span class="chip">Lab</span>` : ""} <span class="muted small">${SE.timeText(a)} · ${SE.gradesText(a.grades)}</span>${SE.content.readiness(a) === "missing-resource" ? ` <span class="chip chip--soon">No resource yet</span>` : ""}</span></div>
        <button type="button" class="btn ${inPlan.has(a.id) ? "btn--ghost" : "btn--primary"} btn--small" data-add="${a.id}" ${inPlan.has(a.id) ? 'aria-disabled="true"' : ""}>${icon(inPlan.has(a.id) ? "check" : "plus")}${inPlan.has(a.id) ? "In the plan" : "Add"}<span class="visually-hidden">: ${esc(a.title)}</span></button></li>`).join("")
      : `<li class="muted">No activities match. Try another category, grade, or word.</li>`;
  }
  /* "Your mix": how many activities come from each category, and the total time. */
  function mixStrip() {
    const n = {};
    ed.steps.forEach((s) => { const a = actOf(s); if (a) n[a.area] = (n[a.area] || 0) + 1; });
    const t = totals(ed.steps);
    return `<p class="pk-mix" id="pw-mix"><span class="pk-mix__label">Your mix</span>${Object.entries(n).map(([id, k]) => `<span class="pw-area">${icon(SE.areaById[id].icon)}${esc(SE.areaById[id].short)} · ${k}</span>`).join("")}<span class="muted small">${timeText(t.min, t.max)} required${t.optMax ? `, plus ${timeText(t.optMin, t.optMax)} optional` : ""}</span></p>`;
  }
  function save() {
    const out = document.getElementById("pw-saved");
    if (out) out.textContent = "Saving…";
    clearTimeout(saveTimer);
    // Read the form now: if the teacher leaves the page before the timer, the form is gone.
    const id = ed.id, patch = { ...readForm(), steps: JSON.parse(JSON.stringify(ed.steps)).map(({ missionVersion, ...s }) => s) };
    pendingSave = () => {
      pendingSave = null;
      const p = SE.store.savePathway(id, patch);
      const h = document.getElementById("pw-edit-title");
      if (h && p) h.textContent = p.title;
      if (out) out.textContent = "All changes saved.";
    };
    saveTimer = setTimeout(pendingSave, 600);
  }
  /* Save right away (before any plan page renders, so previews never show an older copy). */
  function flushSave() { if (pendingSave) { clearTimeout(saveTimer); pendingSave(); } }

  function bindEditor() {
    const root = app().querySelector(".pw-layout");
    const live = (t) => { const el = document.getElementById("pw-live"); if (el) el.textContent = t; };
    const idx = (id) => ed.steps.findIndex((s) => s.id === id);
    const titleOf = (s) => (actOf(s) || {}).title || "Activity";
    const move = (id, d) => {
      const i = idx(id), j = i + d;
      if (i < 0 || j < 0 || j >= ed.steps.length) return;
      [ed.steps[i], ed.steps[j]] = [ed.steps[j], ed.steps[i]];
      renderSteps([`[data-${d < 0 ? "up" : "down"}="${id}"]`, `[data-${d < 0 ? "down" : "up"}="${id}"]`]);
      live(`${titleOf(ed.steps[j])} moved to ${j + 1} of ${ed.steps.length}.`);
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
        renderSteps(ed.steps.length ? `[data-remove="${ed.steps[Math.min(i, ed.steps.length - 1)].id}"]` : "#pw-q");
        renderResults();
        live(`Removed ${titleOf(gone)}.`);
        return save();
      }
      if (add && add.getAttribute("aria-disabled") !== "true") {
        const a = SE.activityById[add.dataset.add];
        ed.steps.push({ id: SE.uid("st"), kind: "mission", activityId: a.id, required: SE.content.readiness(a) !== "missing-resource", note: null });
        renderSteps();
        renderResults();
        live(`Added ${a.title} as activity ${ed.steps.length}.`);
        return save();
      }
    });
    document.getElementById("pw-steps").addEventListener("input", (e) => {
      const el = e.target.closest("[data-f]");
      if (!el) return;
      const s = ed.steps[idx(el.dataset.sid)];
      if (el.dataset.f === "required") {
        const a = actOf(s);
        if (el.checked && a && SE.content.readiness(a) === "missing-resource") { el.checked = false; SE.toast("This activity has no resource yet, so it can only be optional."); return; }
        s.required = el.checked;
      } else s.note = el.value.trim() ? el.value.slice(0, 400) : null;
      renderPreview();
      save();
    });
    document.getElementById("pw-q").addEventListener("input", renderResults);
    ["pw-fgrade", "pw-ftime"].forEach((id) => document.getElementById(id).addEventListener("change", renderResults));
    app().querySelectorAll("[data-pick-area]").forEach((b) => b.addEventListener("click", () => {
      pick.area = b.dataset.pickArea;
      app().querySelectorAll("[data-pick-area]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      document.getElementById("pw-q").value = "";
      renderResults();
    }));
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
      live(`${titleOf(s)} moved to ${to + 1}.`);
      save();
    });
  }

  /* ───────── Activity page (educators): add this activity to a plan ───────── */
  SE.planPicker = function (user, a) {
    if (!SE.content.assignable(a)) return "";
    const plans = SE.store.pathwaysFor(user.id).filter((p) => p.status !== "archived");
    return `
      <div class="block plan-picker">
        <h2>Add to a Learning Plan</h2>
        ${plans.length ? `<form id="plan-pick" class="pl-assign" data-activity="${a.id}">
          <label for="pp-plan">Learning Plan</label>
          <select id="pp-plan" class="input input--small">${plans.map((p) => `<option value="${p.id}">${esc(p.title)}${stepsOf(p).some((s) => s.activityId === a.id) ? " (already in it)" : ""}</option>`).join("")}</select>
          <button type="submit" class="btn btn--primary btn--small">${icon("plus")}Add</button>
        </form>` : `<p class="muted small">You don't have a Learning Plan yet.</p>`}
        <a class="btn btn--ghost btn--small" href="#/teach/plans/new/${a.id}">${icon("plus")}New plan with this activity</a>
        <p class="mx-status" id="pp-status" role="status" aria-live="polite"></p>
      </div>`;
  };
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("#plan-pick");
    if (!f) return;
    e.preventDefault();
    const pid = document.getElementById("pp-plan").value, p = SE.store.pathwayById(pid), aid = f.dataset.activity;
    const out = document.getElementById("pp-status");
    if (stepsOf(p).some((s) => s.activityId === aid)) { out.textContent = `It's already in “${p.title}”.`; return; }
    SE.store.addActivityToPlan(pid, aid);
    out.textContent = SE.store.planStatus(p) === "current" ? `Added to “${p.title}”. Open the plan and choose Update for students to send it.` : `Added to “${p.title}”.`;
  });

  /* ───────── Students: a plan page and the Home cards ───────── */
  const studentPlans = (user) => SE.store.pathwayAssignmentsFor(user.classId).filter((a) => a.snapshot);
  SE.views.myPlan = function (user, assignmentId) {
    const asg = studentPlans(user).find((a) => a.id === assignmentId);
    if (!asg) return SE.views.notFound();
    const prof = SE.game.profile(user.id);
    const pr = progress(prof, asg.snapshot);
    const finished = SE.store.planFinished(asg);
    const verb = (st) => ({ confirmed: "See it", submitted: "See it", tryagain: "Try again", started: "Continue" }[st] || "Start");
    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink("#/plans", "My Learning Plans")}</div>
          <div class="page-top__head"><span class="icon-badge">${icon("map")}</span>
            <div><span class="eyebrow">Learning Plan${finished ? " · Finished" : ""}</span><h1 tabindex="-1">${esc(asg.snapshot.title)}</h1></div></div>
          ${asg.snapshot.goal ? `<p class="page-top__lede">${esc(asg.snapshot.goal)}</p>` : ""}
          <p class="page-top__progress"><strong>${pr.passed} of ${pr.required}</strong> required activities passed</p>
          ${pr.next && !finished ? `<a class="btn btn--launch" href="#/activity/${pr.next.a.id}">${icon("arrowRight")}${pr.next.st.state === "tryagain" ? "Try again" : pr.next.st.state === "started" ? "Continue" : "Start"}: ${esc(pr.next.a.title)}</a>` : ""}
        </div>
      </section>
      <ol class="wrap plan-list">${pr.rows.map((r, i) => `
        <li class="block plan-item ${r.step.required ? "" : "plan-item--optional"}">
          <span class="pw-step__n" aria-hidden="true">${i + 1}</span>
          <div class="plan-item__main">
            <h2><span class="visually-hidden">${i + 1}. </span>${esc(r.a.title)}</h2>
            <p class="muted small">${esc(SE.areaById[r.a.area].short)} · ${SE.timeText(r.a)}${r.step.required ? "" : " · Optional"}</p>
            ${r.step.note ? `<p class="plan-item__note">${icon("message")}<span><strong>From your teacher:</strong> ${esc(r.step.note)}</span></p>` : ""}
            ${r.st.state === "tryagain" && r.st.tryAgain.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(r.st.tryAgain.data.note)}</span></p>` : ""}
          </div>
          <div class="plan-item__side">${SE.studentStatusChip(r.st)}
            <a class="btn ${r.st.state === "confirmed" || r.st.state === "submitted" ? "btn--ghost" : "btn--primary"} btn--small" href="#/activity/${r.a.id}">${verb(r.st.state)}<span class="visually-hidden">: ${esc(r.a.title)}</span></a></div>
        </li>`).join("")}</ol>`;
  };
  /* Status in words with a shape, so color is never the only signal (students). */
  SE.studentStatusChip = (st) => `<span class="pwk-state pwk-state--${{ confirmed: "accepted", tryagain: "revise", submitted: "sent", started: "sent", none: "none" }[st.state] || "none"}">${icon({ confirmed: "check", tryagain: "refresh", submitted: "clock", started: "list" }[st.state] || "list")}${esc(st.label)}</span>`;

  /* My Learning Plans (#/plans): Current (not finished) or All. Activities assigned one at a time
     (before Learning Plans) show as one "Earlier assignments" card until the teacher moves them. */
  let myMode = "current";
  SE.views.myPlans = function (user) {
    const prof = SE.game.profile(user.id);
    const all = studentPlans(user).slice().reverse();
    const list = myMode === "all" ? all : all.filter((a) => !SE.store.planFinished(a));
    const old = (user.classId ? SE.store.assignmentsFor(user.classId) : []).map((x) => SE.activityById[x.activityId]).filter((a) => a && !SE.hiddenForUser(a));
    const card = (asg) => {
      const pr = progress(prof, asg.snapshot), done = SE.store.planFinished(asg);
      return `
        <li class="block myplan ${done ? "myplan--done" : ""}">
          <div class="myplan__head"><h2 id="mp-${asg.id}">${esc(asg.snapshot.title)}</h2>${done ? `<span class="chip">Finished</span>` : ""}</div>
          ${asg.snapshot.goal ? `<p>${esc(asg.snapshot.goal)}</p>` : ""}
          <p class="myplan__progress"><strong>${pr.passed} of ${pr.required}</strong> required activities passed</p>
          <div class="mini-meter" aria-hidden="true"><span style="width:${pr.required ? (pr.passed / pr.required) * 100 : 0}%"></span></div>
          ${pr.next && !done ? `<p class="muted">Next: ${esc(pr.next.a.title)}</p>` : ""}
          <a class="btn ${done ? "btn--ghost" : "btn--primary"}" href="#/plans/${asg.id}" aria-describedby="mp-${asg.id}">${icon("arrowRight")}Open the plan</a>
        </li>`;
    };
    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink()}</div>
          <div class="page-top__head"><span class="icon-badge">${icon("map")}</span>
            <div><span class="eyebrow">From your teacher</span><h1 tabindex="-1">My Learning Plans</h1></div></div>
          <p class="page-top__lede">Each plan is a set of activities, in order. Your teacher checks each one.</p>
        </div>
      </section>
      <section class="wrap section">
        <div class="seg" role="group" aria-label="Show">
          <button type="button" class="seg__btn" data-mymode="current" aria-pressed="${myMode === "current"}">Current</button>
          <button type="button" class="seg__btn" data-mymode="all" aria-pressed="${myMode === "all"}">All (${all.length})</button>
        </div>
        ${list.length ? `<ul class="myplans">${list.map(card).join("")}</ul>` : `<div class="empty">${icon("map")}<h2>${myMode === "all" ? "No Learning Plans yet" : "No current Learning Plans"}</h2><p>When your teacher gives your class a Learning Plan, it shows up here.${all.length && myMode === "current" ? " Finished plans are under All." : ""}</p></div>`}
        ${old.length ? `
        <section class="block myplan myplan--old" aria-labelledby="mp-old">
          <h2 id="mp-old">Earlier assignments</h2>
          <ul class="today-list">${old.map((a) => `<li><a href="#/activity/${a.id}">${icon(SE.areaById[a.area].icon)}<span><strong>${esc(a.title)}</strong><small>${SE.timeText(a)}</small></span></a>${SE.studentStatusChip(SE.game.statusFor(prof, a))}</li>`).join("")}</ul>
        </section>` : ""}
      </section>`;
    app().querySelectorAll("[data-mymode]").forEach((b) => b.addEventListener("click", () => {
      myMode = b.dataset.mymode;
      SE.route(true);
      const again = document.querySelector(`[data-mymode="${myMode}"]`);
      if (again) again.focus();
    }));
  };
})();
