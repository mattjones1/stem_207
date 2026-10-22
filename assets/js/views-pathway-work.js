/*
 * STEM 207 — pathway evidence, portfolio, and review (categories-pathways Phase 4).
 *
 *   #/my/pathways/<assignmentId>          a student's assigned pathway: steps, evidence, synthesis
 *   #/teach/pathways/<id>/review          the teacher's grid (students × steps) and each student's work
 *   Today (class side)                    a card per assigned pathway; "revise" requests come first
 *
 * Events (all carry assignmentId, stepId, and v = the assigned pathway version):
 *   pathway_evidence   { mode: written | show, text, missionVersion }   student, individual
 *   pathway_synthesis  { text }                                          student, individual
 *   pathway_artifact   { text, link }                                    student, shared with teammates (TEAM_TYPES)
 *   pathway_review     { decision: accepted | revise, criteria, note }   teacher
 *   pathway_observation { note }                                         teacher
 * Launching or opening a mission never counts as evidence. Mission status (the mission's own debrief and
 * checks) is shown next to pathway evidence but kept separate: participation, submission, mission
 * completion, and demonstrated skill are different things. Pure rules: SE.pathwayWork.*.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc, plural } = SE;
  const app = () => document.getElementById("app");

  /* ───────── Rules (pure, for tests) ───────── */
  const SENT = ["pathway_evidence", "pathway_synthesis"];
  const LABEL = { none: "Not started", sent: "Sent", accepted: "Accepted", revise: "Revise" };
  const MISSION = { none: "Not started", started: "Started", submitted: "Sent", checked: "Checked in lab", tryagain: "Try again", confirmed: "Teacher confirmed" };

  /* One step's state for one student. A review counts only if it is newer than the latest evidence. */
  function stepState(evs, assignmentId, stepId) {
    const mine = evs.filter((e) => e.data && e.data.assignmentId === assignmentId && e.data.stepId === stepId);
    const last = (pred) => mine.filter(pred).pop() || null;
    const sent = last((e) => SENT.includes(e.type));
    const review = last((e) => e.type === "pathway_review");
    let state = "none";
    if (review && (!sent || review.at >= sent.at)) state = review.data.decision === "accepted" ? "accepted" : "revise";
    else if (sent) state = "sent";
    return { state, label: LABEL[state], sent, review, artifact: last((e) => e.type === "pathway_artifact"), observations: mine.filter((e) => e.type === "pathway_observation") };
  }

  /* A student's events plus their teammates' shared artifacts. */
  const workFor = (studentId) => SE.store.eventsFor(studentId).concat(SE.store.teamEvents(studentId)).sort((a, b) => a.at - b.at);

  /* Progress through an assigned pathway: per-step states, counts, and where to resume. */
  function progress(asg, evs) {
    const steps = (asg.snapshot ? asg.snapshot.steps : []).map((s, i) => ({ step: s, n: i + 1, ...stepState(evs, asg.id, s.id) }));
    const req = steps.filter((x) => x.step.required);
    const resume = steps.find((x) => x.state === "revise") || steps.find((x) => x.step.required && x.state === "none") || steps.find((x) => x.state === "none") || null;
    return {
      steps, resume,
      accepted: req.filter((x) => x.state === "accepted").length,
      sent: req.filter((x) => x.state !== "none").length,
      required: req.length,
      revise: steps.filter((x) => x.state === "revise")
    };
  }

  /* The newer library version of a step's mission, if it changed after the pathway was published. */
  const updated = (step) => {
    const a = step.kind === "mission" ? SE.activityById[step.activityId] : null;
    return a && step.missionVersion && SE.content.version(a) !== step.missionVersion ? a : null;
  };

  SE.pathwayWork = { stepState, progress, workFor, updated, LABEL };

  /* Teacher timeline lines for these events (views-teacher.js describe()). */
  SE.pathwayWork.describe = function (e, who) {
    const D = {
      pathway_evidence: ["check", `${who}sent pathway evidence${e.data.mode === "show" ? " (will show the teacher)" : ""}`],
      pathway_synthesis: ["flag", `${who}sent a pathway synthesis`],
      pathway_artifact: ["box", `${who}saved a team artifact for a pathway step`],
      pathway_review: ["shield", `Teacher ${e.data.decision === "accepted" ? "accepted" : "asked for a revision on"} a pathway step`],
      pathway_observation: ["eye", "Teacher added a pathway observation"]
    }[e.type];
    return D ? { icon: D[0], text: D[1] } : null;
  };

  /* ───────── Shared pieces ───────── */
  const stateChip = (st) => `<span class="pwk-state pwk-state--${st}">${icon(st === "accepted" ? "check" : st === "revise" ? "refresh" : st === "sent" ? "clock" : "list")}${esc(LABEL[st])}</span>`;
  const stepTitle = (s) => (s.kind === "synthesis" ? "Synthesis" : (SE.activityById[s.activityId] || {}).title || "Mission");
  const evidencePrompt = (s) => {
    if (s.kind === "synthesis") return s.prompt || "";
    const a = SE.activityById[s.activityId];
    return s.evidence || (a && (a.check || a.reflect)) || "";
  };
  const safeLink = (u) => (/^https:\/\/[^\s<>"]+$/.test(u || "") ? u : "");
  function rerender(focusId, msg) {
    const y = window.scrollY;
    SE.route(true);
    window.scrollTo(0, y);
    const el = focusId && document.getElementById(focusId);
    if (el) { if (msg) el.textContent = msg; if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
    else if (msg) SE.toast(msg);
  }

  /* ───────── Today: one card per assigned pathway (class side) ───────── */
  SE.pathwayToday = function (user) {
    if (!user || user.role !== "student" || !user.classId) return "";
    const list = SE.store.pathwayAssignmentsFor(user.classId).filter((a) => a.snapshot);
    if (!list.length) return "";
    const evs = workFor(user.id);
    return list.map((asg) => {
      const pr = progress(asg, evs);
      const r = pr.revise[0];
      return `
        <article class="pwk-today" aria-labelledby="pwk-t-${asg.id}">
          <span class="today-card__why">${icon("map")}Pathway from your teacher${asg.dueDate ? ` · ${esc(SE.dueText(asg.dueDate))}` : ""}</span>
          <h3 id="pwk-t-${asg.id}">${esc(asg.snapshot.title)}</h3>
          ${r ? `<p class="today-card__retry">${icon("refresh")}<span><strong>Revise step ${r.n}:</strong> ${esc(stepTitle(r.step))}${r.review.data.note ? ` · “${esc(r.review.data.note)}”` : ""}</span></p>` : ""}
          <p>${pr.accepted} of ${pr.required} required steps accepted${pr.resume ? ` · Next: step ${pr.resume.n}, ${esc(stepTitle(pr.resume.step))}` : ""}</p>
          <a class="btn btn--launch" href="#/my/pathways/${asg.id}${pr.resume ? `#step-${pr.resume.n}` : ""}">${icon("arrowRight")}${pr.sent ? "Continue" : "Start"}<span class="visually-hidden">: ${esc(asg.snapshot.title)}</span></a>
        </article>`;
    }).join("");
  };

  /* ───────── Student: #/my/pathways/<assignmentId> ───────── */
  SE.views.myPathway = function (user, assignmentId) {
    const asg = SE.store.pathwayAssignmentsFor(user.classId).find((a) => a.id === assignmentId);
    if (!asg || !asg.snapshot) return SE.views.notFound();
    const snap = asg.snapshot;
    const evs = workFor(user.id);
    const pr = progress(asg, evs);
    const prof = SE.game.profile(user.id);
    const mates = SE.store.teammates(user.id);
    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink()}</div>
          <div class="page-top__head"><span class="icon-badge">${icon("map")}</span>
            <div><span class="eyebrow">Pathway from your teacher</span><h1 tabindex="-1">${esc(snap.title)}</h1></div></div>
          <p class="page-top__lede">${esc(snap.goal)}</p>
          ${pr.resume ? `<a class="btn btn--launch" href="#/my/pathways/${asg.id}#step-${pr.resume.n}">${icon("arrowRight")}${pr.sent ? "Continue" : "Start"} with step ${pr.resume.n}</a>` : ""}
        </div>
      </section>
      <div class="wrap section">
        <dl class="facts pwk-facts">
          <div><dt>You'll make</dt><dd>${esc(snap.finalProduct)}</dd></div>
          ${snap.essentialQuestion ? `<div><dt>Big question</dt><dd>${esc(snap.essentialQuestion)}</dd></div>` : ""}
          <div><dt>Progress</dt><dd>${pr.accepted} of ${pr.required} required steps accepted</dd></div>
        </dl>
        ${pr.revise.length ? `<p class="pwk-banner">${icon("refresh")}<span><strong>Your teacher asked you to revise:</strong> ${pr.revise.map((x) => `<a href="#/my/pathways/${asg.id}#step-${x.n}">step ${x.n}</a>`).join(", ")}.</span></p>` : ""}
      </div>
      <ol class="wrap pwk-steps">${pr.steps.map((x) => studentStep(user, asg, x, prof, mates)).join("")}</ol>`;
    bindStudent(user, asg);
  };

  function studentStep(user, asg, x, prof, mates) {
    const s = x.step, a = s.kind === "mission" ? SE.activityById[s.activityId] : null;
    const ms = a && SE.content.visibleTo(a, user) ? SE.game.statusFor(prof, a) : null;
    const newer = updated(s);
    const sid = s.id;
    const synth = s.kind === "synthesis";
    return `
      <li class="block pwk-step ${s.required ? "" : "pwk-step--optional"}" id="step-${x.n}" aria-labelledby="pwk-h-${sid}">
        <div class="pwk-step__head">
          <span class="pw-step__n" aria-hidden="true">${x.n}</span>
          <h2 id="pwk-h-${sid}"><span class="visually-hidden">Step ${x.n}: </span>${s.label ? `<span class="pw-step__label">${esc(s.label)}</span> ` : ""}${esc(stepTitle(s))}</h2>
          ${stateChip(x.state)}${s.required ? "" : ` <span class="chip chip--soon">Optional</span>`}
        </div>
        ${s.bridge ? `<p class="pw-step__bridge">${icon("arrowRight")}<span>${esc(s.bridge)}</span></p>` : ""}
        ${s.adaptation ? `<p class="pwk-note">${icon("clipboard")}<span><strong>From your teacher:</strong> ${esc(s.adaptation)}</span></p>` : ""}
        ${a ? `<p class="pwk-mission">${SE.content.visibleTo(a, user) ? `<a class="btn btn--ghost btn--small" href="#/activity/${a.id}">${icon("rocket")}Open the mission<span class="visually-hidden">: ${esc(a.title)}</span></a>` : ""}
          <span class="muted small">${a.duration || a.time ? SE.timeText(a) : ""}${ms ? ` · Mission: ${esc(MISSION[ms.state] || ms.label)}` : ""}</span></p>` : ""}
        ${newer ? `<p class="small">${icon("alert")} This mission was updated after your teacher assigned it. Follow the mission page as it is now.</p>` : ""}
        ${x.state === "revise" && x.review.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(x.review.data.note)}</span></p>` : ""}
        ${x.state === "accepted" && x.review.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(x.review.data.note)}</span></p>` : ""}
        <p class="pwk-prompt"><strong>${synth ? "Your task" : "Show what you learned"}:</strong> ${esc(evidencePrompt(s))}</p>
        ${x.sent ? `<blockquote class="your-answer"><span>What you sent${x.sent.data.mode === "show" ? " (you'll show your teacher)" : ""}</span>${esc(x.sent.data.text || "")}</blockquote>` : ""}
        ${x.state !== "accepted" ? `
        <form class="pwk-form" data-send="${sid}" novalidate>
          ${synth ? "" : `<fieldset class="evidence"><legend>How will you show it?</legend>
            <label class="evidence__opt"><input type="radio" name="pwk-mode-${sid}" value="written" checked><span>${icon("message")}Write it here</span></label>
            <label class="evidence__opt"><input type="radio" name="pwk-mode-${sid}" value="show"><span>${icon("users")}Show or tell my teacher</span></label></fieldset>`}
          <label for="pwk-text-${sid}">${synth ? "Your synthesis" : "Your evidence"}</label>
          <textarea id="pwk-text-${sid}" rows="${synth ? 5 : 3}" maxlength="${synth ? 1500 : 800}"></textarea>
          <p class="field-help">Don't include personal details like your full name, address, or phone number.</p>
          <button type="submit" class="btn btn--primary">${icon("check")}${x.sent ? "Send again" : "Send"}</button>
          <p class="mx-status" id="pwk-status-${sid}" role="status" aria-live="polite"></p>
        </form>` : ""}
        ${mates.length ? `
        <details class="pwk-team" ${x.artifact ? "open" : ""}>
          <summary>Team artifact, shared with ${esc(mates.map((m) => m.displayName).join(" and "))}</summary>
          ${x.artifact ? `<p>${esc(x.artifact.data.text || "")}${safeLink(x.artifact.data.link) ? ` <a href="${esc(x.artifact.data.link)}" target="_blank" rel="noopener noreferrer">Open the link<span class="visually-hidden"> (opens in a new tab)</span></a>` : ""} <span class="muted small">(${x.artifact.studentId === user.id ? "you" : esc((mates.find((m) => m.id === x.artifact.studentId) || {}).displayName || "partner")}, ${SE.dateShort(x.artifact.at)})</span></p>` : ""}
          <form class="pwk-form" data-artifact="${sid}" novalidate>
            <label for="pwk-art-${sid}">Describe what your team made</label>
            <textarea id="pwk-art-${sid}" rows="2" maxlength="400"></textarea>
            <label for="pwk-link-${sid}">Link to it (optional, https)</label>
            <input id="pwk-link-${sid}" class="input" maxlength="300" placeholder="https://">
            <button type="submit" class="btn btn--ghost btn--small">${icon("box")}Save team artifact</button>
            <p class="mx-status" id="pwk-astatus-${sid}" role="status" aria-live="polite"></p>
          </form>
        </details>` : ""}
      </li>`;
  }

  function bindStudent(user, asg) {
    const stepById = (id) => asg.snapshot.steps.find((s) => s.id === id);
    app().querySelectorAll("form[data-send]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = stepById(f.dataset.send);
      const text = document.getElementById(`pwk-text-${s.id}`).value.trim();
      const modeEl = f.querySelector(`input[name="pwk-mode-${s.id}"]:checked`);
      const mode = s.kind === "synthesis" ? "written" : (modeEl ? modeEl.value : "written");
      if (mode === "written" && !/[a-z0-9]/i.test(text)) { document.getElementById(`pwk-status-${s.id}`).textContent = "Write your answer first, or choose “Show or tell my teacher.”"; return; }
      const base = { assignmentId: asg.id, stepId: s.id, v: asg.version };
      if (s.kind === "synthesis") SE.store.log("pathway_synthesis", { ...base, text: text.slice(0, 1500) });
      else SE.store.log("pathway_evidence", { ...base, mode, text: text.slice(0, 800), missionVersion: s.missionVersion || null });
      rerender(`step-${asg.snapshot.steps.indexOf(s) + 1}`, null);
      SE.toast("Sent to your teacher");
    }));
    app().querySelectorAll("form[data-artifact]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = stepById(f.dataset.artifact);
      const text = document.getElementById(`pwk-art-${s.id}`).value.trim(), link = document.getElementById(`pwk-link-${s.id}`).value.trim();
      const out = document.getElementById(`pwk-astatus-${s.id}`);
      if (!/[a-z0-9]/i.test(text)) { out.textContent = "Describe what your team made first."; return; }
      if (link && !safeLink(link)) { out.textContent = "Links must start with https://"; return; }
      SE.store.log("pathway_artifact", { assignmentId: asg.id, stepId: s.id, v: asg.version, text: text.slice(0, 400), link: link || null });
      rerender(`pwk-astatus-${s.id}`, "Team artifact saved. Your teammates can see it.");
    }));
  }

  /* ───────── Teacher review: #/teach/pathways/<id>/review ───────── */
  let openStudent = null;

  SE.views.pathwayReview = function (user, p) {
    const { classes, cls } = SE.teachClass(user);
    const asg = cls ? SE.store.pathwayAssignmentsFor(cls.id).find((a) => a.pathwayId === p.id) : null;
    const back = `<div class="backbar pw-back">${SE.backLink(`#/teach/pathways/${p.id}`, p.title)}</div>`;
    if (!asg || !asg.snapshot) {
      app().innerHTML = SE.teachFrame(user, cls, classes, "pathways", `<section class="wrap section">${back}<div class="empty">${icon("map")}<h2 tabindex="-1">Not assigned to this class</h2><p>Assign a published version to review students' work.</p></div></section>`);
      return SE.teachBindFrame(user);
    }
    const students = SE.store.studentsIn(cls.id);
    const rows = students.map((st) => ({ st, pr: progress(asg, workFor(st.id)) }));
    if (openStudent && !students.some((s) => s.id === openStudent)) openStudent = null;
    const steps = asg.snapshot.steps;
    const col = (i) => rows.map((r) => r.pr.steps[i].state);
    const body = `
      <section class="wrap section" aria-labelledby="pwk-review-h">
        ${back}
        <div class="section__head"><div><span class="eyebrow">Review · version ${asg.version}${asg.version < p.version ? ` (latest is v${p.version})` : ""}</span>
          <h2 id="pwk-review-h" tabindex="-1">${esc(asg.snapshot.title)}</h2></div>
          <p class="muted">Sent means a student turned in evidence. Accepted means you checked it shows the goal. Mission checks are separate.</p></div>
        <div class="table-wrap"><table class="roster pwk-grid">
          <caption class="visually-hidden">Each student's state on each step</caption>
          <thead><tr><th scope="col">Student</th>${steps.map((s, i) => `<th scope="col"><span class="visually-hidden">Step </span>${i + 1}<small>${esc(stepTitle(s))}</small><small>${col(i).filter((x) => x !== "none").length} sent · ${col(i).filter((x) => x === "accepted").length} accepted</small></th>`).join("")}</tr></thead>
          <tbody>${rows.map(({ st, pr }) => `<tr>
            <th scope="row"><button type="button" class="link-btn" data-open="${st.id}" aria-pressed="${openStudent === st.id}">${esc(st.displayName)}</button><small>${pr.accepted} of ${pr.required} accepted</small></th>
            ${pr.steps.map((x) => `<td>${stateChip(x.state)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table></div>
      </section>
      ${openStudent ? portfolio(students.find((s) => s.id === openStudent), asg) : `<p class="wrap muted">Choose a student's name to see their work and review it.</p>`}`;
    app().innerHTML = SE.teachFrame(user, cls, classes, "pathways", body);
    SE.teachBindFrame(user);
    bindReview(asg);
  };

  /* One student's connected body of work for this pathway, with review and observation forms. */
  function portfolio(st, asg) {
    const evs = workFor(st.id);
    const pr = progress(asg, evs);
    const prof = SE.game.profile(st.id);
    return `
      <section class="wrap section" aria-labelledby="pwk-port-h">
        <div class="section__head"><div><span class="eyebrow">Portfolio</span><h2 id="pwk-port-h" tabindex="-1">${esc(st.displayName)}'s work</h2></div>
          <p>${pr.accepted} of ${pr.required} required steps accepted · ${pr.sent} sent</p></div>
        <ol class="pwk-steps">${pr.steps.map((x) => {
          const s = x.step, sid = s.id, a = s.kind === "mission" ? SE.activityById[s.activityId] : null;
          const ms = a ? SE.game.statusFor(prof, a) : null;
          return `
          <li class="block pwk-step" aria-labelledby="pwk-ph-${sid}">
            <div class="pwk-step__head"><span class="pw-step__n" aria-hidden="true">${x.n}</span>
              <h3 id="pwk-ph-${sid}">${esc(stepTitle(s))}</h3>${stateChip(x.state)}</div>
            <p class="pwk-prompt"><strong>${s.kind === "synthesis" ? "Task" : "Evidence asked for"}:</strong> ${esc(evidencePrompt(s))}</p>
            <dl class="pwk-sep">
              ${a ? `<div><dt>Mission</dt><dd>${esc(MISSION[ms.state] || ms.label)}${prof.opened.has(a.id) ? "" : " · not opened"}</dd></div>` : ""}
              <div><dt>Pathway evidence</dt><dd>${x.sent ? (x.sent.data.mode === "show" ? "Will show you in person" : esc(x.sent.data.text)) + ` <span class="muted small">(${SE.dateShort(x.sent.at)}${x.sent.data.missionVersion && a && x.sent.data.missionVersion !== SE.content.version(a) ? `, mission v${esc(x.sent.data.missionVersion)}` : ""})</span>` : "Nothing sent yet"}</dd></div>
              ${x.artifact ? `<div><dt>Team artifact</dt><dd>${esc(x.artifact.data.text)}${safeLink(x.artifact.data.link) ? ` <a href="${esc(x.artifact.data.link)}" target="_blank" rel="noopener noreferrer">Open<span class="visually-hidden"> the team artifact (opens in a new tab)</span></a>` : ""}</dd></div>` : ""}
              ${x.observations.length ? `<div><dt>Your observations</dt><dd>${x.observations.map((o) => esc(o.data.note)).join(" · ")}</dd></div>` : ""}
              ${x.review ? `<div><dt>Your last review</dt><dd>${esc(x.review.data.decision === "accepted" ? "Accepted" : "Revise")}${x.review.data.criteria ? ` · ${esc(x.review.data.criteria)}` : ""}${x.review.data.note ? ` · “${esc(x.review.data.note)}”` : ""}</dd></div>` : ""}
            </dl>
            <form class="pwk-review" data-review="${sid}" data-student="${st.id}" novalidate>
              <fieldset class="evidence"><legend>Review this step</legend>
                <label class="evidence__opt"><input type="radio" name="pwk-dec-${sid}" value="accepted"><span>${icon("check")}Accept</span></label>
                <label class="evidence__opt"><input type="radio" name="pwk-dec-${sid}" value="revise"><span>${icon("refresh")}Ask to revise</span></label></fieldset>
              <label for="pwk-crit-${sid}">What it shows (optional)</label><input id="pwk-crit-${sid}" class="input" maxlength="200">
              <label for="pwk-note-${sid}">Note to the student (needed for a revision)</label><textarea id="pwk-note-${sid}" rows="2" maxlength="300"></textarea>
              <button type="submit" class="btn btn--primary btn--small">${icon("check")}Save review</button>
              <p class="form__error" id="pwk-rerr-${sid}" role="alert"></p>
            </form>
            <form class="pwk-obs" data-observe="${sid}" data-student="${st.id}" novalidate>
              <label for="pwk-obs-${sid}">Add an observation (what you saw or heard)</label>
              <input id="pwk-obs-${sid}" class="input" maxlength="300">
              <button type="submit" class="btn btn--ghost btn--small">${icon("eye")}Add observation</button>
            </form>
          </li>`;
        }).join("")}</ol>
      </section>`;
  }

  function bindReview(asg) {
    app().querySelectorAll("[data-open]").forEach((b) => b.addEventListener("click", () => {
      openStudent = openStudent === b.dataset.open ? null : b.dataset.open;
      rerender(openStudent ? "pwk-port-h" : "pwk-review-h");
    }));
    app().querySelectorAll("form[data-review]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const sid = f.dataset.review, dec = f.querySelector(`input[name="pwk-dec-${sid}"]:checked`);
      const note = document.getElementById(`pwk-note-${sid}`).value.trim(), err = document.getElementById(`pwk-rerr-${sid}`);
      if (!dec) { err.textContent = "Choose Accept or Ask to revise."; return; }
      if (dec.value === "revise" && !/[a-z0-9]/i.test(note)) { err.textContent = "Write a short note so the student knows what to change."; document.getElementById(`pwk-note-${sid}`).focus(); return; }
      SE.store.teacherLog(f.dataset.student, "pathway_review", { assignmentId: asg.id, stepId: sid, v: asg.version, decision: dec.value, criteria: document.getElementById(`pwk-crit-${sid}`).value.trim().slice(0, 200), note: note.slice(0, 300) });
      rerender("pwk-port-h", null);
      SE.toast(dec.value === "accepted" ? "Accepted" : "Sent back for revision");
    }));
    app().querySelectorAll("form[data-observe]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const sid = f.dataset.observe, note = document.getElementById(`pwk-obs-${sid}`).value.trim();
      if (!/[a-z0-9]/i.test(note)) { document.getElementById(`pwk-obs-${sid}`).focus(); return; }
      SE.store.teacherLog(f.dataset.student, "pathway_observation", { assignmentId: asg.id, stepId: sid, v: asg.version, note: note.slice(0, 300) });
      rerender("pwk-port-h", null);
      SE.toast("Observation saved");
    }));
  }
})();
