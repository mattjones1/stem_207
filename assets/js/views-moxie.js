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
  /* Teacher sign-offs. The labels match the sheets' checkoff boxes. "Core challenge" is the teacher's Pass. */
  const GATES = { wiring: "Wiring checked", design: "Design approved", plan: "Plan approved", stretch: "Stretch goal", subsystem: "Subsystem demo",
    card: "Criteria tested + showcase card", pitch: "Pitch + demo" };
  const BAD_PINS = [0, 2, 6, 7, 8, 9, 10, 11, 12, 15];   // the Session 13 sheet's don't-use list
  const INPUTS = [["button", "Button"], ["knob", "Knob (potentiometer)"], ["light", "Light sensor"], ["temperature", "Temperature sensor"], ["distance", "Distance sensor"]];
  const OUTPUTS = [["led", "LED", "light"], ["rgb", "RGB LED", "light"], ["buzzer", "Buzzer", "sound"], ["oled", "OLED display", "display"], ["servo", "Servo", "motion"]];
  const BUGLOG = { subsystem: "Subsystem test", bug: "Bug and fix", change: "Change to the plan" };
  const MET = { yes: "Yes", no: "No" };
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

  /* What a session still needs. "pilot" needs the sheet's content; "publish" (everyone) also needs the
     grade range and student time, which the pilot sets (never guessed). */
  function readyToPublish(a, level = "publish") {
    const out = [];
    if (level === "publish") {
      if (!a.grades || !a.grades.length) out.push("grade range");
      if (!a.duration && !(a.time && a.time.core)) out.push("student time");
    }
    if (!a.mission || !a.moxie.sheet) out.push("the sheet's content");
    if (a.moxie.kind === "build") {
      if (!a.wiring && (!a.moxie.sheet || a.moxie.sheet.build)) out.push("wiring table");
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
    if (!clean(d.user)) out.push("Write who has the problem.");
    if (!clean(d.problem)) out.push("Write what the problem is.");
    if ("device" in d && !clean(d.device)) out.push("Finish the sentence “Our device will…”.");
    const crit = (d.criteria || []).filter(clean);
    if (crit.length < 3) out.push(`You have ${crit.length} of 3 criteria. Write ${crit.length === 2 ? "one more" : `${3 - crit.length} more`} that you can measure.`);
    (d.criteria || []).forEach((c, i) => { if (clean(c) && d.tests && !clean(d.tests[i])) out.push(`Criterion ${i + 1}: write how you will test it.`); });
    if (!(d.inputs || []).length) out.push("Pick at least one input.");
    const outs = d.outputs || [];
    const types = [...new Set(outs.map(outputType))];
    if (!outs.length) out.push("Pick at least two outputs of different types.");
    else if (types.length < 2) out.push(`Your output${outs.length === 1 ? "" : "s"} (${outs.map(outputName).join(", ")}) ${outs.length === 1 ? "is" : "are all"} one type: ${types[0]}. Add an output of a different type.`);
    const parts = d.parts || [];
    if (!parts.length && !clean(d.pins)) out.push("List each part and the pin it uses.");
    parts.forEach((p, i) => {
      if (!clean(p.part)) return;
      if (!clean(p.pin)) { out.push(`Part ${i + 1} (${p.part}) needs a pin.`); return; }
      const n = Number((String(p.pin).match(/\d+/) || [])[0]);
      if (/^(3v3|vin|gnd|5v)$/i.test(String(p.pin).trim())) return;
      if (BAD_PINS.includes(n)) out.push(`Pin ${n} (${p.part}) is on the don't-use list: 0, 2, 6–11, 12, and 15. Pick another pin.`);
    });
    if (parts.length && !parts.some((p) => p.io === "input")) out.push("Mark at least one part as an input.");
    if ("sketched" in d && !d.sketched) out.push("Sketch your circuit on paper and show your teacher, then tick the box.");
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
    // Cards other teams sent count as feedback this team received (moxie_feedback_card_got, read-only).
    const got = (SE.store.feedbackCards ? SE.store.feedbackCards(studentId) : []).map((e) => ({ ...e, type: "moxie_feedback_card_got" }));
    return SE.store.eventsFor(studentId).filter((e) => /^moxie_/.test(e.type) && e.type !== "moxie_feedback_card")
      .concat(SE.store.teamEvents(studentId), got).sort((x, y) => x.at - y.at);
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
      standups: evs.filter((e) => e.type === "moxie_standup").reduce((m, e) => ((m[e.data.session] = e.data), m), {}),
      subsystems: data(latest(evs, "moxie_subsystem")),
      change: data(latest(evs, "moxie_change")),
      pitch: data(latest(evs, "moxie_pitch")),
      cards: evs.filter((e) => e.type === "moxie_feedback_card_got"),
      designApproved: gateOpen(evs, "moxie-13", "design"),
      subsystemDemo: gateOpen(evs, "moxie-14", "subsystem"),
      cardChecked: gateOpen(evs, "moxie-15", "card"),
      pitched: gateOpen(evs, "moxie-16", "pitch")
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
    if (!rec.feedback.length && !rec.cards.length) out.push("Get a feedback card from another team.");
    if (!rec.improvements.length) out.push("Make at least one improvement, and write what you changed.");
    if (!rec.card || !clean(rec.card.title)) out.push("Fill in your showcase card.");
    if (!rec.pitch || !clean(Object.values(rec.pitch).join(""))) out.push("Plan your 1-minute pitch.");
    if (!rec.pitched) out.push("Give your one-minute pitch with your partner. Your teacher marks it.");
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
      moxie_code: ["code", `${who}saved their code for ${title}`], moxie_think: ["message", `${who}answered Think about it for ${title}`],
      moxie_checklist: ["list", `${who}updated a checklist for ${title}`], moxie_kit: ["box", `${who}set their kit number`],
      moxie_standup: ["users", `${who}wrote a stand-up`], moxie_subsystem: ["list", `${who}updated the subsystem checklist`],
      moxie_change: ["refresh", `${who}wrote what changed from the plan`], moxie_pitch: ["message", `${who}planned the pitch`],
      moxie_feedback_card: ["star", `${who}sent a feedback card to ${esc(e.data.toNames || "another team")}`],
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

  /* ───────── Session page: #/activity/moxie-NN ─────────
   * The page follows the student sheet section by section, with the sheet's headings, so a class can
   * switch between paper and screen. Work saves as moxie_* events (see SAVE below). */
  const TEAMS_FOR = (user) => (isStu(user) ? SE.store.classTeams(user.id) : []);
  const tableHtml = (t, caption, cls = "") => {
    if (!t || !t.length) return "";
    const [head, ...rows] = t;
    return `<div class="table-wrap"><table class="roster mx-sheet-table ${cls}"><caption class="visually-hidden">${esc(caption)}</caption>
      <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
  };
  const bullets = (list) => (list && list.length ? `<ul class="bullets">${list.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>` : "");
  const sec = (id, ic, title, body, extra = "") => `<section class="block mx-sec ${extra}" aria-labelledby="${id}"><h2 id="${id}">${icon(ic)}${esc(title)}</h2>${body}</section>`;
  const latestFor = (evs, type, a, pred) => evs.filter((e) => e.type === type && e.data.activityId === a.id && (!pred || pred(e))).pop() || null;
  const checklistState = (evs, a, list) => ((latestFor(evs, "moxie_checklist", a, (e) => e.data.list === list) || {}).data || {}).items || [];

  /* Code with blanks: every run of 3+ underscores is one blank the student fills in. */
  function codeModel(lines) {
    let k = 0;
    return { lines: lines.map((l, i) => ({ n: i + 1, segs: l.split(/(_{3,})/).filter((p) => p !== "").map((p) => (/^_{3,}$/.test(p) ? { b: k++, len: p.length } : p)) })), count: k };
  }
  const filledCode = (model, values) => model.lines.map((ln) => ln.segs.map((s) => (typeof s === "string" ? s : (values[s.b] || "").trim() || "____")).join("")).join("\n");
  const emptyBlankLines = (model, values) => [...new Set(model.lines.filter((ln) => ln.segs.some((s) => typeof s !== "string" && !(values[s.b] || "").trim())).map((ln) => ln.n))];
  SE.moxieCode = { codeModel, filledCode, emptyBlankLines };

  SE.views.moxieSession = function (user, a) {
    if (!visible(a, user)) return SE.views.notFound();
    const stu = isStu(user), edu = isEdu(user);
    const prof = stu ? SE.game.profile(user.id) : null;
    const evs = stu ? work(user.id) : [];
    const k = a.moxie.kind;
    const u = M.units[a.moxie.unit - 1];
    const st = prof ? statusOf(prof, a) : null;
    const mates = stu ? SE.store.teammates(user.id) : [];
    const kit = stu ? ((latest(evs, "moxie_kit") || {}).data || {}).kit : "";

    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink("#/moxie", "Moxie")}
            <nav class="crumbs" aria-label="Breadcrumb"><a href="#/moxie">Moxie</a> / Unit ${u.n}: ${esc(u.title)} / <span aria-current="page">${esc(a.title)}</span></nav></div>
          <div class="page-top__head"><span class="icon-badge">${icon("gear")}</span>
            <div><span class="eyebrow">Moxie · ${num(a)} of 16 · Unit ${u.n}: ${esc(u.title)}</span><h1 tabindex="-1">${esc(a.title)}</h1></div></div>
          ${a.moxie.based ? `<p class="mx-based">${esc(a.moxie.based)}</p>` : ""}
          <div class="page-top__tags">
            ${st ? `<span class="chip chip--done-dark">${esc(st.label)}</span>` : ""}
            <button type="button" class="btn btn--ghost btn--small mx-print-btn" id="mx-print">${icon("print")}Print this sheet</button>
          </div>
        </div>
      </section>
      <div class="wrap activity-layout">
        <div class="activity-main">
          ${edu ? pubBanner(a.pub, "this session") : ""}
          ${a.notice ? `<p class="mx-banner mx-banner--notice">${icon("alert")}<span><strong>Update:</strong> ${esc(a.notice)}</span></p>` : ""}
          ${stu ? `
          <form class="block mx-names" data-mx="kit" novalidate>
            <p><strong>Name:</strong> ${esc(user.displayName)}</p>
            <p><strong>Partner:</strong> ${mates.length ? esc(mates.map((m) => m.displayName).join(" & ")) : `<span class="muted">Not on a team yet</span>`}</p>
            <div class="mx-kit">${line("mx-kit", "Kit #", kit, 12)}<button type="submit" class="btn btn--ghost btn--small">${icon("check")}Save</button>${status("mx-kit-status")}</div>
          </form>` : ""}
          ${k === "build" ? buildSections(user, a, evs, prof) : (stu ? teamPanel(user) : "") + capstoneSections(user, a, evs)}
          ${checkoffSection(user, a, evs, prof)}
          ${stu ? SE.views.debrief(user, a, prof) : ""}
          ${stu ? `
          <nav class="act-bar" aria-label="Jump to">
            ${a.code ? `<a class="btn btn--ghost btn--small" href="#s-code" data-jump="s-code">${icon("code")}Code it</a>` : ""}
            <a class="btn btn--ghost btn--small" href="#s-checkoff" data-jump="s-checkoff">${icon("shield")}Checkoff</a>
            <a class="btn btn--primary btn--small" href="#s-debrief" data-jump="s-debrief">${icon("flag")}${st && (st.state === "submitted" || st.state === "confirmed") ? "My answer" : "Send my answer"}</a>
          </nav>` : ""}
          ${stu ? "" : `
          <details class="block teacher-notes" open>
            <summary><h2>${icon("clipboard")}Teacher notes</h2><span class="toggle-hint" aria-hidden="true"></span></summary>
            <div class="teacher-notes__body">
              <ul class="bullets">${a.teacherNotes.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
              <p><strong>Source:</strong> ${esc(a.moxie.sourceFile)} · content v${esc(a.version)}</p>
              ${readyToPublish(a, "publish").length ? `<p><strong>Still needed before publishing to everyone:</strong> ${esc(readyToPublish(a, "publish").join(", "))}.</p>` : ""}
            </div>
          </details>`}
        </div>
        <aside class="aside" aria-label="Session at a glance">
          <div class="block launch-mini">
            <h2>At a glance</h2>
            <dl class="facts">
              <div><dt>Pathway</dt><dd><a href="#/moxie">Moxie</a>, ${num(a)} of 16</dd></div>
              <div><dt>Unit</dt><dd>${u.n}: ${esc(u.title)}</dd></div>
              <div><dt>Grades</dt><dd>${a.grades.length ? SE.gradesText(a.grades) : "Pending a pilot"}</dd></div>
              <div><dt>Time</dt><dd>${a.duration || a.time ? SE.timeText(a) : "Pending a pilot"}</dd></div>
              <div><dt>Format</dt><dd>With a partner</dd></div>
            </dl>
          </div>
          ${edu ? sessionClassBox(user, a) : ""}
          <div class="block"><h2>Before this</h2><p class="muted small">${esc(a.before.prerequisites)}</p></div>
        </aside>
      </div>
      <div id="mx-print-sheet" class="mx-print-sheet" aria-hidden="true"></div>`;

    document.getElementById("mx-print").addEventListener("click", () => {
      const box = document.getElementById("mx-print-sheet");
      box.innerHTML = printSheet(a);
      document.body.classList.add("mx-printing");
      window.print();
      document.body.classList.remove("mx-printing");
    });
    if (stu) {
      SE.logOpen(user, a.id);
      SE.views.bindDebrief(user, a);
      bindStudent(user, a);
    }
  };

  /* The checkoff, like the bottom of the sheet: the list before you call your teacher over, the
     question to be ready for (sent through the debrief below), and the teacher's sign-offs. */
  function checkoffSection(user, a, evs, prof) {
    const stu = isStu(user);
    const items = a.moxie.checkoff || [];
    const done = stu ? checklistState(evs, a, "checkoff") : [];
    const st = prof ? SE.game.statusFor(prof, a) : null;
    const signoff = (label) => {
      const gate = Object.keys(GATES).find((g) => GATES[g] === label);
      if (!gate) {   // "Core challenge": the teacher's Pass
        const ok = st && st.state === "confirmed";
        return `<li class="${ok ? "is-done" : ""}">${icon(ok ? "check" : "clock")}<span><strong>${esc(label)}</strong> · ${ok ? "passed by your teacher" : "your teacher passes it after you send your answer"}</span></li>`;
      }
      const g = latest(evs.filter((e) => e.data.gate === gate), "moxie_gate", a.id);
      const ok = !!(g && g.data.ok);
      return `<li class="${ok ? "is-done" : ""}">${icon(ok ? "check" : "clock")}<span><strong>${esc(label)}</strong> · ${ok ? `checked ${SE.dateShort(g.at)}` : "your teacher checks this off"}</span></li>`;
    };
    return `
      <section class="block mx-sec mx-checkoff" aria-labelledby="s-checkoff">
        <h2 id="s-checkoff">${icon("shield")}${items.length ? "Checkoff: before you call your teacher over" : "Checkoff"}</h2>
        ${items.length ? (stu ? `<fieldset class="mx-checklist" data-checklist="checkoff"><legend class="visually-hidden">Checkoff list</legend>
          ${items.map((x, i) => `<label class="mx-check"><input type="checkbox" data-ci="${i}" ${done[i] ? "checked" : ""}><span>${esc(x)}</span></label>`).join("")}</fieldset>` : bullets(items)) : ""}
        ${a.check ? `<p class="mx-explain">${icon("message")}<span><strong>Be ready to explain:</strong> ${esc(a.check)}</span></p>` : ""}
        ${stu ? `<p class="muted small">When your list is done, send your answer below. That's how you call your teacher over.</p>` : ""}
        <ul class="mx-signoffs">${(a.moxie.signoffs || []).map(signoff).join("")}</ul>
      </section>`;
  }

  /* Sessions 1–12: the sheet's sections, in the sheet's order. */
  function buildSections(user, a, evs, prof) {
    const stu = isStu(user);
    const m = a.moxie;
    const wiringGate = m.gates.includes("wiring");
    const plan = stu ? latest(evs, "moxie_plan", a.id) : null;
    const obs = stu ? latest(evs, "moxie_observe", a.id) : null;
    const think = stu ? latest(evs, "moxie_think", a.id) : null;
    const code = stu ? latest(evs, "moxie_code", a.id) : null;
    const tested = stu ? checklistState(evs, a, "test") : [];
    const checked = prof ? (prof.steps[a.id] || new Set()) : new Set();
    const model = a.code ? codeModel(a.code.lines) : null;
    const values = (code && code.data.blanks) || [];
    const planLines = m.planSheet ? m.planSheet.text.filter((t) => !/^Instructor approval/i.test(t)) : [];
    const savedPlan = (plan && plan.data.lines) || [];
    let blankNo = 0;
    return `
      ${sec("s-mission", "target", "Your mission", `<p>${esc(a.mission)}</p>`, "block--mission")}
      ${sec("s-need", "box", "What you need", bullets(a.before.materials))}
      ${sec("s-before", "shield", m.setupTitle || "Before you wire", `${bullets(a.before.setup)}
        ${wiringGate ? `<p class="mx-stop">${icon("alert")}<span><strong>Stop and check:</strong> your teacher checks your wiring before you power this circuit.${stu ? ` ${gateOpen(evs, a.id, "wiring") ? "Your wiring is checked. You can power it on." : "Not checked yet."}` : ""}</span></p>` : ""}`)}
      ${m.board ? sec("s-meet", "tools", "Meet your ESP32", `
        <figure class="mx-diagram"><img src="${esc(m.board.src)}" alt="${esc(m.board.alt)}" loading="lazy"><figcaption>${esc((m.meet && m.meet.text[0]) || "")}</figcaption>
          <details><summary>Read the board as text</summary><p>${esc(m.board.text)}</p></details></figure>`) : ""}
      ${a.steps.length ? sec("s-connect", "list", "Connect it", `<ol class="steps ${stu ? "steps--check" : ""}">${a.steps.map((x, i) => stu ? `
          <li><label class="step-check"><input type="checkbox" data-step="${i}" ${checked.has(i) ? "checked" : ""}>
            <span class="step-check__box" aria-hidden="true">${icon("check")}</span><span class="step-check__num" aria-hidden="true">${i + 1}</span>
            <span class="step-check__text"><span class="visually-hidden">Step ${i + 1}: </span>${esc(x)}</span></label></li>` : `<li><span>${esc(x)}</span></li>`).join("")}</ol>`) : ""}
      ${a.wiring || a.diagram ? sec("s-build", "tools", "Build it", `
        ${a.diagram ? `<figure class="mx-diagram"><a href="${esc(a.diagram.src)}" target="_blank" rel="noopener" class="mx-diagram__zoom"><img src="${esc(a.diagram.src)}" alt="${esc(a.diagram.alt)}" loading="lazy"><span class="visually-hidden"> (opens the full-size diagram in a new tab)</span></a>
          <details><summary>Read the diagram as text</summary><p>${esc(a.diagram.text)}</p></details></figure>` : ""}
        ${(m.buildNotes || []).map((x) => `<p class="mx-note">${esc(x)}</p>`).join("")}
        ${a.wiring ? tableHtml([a.wiring.head].concat(a.wiring.rows), `Wiring for ${a.title}`, "mx-wiring") : ""}`) : ""}
      ${m.concept ? sec("s-concept", "bulb", sentence(m.concept.title), `${m.concept.text.map((x) => `<p>${esc(x)}</p>`).join("")}${m.concept.tables.map((t) => tableHtml(t, m.concept.title)).join("")}`) : ""}
      ${m.planSheet ? sec("s-plan", "list", sentence(m.planSheet.title), `
        ${m.planSheet.tables.map((t) => tableHtml(t, "Truth table")).join("")}
        ${planLines.some((t) => /^\d+\.\s*_{3,}/.test(t)) ? `
          ${planLines.filter((t) => !/^\d+\./.test(t)).map((t) => `<p>${esc(t)}</p>`).join("")}
          ${stu ? `<form data-mx="plan" novalidate><ol class="mx-plan">${planLines.filter((t) => /^\d+\./.test(t)).map((t) => {
              const [, n, rest] = t.match(/^(\d+)\.\s*(.*)$/);
              if (!/^_{3,}$/.test(rest.trim())) return `<li><span>${esc(rest)}</span></li>`;
              const i = blankNo++;
              return `<li><label class="visually-hidden" for="mx-pl-${i}">Step ${n} of your plan</label><input id="mx-pl-${i}" class="input" data-plan="${i}" maxlength="200" value="${esc(savedPlan[i] || "")}" placeholder="Step ${n}"></li>`;
            }).join("")}</ol>
            <button type="submit" class="btn btn--primary">${icon("check")}Save my plan</button>${status("mx-plan-status")}</form>`
          : `<ol class="mx-plan">${planLines.filter((t) => /^\d+\./.test(t)).map((t) => `<li><span>${esc(t.replace(/^\d+\.\s*/, ""))}</span></li>`).join("")}</ol>`}`
        : planLines.map((t) => `<p>${esc(t)}</p>`).join("")}
        ${m.gates.includes("plan") ? `<p class="mx-gates">${stu ? gateChip(gateOpen(evs, a.id, "plan"), "plan") : ""}</p><p class="muted small">Show your plan to your teacher before you code.</p>` : ""}`) : ""}
      ${a.code ? sec("s-code", "code", "Code it", `
        ${a.code.intro ? `<p>${esc(a.code.intro)}</p>` : ""}
        ${stu ? `<p class="muted small">Fill in each blank right in the code. Then copy it into the Arduino IDE, or download it.</p>` : ""}
        <pre class="mx-code mx-code--blanks" aria-label="Code for ${esc(a.title)}"><code>${model.lines.map((ln) => `<span class="mx-ln" aria-hidden="true">${ln.n}</span>${ln.segs.map((s) => typeof s === "string" ? esc(s)
          : stu ? `<input class="mx-blank" data-blank="${s.b}" size="${Math.max(4, Math.min(s.len, 22))}" maxlength="80" aria-label="Blank ${s.b + 1}, line ${ln.n}" value="${esc(values[s.b] || "")}" spellcheck="false" autocapitalize="off" autocomplete="off">`
          : `<span class="mx-blank-line">${"_".repeat(Math.min(s.len, 14))}</span>`).join("")}`).join("\n")}</code></pre>
        ${stu ? `<div class="mx-code-tools">
          <button type="button" class="btn btn--primary btn--small" id="mx-code-save">${icon("check")}Save my code</button>
          <button type="button" class="btn btn--ghost btn--small" id="mx-code-copy">${icon("clipboard")}Copy my code</button>
          <button type="button" class="btn btn--ghost btn--small" id="mx-code-dl">${icon("arrowRight")}Download .ino</button>
          ${status("mx-code-status")}</div>` : `<p class="muted small">Students fill the ${plural(model.count, "blank", "blanks")} on screen; you see their answers in Checks.</p>`}
        ${a.code.remember ? `<p class="mx-remember">${icon("bulb")}<span>${esc(a.code.remember)}</span></p>` : ""}
        <p class="mx-cb-note">${icon("code")}<span><strong>On a Chromebook?</strong> Fill in your code here, then use Copy my code or Download .ino. Your teacher uploads it to the board from the class laptop with the Arduino IDE.</span></p>`) : ""}
      ${a.tests ? sec("s-test", "flask", "Test it", `
        ${stu ? `<fieldset class="mx-checklist" data-checklist="test"><legend class="visually-hidden">Tests</legend>
          ${a.tests.map((x, i) => `<label class="mx-check"><input type="checkbox" data-ci="${i}" ${tested[i] ? "checked" : ""}><span>${esc(x)}</span></label>`).join("")}</fieldset>` : bullets(a.tests)}
        ${stu ? `<form data-mx="observe" novalidate>${area("mx-observe", "What happened when you tested it?", obs && obs.data.text, 3, 800, "Write what you saw, and anything you changed.")}
          <button type="submit" class="btn btn--ghost">${icon("check")}Save my notes</button>${status("mx-observe-status")}</form>` : ""}`) : ""}
      ${a.stuck && a.stuck.length ? sec("s-stuck", "question", "Stuck? Check these first", bullets(a.stuck), "mx-stuck") : ""}
      ${a.stretch ? sec("s-stretch", "rocket", "Stretch goal", `<p class="muted small">Optional. You don't need it to finish the session.</p><p>${esc(a.stretch)}</p>
        ${m.stretchHint ? `<details class="mx-hint"><summary>Show the hint</summary><p>${esc(m.stretchHint)}</p></details>` : ""}`, "block--extend") : ""}
      ${m.think ? sec("s-think", "message", "Think about it", `<p>${esc(m.think)}</p>
        ${stu ? `<form data-mx="think" novalidate>${area("mx-think", "Your answer", think && think.data.text, 3, 600)}
          <button type="submit" class="btn btn--ghost">${icon("check")}Save my answer</button>${status("mx-think-status")}</form>` : ""}`) : ""}`;
  }
  /* "PLAN IT FIRST: TRUTH TABLE" → "Plan it first: truth table" */
  const sentence = (t) => { const s = String(t || "").toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1).replace(/esp32/g, "ESP32").replace(/oled/g, "OLED"); };

  /* Capstone sessions 13–16, following each sheet. Partners share one copy (TEAM_TYPES). */
  function capstoneSections(user, a, evs) {
    const stu = isStu(user);
    const S = a.moxie.sheet || {};
    const rec = capstone(evs);
    const d = rec.design || {};
    const lock = stu ? "" : " disabled";
    const preview = stu ? "" : `<p class="mx-preview">${icon("eye")}<span><strong>Student view preview.</strong> Students fill this in. Partners share one copy.</span></p>`;
    const missing = (list, okText) => list.length
      ? `<ul class="mx-missing">${list.map((m) => `<li>${icon("alert")}<span>${esc(m)}</span></li>`).join("")}</ul>`
      : `<p class="mx-done">${icon("check")}<span>${esc(okText)}</span></p>`;
    const designSummary = rec.design ? `
      <dl class="mx-design">
        <div><dt>Problem</dt><dd>${esc(d.problem)}</dd></div><div><dt>Who has it</dt><dd>${esc(d.user)}</dd></div>
        ${d.device ? `<div><dt>Our device will</dt><dd>${esc(d.device)}</dd></div>` : ""}
        <div><dt>Criteria</dt><dd><ol>${(d.criteria || []).filter(clean).map((c, i) => `<li>${esc(c)}${(d.tests || [])[i] ? ` <span class="muted">(test: ${esc(d.tests[i])})</span>` : ""}</li>`).join("")}</ol></dd></div>
      </dl>` : `<p>No design saved yet. Start in <a href="#/activity/moxie-13">Session 13: Define & Design</a>.</p>`;
    const mission = sec("s-mission", "target", "Your mission", `<p>${esc(a.mission)}</p>`, "block--mission");
    const cardsBox = (session) => feedbackCardsSection(user, a, session, lock);

    if (a.moxie.kind === "design") {
      const dc = rec.design ? designCheck(rec.design) : [];
      const parts = d.parts && d.parts.length ? d.parts : [];
      const PARTS = 6;
      return `
      ${mission}
      ${sec("s-must", "list", "Your project must have", bullets(S.mustHave))}
      ${sec("s-limits", "shield", "Constraints (limits)", bullets(S.constraints))}
      ${S.ideaBank ? sec("s-ideas", "bulb", "Idea bank (or invent your own!)", tableHtml(S.ideaBank.tables[0], "Idea bank")) : ""}
      <section class="block mx-sec" aria-labelledby="s-design">
        <h2 id="s-design">${icon("target")}Plan your device</h2>
        ${preview}
        <form data-mx="design" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Capstone design</legend>
          <h3>1. Define the problem</h3>
          ${line("mx-user", "Who has the problem?", d.user)}
          ${area("mx-problem", "What is the problem?", d.problem, 2, 400)}
          ${line("mx-device", "Our device (one sentence): “Our device will…”", d.device, 200)}
          <h3>2. Criteria: how will we know it works?</h3>
          <p class="field-help">${esc((S.criteria && S.criteria.text[0]) || "Make each one measurable.")}</p>
          <div class="mx-rows">${[0, 1, 2].map((i) => `<div class="mx-row">
            ${line(`mx-crit-${i}`, `${i + 1}. Our device must…`, (d.criteria || [])[i])}
            ${line(`mx-how-${i}`, `How we will test it`, (d.tests || [])[i])}</div>`).join("")}</div>
          <h3>3. Parts & pin plan</h3>
          <p class="field-help">${esc((S.pins && S.pins.text[0]) || "")}</p>
          <div class="table-wrap"><table class="roster mx-parts"><caption class="visually-hidden">Parts and pins</caption>
            <thead><tr><th scope="col">Part</th><th scope="col">Input or output?</th><th scope="col">ESP32 pin</th><th scope="col">Learned in session</th></tr></thead>
            <tbody>${Array.from({ length: PARTS }, (_, i) => { const p = parts[i] || {}; return `<tr>
              <td><label class="visually-hidden" for="mx-pp-${i}">Part ${i + 1}</label><input id="mx-pp-${i}" class="input input--small" maxlength="60" value="${esc(p.part || "")}"></td>
              <td><label class="visually-hidden" for="mx-pio-${i}">Part ${i + 1}: input or output</label><select id="mx-pio-${i}" class="input input--small"><option value=""></option><option value="input" ${p.io === "input" ? "selected" : ""}>Input</option><option value="output" ${p.io === "output" ? "selected" : ""}>Output</option></select></td>
              <td><label class="visually-hidden" for="mx-ppin-${i}">Part ${i + 1}: ESP32 pin</label><input id="mx-ppin-${i}" class="input input--small" maxlength="12" value="${esc(p.pin || "")}" placeholder="D25"></td>
              <td><label class="visually-hidden" for="mx-pses-${i}">Part ${i + 1}: learned in session</label><input id="mx-pses-${i}" class="input input--small" maxlength="4" inputmode="numeric" value="${esc(p.session || "")}"></td></tr>`; }).join("")}</tbody></table></div>
          <fieldset class="mx-group"><legend>What kinds of inputs?</legend><div class="mx-checks">
            ${INPUTS.map(([id, name]) => `<label class="mx-check"><input type="checkbox" name="mx-in" value="${id}" ${(d.inputs || []).includes(id) ? "checked" : ""}><span>${esc(name)}</span></label>`).join("")}</div></fieldset>
          <fieldset class="mx-group"><legend>What kinds of outputs? (at least two different types)</legend><div class="mx-checks">
            ${OUTPUTS.map(([id, name, type]) => `<label class="mx-check"><input type="checkbox" name="mx-out" value="${id}" ${(d.outputs || []).includes(id) ? "checked" : ""}><span>${esc(name)} <small>(${esc(type)})</small></span></label>`).join("")}</div></fieldset>
          <h3>4. Sketch your circuit</h3>
          <label class="mx-check"><input type="checkbox" id="mx-sketch" ${d.sketched ? "checked" : ""}><span>We drew the ESP32, each part, and every wire on paper, with the pins labeled, and showed our teacher.</span></label>
          <h3>5. Plan the code</h3>
          ${area("mx-pseudo", esc((S.codePlan || [])[0] || "Your plan in plain steps (pseudocode)"), d.pseudocode, 6, 1500)}
          <button type="submit" class="btn btn--primary">${icon("check")}Save our design</button>${status("mx-design-status")}
        </fieldset></form>
        ${rec.design ? `<h3>Design check</h3>${missing(dc, "Your design has everything the project needs. Ask your teacher to approve it.")}
          <p class="mx-gates">${gateChip(rec.designApproved, "design")}</p>${versionNote(rec.designEvent)}` : ""}
      </section>
      ${S.rubric ? sec("s-rubric", "clipboard", "How your project will be scored", tableHtml(S.rubric.tables[0], "Scoring")) : ""}`;
    }

    if (a.moxie.kind === "buildlog") {
      const cc = rec.codecheck || {};
      const stand = (n) => ((rec.standups || {})[n]) || {};
      const subs = (rec.subsystems && rec.subsystems.rows) || [];
      const ROWS = 6;
      return `
      ${mission}
      <section class="block mx-sec" aria-labelledby="s-plan">
        <h2 id="s-plan">${icon("target")}Your approved design</h2>
        ${designSummary}
        ${stu ? `<p class="mx-gates">${gateChip(rec.designApproved, "design")}</p>` : ""}
        ${rec.design && !rec.designApproved ? `<p class="mx-stop">${icon("alert")}<span>Ask your teacher to approve your design before you build.</span></p>` : ""}
      </section>
      <section class="block mx-sec" aria-labelledby="s-standup">
        <h2 id="s-standup">${icon("users")}Stand-up meeting (start of class, 2 minutes)</h2>
        ${preview}
        <div class="mx-two">${[14, 15].map((n) => `
          <form data-mx="standup" data-session="${n}" novalidate><fieldset class="mx-fieldset"${lock}><legend><strong>Session ${n}</strong></legend>
            ${area(`mx-su-done-${n}`, "What is done?", stand(n).done, 2, 300)}
            ${area(`mx-su-today-${n}`, "What will we do today?", stand(n).today, 2, 300)}
            ${area(`mx-su-block-${n}`, "What is blocking us?", stand(n).blocking, 2, 300)}
            <button type="submit" class="btn btn--ghost btn--small">${icon("check")}Save Session ${n}</button>${status(`mx-su-status-${n}`)}
          </fieldset></form>`).join("")}</div>
      </section>
      <section class="block mx-sec" aria-labelledby="s-subs">
        <h2 id="s-subs">${icon("list")}Subsystem checklist</h2>
        <p>${esc((S.subsystems && S.subsystems.text[0]) || "")}</p>
        <form data-mx="subsystems" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Subsystems</legend>
          <div class="table-wrap"><table class="roster mx-parts"><caption class="visually-hidden">Subsystem checklist</caption>
            <thead><tr><th scope="col">Subsystem (part)</th><th scope="col">Wired</th><th scope="col">Tested alone</th><th scope="col">Added to main code</th><th scope="col">Notes</th></tr></thead>
            <tbody>${Array.from({ length: ROWS }, (_, i) => { const r = subs[i] || {}; return `<tr>
              <td><label class="visually-hidden" for="mx-ss-${i}">Subsystem ${i + 1}</label><input id="mx-ss-${i}" class="input input--small" maxlength="60" value="${esc(r.part || "")}"></td>
              ${["wired", "alone", "added"].map((k) => `<td><label class="mx-tick"><input type="checkbox" id="mx-ss-${k}-${i}" ${r[k] ? "checked" : ""}><span class="visually-hidden">Subsystem ${i + 1}: ${k === "wired" ? "wired" : k === "alone" ? "tested alone" : "added to main code"}</span></label></td>`).join("")}
              <td><label class="visually-hidden" for="mx-ssn-${i}">Subsystem ${i + 1}: notes</label><input id="mx-ssn-${i}" class="input input--small" maxlength="120" value="${esc(r.notes || "")}"></td></tr>`; }).join("")}</tbody></table></div>
          <button type="submit" class="btn btn--primary btn--small">${icon("check")}Save the checklist</button>${status("mx-ss-status")}
        </fieldset></form>
      </section>
      ${sec("s-tips", "bulb", "Build tips", bullets(S.tips))}
      <section class="block mx-sec" aria-labelledby="s-log">
        <h2 id="s-log">${icon("tools")}Bug log</h2>
        <p>${esc((S.bugLog && S.bugLog.text[0]) || "")}</p>
        <form data-mx="buglog" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">New bug log entry</legend>
          ${area("mx-log-what", "What went wrong?", "", 2, 400)}
          ${area("mx-log-result", "What we tried", "", 2, 400)}
          <label class="mx-check"><input type="checkbox" id="mx-log-fixed"><span>Fixed</span></label>
          <button type="submit" class="btn btn--primary btn--small">${icon("plus")}Add to the bug log</button>${status("mx-log-status")}
        </fieldset></form>
        ${rec.bugs.length ? `<div class="table-wrap"><table class="roster mx-sheet-table"><caption class="visually-hidden">Your team's bug log</caption>
          <thead><tr><th scope="col">What went wrong?</th><th scope="col">What we tried</th><th scope="col">Fixed?</th><th scope="col">Who</th></tr></thead>
          <tbody>${rec.bugs.map((e) => `<tr><td>${esc(e.data.what)}</td><td>${esc(e.data.result || "")}</td><td>${e.data.fixed ? "Yes" : "Not yet"}</td><td class="small">${who(e, user)}, ${SE.dateShort(e.at)}</td></tr>`).join("")}</tbody></table></div>` : ""}
      </section>
      <section class="block mx-sec" aria-labelledby="s-changed">
        <h2 id="s-changed">${icon("refresh")}What changed from our plan, and why?</h2>
        <form data-mx="change" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Changes from the plan</legend>
          ${area("mx-change", "What changed, and why", (rec.change || {}).text, 3, 600)}
          <button type="submit" class="btn btn--ghost btn--small">${icon("check")}Save</button>${status("mx-change-status")}
        </fieldset></form>
      </section>
      <section class="block mx-sec" aria-labelledby="s-codecheck">
        <h2 id="s-codecheck">${icon("code")}Code checklist</h2>
        <form data-mx="codecheck" novalidate><fieldset class="mx-fieldset"${lock}><legend>Our code has:</legend><div class="mx-checks">
          ${[["variable", "A variable"], ["ifelse", "An if/else"], ["comments", "Comments that explain it"]].map(([id, t]) => `<label class="mx-check"><input type="checkbox" name="mx-cc" value="${id}" ${cc[id] ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div>
          <button type="submit" class="btn btn--ghost btn--small">${icon("check")}Save the checklist</button>${status("mx-cc-status")}
        </fieldset></form>
      </section>`;
    }

    if (a.moxie.kind === "testimprove") {
      const crit = (d.criteria || []).filter(clean);
      const card = rec.card || {};
      const pitch = rec.pitch || {};
      const PITCH = [["hook", "Hook (1 sentence): Have you ever…?"], ["problem", "Problem: who has it and why it matters."], ["demo", "Demo: show it working. Say what each part does."],
        ["challenge", "Challenge: the hardest bug and how you fixed it."], ["next", "Next: what you would add with more time."], ["who", "Who says what"]];
      const CARD = [["title", "Project name", 60], ["by", "Made by", 120], ["problem", "The problem", 300], ["inputs", "Inputs (what it senses)", 200], ["outputs", "Outputs (what it does)", 200], ["how", "How it works", 400], ["next", "What we would add next", 300]];
      return `
      ${mission}
      <section class="block mx-sec" aria-labelledby="s-tests">
        <h2 id="s-tests">${icon("flask")}1. Test against your criteria</h2>
        ${preview}
        ${crit.length ? `<form data-mx="tests" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Test results</legend>
          ${crit.map((c, i) => `<fieldset class="mx-group"><legend>${i + 1}. ${esc(c)}</legend>
            ${area(`mx-test-${i}`, "What happened when we tested it", (rec.tests[i] || {}).result, 2, 300)}
            ${field(`mx-met-${i}`, "Pass?", `<select id="mx-met-${i}" class="input input--small"><option value=""></option>${Object.entries(MET).map(([id, t]) => `<option value="${id}" ${(rec.tests[i] || {}).met === id ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>`)}</fieldset>`).join("")}
          <button type="submit" class="btn btn--primary">${icon("check")}Save test results</button>${status("mx-tests-status")}
        </fieldset></form>` : designSummary}
      </section>
      ${cardsBox(15)}
      <section class="block mx-sec" aria-labelledby="s-improve">
        <h2 id="s-improve">${icon("refresh")}3. Improve it</h2>
        <form data-mx="improve" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">An improvement</legend>
          ${area("mx-imp-why", "Feedback or test result we used", "", 2, 300)}
          ${area("mx-imp", "What we changed", "", 2, 300)}
          <button type="submit" class="btn btn--primary btn--small">${icon("plus")}Save the improvement</button>${status("mx-imp-status")}
        </fieldset></form>
        ${rec.improvements.length ? `<ul class="bullets">${rec.improvements.map((e) => `<li><span><strong>${esc(e.data.change)}</strong> ${e.data.why ? `(from: ${esc(e.data.why)})` : ""} <span class="muted small">${who(e, user)}</span></span></li>`).join("")}</ul>` : ""}
      </section>
      <section class="block mx-sec" aria-labelledby="s-card">
        <h2 id="s-card">${icon("flag")}4. Showcase card</h2>
        <p>${esc((S.card && S.card.text[0]) || "")}</p>
        <form data-mx="card" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Showcase card</legend>
          ${CARD.map(([k, label, max]) => (max > 200 ? area(`mx-card-${k}`, label, card[k], 2, max) : line(`mx-card-${k}`, label, k === "by" && !card.by && stu ? [user.displayName].concat(SE.store.teammates(user.id).map((m) => m.displayName)).join(" & ") : card[k], max))).join("")}
          <button type="submit" class="btn btn--primary btn--small">${icon("check")}Save the card</button>${status("mx-card-status")}
        </fieldset></form>
      </section>
      <section class="block mx-sec" aria-labelledby="s-pitch">
        <h2 id="s-pitch">${icon("message")}5. Plan your 1-minute pitch</h2>
        <form data-mx="pitch" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Pitch plan</legend>
          ${PITCH.map(([k, label]) => line(`mx-pitch-${k}`, label, pitch[k], 300)).join("")}
          <button type="submit" class="btn btn--primary btn--small">${icon("check")}Save the pitch plan</button>${status("mx-pitch-status")}
        </fieldset></form>
      </section>`;
    }

    // showcase (16)
    const reflect = stu ? latest(evs, "moxie_reflect", a.id) : null;
    const answers = (reflect && reflect.data.answers) || [];
    const ratings = (reflect && reflect.data.ratings) || {};
    const present = stu ? checklistState(evs, a, "present") : [];
    const PROMPTS = (S.reflection && S.reflection.text) || [];
    const RATE = ((S.rate && S.rate.tables[0]) || []).slice(1).map((r) => r[0]);
    return `
      ${mission}
      <section class="block mx-sec" aria-labelledby="s-present">
        <h2 id="s-present">${icon("list")}Before you present</h2>
        ${stu ? `<fieldset class="mx-checklist" data-checklist="present"><legend class="visually-hidden">Before you present</legend>
          ${(S.present || []).map((x, i) => `<label class="mx-check"><input type="checkbox" data-ci="${i}" ${present[i] ? "checked" : ""}><span>${esc(x)}</span></label>`).join("")}</fieldset>` : bullets(S.present)}
        <h3>Final project checklist</h3>
        ${stu ? missing(capstoneCheck(rec), "Your project meets every requirement. Get ready to show it!") : bullets(M.capstone.requirements)}
      </section>
      ${cardsBox(16)}
      <section class="block mx-sec" aria-labelledby="s-reflect">
        <h2 id="s-reflect">${icon("question")}My reflection</h2>
        ${preview}
        <p>This part is just yours, not your team's.</p>
        <form data-mx="reflect" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">Reflection and self-rating</legend>
          ${PROMPTS.map((p, i) => area(`mx-refl-${i}`, esc(p), answers[i], 2, 400)).join("")}
          <fieldset class="mx-group"><legend>Rate yourself: I can…</legend>
            ${RATE.map((item, i) => `<div class="mx-rate" role="radiogroup" aria-labelledby="mx-rate-${i}"><span id="mx-rate-${i}">${esc(item)}</span>
              ${[[1, "Not yet"], [2, "Getting there"], [3, "Yes!"]].map(([n, t]) => `<label class="mx-rate__opt"><input type="radio" name="mx-rate-${i}" value="${n}" ${ratings[item] === n ? "checked" : ""}><span>${t}</span></label>`).join("")}</div>`).join("")}
          </fieldset>
          <button type="submit" class="btn btn--primary">${icon("check")}Save my reflection</button>${status("mx-refl-status")}
        </fieldset></form>
      </section>`;
  }

  /* Star, Star, Wish cards: send one to another team; see the ones sent to yours. */
  function feedbackCardsSection(user, a, session, lock) {
    const stu = isStu(user);
    const S = a.moxie.sheet || {};
    const mine = stu ? SE.store.teamOf(user.id) : null;
    const teams = TEAMS_FOR(user).filter((t) => !mine || t.id !== mine.id);
    const got = stu ? SE.store.feedbackCards(user.id).filter((e) => Number(e.data.session) === session) : [];
    const sent = stu ? SE.store.eventsFor(user.id).filter((e) => e.type === "moxie_feedback_card" && Number(e.data.session) === session) : [];
    const intro = session === 15 ? ((S.peer && S.peer.text[0]) || "") : ((S.audience && S.audience.text[0]) || "");
    const stars = session === 15 ? ["Something that works really well", "Something else that's great", "A wish (one idea to make it better)"] : ["Star", "Star", "Wish"];
    return `
      <section class="block mx-sec" aria-labelledby="s-cards-${session}">
        <h2 id="s-cards-${session}">${icon("star")}${session === 15 ? "2. Peer feedback" : "Audience feedback cards"}</h2>
        <p>${esc(intro.replace(/ Cut (them|out).*$/, ""))}</p>
        ${stu ? (teams.length ? `
        <form data-mx="fbcard" data-session="${session}" novalidate><fieldset class="mx-fieldset"${lock}><legend class="visually-hidden">A feedback card</legend>
          ${field(`mx-fc-to-${session}`, "For", `<select id="mx-fc-to-${session}" class="input">${teams.map((t) => `<option value="${t.id}">${esc(t.members.join(" & "))}</option>`).join("")}</select>`)}
          ${line(`mx-fc-s1-${session}`, `⭐ ${stars[0]}`, "", 200)}
          ${line(`mx-fc-s2-${session}`, `⭐ ${stars[1]}`, "", 200)}
          ${line(`mx-fc-w-${session}`, `💡 ${stars[2]}`, "", 200)}
          <button type="submit" class="btn btn--primary btn--small">${icon("message")}Send the card</button>${status(`mx-fc-status-${session}`)}
        </fieldset></form>` : `<p class="muted">There are no other teams in your class yet. Your teacher makes the teams.</p>`) : `<p class="muted">Students send cards to other teams in their class, and see the cards sent to them.</p>`}
        ${sent.length ? `<h3>Cards you sent (${sent.length})</h3><ul class="mx-cards">${sent.map((e) => cardHtml(e, `For ${esc(e.data.toNames || "a team")}`)).join("")}</ul>` : ""}
        ${stu ? `<h3>Cards for your team (${got.length})</h3>${got.length ? `<ul class="mx-cards">${got.map((e) => cardHtml(e, `From ${esc(e.data.fromNames || "a classmate")}`)).join("")}</ul>` : `<p class="muted small">None yet.${SE.store.mode === "cloud" ? " Press See my partner's latest to check again." : ""}</p>`}` : ""}
      </section>`;
  }
  const cardHtml = (e, head) => `<li class="mx-card"><p class="mx-card__head">${head}</p><p>⭐ ${esc(e.data.star1 || "")}</p><p>⭐ ${esc(e.data.star2 || "")}</p><p>💡 ${esc(e.data.wish || "")}</p></li>`;

  function teamPanel(user) {
    const mates = SE.store.teammates(user.id);
    return `
      <p class="mx-team">${icon("users")}<span>${mates.length
        ? `<strong>Your team:</strong> you and ${esc(mates.map((m) => m.displayName).join(" and "))}. You share one design, build log, and test results.`
        : "Your teacher hasn't put you on a team yet. You can still start; your partner sees shared work once you're on a team."}</span>
        ${SE.store.mode === "cloud" && mates.length ? `<button type="button" class="btn btn--ghost btn--small" id="mx-refresh">${icon("refresh")}See my partner's latest</button>` : ""}</p>`;
  }

  /* A clean paper version of the sheet, built from the same data (blanks print as lines). */
  function printSheet(a) {
    const m = a.moxie, S = m.sheet || {};
    const line = '<span class="mx-pl">&nbsp;</span>';
    const list = (xs, box) => (xs && xs.length ? `<ul class="${box ? "mx-pbox" : ""}">${xs.map((x) => `<li>${box ? "☐ " : ""}${esc(x)}</li>`).join("")}</ul>` : "");
    const tbl = (t) => tableHtml(t, "Table");
    const h = (t) => `<h3>${esc(t)}</h3>`;
    const code = a.code ? `<pre class="mx-pcode">${esc(a.code.lines.join("\n"))}</pre>${a.code.remember ? `<p><em>${esc(a.code.remember)}</em></p>` : ""}` : "";
    return `
      <header class="mx-phead"><p>${esc(m.unitLabel || `SESSION ${m.session}`)}</p><h1>${esc(a.title)}</h1>${m.based ? `<p>${esc(m.based)}</p>` : ""}
        <p class="mx-pnames">Name: ${line} Partner: ${line} ${m.kind === "build" ? "Kit #:" : "Project:"} ${line}</p></header>
      ${h("Your mission")}<p>${esc(a.mission)}</p>
      ${m.kind === "build" ? `
        ${h("What you need")}${list(a.before.materials)}
        ${h(m.setupTitle || "Before you wire")}${list(a.before.setup)}
        ${m.board ? `${h("Meet your ESP32")}<img src="${esc(m.board.src)}" alt="${esc(m.board.alt)}">` : ""}
        ${a.steps.length ? `${h("Connect it")}<ol>${a.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
        ${a.diagram ? `${h("Build it")}<img src="${esc(a.diagram.src)}" alt="${esc(a.diagram.alt)}">${(m.buildNotes || []).map((x) => `<p>${esc(x)}</p>`).join("")}${a.wiring ? tbl([a.wiring.head].concat(a.wiring.rows)) : ""}` : ""}
        ${m.concept ? `${h(sentence(m.concept.title))}${m.concept.text.map((x) => `<p>${esc(x)}</p>`).join("")}${m.concept.tables.map(tbl).join("")}` : ""}
        ${m.planSheet ? `${h(sentence(m.planSheet.title))}${m.planSheet.text.map((x) => `<p>${esc(x)}</p>`).join("")}${m.planSheet.tables.map(tbl).join("")}` : ""}
        ${h("Code it")}${a.code && a.code.intro ? `<p>${esc(a.code.intro)}</p>` : ""}${code}
        ${h("Test it")}${list(a.tests, true)}
        ${h("Stuck? Check these first")}${list(a.stuck)}
        ${a.stretch ? `${h("Stretch goal")}<p>${esc(a.stretch)}</p>${m.stretchHint ? `<p><em>Hint: ${esc(m.stretchHint)}</em></p>` : ""}` : ""}
        ${m.think ? `${h("Think about it")}<p>${esc(m.think)}</p><p>${line}</p><p>${line}</p>` : ""}`
      : `${Object.entries(S).filter(([k, v]) => v && typeof v === "object" && !Array.isArray(v) && v.heading).map(([, v]) => `${h(sentence(v.heading))}${v.text.map((x) => `<p>${esc(x)}</p>`).join("")}${v.tables.map(tbl).join("")}`).join("")}
         ${["mustHave", "constraints", "tips", "present"].filter((k) => S[k] && S[k].length).map((k) => list(S[k], k === "present")).join("")}`}
      ${h("Checkoff: before you call the instructor over")}${list(m.checkoff, true)}
      ${a.check ? `<p><strong>Be ready to explain:</strong> ${esc(a.check)}</p>` : ""}
      <p class="mx-psign">${(m.signoffs || []).map((s) => `☐ ${esc(s)} &nbsp; Initials / date: ${line}`).join("<br>")}</p>`;
  }

  /* ───────── Student saves ───────── */
  const val = (f, id) => (f.querySelector(`#${id}`) || {}).value || "";
  const chk = (f, id) => !!(f.querySelector(`#${id}`) || {}).checked;
  const SAVE = {
    kit: (f) => ["moxie_kit", { kit: val(f, "mx-kit").trim().slice(0, 12) }, "mx-kit-status", "Kit number saved."],
    plan: (f) => { const lines = [...f.querySelectorAll("[data-plan]")].map((x) => x.value.trim().slice(0, 200)); return lines.some(clean) ? ["moxie_plan", { lines, text: lines.filter(clean).map((x, i) => `${i + 1}. ${x}`).join("\n") }, "mx-plan-status", "Plan saved."] : "Write at least one step of your plan."; },
    observe: (f) => clean(val(f, "mx-observe")) ? ["moxie_observe", { text: val(f, "mx-observe").trim().slice(0, 800) }, "mx-observe-status", "Notes saved."] : "Write what happened first.",
    think: (f) => clean(val(f, "mx-think")) ? ["moxie_think", { text: val(f, "mx-think").trim().slice(0, 600) }, "mx-think-status", "Answer saved."] : "Write your answer first.",
    design: (f) => ["moxie_design", {
      problem: val(f, "mx-problem").trim().slice(0, 400), user: val(f, "mx-user").trim().slice(0, 160), device: val(f, "mx-device").trim().slice(0, 200),
      criteria: [0, 1, 2].map((i) => val(f, `mx-crit-${i}`).trim().slice(0, 160)), tests: [0, 1, 2].map((i) => val(f, `mx-how-${i}`).trim().slice(0, 160)),
      parts: Array.from({ length: 6 }, (_, i) => ({ part: val(f, `mx-pp-${i}`).trim().slice(0, 60), io: val(f, `mx-pio-${i}`), pin: val(f, `mx-ppin-${i}`).trim().slice(0, 12), session: val(f, `mx-pses-${i}`).trim().slice(0, 4) })).filter((p) => clean(p.part) || clean(p.pin)),
      inputs: [...f.querySelectorAll("input[name=mx-in]:checked")].map((x) => x.value),
      outputs: [...f.querySelectorAll("input[name=mx-out]:checked")].map((x) => x.value),
      sketched: chk(f, "mx-sketch"), pseudocode: val(f, "mx-pseudo").trim().slice(0, 1500)
    }, "mx-design-status", "Design saved. Check the list below."],
    standup: (f) => { const n = Number(f.dataset.session); const d = { session: n, done: val(f, `mx-su-done-${n}`).trim().slice(0, 300), today: val(f, `mx-su-today-${n}`).trim().slice(0, 300), blocking: val(f, `mx-su-block-${n}`).trim().slice(0, 300) };
      return clean(d.done + d.today + d.blocking) ? ["moxie_standup", d, `mx-su-status-${n}`, `Session ${n} stand-up saved.`] : "Answer at least one stand-up question."; },
    subsystems: (f) => ["moxie_subsystem", { rows: Array.from({ length: 6 }, (_, i) => ({ part: val(f, `mx-ss-${i}`).trim().slice(0, 60), wired: chk(f, `mx-ss-wired-${i}`), alone: chk(f, `mx-ss-alone-${i}`), added: chk(f, `mx-ss-added-${i}`), notes: val(f, `mx-ssn-${i}`).trim().slice(0, 120) })).filter((r) => clean(r.part)) }, "mx-ss-status", "Subsystem checklist saved."],
    buglog: (f) => clean(val(f, "mx-log-what")) ? ["moxie_buglog", { kind: "bug", what: val(f, "mx-log-what").trim().slice(0, 400), result: val(f, "mx-log-result").trim().slice(0, 400), fixed: chk(f, "mx-log-fixed") }, "mx-log-status", "Added to the bug log."] : "Write what went wrong.",
    change: (f) => clean(val(f, "mx-change")) ? ["moxie_change", { text: val(f, "mx-change").trim().slice(0, 600) }, "mx-change-status", "Saved."] : "Write what changed and why.",
    codecheck: (f) => ["moxie_codecheck", Object.fromEntries(["variable", "ifelse", "comments"].map((k) => [k, !!f.querySelector(`input[name=mx-cc][value=${k}]:checked`)])), "mx-cc-status", "Checklist saved."],
    improve: (f) => clean(val(f, "mx-imp")) ? ["moxie_improve", { change: val(f, "mx-imp").trim().slice(0, 300), why: val(f, "mx-imp-why").trim().slice(0, 300) }, "mx-imp-status", "Improvement saved."] : "Write what you changed.",
    card: (f) => clean(val(f, "mx-card-title")) ? ["moxie_card", Object.fromEntries(["title", "by", "problem", "inputs", "outputs", "how", "next"].map((k) => [k, val(f, `mx-card-${k}`).trim().slice(0, 400)])), "mx-card-status", "Showcase card saved."] : "Give your project a name first.",
    pitch: (f) => { const d = Object.fromEntries(["hook", "problem", "demo", "challenge", "next", "who"].map((k) => [k, val(f, `mx-pitch-${k}`).trim().slice(0, 300)])); return clean(Object.values(d).join("")) ? ["moxie_pitch", d, "mx-pitch-status", "Pitch plan saved."] : "Write at least one part of your pitch."; },
    fbcard: (f) => {
      const n = Number(f.dataset.session), user = SE.store.currentUser();
      const to = val(f, `mx-fc-to-${n}`), t = SE.store.classTeams(user.id).find((x) => x.id === to);
      const d = { session: n, toTeam: to, toNames: t ? t.members.join(" & ") : "", star1: val(f, `mx-fc-s1-${n}`).trim().slice(0, 200), star2: val(f, `mx-fc-s2-${n}`).trim().slice(0, 200), wish: val(f, `mx-fc-w-${n}`).trim().slice(0, 200),
        fromNames: [user.displayName].concat(SE.store.teammates(user.id).map((x) => x.displayName)).join(" & ") };
      if (!to) return "Pick the team the card is for.";
      if (!clean(d.star1) || !clean(d.wish)) return "Write at least one star and a wish.";
      return ["moxie_feedback_card", d, `mx-fc-status-${n}`, `Card sent to ${d.toNames}.`];
    },
    reflect: (f) => {
      const S = (SE.activityById["moxie-16"].moxie.sheet) || {};
      const prompts = (S.reflection && S.reflection.text) || [];
      const rate = ((S.rate && S.rate.tables[0]) || []).slice(1).map((r) => r[0]);
      const answers = prompts.map((_, i) => val(f, `mx-refl-${i}`).trim().slice(0, 400));
      if (!answers.some(clean)) return "Answer at least one reflection question.";
      return ["moxie_reflect", { answers, text: prompts.map((p, i) => (clean(answers[i]) ? `${p} ${answers[i]}` : "")).filter(Boolean).join("\n"),
        ratings: Object.fromEntries(rate.map((item, i) => [item, Number((f.querySelector(`input[name=mx-rate-${i}]:checked`) || {}).value) || null]).filter(([, n]) => n)) }, "mx-refl-status", "Reflection saved."];
    }
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
        if (!n) { f.querySelector(".mx-status").textContent = "Write what happened for at least one criterion."; return; }
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
    app().querySelectorAll("[data-checklist]").forEach((fs) => fs.addEventListener("change", () => {
      SE.store.log("moxie_checklist", { activityId: a.id, v: a.version, list: fs.dataset.checklist, items: [...fs.querySelectorAll("input[data-ci]")].map((x) => x.checked) });
    }));
    // Code blanks: save, copy, download.
    if (a.code) {
      const model = codeModel(a.code.lines);
      const values = () => { const v = []; app().querySelectorAll("[data-blank]").forEach((x) => { v[Number(x.dataset.blank)] = x.value; }); return v; };
      const out = document.getElementById("mx-code-status");
      const note = (v) => { const e = emptyBlankLines(model, v); return e.length ? ` ${plural(e.length, "line still has", "lines still have")} an empty blank: ${e.join(", ")}.` : ""; };
      const save = () => { const v = values(); SE.store.log("moxie_code", { activityId: a.id, v: a.version, blanks: v.map((x) => String(x || "").slice(0, 80)) }); return v; };
      document.getElementById("mx-code-save").addEventListener("click", () => { const v = save(); out.textContent = `Code saved.${note(v)}`; });
      document.getElementById("mx-code-copy").addEventListener("click", async () => {
        const v = save(), text = filledCode(model, v);
        try { await navigator.clipboard.writeText(text); out.textContent = `Copied. Paste it into the Arduino IDE.${note(v)}`; }
        catch (err) { out.textContent = `Your browser blocked copying. Use Download .ino instead.${note(v)}`; }
      });
      document.getElementById("mx-code-dl").addEventListener("click", () => {
        const v = save(), blob = new Blob([filledCode(model, v) + "\n"], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Session_${String(a.moxie.session).padStart(2, "0")}_${a.title.replace(/[^A-Za-z0-9]+/g, "_").replace(/_+$/, "")}.ino`;
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        out.textContent = `Downloaded.${note(v)}`;
      });
    }
    const refresh = document.getElementById("mx-refresh");
    if (refresh) refresh.addEventListener("click", async () => { refresh.disabled = true; await SE.store.refreshTeam(); rerender("mx-refresh", ""); SE.toast("Up to date with your partner's work"); });
  }

  /* What a teacher sees with a Moxie answer in Checks: the student's code blanks, Think about it, and checklists. */
  SE.moxie.checkDetails = function (studentId, a) {
    const evs = work(studentId);
    const code = latestFor(evs, "moxie_code", a);
    const think = latestFor(evs, "moxie_think", a);
    const list = checklistState(evs, a, "checkoff");
    const items = a.moxie.checkoff || [];
    const parts = [];
    if (a.code) {
      const model = codeModel(a.code.lines);
      const v = (code && code.data.blanks) || [];
      parts.push(`<details class="mx-check-code"><summary>Their code (${v.filter(clean).length} of ${model.count} blanks filled)</summary>
        <pre class="mx-code"><code>${model.lines.map((ln) => ln.segs.map((s) => (typeof s === "string" ? esc(s) : `<mark>${esc((v[s.b] || "").trim() || "____")}</mark>`)).join("")).join("\n")}</code></pre></details>`);
    }
    if (think) parts.push(`<p class="small"><strong>Think about it:</strong> “${esc(think.data.text)}”</p>`);
    if (items.length) parts.push(`<p class="small"><strong>Checkoff list:</strong> ${list.filter(Boolean).length} of ${items.length} checked${items.some((_, i) => !list[i]) ? ` (not yet: ${esc(items.filter((_, i) => !list[i]).join("; "))})` : ""}</p>`);
    return parts.join("");
  };

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
            <h3>Chromebooks</h3>
            <p>Uploading to an ESP32 needs the Arduino IDE on Windows, macOS, or Linux. On ChromeOS, Arduino's Cloud Editor lists only Arduino-brand boards, and the IDE runs only if your IT team turns on Linux. Until you've tested your own setup (validation item 16), use an <strong>upload station</strong>: students fill in their code on their Chromebooks, then use Copy my code or Download .ino, and you upload from one class laptop.</p>
            <h3>Teacher kit</h3>
            <p>The student sheets are on each session page (Print this sheet makes a paper copy). Answer sketches and solutions are in the private Moxie teacher kit, not on this site.</p>
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

      <section class="wrap section" aria-labelledby="mx-grid">
        <div class="section__head"><div><span class="eyebrow">${esc(cls.name)}</span><h2 id="mx-grid">Checkoffs</h2></div>
          <p>Core challenge is your Pass in Checks. Press ★ to mark a stretch goal done.</p></div>
        ${checkoffGrid(students)}
      </section>

      <section class="wrap section" aria-labelledby="mx-review">
        <div class="section__head"><div><span class="eyebrow">Gates, capstone, and feedback</span><h2 id="mx-review">Review</h2></div></div>
        ${groups.length ? groups.map((g) => reviewCard(g)).join("") : `<p class="muted">No Moxie work in this class yet.</p>`}
      </section>` : `<p class="wrap muted">Create a class on the educator dashboard to pair students and review work.</p>`}`;
    bindTeach(user, cls);
  };

  /* One row per student, one column per session: Passed / Sent / Try again, plus the stretch star. */
  function checkoffGrid(students) {
    if (!students.length) return `<p class="muted">No students in this class yet.</p>`;
    const SHORT = { confirmed: ["✓", "Passed"], submitted: ["•", "Sent"], tryagain: ["↻", "Try again"], started: ["…", "In progress"] };
    return `<div class="table-wrap"><table class="roster mx-grid">
      <caption class="visually-hidden">Moxie checkoffs by student and session</caption>
      <thead><tr><th scope="col">Student</th>${sessions().map((s) => `<th scope="col"><abbr title="${esc(s.title)}">${s.moxie.session}</abbr></th>`).join("")}</tr></thead>
      <tbody>${students.map((st) => {
        const prof = SE.game.profile(st.id), evs = work(st.id);
        return `<tr><th scope="row">${esc(st.displayName)}</th>${sessions().map((s) => {
          const state = SE.game.statusFor(prof, s).state, sh = SHORT[state];
          const star = s.moxie.gates.includes("stretch") ? gateOpen(evs, s.id, "stretch") : null;
          return `<td class="mx-grid__cell mx-grid__cell--${state}">${sh ? `<span title="${sh[1]}"><span aria-hidden="true">${sh[0]}</span><span class="visually-hidden">${sh[1]}</span></span>` : `<span class="visually-hidden">Not started</span>`}
            ${star !== null && state === "confirmed" ? `<button type="button" class="mx-star ${star ? "is-on" : ""}" data-gate="${s.id}|stretch|${star ? 0 : 1}" data-students="${st.id}" aria-pressed="${star}" aria-label="Stretch goal, ${esc(st.displayName)}, session ${s.moxie.session}">★</button>` : ""}</td>`;
        }).join("")}</tr>`;
      }).join("")}</tbody></table></div>
      <p class="muted small">✓ Passed · • Sent, waiting for your check · ↻ Try again · … In progress · ★ Stretch goal done</p>`;
  }

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
          <p class="mx-gates">${gateBtn("moxie-13", "design", g.ids, rec.designApproved)}${gateBtn("moxie-14", "subsystem", g.ids, rec.subsystemDemo)}${gateBtn("moxie-15", "card", g.ids, rec.cardChecked)}${gateBtn("moxie-16", "pitch", g.ids, rec.pitched)}</p>
          <p><strong>Bug log:</strong> ${plural(rec.bugs.length, "entry", "entries")} · <strong>Feedback cards:</strong> ${rec.cards.length + rec.feedback.length} · <strong>Improvements:</strong> ${rec.improvements.map((e) => esc(e.data.change)).join("; ") || "none yet"}</p>
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
