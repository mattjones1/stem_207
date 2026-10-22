/*
 * STEM 207 — Moxie, a physical computing pathway (data in assets/js/data/moxie.js).
 *
 *   #/moxie                 overview: promise, four units, final project, kit, partners
 *   #/moxie/teach           educators: preparation, sessions and assigning, partner teams,
 *                           capstone review (gates, rubric feedback), versions
 *   #/activity/moxie-NN     a session page (the activity view hands Moxie sessions to this file)
 *
 * Work is saved as moxie_* events. Partners share one copy of the capstone work
 * (SE.store.TEAM_TYPES); explanations, plans, and reflections stay individual.
 * Teachers record checks as moxie_gate { activityId, gate, ok } and feedback as
 * moxie_rubric { activityId, dimension, note }. Every student event carries the
 * session's content version (v), so later edits never change what work was done against.
 * Pure rules for tests: SE.moxie.visible, readyToPublish, designCheck, capstone, capstoneCheck.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const M = STEM.moxie;
  const { icon, esc, plural } = SE;
  const app = () => document.getElementById("app");

  const PUB = { draft: "Draft", review: "In curriculum review", hardware: "In hardware validation", pilot: "In pilot", published: "Published" };
  const STATUS = { none: "Not started", started: "In progress", submitted: "Ready for review", checked: "Ready for review", tryagain: "Try again", confirmed: "Verified" };
  const GATES = { wiring: "Wiring checked", design: "Design approved", plan: "Plan approved", pitch: "Pitch given" };
  const INPUTS = [["button", "Button"], ["knob", "Knob (potentiometer)"], ["light", "Light sensor"], ["temperature", "Temperature sensor"], ["distance", "Distance sensor"]];
  const OUTPUTS = [["led", "LED", "light"], ["rgb", "RGB LED", "light"], ["buzzer", "Buzzer", "sound"], ["oled", "OLED display", "display"], ["servo", "Servo", "motion"]];
  const BUGLOG = { subsystem: "Subsystem test", bug: "Bug and fix", change: "Change to the plan" };
  const MET = { yes: "Met", partly: "Partly met", no: "Not met yet" };
  const PLAN_PROMPT = {
    pseudocode: "Before you code, write your plan in plain steps, in order.",
    "truth-table": "Before you code, fill in what each light does for every button case."
  };

  const sessions = () => STEM.moxieSessions;
  const isEdu = (u) => !!u && u.role === "educator";
  const isStu = (u) => !!u && u.role === "student";
  const clean = (s) => /[a-z0-9]/i.test(String(s || ""));
  const num = (a) => `Session ${a.moxie.session}`;

  /* ───────── Rules (pure, for tests) ───────── */
  /* Who can open a session: published for everyone, every state for educators,
     and pilot sessions for students whose class has them assigned. */
  const visible = (a, user) => !a || !a.moxie || SE.content.visibleTo(a, user);
  const pathwayVisible = (user) => M.pub === "published" || isEdu(user) || sessions().some((s) => visible(s, user));

  /* What a session still needs before it can go to a pilot or be published. */
  function readyToPublish(a) {
    const out = [];
    if (!a.grades || !a.grades.length) out.push("grade range");
    if (!a.duration && !(a.time && a.time.core)) out.push("student time");
    if (!a.steps || !a.steps.length) out.push("steps");
    if (a.moxie.kind === "build") {
      if (!a.wiring) out.push("wiring table");
      if (!a.code) out.push("starter code");
      if (!a.tests) out.push("test checks");
    }
    if (a.diagram && !a.diagram.text) out.push("text version of the diagram");
    return out;
  }

  const outputType = (id) => (OUTPUTS.find((o) => o[0] === id) || [])[2];
  const outputName = (id) => (OUTPUTS.find((o) => o[0] === id) || [, id])[1];
  const inputName = (id) => (INPUTS.find((o) => o[0] === id) || [, id])[1];

  /* What a capstone design is missing, in the student's own terms. */
  function designCheck(d) {
    if (!d) return ["Fill in your design and save it."];
    const out = [];
    if (!clean(d.problem)) out.push("Write the problem your device solves.");
    if (!clean(d.user)) out.push("Write who your device helps.");
    const crit = (d.criteria || []).filter(clean);
    if (crit.length < 3) out.push(`You have ${crit.length} of 3 criteria. Write ${crit.length === 2 ? "one more" : `${3 - crit.length} more`} that you can measure.`);
    if (!(d.inputs || []).length) out.push("Pick at least one input.");
    const outs = d.outputs || [];
    const types = [...new Set(outs.map(outputType))];
    if (!outs.length) out.push("Pick at least two outputs of different types.");
    else if (types.length < 2) out.push(`Your output${outs.length === 1 ? "" : "s"} (${outs.map(outputName).join(", ")}) ${outs.length === 1 ? "is" : "are all"} one type: ${types[0]}. Add an output of a different type.`);
    if (!clean(d.pins)) out.push("List each part and the pin it uses.");
    if (!clean(d.pseudocode)) out.push("Write your plan in plain steps (pseudocode).");
    return out;
  }

  /* Events helpers. `evs` is one student's moxie_* events plus their teammates' shared work. */
  const latest = (evs, type, activityId) => evs.filter((e) => e.type === type && (!activityId || e.data.activityId === activityId)).pop() || null;
  function gateOpen(evs, activityId, gate) {
    const g = latest(evs.filter((e) => e.data.gate === gate), "moxie_gate", activityId);
    return !!(g && g.data.ok);
  }
  function work(studentId) {
    return SE.store.eventsFor(studentId).filter((e) => /^moxie_/.test(e.type))
      .concat(SE.store.teamEvents(studentId)).sort((x, y) => x.at - y.at);
  }

  /* One team's capstone record. */
  function capstone(evs) {
    const tests = {};
    evs.filter((e) => e.type === "moxie_test").forEach((e) => { tests[e.data.criterion] = e.data; });
    const data = (e) => (e ? e.data : null);
    return {
      design: data(latest(evs, "moxie_design")),
      designEvent: latest(evs, "moxie_design"),
      codecheck: data(latest(evs, "moxie_codecheck")),
      bugs: evs.filter((e) => e.type === "moxie_buglog"),
      tests,
      feedback: evs.filter((e) => e.type === "moxie_feedback_got"),
      improvements: evs.filter((e) => e.type === "moxie_improve"),
      card: data(latest(evs, "moxie_card")),
      designApproved: gateOpen(evs, "moxie-13", "design"),
      pitch: gateOpen(evs, "moxie-16", "pitch")
    };
  }

  /* Everything the brief's capstone requires that this record doesn't show yet. */
  function capstoneCheck(rec) {
    const out = designCheck(rec.design).map((m) => `Design: ${m}`);
    if (rec.design && !rec.designApproved) out.push("Your teacher hasn't approved your design yet.");
    const cc = rec.codecheck || {};
    const codeMissing = [["variable", "a variable"], ["ifelse", "an if/else"], ["comments", "comments"]].filter(([k]) => !cc[k]).map(([, t]) => t);
    if (codeMissing.length) out.push(`Code checklist: your code doesn't show ${codeMissing.join(", ")} yet.`);
    ((rec.design && rec.design.criteria) || []).filter(clean).forEach((c, i) => {
      if (!rec.tests[i] || !clean(rec.tests[i].result)) out.push(`Criterion ${i + 1} (“${c}”) has no test result yet.`);
    });
    if (!rec.feedback.length) out.push("Ask a classmate for feedback, and write down what they said.");
    if (!rec.improvements.length) out.push("Make at least one improvement, and write what you changed.");
    if (!rec.card || !clean(rec.card.title)) out.push("Fill in your showcase card.");
    if (!rec.pitch) out.push("Give your one-minute pitch with your partner. Your teacher marks it.");
    return out;
  }
  const capstoneComplete = (rec) => { const missing = capstoneCheck(rec); return { ok: !missing.length, missing }; };

  const versionNote = (e) => {
    const a = e && SE.activityById[e.data.activityId];
    return a && e.data.v && e.data.v !== a.version ? `<span class="mx-ver">Done on v${esc(e.data.v)}; current is v${esc(a.version)}</span>` : "";
  };
  const statusOf = (prof, a) => { const st = SE.game.statusFor(prof, a); return { state: st.state, label: STATUS[st.state] || st.label }; };

  /* Feed lines for the teacher timeline (views-teacher.js describe()). */
  function describe(e, who, title) {
    const D = {
      moxie_plan: ["list", `${who}saved a plan for ${title}`], moxie_observe: ["eye", `${who}wrote test notes for ${title}`],
      moxie_design: ["target", `${who}saved a capstone design`], moxie_codecheck: ["check", `${who}updated the capstone code checklist`],
      moxie_buglog: ["tools", `${who}added to the capstone build log`], moxie_test: ["flask", `${who}recorded a capstone test result`],
      moxie_feedback_got: ["message", `${who}recorded feedback on the capstone`], moxie_improve: ["refresh", `${who}recorded a capstone improvement`],
      moxie_card: ["flag", `${who}updated the showcase card`], moxie_reflect: ["question", `${who}wrote a Moxie reflection`],
      moxie_gate: ["shield", `Teacher marked “${esc(GATES[e.data.gate] || e.data.gate)}” as ${e.data.ok ? "done" : "not yet"} on ${title}`],
      moxie_rubric: ["clipboard", `Teacher left ${esc(e.data.dimension || "")} feedback on ${title}`]
    }[e.type];
    return D ? { icon: D[0], text: D[1] } : null;
  }

  SE.moxie = { visible, pathwayVisible, readyToPublish, designCheck, gateOpen, work, capstone, capstoneCheck, capstoneComplete, describe, GATES, PUB };

  /* ───────── Shared pieces ───────── */
  const pubBanner = (pub, what) => pub === "published" ? "" : `
    <p class="mx-banner">${icon("alert")}<span><strong>${esc(PUB[pub])}.</strong> ${pub === "pilot"
      ? `Students see ${what} only in classes you assign it to.`
      : `Students can't see ${what} yet, and it can't be assigned until it reaches the pilot stage.`}</span></p>`;
  const gateChip = (open, gate) => `<span class="mx-gate ${open ? "is-open" : ""}">${icon(open ? "check" : "clock")}${esc(GATES[gate])}: ${open ? "done" : "not yet"}</span>`;
  const inReview = (what) => `<p class="mx-review">${icon("clock")}<span>${esc(what)} ${what.endsWith("s") ? "are" : "is"} in review. Your teacher has the lesson sheet.</span></p>`;
  const field = (id, label, control, help) => `<div class="form__field"><label for="${id}">${label}</label>${control}${help ? `<p class="field-help">${help}</p>` : ""}</div>`;
  const area = (id, label, value, rows = 3, max = 600, help) => field(id, label, `<textarea id="${id}" name="${id}" rows="${rows}" maxlength="${max}">${esc(value || "")}</textarea>`, help);
  const line = (id, label, value, max = 160) => field(id, label, `<input id="${id}" name="${id}" class="input" maxlength="${max}" value="${esc(value || "")}">`);
  const status = (id) => `<p class="mx-status" id="${id}" role="status" aria-live="polite"></p>`;
  const who = (e, user) => (isStu(user) && e.studentId === user.id ? "You" : esc((SE.store.teammates(isStu(user) ? user.id : "").find((m) => m.id === e.studentId) || SE.store.studentById(e.studentId) || {}).displayName || "Partner"));

  function rerender(focusId, msg) {
    const y = window.scrollY;
    SE.route(true);
    window.scrollTo(0, y);
    const el = focusId && document.getElementById(focusId);
    if (el) { if (msg) el.textContent = msg; if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
    else if (msg) SE.toast(msg);
  }

  /* ───────── Overview: #/moxie ───────── */
  SE.views.moxie = function (user) {
    if (!pathwayVisible(user)) return SE.views.notFound();
    const prof = isStu(user) ? SE.game.profile(user.id) : null;
    const open = sessions().filter((s) => visible(s, user));
    const next = prof ? open.find((s) => statusOf(prof, s).state !== "confirmed") : null;
    const sessionRow = (id) => {
      const s = SE.activityById[id];
      const can = visible(s, user);
      const st = prof && can ? statusOf(prof, s) : null;
      return `
        <li class="mx-unit__session">
          <span class="mx-num" aria-hidden="true">${s.moxie.session}</span>
          <span><span class="visually-hidden">${num(s)}: </span>${can ? `<a href="#/activity/${s.id}">${esc(s.title)}</a>` : esc(s.title)}
            <small>${esc(s.moxie.focus)}</small></span>
          <span class="mx-unit__state">${isEdu(user) ? `<span class="chip ${s.pub === "published" ? "chip--ok" : "chip--soon"}">${esc(PUB[s.pub])}</span>` : st ? `<span class="chip ${st.state === "confirmed" ? "chip--done" : ""}">${esc(st.label)}</span>` : can ? "" : `<span class="muted small">Not open yet</span>`}</span>
        </li>`;
    };
    app().innerHTML = `
      <section class="page-top mx-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink("#/activities/engineering", "Engineering & Robotics")}</div>
          <div class="page-top__head"><span class="icon-badge">${icon("gear")}</span>
            <div><span class="eyebrow">A STEM 207 pathway · Engineering & Robotics</span><h1 tabindex="-1">${esc(M.name)}</h1></div></div>
          <p class="mx-tagline">${esc(M.tagline)}</p>
          <p class="page-top__lede">${esc(M.intro)}</p>
          ${next ? `<a class="btn btn--launch" href="#/activity/${next.id}">${icon(statusOf(prof, next).state === "none" ? "rocket" : "arrowRight")}${statusOf(prof, next).state === "none" ? "Start" : "Continue"}: ${esc(next.title)}</a>` : ""}
          ${isEdu(user) ? `<a class="btn btn--primary" href="#/moxie/teach">${icon("clipboard")}Teach Moxie: prep, teams, and review</a>` : ""}
        </div>
      </section>
      <div class="wrap section">
        ${isEdu(user) ? pubBanner(M.pub, "the Moxie pathway") : ""}
        <dl class="facts mx-facts">
          <div><dt>Sessions</dt><dd>16, in 4 units</dd></div>
          <div><dt>Grades</dt><dd>${esc(M.pending.grades.replace(/^Grade range: /, ""))}</dd></div>
          <div><dt>Time</dt><dd>${esc(M.pending.minutes.replace(/^Minutes per session: /, ""))}</dd></div>
          <div><dt>Works best</dt><dd>With a partner</dd></div>
        </dl>
      </div>
      <section class="wrap section" aria-labelledby="mx-units">
        <div class="section__head"><div><span class="eyebrow">The journey</span><h2 id="mx-units">Four units, one final project</h2></div>
          <p>Go in order the first time. Each unit adds what the next one needs.</p></div>
        <ol class="mx-units">${M.units.map((u) => `
          <li class="block mx-unit">
            <h3><span class="mx-unit__n">Unit ${u.n}</span> ${esc(u.title)}</h3>
            <p class="mx-unit__q">${esc(u.question)}</p>
            <ol class="mx-unit__sessions">${u.sessions.map(sessionRow).join("")}</ol>
            <p class="muted small"><strong>You're ready to move on when:</strong> ${esc(u.progress)}</p>
          </li>`).join("")}</ol>
      </section>
      <div class="wrap section mx-two">
        <section class="block" aria-labelledby="mx-final">
          <h2 id="mx-final">${icon("flag")}Your final project</h2>
          <p>With your partner, build a device that solves a real problem for someone. It must have:</p>
          <ul class="bullets">${M.capstone.requirements.map((r) => `<li><span>${esc(r)}</span></li>`).join("")}</ul>
        </section>
        <section class="block" aria-labelledby="mx-how">
          <h2 id="mx-how">${icon("users")}How partners work</h2>
          <p>${esc(M.partner.summary)}</p>
          <p>${esc(M.partner.individual)}</p>
          <h3>What you'll use</h3>
          <ul class="bullets">${M.kit.core.slice(0, 4).map((k) => `<li><span>${esc(k)}</span></li>`).join("")}</ul>
          <p class="muted small">Plus lights, buttons, a knob, a buzzer, a display, a distance sensor, and a servo. ${esc(M.kit.status)}</p>
        </section>
      </div>`;
  };

  /* ───────── Session page: #/activity/moxie-NN ───────── */
  SE.views.moxieSession = function (user, a) {
    if (!visible(a, user)) return SE.views.notFound();
    const stu = isStu(user), edu = isEdu(user);
    const prof = stu ? SE.game.profile(user.id) : null;
    const evs = stu ? work(user.id) : [];
    const k = a.moxie.kind;
    const u = M.units[a.moxie.unit - 1];
    const st = prof ? statusOf(prof, a) : null;
    const gates = a.moxie.gates.map((g) => ({ g, open: stu && gateOpen(evs, a.id, g) }));
    const capstoneKind = k !== "build";

    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink("#/moxie", "Moxie")}
            <nav class="crumbs" aria-label="Breadcrumb"><a href="#/moxie">Moxie</a> / Unit ${u.n}: ${esc(u.title)} / <span aria-current="page">${esc(a.title)}</span></nav></div>
          <div class="page-top__head"><span class="icon-badge">${icon("gear")}</span>
            <div><span class="eyebrow">Moxie · ${num(a)} of 16 · Unit ${u.n}</span><h1 tabindex="-1">${esc(a.title)}</h1></div></div>
          <p class="page-top__lede">${esc(a.moxie.focus)}.</p>
          <div class="page-top__tags">
            ${st ? `<span class="chip chip--done-dark">${esc(st.label)}</span>` : ""}
            ${stu && SE.store.assignmentFor(user.classId, a.id) ? `<span class="assigned-tag">${icon("clipboard")}Assigned by your teacher</span>` : ""}
          </div>
        </div>
      </section>
      <div class="wrap activity-layout">
        <div class="activity-main">
          ${edu ? pubBanner(a.pub, "this session") : ""}
          ${a.notice ? `<p class="mx-banner mx-banner--notice">${icon("alert")}<span><strong>Update:</strong> ${esc(a.notice)}</span></p>` : ""}
          <section class="block block--mission" aria-labelledby="s-mission">
            <h2 id="s-mission">${icon("target")}Your mission</h2>
            <p>${esc(a.mission)}</p>
          </section>
          <section class="block" aria-label="When you are done">
            <p class="stop-at">${icon("flag")}<span><strong>You're done when:</strong> ${esc(a.stopAt)}</span></p>
            ${gates.length ? (stu ? `<p class="mx-gates">${gates.map((x) => gateChip(x.open, x.g)).join("")}</p>` : `<p class="muted small">${icon("shield")}Teacher check in this session: ${esc(gates.map((x) => GATES[x.g]).join(", "))}. Mark it on the <a href="#/moxie/teach">Teach Moxie</a> page.</p>`) : ""}
          </section>
          ${capstoneKind && stu ? teamPanel(user) : ""}
          ${capstoneKind ? capstoneSections(user, a, evs) : buildSections(user, a, evs, prof)}
          <section class="block" aria-labelledby="s-explain">
            <h2 id="s-explain">${icon("question")}Explain it</h2>
            <p>${esc(a.check)}</p>
            <p class="muted">${stu ? "Explain it in your own words, even if your partner built the circuit. Write it below, or show your teacher." : "Each partner explains on their own. Confirm or ask them to try again from the student page."}</p>
          </section>
          ${stu ? SE.views.debrief(user, a, prof) : ""}
          <section class="block block--extend" aria-labelledby="s-stretch">
            <h2 id="s-stretch">${icon("rocket")}Stretch</h2>
            <p class="muted">Optional. You don't need it to finish the session.</p>
            ${a.stretch ? `<p>${esc(a.stretch)}</p>` : inReview("The stretch challenge")}
          </section>
          ${stu ? "" : `
          <details class="block teacher-notes" open>
            <summary><h2>${icon("clipboard")}Teacher notes</h2><span class="toggle-hint" aria-hidden="true"></span></summary>
            <div class="teacher-notes__body">
              <ul class="bullets">${a.teacherNotes.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
              <p><strong>Source:</strong> ${esc(a.moxie.sourceFile)} · content v${esc(a.version)}</p>
              ${readyToPublish(a).length ? `<p><strong>Still needed before a pilot:</strong> ${esc(readyToPublish(a).join(", "))}.</p>` : ""}
            </div>
          </details>`}
        </div>
        <aside class="aside" aria-label="Session at a glance">
          <div class="block launch-mini">
            <h2>At a glance</h2>
            <dl class="facts">
              <div><dt>Pathway</dt><dd><a href="#/moxie">Moxie</a>, ${num(a)} of 16</dd></div>
              <div><dt>Unit</dt><dd>${u.n}: ${esc(u.title)}</dd></div>
              <div><dt>Grades</dt><dd>${a.grades.length ? SE.gradesText(a.grades) : "Pending validation"}</dd></div>
              <div><dt>Time</dt><dd>${a.duration || a.time ? SE.timeText(a) : "Pending a pilot"}</dd></div>
              <div><dt>Format</dt><dd>With a partner</dd></div>
            </dl>
          </div>
          ${edu ? sessionClassBox(user, a) : ""}
          <div class="block"><h2>What you need</h2><ul class="bullets">${a.before.materials.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
            <p class="muted small"><strong>Before this:</strong> ${esc(a.before.prerequisites)}</p></div>
        </aside>
      </div>`;

    if (stu) {
      SE.logOpen(user, a.id);
      SE.views.bindDebrief(user, a);
      bindStudent(user, a);
    }
  };

  /* The 8 sections of a build session (3–6 here; mission, explain, and stretch are shared). */
  function buildSections(user, a, evs, prof) {
    const stu = isStu(user);
    const wiringGate = a.moxie.gates.includes("wiring");
    const plan = stu ? latest(evs, "moxie_plan", a.id) : null;
    const obs = stu ? latest(evs, "moxie_observe", a.id) : null;
    const checked = prof ? (prof.steps[a.id] || new Set()) : new Set();
    return `
      <section class="block" aria-labelledby="s-before">
        <h2 id="s-before">${icon("shield")}Before you wire</h2>
        <ul class="bullets">${a.before.setup.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}
          <li><span>Unplug the board before you change any wires.</span></li></ul>
        ${wiringGate ? `<p class="mx-stop">${icon("alert")}<span><strong>Stop and check:</strong> your teacher checks your wiring before you power this circuit.${stu ? ` ${gateOpen(evs, a.id, "wiring") ? "Your wiring is checked. You can power it on." : "Not checked yet. Raise your hand when your circuit is built."}` : ""}</span></p>` : ""}
      </section>
      <section class="block" aria-labelledby="s-build">
        <h2 id="s-build">${icon("tools")}Build it</h2>
        ${a.diagram ? `<figure class="mx-diagram"><img src="${esc(a.diagram.src)}" alt="${esc(a.diagram.alt)}"><figcaption>${esc(a.diagram.alt)}</figcaption>
          <details><summary>Read the diagram as text</summary><p>${esc(a.diagram.text)}</p></details></figure>` : ""}
        ${a.wiring ? `<div class="table-wrap"><table class="roster mx-wiring"><caption class="visually-hidden">Wiring for ${esc(a.title)}</caption>
          <thead><tr><th scope="col">Part</th><th scope="col">Connects to</th><th scope="col">Notes</th></tr></thead>
          <tbody>${a.wiring.map(([part, pin, note]) => `<tr><th scope="row">${esc(part)}</th><td>${esc(pin)}</td><td>${esc(note || "")}</td></tr>`).join("")}</tbody></table></div>
          <p class="muted small">Wire colors don't matter. Follow the pin names in the table.</p>` : inReview("The wiring table and diagram")}
        ${a.steps.length ? `<ol class="steps ${stu ? "steps--check" : ""}">${a.steps.map((x, i) => stu ? `
          <li><label class="step-check"><input type="checkbox" data-step="${i}" ${checked.has(i) ? "checked" : ""}>
            <span class="step-check__box" aria-hidden="true">${icon("check")}</span><span class="step-check__num" aria-hidden="true">${i + 1}</span>
            <span class="step-check__text"><span class="visually-hidden">Step ${i + 1}: </span>${esc(x)}</span></label></li>` : `<li><span>${esc(x)}</span></li>`).join("")}</ol>` : ""}
      </section>
      ${a.moxie.plan ? `
      <section class="block" aria-labelledby="s-plan">
        <h2 id="s-plan">${icon("list")}Plan it</h2>
        <p>${esc(PLAN_PROMPT[a.moxie.plan])}</p>
        ${a.moxie.gates.includes("plan") ? `${stu ? `<p class="mx-gates">${gateChip(gateOpen(evs, a.id, "plan"), "plan")}</p>` : ""}<p class="muted small">Show your teacher your plan before you code.</p>` : ""}
        ${stu ? `<form data-mx="plan" novalidate>${area("mx-plan", "Your plan", plan && plan.data.text, 6, 1500)}
          <button type="submit" class="btn btn--primary">${icon("check")}Save my plan</button>${status("mx-plan-status")}</form>`
          : `<p class="muted">Each student writes and saves their own plan here.</p>`}
      </section>` : ""}
      <section class="block" aria-labelledby="s-code">
        <h2 id="s-code">${icon("code")}Code it</h2>
        ${a.code ? `<p>Type the code in the Arduino IDE and fill in each blank (<code>____</code>). You can copy it from here.</p>
          <pre class="mx-code" tabindex="0" aria-label="Starter code for ${esc(a.title)}"><code>${a.code.lines.map(esc).join("\n")}</code></pre>
          ${a.code.file ? `<a class="btn btn--ghost btn--small" href="${esc(a.code.file)}" download>${icon("arrowRight")}Download the starter sketch</a>` : ""}` : inReview("The starter code")}
      </section>
      <section class="block" aria-labelledby="s-test">
        <h2 id="s-test">${icon("flask")}Test it</h2>
        ${a.tests ? `<ul class="bullets">${a.tests.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>` : inReview("The test checks")}
        ${stu ? `<form data-mx="observe" novalidate>${area("mx-observe", "What happened when you tested it?", obs && obs.data.text, 4, 800, "Write what you saw, and anything you changed.")}
          <button type="submit" class="btn btn--primary">${icon("check")}Save my notes</button>${status("mx-observe-status")}</form>` : ""}
      </section>`;
  }

  /* Capstone sessions: a design worksheet (13), a build log (14), tests and improvement (15), showcase (16). */
  function capstoneSections(user, a, evs) {
    const stu = isStu(user);
    const rec = capstone(evs);
    const d = rec.design || {};
    const lock = stu ? "" : " disabled";
    const preview = stu ? "" : `<p class="mx-preview">${icon("eye")}<span><strong>Student view preview.</strong> Students fill this in. Partners share one copy.</span></p>`;
    const designSummary = rec.design ? `
      <dl class="mx-design">
        <div><dt>Problem</dt><dd>${esc(d.problem)}</dd></div><div><dt>Who it helps</dt><dd>${esc(d.user)}</dd></div>
        <div><dt>Criteria</dt><dd><ol>${(d.criteria || []).filter(clean).map((c) => `<li>${esc(c)}</li>`).join("")}</ol></dd></div>
        <div><dt>Inputs</dt><dd>${esc((d.inputs || []).map(inputName).join(", ") || "None yet")}</dd></div>
        <div><dt>Outputs</dt><dd>${esc((d.outputs || []).map(outputName).join(", ") || "None yet")}</dd></div>
      </dl>` : `<p>No design saved yet. Start in <a href="#/activity/moxie-13">Session 13: Define & Design</a>.</p>`;
    const missing = (list, okText) => list.length
      ? `<ul class="mx-missing">${list.map((m) => `<li>${icon("alert")}<span>${esc(m)}</span></li>`).join("")}</ul>`
      : `<p class="mx-done">${icon("check")}<span>${esc(okText)}</span></p>`;

    if (a.moxie.kind === "design") {
      const dc = rec.design ? designCheck(rec.design) : [];
      return `
      <section class="block" aria-labelledby="s-design">
        <h2 id="s-design">${icon("target")}Design your device</h2>
        ${preview}
        <p>Pick a real problem for someone at home, at school, or at the Coliseum. Use only parts from your kit.</p>
        <form data-mx="design" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Capstone design</legend>
          ${area("mx-problem", "What problem does your device solve?", d.problem, 3, 400)}
          ${line("mx-user", "Who does it help?", d.user)}
          <fieldset class="mx-group"><legend>Three things you can measure to show it works</legend>
            ${[0, 1, 2].map((i) => line(`mx-crit-${i}`, `Criterion ${i + 1}`, (d.criteria || [])[i])).join("")}
            <p class="field-help">Measurable means you can test it. Example: “The light turns on within 1 second.”</p></fieldset>
          <fieldset class="mx-group"><legend>Inputs (at least one)</legend><div class="mx-checks">
            ${INPUTS.map(([id, name]) => `<label class="mx-check"><input type="checkbox" name="mx-in" value="${id}" ${(d.inputs || []).includes(id) ? "checked" : ""}><span>${esc(name)}</span></label>`).join("")}</div></fieldset>
          <fieldset class="mx-group"><legend>Outputs (at least two different types)</legend><div class="mx-checks">
            ${OUTPUTS.map(([id, name, type]) => `<label class="mx-check"><input type="checkbox" name="mx-out" value="${id}" ${(d.outputs || []).includes(id) ? "checked" : ""}><span>${esc(name)} <small>(${esc(type)})</small></span></label>`).join("")}</div></fieldset>
          ${area("mx-pins", "Parts and pins", d.pins, 3, 600, "One line per part, like: Buzzer → pin 18.")}
          ${area("mx-pseudo", "Your plan in plain steps (pseudocode)", d.pseudocode, 6, 1500)}
          <button type="submit" class="btn btn--primary">${icon("check")}Save our design</button>${status("mx-design-status")}
        </fieldset></form>
        ${rec.design ? `<h3>Design check</h3>${missing(dc, "Your design has everything the project needs. Ask your teacher to approve it.")}
          <p class="mx-gates">${gateChip(rec.designApproved, "design")}</p>${versionNote(rec.designEvent)}` : ""}
      </section>`;
    }

    if (a.moxie.kind === "buildlog") {
      const cc = rec.codecheck || {};
      return `
      <section class="block" aria-labelledby="s-plan">
        <h2 id="s-plan">${icon("target")}Your approved design</h2>
        ${designSummary}
        ${stu ? `<p class="mx-gates">${gateChip(rec.designApproved, "design")}</p>` : ""}
        ${rec.design && !rec.designApproved ? `<p class="mx-stop">${icon("alert")}<span>Ask your teacher to approve your design before you build.</span></p>` : ""}
      </section>
      <section class="block" aria-labelledby="s-log">
        <h2 id="s-log">${icon("tools")}Build log</h2>
        ${preview}
        <p>Build one part at a time and test it before you add the next. Write down every test, bug, and change.</p>
        <form data-mx="buglog" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">New build log entry</legend>
          ${field("mx-log-kind", "What kind of entry?", `<select id="mx-log-kind" class="input">${Object.entries(BUGLOG).map(([id, t]) => `<option value="${id}">${esc(t)}</option>`).join("")}</select>`)}
          ${area("mx-log-what", "What did you test, find, or change?", "", 3, 400)}
          ${area("mx-log-result", "What happened, or how did you fix it?", "", 3, 400)}
          <button type="submit" class="btn btn--primary">${icon("plus")}Add to the log</button>${status("mx-log-status")}
        </fieldset></form>
        ${rec.bugs.length ? `<h3>Your team's log (${rec.bugs.length})</h3><ol class="mx-log">${rec.bugs.map((e) => `
          <li><strong>${esc(BUGLOG[e.data.kind] || "Entry")}</strong> · <span class="muted small">${who(e, user)}, ${SE.dateShort(e.at)}</span>
            <p>${esc(e.data.what)}</p>${clean(e.data.result) ? `<p class="muted">${esc(e.data.result)}</p>` : ""}</li>`).join("")}</ol>` : ""}
      </section>
      <section class="block" aria-labelledby="s-codecheck">
        <h2 id="s-codecheck">${icon("code")}Code checklist</h2>
        <form data-mx="codecheck" novalidate><fieldset class="mx-fieldset"${lock}><legend>Our code has:</legend><div class="mx-checks">
          ${[["variable", "A variable"], ["ifelse", "An if/else"], ["comments", "Comments that explain it"]].map(([id, t]) => `<label class="mx-check"><input type="checkbox" name="mx-cc" value="${id}" ${cc[id] ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div>
          <button type="submit" class="btn btn--primary">${icon("check")}Save the checklist</button>${status("mx-cc-status")}
        </fieldset></form>
      </section>`;
    }

    if (a.moxie.kind === "testimprove") {
      const crit = (d.criteria || []).filter(clean);
      const card = rec.card || {};
      return `
      <section class="block" aria-labelledby="s-tests">
        <h2 id="s-tests">${icon("flask")}Test against your criteria</h2>
        ${preview}
        ${crit.length ? `<form data-mx="tests" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Test results</legend>
          ${crit.map((c, i) => `<fieldset class="mx-group"><legend>Criterion ${i + 1}: ${esc(c)}</legend>
            ${area(`mx-test-${i}`, "What did you measure?", (rec.tests[i] || {}).result, 2, 300)}
            ${field(`mx-met-${i}`, "Result", `<select id="mx-met-${i}" class="input">${Object.entries(MET).map(([id, t]) => `<option value="${id}" ${(rec.tests[i] || {}).met === id ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`)}</fieldset>`).join("")}
          <button type="submit" class="btn btn--primary">${icon("check")}Save test results</button>${status("mx-tests-status")}
        </fieldset></form>` : designSummary}
      </section>
      <section class="block" aria-labelledby="s-feedback">
        <h2 id="s-feedback">${icon("message")}Feedback and one improvement</h2>
        <form data-mx="feedback" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Feedback from a classmate</legend>
          ${area("mx-fb", "What feedback did a classmate give you?", "", 2, 300)}
          <button type="submit" class="btn btn--primary">${icon("plus")}Save feedback</button>${status("mx-fb-status")}
        </fieldset></form>
        ${rec.feedback.length ? `<ul class="bullets">${rec.feedback.map((e) => `<li><span>${esc(e.data.text)} <span class="muted small">(${who(e, user)})</span></span></li>`).join("")}</ul>` : ""}
        <form data-mx="improve" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">An improvement</legend>
          ${area("mx-imp", "What did you change?", "", 2, 300)}
          ${area("mx-imp-why", "Why? What did the test or feedback show?", "", 2, 300)}
          <button type="submit" class="btn btn--primary">${icon("plus")}Save improvement</button>${status("mx-imp-status")}
        </fieldset></form>
        ${rec.improvements.length ? `<ul class="bullets">${rec.improvements.map((e) => `<li><span><strong>${esc(e.data.change)}</strong> ${esc(e.data.why || "")} <span class="muted small">(${who(e, user)})</span></span></li>`).join("")}</ul>` : ""}
      </section>
      <section class="block" aria-labelledby="s-card">
        <h2 id="s-card">${icon("flag")}Showcase card and pitch plan</h2>
        <form data-mx="card" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Showcase card</legend>
          ${line("mx-card-title", "Device name", card.title, 60)}
          ${area("mx-card-helps", "Who it helps, and how", card.helps, 2, 300)}
          ${area("mx-card-how", "How it works", card.how, 2, 300)}
          ${area("mx-card-pitch", "Pitch plan: who says what in your one minute?", card.pitch, 3, 500)}
          <button type="submit" class="btn btn--primary">${icon("check")}Save the card</button>${status("mx-card-status")}
        </fieldset></form>
      </section>`;
    }

    // showcase
    const reflect = stu ? latest(evs, "moxie_reflect", a.id) : null;
    const ratings = (reflect && reflect.data.ratings) || {};
    return `
      <section class="block" aria-labelledby="s-check">
        <h2 id="s-check">${icon("list")}Final project checklist</h2>
        ${stu ? missing(capstoneCheck(rec), "Your project meets every requirement. Get ready to show it!") : `<ul class="bullets">${M.capstone.requirements.map((r) => `<li><span>${esc(r)}</span></li>`).join("")}</ul>`}
        ${stu ? `<p class="mx-gates">${gateChip(rec.pitch, "pitch")}</p>` : ""}
        <p class="muted small">${esc(M.capstone.schedule)}</p>
      </section>
      <section class="block" aria-labelledby="s-reflect">
        <h2 id="s-reflect">${icon("question")}My reflection</h2>
        ${preview}
        <p>This part is just yours, not your team's.</p>
        <form data-mx="reflect" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Reflection and self-rating</legend>
          ${area("mx-refl", "What did you learn? What would you do differently?", reflect && reflect.data.text, 4, 800)}
          <fieldset class="mx-group"><legend>Rate yourself on each part (3 means “meets”)</legend>
            ${M.rubric.map((dim, i) => `<div class="mx-rate" role="radiogroup" aria-labelledby="mx-rate-${i}"><span id="mx-rate-${i}">${esc(dim)}</span>
              ${[1, 2, 3, 4].map((n) => `<label class="mx-rate__opt"><input type="radio" name="mx-rate-${i}" value="${n}" ${ratings[dim] === n ? "checked" : ""}><span>${n}${n === 3 ? " (meets)" : ""}</span></label>`).join("")}</div>`).join("")}
          </fieldset>
          <button type="submit" class="btn btn--primary">${icon("check")}Save my reflection</button>${status("mx-refl-status")}
        </fieldset></form>
      </section>`;
  }

  function teamPanel(user) {
    const mates = SE.store.teammates(user.id);
    return `
      <p class="mx-team">${icon("users")}<span>${mates.length
        ? `<strong>Your team:</strong> you and ${esc(mates.map((m) => m.displayName).join(" and "))}. You share one design, build log, and test results.`
        : "Your teacher hasn't put you on a team yet. You can still start; your partner sees shared work once you're on a team."}</span>
        ${SE.store.mode === "cloud" && mates.length ? `<button type="button" class="btn btn--ghost btn--small" id="mx-refresh">${icon("refresh")}See my partner's latest</button>` : ""}</p>`;
  }

  /* ───────── Student saves ───────── */
  const val = (f, id) => (f.querySelector(`#${id}`) || {}).value || "";
  const SAVE = {
    plan: (f) => clean(val(f, "mx-plan")) ? ["moxie_plan", { text: val(f, "mx-plan").trim().slice(0, 1500) }, "mx-plan-status", "Plan saved."] : "Write your plan first.",
    observe: (f) => clean(val(f, "mx-observe")) ? ["moxie_observe", { text: val(f, "mx-observe").trim().slice(0, 800) }, "mx-observe-status", "Notes saved."] : "Write what happened first.",
    design: (f) => ["moxie_design", {
      problem: val(f, "mx-problem").trim().slice(0, 400), user: val(f, "mx-user").trim().slice(0, 160),
      criteria: [0, 1, 2].map((i) => val(f, `mx-crit-${i}`).trim().slice(0, 160)),
      inputs: [...f.querySelectorAll("input[name=mx-in]:checked")].map((x) => x.value),
      outputs: [...f.querySelectorAll("input[name=mx-out]:checked")].map((x) => x.value),
      pins: val(f, "mx-pins").trim().slice(0, 600), pseudocode: val(f, "mx-pseudo").trim().slice(0, 1500)
    }, "mx-design-status", "Design saved. Check the list below."],
    buglog: (f) => clean(val(f, "mx-log-what")) ? ["moxie_buglog", { kind: val(f, "mx-log-kind"), what: val(f, "mx-log-what").trim().slice(0, 400), result: val(f, "mx-log-result").trim().slice(0, 400) }, "mx-log-status", "Added to the log."] : "Write what you tested, found, or changed.",
    codecheck: (f) => ["moxie_codecheck", Object.fromEntries(["variable", "ifelse", "comments"].map((k) => [k, !!f.querySelector(`input[name=mx-cc][value=${k}]:checked`)])), "mx-cc-status", "Checklist saved."],
    feedback: (f) => clean(val(f, "mx-fb")) ? ["moxie_feedback_got", { text: val(f, "mx-fb").trim().slice(0, 300) }, "mx-fb-status", "Feedback saved."] : "Write the feedback first.",
    improve: (f) => clean(val(f, "mx-imp")) ? ["moxie_improve", { change: val(f, "mx-imp").trim().slice(0, 300), why: val(f, "mx-imp-why").trim().slice(0, 300) }, "mx-imp-status", "Improvement saved."] : "Write what you changed.",
    card: (f) => clean(val(f, "mx-card-title")) ? ["moxie_card", { title: val(f, "mx-card-title").trim().slice(0, 60), helps: val(f, "mx-card-helps").trim().slice(0, 300), how: val(f, "mx-card-how").trim().slice(0, 300), pitch: val(f, "mx-card-pitch").trim().slice(0, 500) }, "mx-card-status", "Showcase card saved."] : "Give your device a name first.",
    reflect: (f) => clean(val(f, "mx-refl")) ? ["moxie_reflect", { text: val(f, "mx-refl").trim().slice(0, 800), ratings: Object.fromEntries(M.rubric.map((dim, i) => [dim, Number((f.querySelector(`input[name=mx-rate-${i}]:checked`) || {}).value) || null]).filter(([, n]) => n)) }, "mx-refl-status", "Reflection saved."] : "Write your reflection first."
  };

  function bindStudent(user, a) {
    app().querySelectorAll("form[data-mx]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (f.dataset.mx === "tests") {
        const crit = ((capstone(work(user.id)).design || {}).criteria || []).filter(clean);
        let n = 0;
        crit.forEach((c, i) => {
          const result = val(f, `mx-test-${i}`).trim().slice(0, 300);
          if (!clean(result)) return;
          SE.store.log("moxie_test", { activityId: a.id, v: a.version, criterion: i, text: c, result, met: val(f, `mx-met-${i}`) });
          n++;
        });
        if (!n) { f.querySelector(".mx-status").textContent = "Write what you measured for at least one criterion."; return; }
        return rerender("mx-tests-status", `${plural(n, "test result", "test results")} saved.`);
      }
      const r = SAVE[f.dataset.mx](f);
      if (typeof r === "string") { f.querySelector(".mx-status").textContent = r; return; }
      const [type, data, statusId, msg] = r;
      SE.store.log(type, { activityId: a.id, v: a.version, ...data });
      rerender(statusId, msg);
    }));
    app().querySelectorAll("[data-step]").forEach((cb) => cb.addEventListener("change", () => {
      SE.store.log("step_checked", { activityId: a.id, step: Number(cb.dataset.step), checked: cb.checked });
    }));
    const refresh = document.getElementById("mx-refresh");
    if (refresh) refresh.addEventListener("click", async () => { refresh.disabled = true; await SE.store.refreshTeam(); rerender("mx-refresh", ""); SE.toast("Up to date with your partner's work"); });
  }

  /* Assign box on a session page (educators). Draft sessions can't be assigned. */
  function sessionClassBox(user, a) {
    const { cls } = SE.teachClass(user);
    if (!cls) return "";
    return `
      <div class="block">
        <h2>In ${esc(cls.name)}</h2>
        ${SE.store.assignable(a)
          ? SE.planPicker(user, a)
          : `<p class="muted small">${esc(PUB[a.pub])}: can't be assigned until it reaches the pilot stage.</p>`}
        <p><a href="#/moxie/teach">Teams and capstone review</a></p>
      </div>`;
  }

  /* ───────── Educators: #/moxie/teach ───────── */
  let reviewOpen = null; // the team (or student) whose capstone is open for review

  SE.views.moxieTeach = function (user) {
    const { classes, cls } = SE.teachClass(user);
    const students = cls ? SE.store.studentsIn(cls.id) : [];
    const teams = cls ? SE.store.teamsFor(cls.id) : [];
    const inTeam = new Set(teams.flatMap((t) => t.studentIds));
    const name = (id) => esc((SE.store.studentById(id) || {}).displayName || "Removed student");
    const counts = sessions().reduce((m, s) => ((m[s.pub] = (m[s.pub] || 0) + 1), m), {});
    // Review groups: each team, then each student with Moxie work who isn't on a team.
    const groups = teams.map((t) => ({ key: t.id, ids: t.studentIds, label: t.studentIds.map(name).join(" & ") }))
      .concat(students.filter((s) => !inTeam.has(s.id) && SE.store.eventsFor(s.id).some((e) => /^moxie_/.test(e.type))).map((s) => ({ key: s.id, ids: [s.id], label: esc(s.displayName) })));

    app().innerHTML = `
      <section class="page-top page-top--teach">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink("#/moxie", "Moxie overview")}</div>
          <div class="page-top__head"><span class="icon-badge">${icon("clipboard")}</span>
            <div><span class="eyebrow">Moxie · For educators</span><h1 tabindex="-1">Teach Moxie</h1></div></div>
          <p class="page-top__lede">Prepare the kit, pair students, and review the capstone. Sessions: ${Object.entries(counts).map(([p, n]) => `${n} ${esc(PUB[p].toLowerCase())}`).join(", ")}.</p>
        </div>
      </section>
      <div class="wrap section">${pubBanner(M.pub, "the Moxie pathway")}</div>

      <section class="wrap section" aria-labelledby="mx-prep">
        <div class="section__head"><div><span class="eyebrow">Before you teach</span><h2 id="mx-prep">Preparation</h2></div></div>
        <div class="mx-two">
          <div class="block">
            <h3>Still to decide</h3>
            <ul class="bullets">${Object.values(M.pending).map((p) => `<li><span>${esc(p)}</span></li>`).join("")}</ul>
            <p class="muted small">The full validation list is in <code>planning/MOXIE_VALIDATION.md</code>. Nothing on it is tested until it's signed off there.</p>
            <h3>Teacher kit</h3>
            <p>Answer sketches, solutions, and the lesson sheets are in the private Moxie teacher kit, not on this site.</p>
          </div>
          <div class="block">
            <h3>Kit checklist (per pair)</h3>
            <ul class="bullets">${M.kit.core.map((k) => `<li><span>${esc(k)}</span></li>`).join("")}</ul>
            <p><strong>Optional:</strong> ${esc(M.kit.optional.join("; "))}.</p>
            <p class="muted small">${esc(M.kit.status)}</p>
          </div>
        </div>
      </section>

      <section class="wrap section" aria-labelledby="mx-sessions">
        <div class="section__head"><div><span class="eyebrow">16 sessions</span><h2 id="mx-sessions">Sessions and evidence</h2></div>
          ${classes.length > 1 && cls ? `<p class="muted">Assigning to ${esc(cls.name)}. Switch classes on the educator dashboard.</p>` : ""}</div>
        <div class="table-wrap"><table class="roster mx-table">
          <caption class="visually-hidden">Moxie sessions, their state, and the evidence to look for</caption>
          <thead><tr><th scope="col">Session</th><th scope="col">State</th><th scope="col">Evidence to look for</th><th scope="col">Teacher checks</th>${cls ? `<th scope="col">${esc(cls.name)}</th>` : ""}</tr></thead>
          <tbody>${sessions().map((s) => {
            return `<tr><th scope="row"><a href="#/activity/${s.id}">${s.moxie.session}. ${esc(s.title)}</a><small>Unit ${s.moxie.unit} · v${esc(s.version)}</small></th>
              <td>${esc(PUB[s.pub])}</td><td class="mx-wrap">${esc(s.stopAt)}</td>
              <td>${s.moxie.gates.map((g) => esc(GATES[g])).join(", ") || "—"}</td>
              ${cls ? `<td>${SE.store.assignable(s) ? `<a class="btn btn--ghost btn--small" href="#/activity/${s.id}">${icon("plus")}Add to a Learning Plan<span class="visually-hidden">: ${esc(s.title)}</span></a>` : `<span class="muted small">Not yet assignable</span>`}</td>` : ""}</tr>`;
          }).join("")}</tbody></table></div>
        <p class="muted small">Rubric dimensions: ${esc(M.rubric.join(", "))}. The source rubric only describes “Meets” (3 of 4), so give written feedback per dimension. There are no scores until the other levels are written.</p>
      </section>

      ${cls ? `
      <section class="wrap section" aria-labelledby="mx-teams">
        <div class="section__head"><div><span class="eyebrow">${esc(cls.name)}</span><h2 id="mx-teams">Partner teams</h2></div>
          <p>Partners share one capstone record. Each student still explains and reflects on their own.</p></div>
        <div class="mx-two">
          <div class="block">
            <h3>Teams</h3>
            ${teams.length ? `<ul class="mx-teams">${teams.map((t) => `<li><span>${t.studentIds.map(name).join(" & ")}</span>
              <button type="button" class="btn btn--ghost btn--small" data-team-del="${t.id}">${icon("users")}Split up<span class="visually-hidden"> ${t.studentIds.map(name).join(" and ")}</span></button></li>`).join("")}</ul>` : `<p class="muted">No teams yet.</p>`}
          </div>
          <form class="block" id="mx-team-form" novalidate>
            <h3>Make a team</h3>
            ${[0, 1, 2].map((i) => field(`mx-tm-${i}`, i < 2 ? `Partner ${i + 1}` : "Third partner (optional)", `<select id="mx-tm-${i}" class="input"><option value="">${i < 2 ? "Choose a student" : "None"}</option>${students.map((s) => `<option value="${s.id}">${esc(s.displayName)}${inTeam.has(s.id) ? " (on a team)" : ""}</option>`).join("")}</select>`)).join("")}
            <p class="field-help">A student already on a team moves to the new one.</p>
            <button type="submit" class="btn btn--primary">${icon("users")}Make team</button>
            <p class="form__error" id="mx-team-err" role="alert"></p>
          </form>
        </div>
      </section>

      <section class="wrap section" aria-labelledby="mx-review">
        <div class="section__head"><div><span class="eyebrow">Gates, capstone, and feedback</span><h2 id="mx-review">Review</h2></div></div>
        ${groups.length ? groups.map((g) => reviewCard(g)).join("") : `<p class="muted">No Moxie work in this class yet.</p>`}
      </section>` : `<p class="wrap muted">Create a class on the educator dashboard to pair students and review work.</p>`}`;
    bindTeach(user, cls);
  };

  function reviewCard(g) {
    const evs = work(g.ids[0]);
    const rec = capstone(evs);
    const d = rec.design;
    const open = reviewOpen === g.key;
    const gateBtn = (activityId, gate, ids, isOpen) => `<button type="button" class="btn btn--small ${isOpen ? "btn--assigned" : "btn--ghost"}" data-gate="${activityId}|${gate}|${isOpen ? 0 : 1}" data-students="${ids.join(",")}" aria-pressed="${isOpen}">${icon(isOpen ? "check" : "shield")}${esc(GATES[gate])}${isOpen ? "" : "?"}<span class="visually-hidden"> for ${g.label.replace(/<[^>]*>/g, "")}</span></button>`;
    const perStudent = g.ids.map((id) => {
      const own = work(id);
      const s = SE.store.studentById(id) || { displayName: "Removed student" };
      const refl = latest(own, "moxie_reflect");
      const notes = own.filter((e) => e.type === "moxie_rubric");
      const plans = own.filter((e) => e.type === "moxie_plan");
      return `
        <div class="mx-student">
          <h4>${esc(s.displayName)} <a class="small" href="#/teach/student/${id}">Student page</a></h4>
          <p class="mx-gates">${gateBtn("moxie-11", "wiring", [id], gateOpen(own, "moxie-11", "wiring"))}${gateBtn("moxie-08", "plan", [id], gateOpen(own, "moxie-08", "plan"))}</p>
          ${plans.length ? `<details><summary>Plans (${plans.length})</summary><ul class="bullets">${plans.map((e) => `<li><span><strong>${esc((SE.activityById[e.data.activityId] || {}).title || "")}:</strong> ${esc(e.data.text)} ${versionNote(e)}</span></li>`).join("")}</ul></details>` : ""}
          ${refl ? `<p><strong>Reflection:</strong> ${esc(refl.data.text)} ${versionNote(refl)}</p>
            <p class="small">Self-rating: ${Object.entries(refl.data.ratings || {}).map(([k, n]) => `${esc(k)} ${n}`).join(" · ") || "none"}</p>` : `<p class="muted small">No reflection yet.</p>`}
          ${notes.length ? `<ul class="bullets small">${notes.map((e) => `<li><span><strong>${esc(e.data.dimension)}:</strong> ${esc(e.data.note)}</span></li>`).join("")}</ul>` : ""}
          <form class="mx-rubric" data-rubric="${id}" novalidate>
            ${field(`mx-rd-${id}`, "Dimension", `<select id="mx-rd-${id}" class="input input--small">${M.rubric.map((r) => `<option>${esc(r)}</option>`).join("")}</select>`)}
            ${field(`mx-rn-${id}`, "Feedback", `<input id="mx-rn-${id}" class="input" maxlength="300">`)}
            <button type="submit" class="btn btn--ghost btn--small">${icon("message")}Add feedback</button>
          </form>
        </div>`;
    }).join("");
    return `
      <details class="block mx-review" data-review="${g.key}" ${open ? "open" : ""}>
        <summary><strong>${g.label}</strong> <span class="muted small">${d ? `“${esc(d.problem.slice(0, 60))}”` : "No design yet"} · ${capstoneCheck(rec).length ? `${capstoneCheck(rec).length} to go` : "complete"}</span></summary>
        <div class="mx-review__body">
          ${d ? `<dl class="mx-design">
            <div><dt>Problem</dt><dd>${esc(d.problem)}</dd></div><div><dt>Who it helps</dt><dd>${esc(d.user)}</dd></div>
            <div><dt>Criteria</dt><dd><ol>${d.criteria.filter(clean).map((c, i) => `<li>${esc(c)}${rec.tests[i] ? ` <span class="muted">→ ${esc(MET[rec.tests[i].met] || "")}: ${esc(rec.tests[i].result)}</span>` : ""}</li>`).join("")}</ol></dd></div>
            <div><dt>Inputs / outputs</dt><dd>${esc((d.inputs || []).map(inputName).join(", "))} / ${esc((d.outputs || []).map(outputName).join(", "))}</dd></div>
            <div><dt>Pins</dt><dd>${esc(d.pins)}</dd></div>
            <div><dt>Plan</dt><dd class="mx-pre">${esc(d.pseudocode)}</dd></div>
          </dl>${versionNote(rec.designEvent)}` : `<p class="muted">No design saved yet.</p>`}
          <p class="mx-gates">${gateBtn("moxie-13", "design", g.ids, rec.designApproved)}${gateBtn("moxie-16", "pitch", g.ids, rec.pitch)}</p>
          <p><strong>Build log:</strong> ${plural(rec.bugs.length, "entry", "entries")} · <strong>Feedback:</strong> ${rec.feedback.length} · <strong>Improvements:</strong> ${rec.improvements.map((e) => esc(e.data.change)).join("; ") || "none yet"}</p>
          ${rec.card ? `<p><strong>Showcase card:</strong> ${esc(rec.card.title)}. ${esc(rec.card.helps || "")}</p>` : ""}
          <h3 class="small">Still to do</h3>
          ${capstoneCheck(rec).length ? `<ul class="bullets small">${capstoneCheck(rec).map((m) => `<li><span>${esc(m)}</span></li>`).join("")}</ul>` : `<p class="small">${icon("check")}Every requirement is met.</p>`}
          <div class="mx-students">${perStudent}</div>
        </div>
      </details>`;
  }

  function bindTeach(user, cls) {
    if (!cls) return;
    const form = document.getElementById("mx-team-form");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ids = [0, 1, 2].map((i) => document.getElementById(`mx-tm-${i}`).value).filter(Boolean);
      const r = SE.store.saveTeam(cls.id, ids);
      if (!r.ok) { document.getElementById("mx-team-err").textContent = r.error; return; }
      rerender("mx-teams", "");
      SE.toast("Team saved");
    });
    app().querySelectorAll("[data-team-del]").forEach((b) => b.addEventListener("click", () => {
      SE.store.deleteTeam(b.dataset.teamDel);
      rerender("mx-teams", "");
      SE.toast("Team split up. Each student keeps their own work.");
    }));
    app().querySelectorAll("details[data-review]").forEach((d) => d.addEventListener("toggle", () => { if (d.open) reviewOpen = d.dataset.review; else if (reviewOpen === d.dataset.review) reviewOpen = null; }));
    app().querySelectorAll("[data-gate]").forEach((b) => b.addEventListener("click", () => {
      const [activityId, gate, ok] = b.dataset.gate.split("|");
      const a = SE.activityById[activityId];
      b.dataset.students.split(",").forEach((id) => SE.store.teacherLog(id, "moxie_gate", { activityId, gate, ok: ok === "1", v: a.version }));
      rerender(null, `${GATES[gate]}: ${ok === "1" ? "done" : "not yet"}`);
    }));
    app().querySelectorAll("form[data-rubric]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = f.dataset.rubric, note = document.getElementById(`mx-rn-${id}`).value.trim().slice(0, 300);
      if (!clean(note)) { document.getElementById(`mx-rn-${id}`).focus(); return; }
      SE.store.teacherLog(id, "moxie_rubric", { activityId: "moxie-16", dimension: document.getElementById(`mx-rd-${id}`).value, note });
      rerender(null, "Feedback saved");
    }));
  }
})();
