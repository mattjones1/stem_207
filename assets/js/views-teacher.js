/*
 * STEM 207 — educator dashboard.
 *   #/teach                   class overview
 *   #/teach/student/<id>      one student's progress and log
 *   #/teach/pathway           educator coding pathway: the student stages, class status, checks, assigning
 *   #/teach/reflections       student answers to review
 *   #/teach/class             roster, class code, and login cards
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const P = STEM.progression;
  const { icon, esc, plural } = SE;
  const app = () => document.getElementById("app");

  let currentClassId = null;
  /* How a student-marked completion is labeled for teachers: "legacy" for records from the old
     one-click flow, "self-reported" for everything since. Lab checks are reported separately. */
  const completionTag = (e) => {
    const legacy = !e.data.evidence && !e.isDemo && e.at < (STEM.progression.legacyBefore || 0);
    if (legacy) return '<span class="self-rep self-rep--legacy" title="Recorded before completions were labeled. Treat as unverified.">legacy</span>';
    if (e.data.evidence === "show") return '<span class="self-rep" title="The student chose to show or tell you. Record a check when you have.">will show you</span>';
    return '<span class="self-rep" title="The student submitted this. It isn\'t confirmed until you check it.">submitted</span>';
  };
  /* A student's status on one activity, as a small chip (word + shape, not color alone). */
  const STATUS_ICON = { confirmed: "shield", tryagain: "refresh", checked: "flask", submitted: "check", started: "clock", none: "clock" };
  const statusChip = (st) => `<span class="st-chip st-chip--${st.state}">${icon(STATUS_ICON[st.state])}${esc(st.label)}</span>`;
  /* The one check for every activity: Pass (how: spoken, demo, or work) or Try again (a note is required).
     open: show the form right away (the Checks page) instead of folded (student pages). */
  const checkActions = (student, a, st, open) => st.state === "confirmed" ? "" : `
    <details class="check-act" ${open ? "open" : ""}>
      <summary>${icon("shield")}Check it</summary>
      <form class="check-act__form" data-check-student="${student.id}" data-check-activity="${a.id}">
        ${a.check ? `<p class="muted small"><strong>Check:</strong> ${esc(a.check)}</p>` : ""}
        <label>How did you check? <select class="input input--small" name="how">
          <option value="oral">Spoken check (they told me)</option><option value="demo">Watched them show it</option><option value="work">Reviewed their work</option></select></label>
        <label>Note for ${esc(student.displayName.split(" ")[0])} <span class="muted">(needed for Try again)</span>
          <input class="input input--small" name="note" maxlength="200" placeholder="What to try next, or what they did well"></label>
        <div class="check-act__btns">
          <button type="submit" class="btn btn--primary btn--small" name="act" value="confirm">${icon("check")}Pass</button>
          <button type="submit" class="btn btn--ghost btn--small" name="act" value="again">${icon("refresh")}Try again</button>
        </div>
        <p class="form__error" role="alert"></p>
      </form>
    </details>`;
  let checkBound = false;
  function bindCheckActions() {
    if (checkBound) return;
    checkBound = true;
    document.addEventListener("submit", (e) => {
      const f = e.target.closest("[data-check-student]");
      if (!f) return;
      e.preventDefault();
      const act = (e.submitter && e.submitter.value) || "confirm";
      const note = f.note.value.trim();
      if (act === "again" && !note) { f.querySelector(".form__error").textContent = "Add a short note so they know what to try next."; f.note.focus(); return; }
      f.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      const data = { activityId: f.dataset.checkActivity, note };
      if (act === "confirm") data.how = f.how.value;
      SE.store.teacherLog(f.dataset.checkStudent, act === "confirm" ? "teacher_confirmed" : "teacher_try_again", data);
      SE.toast(act === "confirm" ? "Passed" : "Sent back with your note");
      SE.route(true);
    });
  }
  const FEED_NOISE = ["step_checked", "pathway_evidence", "pathway_synthesis", "pathway_artifact", "pathway_review", "pathway_observation", "signed_in", "lab_test_run", "lab_opened", "lab_hint", "lab_clue", "lab_compass", "lab_fps", "lab_play", "lab_prediction", "lab_trained", "lab_bug", "lab_miss", "profile_custom"];
  const TIMELINE_NOISE = ["lab_test_run", "lab_clue", "lab_compass", "lab_fps", "lab_play", "lab_prediction", "lab_trained", "lab_bug", "lab_miss", "profile_custom"];
  let rosterSort = { key: "name", dir: 1 };
  let showReviewed = false;
  let pendingRemove = null;

  function getClass(user) {
    const classes = SE.store.classesFor(user.id);
    if (!classes.length) return { classes, cls: null };
    if (!classes.some((c) => c.id === currentClassId)) currentClassId = classes[0].id;
    return { classes, cls: classes.find((c) => c.id === currentClassId) };
  }
  SE.teachClass = getClass; // the class the educator is working with (used by the Moxie pages)

  /* ───────── Event descriptions ───────── */
  function describe(e, withName) {
    const a = e.data && e.data.activityId ? SE.activityById[e.data.activityId] : null;
    const title = a ? `<a href="#/activity/${a.id}">${esc(a.title)}</a>` : "";
    const who = withName ? `<strong>${esc((SE.store.studentById(e.studentId) || {}).displayName || "A student")}</strong> ` : "";
    switch (e.type) {
      case "signed_in": return { icon: "user", text: `${who}signed in` };
      case "teacher_confirmed": return { icon: "shield", text: `You passed ${withName ? esc((SE.store.studentById(e.studentId) || {}).displayName) + "’s " : ""}${title}${e.data.how ? ` (${esc({ oral: "spoken check", demo: "watched a demo", work: "reviewed work" }[e.data.how] || "")})` : ""}`, strong: true };
      case "teacher_try_again": return { icon: "refresh", text: `You asked ${withName ? esc((SE.store.studentById(e.studentId) || {}).displayName) : "them"} to try again on ${title}` };
      case "teacher_note": return { icon: "message", text: `You sent ${withName ? esc((SE.store.studentById(e.studentId) || {}).displayName) : "them"} a note: “${esc(e.data.note || "")}”` };
      case "help_requested": return { icon: "question", text: `${who}asked for help on ${title}`, strong: true };
      case "mission_opened": return { icon: "eye", text: `${who}opened ${title}` };
      case "launched": return { icon: "external", text: `${who}launched ${a ? esc(a.launch.provider) : "a resource"} for ${title}` };
      case "deeper_opened": return { icon: "rocket", text: `${who}went deeper on ${title}: opened ${esc(e.data.provider || "an outside resource")}` };
      case "step_checked": return { icon: "list", text: `${who}${e.data.checked ? "checked off" : "unchecked"} step ${e.data.step + 1} of ${title}` };
      case "mission_completed": { const tag = completionTag(e); return { icon: "check", text: `${who}sent ${title}${/submitted</.test(tag) ? "" : ` ${tag}`}`, strong: true }; }
      case "ican_claimed": return { icon: "flag", text: `${who}said “I can” for pathway stage ${e.data.stage}` };
      case "ican_verified": return { icon: "shield", text: `${withName ? who : ""}Stage ${e.data.stage} confirmed by teacher` };
      case "ican_returned": return { icon: "refresh", text: `${withName ? who : ""}Stage ${e.data.stage}: teacher said “not yet”` };
      case "lab_level_completed": {
        const lab = SE.labs.byId(e.data.labId);
        return { icon: "flask", text: `${who}finished level ${e.data.level + 1} of <a href="#/lab/${esc(e.data.labId)}/${e.data.level + 1}">${esc(lab ? lab.title : "a lab")}</a>`, strong: true };
      }
      case "lab_opened": { const lab = SE.labs.byId(e.data.labId); return { icon: "eye", text: `${who}opened ${esc(lab ? lab.title : "a lab")}, level ${e.data.level + 1}` }; }
      case "lab_hint": { const lab = SE.labs.byId(e.data.labId); return { icon: "question", text: `${who}used a hint in ${esc(lab ? lab.title : "a lab")}, level ${e.data.level + 1}` }; }
      case "reflection_reviewed": return { icon: "message", text: `Teacher ${e.data.note ? "replied to" : "read"} ${withName ? esc((SE.store.studentById(e.studentId) || {}).displayName) + "’s" : "a"} reflection` };
      default: return (SE.moxie && SE.moxie.describe(e, who, title)) || { icon: "clock", text: esc(e.type) };
    }
  }

  /* ───────── Frame: page header and the sample-data banner (sections are in the top menu) ─────────
     opts: title, eyebrow, code (show cls's sign-in code), demo (show the sample-class banner). */
  function frame(user, cls, classes, active, body, opts = {}) {
    const demo = opts.demo != null ? opts.demo : cls && cls.isDemo;
    return `
      <section class="page-top page-top--teach">
        <div class="wrap page-top__inner">
          <div class="teach-head">
            <div>
              <span class="eyebrow">${esc(opts.eyebrow || "Educator")}</span>
              <h1 tabindex="-1">${opts.title || (cls ? esc(cls.name) : "Dashboard")}</h1>
            </div>
            ${cls && opts.code ? `
            <div class="teach-head__tools">
              <span class="code-chip" title="Students use this code to sign in">${icon("key")}Class code <b>${esc(cls.code)}</b></span>
            </div>` : ""}
          </div>
        </div>
      </section>
      ${demo ? `
        <div class="wrap"><div class="demo-banner">
          ${icon("flag")}
          <p><strong>Sample class.</strong> The sample class's students and their work are made up to show how things work. ${SE.store.mode === "cloud" ? "It lives in your account so you can explore; reset it or archive it anytime." : "Changes you make here are saved in this browser."}</p>
          <button type="button" class="btn btn--ghost btn--small" id="reset-demo">${icon("refresh")}Reset sample data</button>
        </div></div>` : ""}
      ${body}`;
  }

  SE.teachFrame = (...args) => frame(...args);   // shared with views-plans.js
  /* Reflections waiting for a check, across all of an educator's classes (the badge on "Checks" in the top menu). */
  SE.teachChecksWaiting = (user) => SE.store.classesFor(user.id).reduce((n, c) => n + pendingChecks(SE.game.classSummary(c.id)).length, 0);
  SE.teachBindFrame = (user) => bindFrame(user);
  /* Waiting reflections in some classes, optionally only for some activities (a Learning Plan's Checks tab). */
  SE.teachCheckList = (classIds, activityIds) => {
    const items = classIds.flatMap((id) => pendingChecks(SE.game.classSummary(id)))
      .filter((x) => !activityIds || activityIds.has(x.c.activity.id)).sort((a, b) => a.c.event.at - b.c.event.at);
    return { count: items.length, html: items.length ? `<ol class="mission-log">${items.map((x) => reflectionItem(x.student, x.prof, x.c, classIds.length > 1 ? "class" : true, true)).join("")}</ol>` : "" };
  };
  SE.teachBindChecks = () => bindCheckActions();
  SE.teachStatusChip = (st) => statusChip(st);
  SE.teachNoClass = (user) => noClass(user);

  function bindFrame(user) {
    const rd = document.getElementById("reset-demo");
    if (rd) rd.addEventListener("click", async () => { rd.disabled = true; try { const c = await SE.store.resetDemo(); if (c) currentClassId = c.id; SE.toast("Sample data reset"); } catch (e) { SE.toast("Couldn't reset the sample class. Try again."); } SE.route(true); });
    const ad = document.getElementById("add-demo");
    if (ad) ad.addEventListener("click", async () => { ad.disabled = true; ad.textContent = "Adding the sample class…"; try { const c = await SE.store.resetDemo(); if (c) currentClassId = c.id; SE.toast("Sample class added"); location.hash = "#/teach"; } catch (e) { SE.toast("Couldn't add the sample class. Try again."); } SE.route(true); });
  }

  /* Waiting for a check: each activity whose latest send isn't passed or sent back yet. Oldest first. */
  function pendingChecks(summary) {
    const out = [];
    summary.profiles.forEach(({ student, prof }) => {
      const seen = new Set();
      prof.completions.slice().reverse().forEach((c) => {
        if (seen.has(c.activity.id)) return;
        seen.add(c.activity.id);
        if (SE.game.statusFor(prof, c.activity).state === "submitted") out.push({ student, prof, c });
      });
    });
    return out.sort((a, b) => a.c.event.at - b.c.event.at);
  }

  function noClass(user) {
    app().innerHTML = frame(user, null, [], "", `
      <section class="wrap section"><div class="empty">${icon("users")}<h2>Create your first class</h2>
        <p>You'll get a class code students use to sign in.</p>
        <form id="new-class" class="inline-form"><label class="visually-hidden" for="nc-name">Class name</label>
          <input id="nc-name" class="input" placeholder="Class name, like Room 12"><button class="btn btn--primary" type="submit">${icon("plus")}Create class</button></form>
        ${SE.store.mode === "cloud" ? `<p class="muted">Or explore first: <button type="button" class="linkish" id="add-demo">add a sample class with made-up students</button>.</p>` : ""}
      </div></section>`);
    bindFrame(user);
    document.getElementById("new-class").addEventListener("submit", (e) => {
      e.preventDefault();
      const c = SE.store.createClass(user.id, document.getElementById("nc-name").value);
      currentClassId = c.id;
      location.hash = `#/teach/classes/${c.id}`;
    });
  }

  /* What's worth a look in one class: never signed in, a quiet week, "still figuring it out", help requests. */
  function attentionFor(sum) {
    const now = Date.now(), out = [];
    sum.profiles.forEach(({ student, prof }) => {
      if (!prof.lastActive) out.push({ student, why: "Hasn't signed in yet", icon: "user" });
      else if (now - prof.lastActive > 7 * SE.DAY) out.push({ student, why: `No activity for ${Math.floor((now - prof.lastActive) / SE.DAY)} days`, icon: "clock" });
      const recent = prof.completions.slice(-3);
      const stuck = recent.filter((c) => c.event.data.confidence === "figuring").length;
      if (stuck >= 2) out.push({ student, why: `Said “still figuring it out” on ${stuck} of their last ${recent.length} activities`, icon: "question" });
      const help = SE.store.eventsFor(student.id).filter((e) => e.type === "help_requested" && now - e.at < SE.DAY).pop();
      if (help) { const ha = SE.activityById[help.data.activityId]; out.unshift({ student, why: `Asked for help ${SE.timeAgo(help.at)}${ha ? ` on ${ha.title}` : ""}`, icon: "message" }); }
    });
    return out;
  }
  const attentionList = (items, withClass) => items.length
    ? `<ul class="attn">${items.map((x) => `<li>${icon(x.icon)}<span><a href="#/teach/student/${x.student.id}"><strong>${esc(x.student.displayName)}</strong></a>${withClass ? ` <span class="muted">(${esc(x.c.name)})</span>` : ""}<small>${esc(x.why)}</small></span><button type="button" class="btn btn--ghost btn--small attn__note" data-note-student="${x.student.id}">${icon("message")}Note<span class="visually-hidden"> to ${esc(x.student.displayName)}</span></button></li>`).join("")}</ul>`
    : `<p class="muted">Everyone has been active this week and nobody is flagging trouble.</p>`;
  /* A Learning Plan's progress in one class: students who passed every required activity. */
  function planProgress(sum, pa) {
    const req = pa.snapshot.steps.filter((x) => x.kind === "mission" && x.required).map((x) => SE.activityById[x.activityId]).filter(Boolean);
    const done = sum.profiles.filter(({ prof }) => req.every((a) => prof.completedIds.has(a.id))).length;
    return { done, total: sum.students.length, req: req.length };
  }

  /* ───────── Dashboard: every class at a glance ───────── */
  SE.views.teach = function (user) {
    const classes = SE.store.classesFor(user.id);
    if (!classes.length) return noClass(user);
    const rows = classes.map((c) => {
      const sum = SE.game.classSummary(c.id);
      return { c, sum, waiting: pendingChecks(sum).length, plans: SE.store.pathwayAssignmentsFor(c.id).filter((pa) => pa.snapshot) };
    });
    const waiting = rows.reduce((n, r) => n + r.waiting, 0);
    const students = rows.reduce((n, r) => n + r.sum.students.length, 0);
    const plans = rows.flatMap((r) => r.plans.map((pa) => ({ r, pa })));
    const attention = rows.flatMap((r) => attentionFor(r.sum).map((x) => ({ ...x, c: r.c }))).slice(0, 8);
    // Recent activity across classes: the events a teacher acts on (sent, passed, try again, help, notes).
    const FEED = ["mission_completed", "teacher_confirmed", "teacher_try_again", "help_requested", "teacher_note"];
    const feed = rows.flatMap((r) => r.sum.events.filter((e) => FEED.includes(e.type)).map((e) => ({ e, c: r.c }))).sort((x, y) => y.e.at - x.e.at).slice(0, 8);
    const hour = new Date().getHours();
    const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const body = `
      <section class="wrap section dash">
        <p class="dash-hello">${icon("compass")}<span><strong>${hello}, ${esc(user.name || "educator")}.</strong> ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span></p>
        <div class="dash-actions">
          <a class="btn btn--primary" href="#/teach/checks">${icon("check")}Checks${waiting ? ` (${waiting})` : ""}</a>
          <a class="btn btn--ghost" href="#/teach/plans/new">${icon("plus")}New Learning Plan</a>
          <button type="button" class="btn btn--ghost" data-message-class="">${icon("message")}Message a class</button>
          <a class="btn btn--ghost" href="#/teach/classes">${icon("users")}Add a class</a>
        </div>
        <div class="kpis kpis--dash">
          <a class="kpi kpi--green ${waiting ? "kpi--action" : ""}" href="#/teach/checks"><span class="kpi__label">Checks waiting</span><span class="kpi__value">${waiting}</span><span class="kpi__foot">${waiting ? "Pass or Try again" : "You're all caught up"}</span></a>
          <a class="kpi kpi--teal" href="#/teach/classes"><span class="kpi__label">Classes</span><span class="kpi__value">${classes.length}</span><span class="kpi__foot">${plural(students, "student", "students")}</span></a>
          <a class="kpi kpi--blue" href="#/teach/plans"><span class="kpi__label">Current Learning Plans</span><span class="kpi__value">${plans.length}</span><span class="kpi__foot">assigned to your classes</span></a>
        </div>
      </section>
      <div class="wrap dash-cols">
        <div class="dash-main">
          <section class="section" aria-labelledby="dash-classes">
            <div class="section__head"><div><span class="eyebrow">Classes</span><h2 id="dash-classes">Your classes</h2></div>
              <a class="btn btn--ghost btn--small" href="#/teach/classes">Manage classes ${icon("arrowRight")}</a></div>
            <ul class="dash-classes">${rows.map((r) => `
              <li class="block dash-class">
                <h3><a href="#/teach/classes/${r.c.id}">${esc(r.c.name)}</a>${r.c.isDemo ? ` <span class="chip">Sample</span>` : ""}</h3>
                <p class="muted small">Class code ${esc(r.c.code)}</p>
                <p>${plural(r.sum.students.length, "student", "students")} · ${r.waiting ? `<a href="#/teach/checks">${plural(r.waiting, "check", "checks")} waiting</a>` : "no checks waiting"} · ${plural(r.plans.length, "Learning Plan", "Learning Plans")}</p>
                ${classTools(r.c)}
              </li>`).join("")}</ul>
          </section>
          <section class="section" aria-labelledby="dash-plans">
            <div class="section__head"><div><span class="eyebrow">Learning Plans</span><h2 id="dash-plans">Current Learning Plans</h2></div>
              <a class="btn btn--ghost btn--small" href="#/teach/plans">All Learning Plans ${icon("arrowRight")}</a></div>
            ${plans.length ? `<ul class="dash-plans">${plans.map(({ r, pa }) => { const p = planProgress(r.sum, pa); return `
              <li class="block"><h3><a href="#/teach/plans/${pa.pathwayId}">${esc(pa.snapshot.title)}</a> <span class="muted small">· ${esc(r.c.name)}</span></h3>
                <p>${p.done} of ${p.total} students passed all ${plural(p.req, "required activity", "required activities")}</p>
                <div class="mini-meter" aria-hidden="true"><span style="width:${p.total ? (p.done / p.total) * 100 : 0}%"></span></div></li>`; }).join("")}</ul>`
              : `<div class="empty">${icon("map")}<h3>No Learning Plans assigned yet</h3><p>A Learning Plan puts activities in order for a class.</p><a class="btn btn--primary" href="#/teach/plans">${icon("plus")}Start a Learning Plan</a></div>`}
          </section>
        </div>
        <aside class="dash-side" aria-label="Activity and students">
          <section class="block dash-feed" aria-labelledby="dash-feed">
            <h2 id="dash-feed">${icon("clock")}Recent activity</h2>
            ${feed.length ? `<ol class="feed feed--dash">${feed.map(({ e, c }) => { const d = describe(e, true); return `<li class="${d.strong ? "is-strong" : ""}">${icon(d.icon)}<span>${d.text}${classes.length > 1 ? ` <small class="muted">${esc(c.name)}</small>` : ""}</span><time datetime="${new Date(e.at).toISOString()}">${SE.timeAgo(e.at)}</time></li>`; }).join("")}</ol>`
              : `<p class="muted">When students send work, it shows up here.</p>`}
            ${classes.length === 1 ? `<a class="small" href="#/teach/classes/${classes[0].id}#class-feed">See everything on the class page</a>` : ""}
          </section>
          <section class="block" aria-labelledby="dash-attn">
            <h2 id="dash-attn">${icon("users")}Needs a check-in</h2>
            ${attentionList(attention, classes.length > 1)}
          </section>
        </aside>
      </div>`;
    app().innerHTML = frame(user, null, classes, "teach", body, { title: "Dashboard", demo: classes.some((c) => c.isDemo) });
    bindFrame(user);
  };

  /* Class messages: a short note to the whole class, shown under "From your teacher" on the student Home. */
  function messageBlock(cls) {
    const list = SE.store.messagesFor(cls.id);
    return `
      <div class="block msg-block" id="class-messages">
        <div class="block__head"><h2>${icon("message")}Message your class</h2><span class="muted">Students see the newest one on Home</span></div>
        <form class="msg-form" id="msg-form">
          <label for="msg-body" class="visually-hidden">Message to ${esc(cls.name)}</label>
          <textarea id="msg-body" class="input" rows="2" maxlength="500" placeholder="Example: Finish Lobster Trap Logic by Thursday. Bring your flowchart." aria-describedby="msg-help"></textarea>
          <p class="field-help" id="msg-help">Keep it short and about class work. No student names or personal details.</p>
          <button type="submit" class="btn btn--primary">${icon("message")}Post to ${esc(cls.name)}</button>
        </form>
        ${list.length ? `<ul class="msg-list">${list.map((m) => `<li><p>${esc(m.body)}</p><small>${SE.timeAgo(m.createdAt)}</small><button type="button" class="btn btn--ghost btn--small" data-msg-del="${m.id}" aria-label="Delete message: ${esc(m.body.slice(0, 40))}">${icon("trash")}Delete</button></li>`).join("")}</ul>` : `<p class="muted">No messages yet.</p>`}
      </div>`;
  }
  function bindMessages(cls) {
    const f = document.getElementById("msg-form");
    if (!f) return;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const t = document.getElementById("msg-body");
      if (!t.value.trim()) { t.focus(); return; }
      SE.store.postMessage(cls.id, t.value);
      SE.toast(`Posted to ${cls.name}`);
      SE.route(true);
      document.getElementById("msg-body").focus();
    });
    app().querySelectorAll("[data-msg-del]").forEach((b) => b.addEventListener("click", () => {
      SE.store.deleteMessage(b.dataset.msgDel);
      SE.toast("Message deleted");
      SE.route(true);
    }));
  }

  function rosterTable(sum, classId) {
    const rows = sum.profiles.map(({ student, prof }) => {
      // Reflections this student has sent that are waiting for your Pass or Try again.
      const waiting = Object.keys(prof.missions).map((id) => SE.activityById[id]).filter((a) => a && SE.game.statusFor(prof, a).state === "submitted").length;
      return { student, prof, waiting };
    });
    const k = rosterSort.key, d = rosterSort.dir;
    rows.sort((x, y) => {
      const v = {
        name: x.student.displayName.localeCompare(y.student.displayName),
        xp: x.prof.xp - y.prof.xp,
        missions: x.prof.counts.missions - y.prof.counts.missions,
        patches: x.prof.earnedCount - y.prof.earnedCount,
        waiting: x.waiting - y.waiting,
        active: (x.prof.lastActive || 0) - (y.prof.lastActive || 0)
      }[k];
      return v * d;
    });
    const th = (key, label, num) => {
      const sorted = rosterSort.key === key;
      return `<th scope="col" class="${num ? "num" : ""}" aria-sort="${sorted ? (rosterSort.dir === 1 ? "ascending" : "descending") : "none"}">
        <button type="button" data-sort="${key}">${label}<span aria-hidden="true">${sorted ? (rosterSort.dir === 1 ? " ▲" : " ▼") : ""}</span></button></th>`;
    };
    if (!rows.length) return `<div class="empty">${icon("users")}<h3>No students yet</h3><p>Add students, then hand out their login cards.</p>${classId ? `<button type="button" class="btn btn--primary" data-add-students="${classId}">${icon("plus")}Add students</button>` : ""}</div>`;
    return `
      <div class="table-wrap">
        <table class="roster">
          <thead><tr>${th("name", "Student")}<th scope="col">Rank</th>${th("xp", "XP", true)}${th("missions", "Passed", true)}${th("patches", "Patches", true)}${th("waiting", "Waiting", true)}${th("active", "Last active", true)}</tr></thead>
          <tbody>
            ${rows.map(({ student, prof, waiting }) => {
              const stale = !prof.lastActive || Date.now() - prof.lastActive > 7 * SE.DAY;
              return `<tr>
                <th scope="row"><a class="roster-name" href="#/teach/student/${student.id}">${SE.studentAvatar(student.id, 30, prof)}${esc(student.displayName)}</a><small>${esc(SE.gradeById[student.gradeBand] ? SE.gradeById[student.gradeBand].name : "")}</small></th>
                <td><span class="rank-cell">${SE.insignia(prof.rank, 22)}${esc(prof.rank.name)}</span></td>
                <td class="num">${SE.num(prof.xp)}</td>
                <td class="num">${prof.counts.missions}</td>
                <td class="num">${prof.earnedCount}</td>
                <td class="num">${waiting ? `<a href="#/teach/checks">${waiting}<span class="visually-hidden"> waiting for a check</span></a>` : "0"}</td>
                <td class="num ${stale ? "is-stale" : ""}">${prof.lastActive ? SE.timeAgo(prof.lastActive) : "Never"}${stale ? `<span class="visually-hidden"> (needs a check-in)</span>` : ""}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  }

  function bindRoster() {
    app().querySelectorAll("[data-sort]").forEach((b) => b.addEventListener("click", () => {
      const key = b.dataset.sort;
      rosterSort = { key, dir: rosterSort.key === key ? -rosterSort.dir : key === "name" ? 1 : -1 };
      const sum = SE.game.classSummary(currentClassId);
      document.querySelector(".table-wrap").outerHTML = rosterTable(sum, currentClassId);
      bindRoster();
      const again = app().querySelector(`[data-sort="${key}"]`);
      if (again) again.focus();
    }));
  }

  /* ───────── Student detail ───────── */
  SE.views.teachStudent = function (user, id) {
    const student = SE.store.studentById(id);
    const { classes } = getClass(user);
    const cls = student && classes.find((c) => c.id === student.classId);
    if (!student || !cls) return SE.views.notFound();
    currentClassId = cls.id;
    const prof = SE.game.profile(student.id);
    const events = SE.store.eventsFor(student.id).slice().sort((a, b) => b.at - a.at);
    const log = prof.completions.slice().reverse();

    const body = `
      <section class="wrap section">
        <a class="btn btn--ghost btn--small" href="#/teach/classes/${cls.id}">${icon("arrowLeft")}Back to ${esc(cls.name)}</a>
        <div class="student-head">
          ${SE.studentAvatar(student.id, 72, prof)}
          <div>
            <h2>${esc(student.displayName)}</h2>
            <p class="muted">${esc(prof.rank.name)} · ${esc(SE.gradeById[student.gradeBand] ? SE.gradeById[student.gradeBand].name : "")} · last active ${prof.lastActive ? SE.timeAgo(prof.lastActive) : "never"}</p>
            ${SE.rankBar(prof, true)}
            <button type="button" class="btn btn--ghost btn--small" data-note-student="${student.id}">${icon("message")}Send a note</button>
          </div>
          <dl class="xstats xstats--light">
            <div><dt>XP</dt><dd>${SE.num(prof.xp)}</dd></div>
            <div><dt>Passed</dt><dd>${prof.counts.missions}</dd></div>
            <div><dt>Patches</dt><dd>${prof.earnedCount}</dd></div>
            <div><dt>Streak</dt><dd>${prof.streak}<small> wk</small></dd></div>
          </dl>
        </div>
      </section>

      <section class="wrap section teach-grid">
        ${(() => {
          const list = SE.store.assignmentsFor(cls.id).map((x) => ({ x, a: SE.activityById[x.activityId] })).filter((r) => r.a);
          if (!list.length) return "";
          const doneN = list.filter(({ a }) => SE.game.missionDone(prof, a)).length;
          return `<div class="block">
            <div class="block__head"><h2>Assigned activities</h2><span class="muted">${doneN} of ${list.length} done</span></div>
            <ul class="astatus">${list.map(({ x, a }) => { const d = SE.game.missionDone(prof, a); const late = !d && x.dueDate && new Date(`${x.dueDate}T23:59:59`).getTime() < Date.now();
              const st = SE.game.statusFor(prof, a);
              return `<li class="${d ? "is-done" : late ? "is-late" : ""}">${icon(d ? "check" : late ? "alert" : "clock")}<span class="astatus__main"><a href="#/activity/${a.id}">${esc(a.title)}</a><small>${x.dueDate ? esc(dueText(x.dueDate)) : "No due date"}</small></span>${statusChip(st)}${checkActions(student, a, st)}</li>`; }).join("")}</ul>
          </div>`;
        })()}
        <div class="block">
          <div class="block__head"><h2>Patches</h2><span class="muted">${prof.earnedCount} of ${P.patches.length}</span></div>
          <div class="patch-row patch-row--small">
            ${prof.patches.map((p) => `<figure class="patch-tile ${p.earned ? "" : "is-locked"}" title="${esc(p.patch.how)}">${SE.patchArt(p.patch, p.earned, 60)}<figcaption><strong>${esc(p.patch.name)}</strong></figcaption></figure>`).join("")}
          </div>
        </div>
      </section>

      <section class="wrap section teach-grid">
        <div class="block">
          <div class="block__head"><h2>Interactive labs</h2><span class="muted">tests run · hints used</span></div>
          <ul class="lab-prog-list">${SE.labs.all().map((lab) => {
            const n = (prof.labLevels[lab.id] || new Set()).size;
            const st = prof.labStats[lab.id] || { runs: 0, hints: 0 };
            const la = STEM.activities.find((x) => x.launch && x.launch.labId === lab.id);
            const ls = la ? SE.game.statusFor(prof, la) : null;
            return `<li><span><a href="#/lab/${lab.id}">${esc(lab.title)}</a><small>${n} of ${lab.levels.length} levels · ${st.runs} tests · ${st.hints} hints</small>${ls && ["submitted", "confirmed", "tryagain"].includes(ls.state) ? statusChip(ls) : ""}</span><span class="meter"><span style="width:${(n / lab.levels.length) * 100}%"></span></span></li>`;
          }).join("")}</ul>
        </div>
        <div class="block">
          <div class="block__head"><h2>Creations</h2><span class="muted">From the Pixel Animation Studio</span></div>
          ${SE.views.creationsGallery(prof) || `<p class="muted">No saved animations yet.</p>`}
        </div>
      </section>

      <section class="wrap section" aria-labelledby="slog-title">
        <div class="section__head"><div><span class="eyebrow">Reflections</span><h2 id="slog-title">${plural(log.length, "reflection sent", "reflections sent")}</h2></div></div>
        ${log.length ? `<ol class="mission-log">${log.map((c) => reflectionItem(student, prof, c, false)).join("")}</ol>` : `<p class="muted">Nothing sent yet.</p>`}
      </section>

      <section class="wrap section" aria-labelledby="tl-title">
        <div class="section__head"><div><span class="eyebrow">Activity</span><h2 id="tl-title">Everything ${esc(student.displayName.split(" ")[0])} did</h2></div><span class="muted">${plural(events.length, "event", "events")}</span></div>
        <ol class="feed">${events.filter((e) => !TIMELINE_NOISE.includes(e.type)).slice(0, 60).map((e) => { const d = describe(e, false); return `<li class="${d.strong ? "is-strong" : ""}">${icon(d.icon)}<span>${d.text}</span><time datetime="${new Date(e.at).toISOString()}">${SE.timeAgo(e.at)}</time></li>`; }).join("")}</ol>
      </section>`;

    app().innerHTML = frame(user, cls, classes, "", body, { title: esc(cls.name) });
    bindFrame(user);
    bindCheckActions();
  };

  /* ───────── Reflections ───────── */
  function reflectionItem(student, prof, c, withName, open) {
    const r = prof.reviewed[c.event.id];
    const conf = P.confidence.find((x) => x.id === c.event.data.confidence);
    const answer = (c.event.data.reflection || "").trim();
    return `
      <li class="${r ? "is-reviewed" : ""}">
        <div class="mission-log__head">
          <span class="icon-badge">${icon(SE.areaById[c.activity.area].icon)}</span>
          <div>
            ${withName ? `<a href="#/teach/student/${student.id}"><strong>${esc(student.displayName)}</strong></a>${withName === "class" ? ` <span class="muted">(${esc((SE.store.classById(student.classId) || {}).name || "")})</span>` : ""} · ` : ""}<a href="#/activity/${c.activity.id}">${withName ? esc(c.activity.title) : `<strong>${esc(c.activity.title)}</strong>`}</a>
            <span>${SE.dateShort(c.event.at)} · ${completionTag(c.event)} · ${c.event.data.stepsDone || 0}/${c.event.data.stepsTotal || c.activity.steps.length} steps · ${c.event.data.extension ? "tried the challenge" : "no challenge"}</span>
          </div>
          ${conf ? `<span class="conf conf--${conf.id}">${esc(conf.name)}</span>` : ""}
        </div>
        ${(() => { const st = SE.game.statusFor(prof, c.activity); return st.sub && st.sub.id === c.event.id ? `<div class="check-row-wrap">${statusChip(st)}${checkActions(student, c.activity, st, open)}</div>` : ""; })()}
        ${c.event.data.extensionNote ? `<p class="muted small"><strong>Take it further:</strong> “${esc(c.event.data.extensionNote)}”</p>` : ""}
        ${answer ? `<p class="mission-log__q">${esc(c.event.data.evidence && c.activity.check ? c.activity.check : c.activity.reflect)}</p><p class="mission-log__answer">“${esc(answer)}”</p>` : (c.event.data.evidence === "show" ? `<p class="muted">${icon("users", 'class="inline-icon"')}Chose to show or tell you instead of writing.</p>` : `<p class="muted">No answer to the reflection question.</p>`)}
        ${r && r.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>You replied:</strong> ${esc(r.data.note)}</span></p>` : ""}
      </li>`;
  }

  /* ───────── Checks: every reflection waiting, across all classes ───────── */
  SE.views.teachChecks = function (user) {
    const classes = SE.store.classesFor(user.id);
    if (!classes.length) return noClass(user);
    const pending = classes.flatMap((c) => pendingChecks(SE.game.classSummary(c.id))).sort((a, b) => a.c.event.at - b.c.event.at);
    // Recently checked (last 14 days), newest first, when the toggle is on.
    const recent = !showReviewed ? [] : classes.flatMap((c) => SE.game.classSummary(c.id).profiles.flatMap(({ student, prof }) =>
      Object.values(prof.missions).map((ms) => ms.confirmed || ms.tryAgain).filter((e) => e && Date.now() - e.at < 14 * SE.DAY)
        .map((e) => ({ student, e, a: SE.activityById[e.data.activityId] })).filter((x) => x.a))).sort((x, y) => y.e.at - x.e.at);
    const body = `
      <section class="wrap section">
        ${SE.checksGuide("teacher")}
      </section>
      <section class="wrap section" aria-labelledby="checks-title">
        <div class="section__head">
          <div><span class="eyebrow">Checks</span><h2 id="checks-title">${pending.length ? `${plural(pending.length, "reflection", "reflections")} waiting` : "You're all caught up"}</h2></div>
          <label class="check-row"><input type="checkbox" id="show-reviewed" ${showReviewed ? "checked" : ""}> Show what you checked in the last 2 weeks</label>
        </div>
        ${pending.length ? `<ol class="mission-log">${pending.map((x) => reflectionItem(x.student, x.prof, x.c, classes.length > 1 ? "class" : true, true)).join("")}</ol>`
          : `<div class="empty">${icon("message")}<h3>Nothing waiting</h3><p>When a student sends a reflection, it shows up here for you to Pass or send back.</p></div>`}
        ${showReviewed ? `<h3 class="subhead">Checked recently</h3><ul class="checked-list">${recent.map(({ student, e, a }) => `<li>${e.type === "teacher_confirmed" ? `${icon("check")}<strong>Passed</strong>` : `${icon("refresh")}<strong>Try again</strong>`} · <a href="#/teach/student/${student.id}">${esc(student.displayName)}</a> · <a href="#/activity/${a.id}">${esc(a.title)}</a> <span class="muted">${SE.timeAgo(e.at)}${e.data.note ? ` · “${esc(e.data.note)}”` : ""}</span></li>`).join("") || `<li class="muted">Nothing in the last 2 weeks.</li>`}</ul>` : ""}
      </section>`;
    app().innerHTML = frame(user, null, [], "checks", body, { title: "Checks" });
    bindFrame(user);
    bindCheckActions();
    document.getElementById("show-reviewed").addEventListener("change", (e) => { showReviewed = e.target.checked; SE.route(true); });
  };

  /* ───────── Classes ───────── */
  /* Two quick actions on a class card (they open the shared modal). */
  const classTools = (c) => `
    <div class="class-tools">
      <button type="button" class="btn btn--ghost btn--small" data-add-students="${c.id}">${icon("plus")}Add students<span class="visually-hidden"> to ${esc(c.name)}</span></button>
      <button type="button" class="btn btn--ghost btn--small" data-message-class="${c.id}">${icon("message")}Message<span class="visually-hidden"> ${esc(c.name)}</span></button>
    </div>`;

  SE.views.teachClasses = function (user) {
    const classes = SE.store.classesFor(user.id), archived = SE.store.archivedClassesFor(user.id);
    if (!classes.length && !archived.length) return noClass(user);
    const card = (c) => {
      const n = SE.store.studentsIn(c.id).length;
      return `
        <li class="block dash-class">
          <h3><a href="#/teach/classes/${c.id}">${esc(c.name)}</a>${c.isDemo ? ` <span class="chip">Sample</span>` : ""}</h3>
          <p class="muted small">Class code ${esc(c.code)} · ${plural(n, "student", "students")}</p>
          ${c.archivedAt ? `<p class="small">Archived ${SE.dateShort(c.archivedAt)}. Students can't sign in.</p>
            <button type="button" class="btn btn--ghost btn--small" data-restore="${c.id}">${icon("refresh")}Restore<span class="visually-hidden"> ${esc(c.name)}</span></button>` : classTools(c)}
        </li>`;
    };
    const body = `
      <section class="wrap section" aria-labelledby="classes-title">
        <div class="section__head"><div><span class="eyebrow">Classes</span><h2 id="classes-title">${plural(classes.length, "class", "classes")}</h2></div></div>
        ${classes.length ? `<ul class="dash-classes">${classes.map(card).join("")}</ul>` : `<p class="muted">No active classes. Add one below, or restore an archived class.</p>`}
      </section>
      <section class="wrap section" id="add-class" aria-labelledby="add-class-title">
        <div class="block">
          <h2 id="add-class-title">Add a class</h2>
          <p class="muted">Each class gets its own sign-in code.</p>
          <form id="new-class" class="inline-form">
            <label class="visually-hidden" for="nc-name">Class name</label>
            <input id="nc-name" class="input" maxlength="80" placeholder="Class name, like Room 12">
            <button class="btn btn--primary" type="submit">${icon("plus")}Add class</button>
          </form>
          ${SE.store.mode === "cloud" && !classes.concat(archived).some((c) => c.isDemo) ? `<p class="muted">Want to see it with data first? <button type="button" class="linkish" id="add-demo">Add a sample class</button></p>` : ""}
        </div>
      </section>
      ${archived.length ? `
      <section class="wrap section" aria-labelledby="archived-title">
        <details class="block">
          <summary><h2 id="archived-title">Archived (${archived.length})</h2></summary>
          <ul class="dash-classes">${archived.map(card).join("")}</ul>
        </details>
      </section>` : ""}`;
    app().innerHTML = frame(user, null, classes, "classes", body, { title: "Classes" });
    bindFrame(user);
    document.getElementById("new-class").addEventListener("submit", (e) => {
      e.preventDefault();
      const c = SE.store.createClass(user.id, document.getElementById("nc-name").value);
      currentClassId = c.id;
      SE.toast(`Added ${c.name}. Class code ${c.code}`);
      location.hash = `#/teach/classes/${c.id}`;
    });
    app().querySelectorAll("[data-restore]").forEach((b) => b.addEventListener("click", () => {
      SE.store.archiveClass(b.dataset.restore, false);
      SE.toast("Class restored");
      SE.route(true);
    }));
  };

  let deleteOpen = null;   // the class whose delete confirmation is open
  SE.views.teachClassPage = function (user, id) {
    const cls = SE.store.classById(id);
    if (!cls || cls.educatorId !== user.id) return SE.views.notFound();
    if (!cls.archivedAt) currentClassId = cls.id;
    const sum = SE.game.classSummary(cls.id);
    const students = SE.store.studentsIn(cls.id);
    const waiting = pendingChecks(sum).length;
    const activeIds = new Set(sum.events.filter((e) => e.at >= Date.now() - 7 * SE.DAY && !e.by).map((e) => e.studentId));
    const plans = SE.store.pathwayAssignmentsFor(cls.id).filter((pa) => pa.snapshot);
    const legacy = SE.store.assignmentsFor(cls.id).map((x) => ({ x, a: SE.activityById[x.activityId] })).filter((r) => r.a);
    const body = `
      <section class="wrap section">
        <div class="backbar pw-back">${SE.backLink("#/teach/classes", "Classes")}</div>
        ${cls.archivedAt ? `<p class="pwk-banner">${icon("alert")}<span><strong>Archived.</strong> Students in this class can't sign in. Restore it to use it again.</span></p>` : ""}
        <div class="block class-manage">
          <form id="rename-class" class="inline-form">
            <label for="cr-name">Class name</label>
            <input id="cr-name" class="input" maxlength="80" value="${esc(cls.name)}">
            <button class="btn btn--ghost btn--small" type="submit">${icon("check")}Rename</button>
          </form>
          <div class="class-manage__btns">
            <button type="button" class="btn btn--ghost btn--small" id="archive-class">${icon(cls.archivedAt ? "refresh" : "box")}${cls.archivedAt ? "Restore class" : "Archive class"}</button>
            <button type="button" class="btn btn--ghost btn--small" id="delete-open" aria-expanded="${deleteOpen === cls.id}" aria-controls="delete-zone">${icon("trash")}Delete class</button>
          </div>
          <div id="delete-zone" class="danger-zone" ${deleteOpen === cls.id ? "" : "hidden"}>
            <p><strong>Deleting removes ${esc(cls.name)}, its ${plural(students.length, "student", "students")}, and all their work. This can't be undone.</strong> To keep the work, archive the class instead.</p>
            <label for="del-confirm">Type the class name to confirm</label>
            <input id="del-confirm" class="input" autocomplete="off" placeholder="${esc(cls.name)}">
            <button type="button" class="btn btn--danger btn--small" id="delete-yes">${icon("trash")}Delete forever</button>
            <p class="form__error" id="del-err" role="alert"></p>
          </div>
        </div>
        <div class="kpis">
          <a class="kpi" href="#roster"><span class="kpi__label">Students</span><span class="kpi__value">${students.length}</span><span class="kpi__foot">${activeIds.size} active this week</span></a>
          <a class="kpi ${waiting ? "kpi--action" : ""}" href="#/teach/checks"><span class="kpi__label">Checks waiting</span><span class="kpi__value">${waiting}</span><span class="kpi__foot">${waiting ? "Pass or Try again" : "All caught up"}</span></a>
          <a class="kpi" href="#class-plans"><span class="kpi__label">Learning Plans</span><span class="kpi__value">${plans.length}</span><span class="kpi__foot">assigned to this class</span></a>
        </div>
      </section>

      <section class="wrap section" id="roster" aria-labelledby="roster-title">
        <div class="section__head"><div><span class="eyebrow">Roster</span><h2 id="roster-title">${plural(students.length, "student", "students")}</h2></div>
          <button type="button" class="btn btn--primary btn--small" data-add-students="${cls.id}">${icon("plus")}Add students</button></div>
        ${rosterTable(sum, cls.id)}
      </section>

      <section class="wrap section teach-grid">
        <div class="block" id="class-plans">
          <div class="block__head"><h2>Learning Plans</h2><a class="muted" href="#/teach/plans">${plans.length ? "All plans" : "Start one"}</a></div>
          ${plans.length ? `<ul class="alist alist--compact">${plans.map((pa) => { const p = planProgress(sum, pa); return `<li class="alist__item"><div class="alist__main"><a href="#/teach/plans/${pa.pathwayId}">${esc(pa.snapshot.title)}</a><small>${p.done} of ${p.total} passed every required activity</small></div></li>`; }).join("")}</ul>`
            : `<p class="muted">No Learning Plans assigned to this class yet.</p>`}
          ${legacy.length ? `<h3 class="small">Earlier single assignments</h3><ul class="alist alist--compact">${legacy.map(({ x, a }) => `<li class="alist__item"><div class="alist__main"><a href="#/activity/${a.id}">${esc(a.title)}</a><small>${x.dueDate ? esc(dueText(x.dueDate)) : "No due date"}</small></div></li>`).join("")}</ul>` : ""}
        </div>
        <div class="block">
          <div class="block__head"><h2>Needs a check-in</h2></div>
          ${attentionList(attentionFor(sum), false)}
        </div>
        <div class="block">
          <div class="block__head"><h2>Class journey</h2><span class="muted">${sum.journey.goal.next ? `Next stop: ${esc(sum.journey.goal.next.name)}` : "Katahdin reached"}</span></div>
          ${SE.classJourneyBlock(sum.journey)}
          <p class="muted">Only class work moves the journey: +100 each time you pass an activity you assigned or one in an assigned Learning Plan. Students see this on Home. Their own XP, ranks, and patches come from every activity you pass.</p>
        </div>
        <div class="block">
          <div class="block__head"><h2>Interactive labs</h2><span class="muted">Levels finished</span></div>
          <table class="lab-table">
            <thead><tr><th scope="col">Lab</th><th scope="col" class="num">Started</th><th scope="col" class="num">Avg. levels</th><th scope="col" class="num">Finished</th></tr></thead>
            <tbody>${SE.labs.all().map((lab) => {
              const ps = sum.profiles.map((p) => (p.prof.labLevels[lab.id] || new Set()).size);
              const started = ps.filter((n) => n > 0);
              const avg = started.length ? (started.reduce((a, b) => a + b, 0) / started.length).toFixed(1) : "–";
              return `<tr><th scope="row"><a href="#/lab/${lab.id}">${esc(lab.title)}</a></th><td class="num">${started.length}/${sum.students.length}</td><td class="num">${avg} <small>of ${lab.levels.length}</small></td><td class="num">${ps.filter((n) => n === lab.levels.length).length}</td></tr>`;
            }).join("")}</tbody>
          </table>
        </div>
      </section>
      <section class="wrap section">${messageBlock(cls)}</section>

      <section class="wrap section teach-grid teach-grid--class" id="add-student-block">
        <div class="block add-students-block">
          <div class="block__head"><h2>Add students</h2></div>
          <p>Paste a list of names, one per line, or add one at a time. Each student gets a login card with secret pictures.</p>
          <button type="button" class="btn btn--primary" data-add-students="${cls.id}">${icon("plus")}Add students</button>
        </div>
        <div class="block class-code-block">
          <div class="block__head"><h2>How students sign in</h2></div>
          <ol class="how-steps">
            <li>Go to this site and choose <strong>I'm a student</strong>.</li>
            <li>Type the class code <b class="big-code">${esc(cls.code)}</b></li>
            <li>Tap their name, then their 3 secret pictures from their login card.</li>
          </ol>
        </div>
      </section>

      <section class="wrap section" aria-labelledby="cards-title">
        <div class="section__head">
          <div><span class="eyebrow">Login cards</span><h2 id="cards-title">${plural(students.length, "student", "students")}</h2></div>
          <p>Cut these out and hand them to students. Each card has the class code and that student's secret pictures.</p>
        </div>
        ${students.length ? `<div class="login-cards">
          ${students.map((st) => loginCard(st, cls, `
              <footer class="login-card__tools">
                <label class="visually-hidden" for="g-${st.id}">Grade band for ${esc(st.displayName)}</label>
                <select id="g-${st.id}" class="input input--small" data-grade="${st.id}">${STEM.gradeBands.map((g) => `<option value="${g.id}" ${g.id === st.gradeBand ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select>
                <button type="button" class="btn btn--ghost btn--small" data-newpics="${st.id}">${icon("refresh")}New pictures</button>
                ${pendingRemove === st.id
                  ? `<span class="confirm-inline">Remove ${esc(st.displayName)} and their progress? <button type="button" class="btn btn--danger btn--small" data-remove-yes="${st.id}">Remove</button><button type="button" class="btn btn--ghost btn--small" data-remove-no>Keep</button></span>`
                  : `<button type="button" class="btn btn--ghost btn--small" data-remove="${st.id}">${icon("trash")}Remove</button>`}
              </footer>`)).join("")}
        </div>` : `<div class="empty">${icon("users")}<h3>No students yet</h3><p>Add your first students. Their login cards appear here.</p><button type="button" class="btn btn--primary" data-add-students="${cls.id}">${icon("plus")}Add students</button></div>`}
      </section>

      <section class="wrap section" id="class-feed" aria-labelledby="feed-title">
        <div class="section__head"><div><span class="eyebrow">Live log</span><h2 id="feed-title">Recent activity</h2></div></div>
        <ol class="feed">
          ${sum.events.filter((e) => !FEED_NOISE.includes(e.type)).slice(-14).reverse().map((e) => {
            const d = describe(e, true);
            return `<li class="${d.strong ? "is-strong" : ""}">${icon(d.icon)}<span>${d.text}</span><time datetime="${new Date(e.at).toISOString()}">${SE.timeAgo(e.at)}</time></li>`;
          }).join("") || `<li>${icon("clock")}<span>No activity yet. Share your class code to get started.</span></li>`}
        </ol>
      </section>`;

    app().innerHTML = frame(user, cls, [], "classes", body, { eyebrow: "Class", code: true });
    bindFrame(user);
    bindRoster(sum);
    bindMessages(cls);
    const $ = (sel) => document.getElementById(sel);
    $("rename-class").addEventListener("submit", (e) => {
      e.preventDefault();
      if (SE.store.renameClass(cls.id, $("cr-name").value)) { SE.toast("Class renamed"); SE.route(true); }
      else $("cr-name").focus();
    });
    $("archive-class").addEventListener("click", () => {
      const on = !cls.archivedAt;
      SE.store.archiveClass(cls.id, on);
      SE.toast(on ? "Class archived. Its students can't sign in until you restore it." : "Class restored");
      SE.route(true);
    });
    $("delete-open").addEventListener("click", () => { deleteOpen = deleteOpen === cls.id ? null : cls.id; SE.route(true); if (deleteOpen) $("del-confirm").focus(); });
    $("delete-yes").addEventListener("click", () => {
      if ($("del-confirm").value.trim() !== cls.name) { $("del-err").textContent = `Type ${cls.name} exactly to delete it.`; $("del-confirm").focus(); return; }
      const name = cls.name;
      SE.store.deleteClass(cls.id);
      deleteOpen = null;
      SE.toast(`Deleted ${name}`);
      location.hash = "#/teach/classes";
    });
    app().querySelectorAll("[data-grade]").forEach((sel) => sel.addEventListener("change", () => {
      SE.store.updateStudent(sel.dataset.grade, { gradeBand: sel.value });
      SE.toast("Grade band updated");
    }));
    app().querySelectorAll("[data-newpics]").forEach((b) => b.addEventListener("click", () => {
      SE.store.newPictureCodeFor(b.dataset.newpics);
      SE.toast("New pictures set. Give the student a new card.");
      SE.route(true);
    }));
    app().querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => { pendingRemove = b.dataset.remove; SE.route(true); }));
    app().querySelectorAll("[data-remove-no]").forEach((b) => b.addEventListener("click", () => { pendingRemove = null; SE.route(true); }));
    app().querySelectorAll("[data-remove-yes]").forEach((b) => b.addEventListener("click", () => {
      SE.store.removeStudent(b.dataset.removeYes);
      pendingRemove = null;
      SE.toast("Student removed");
      SE.route(true);
    }));
  };

  const dueText = (d) => {
    if (!d) return "";
    const due = new Date(`${d}T23:59:59`);
    const days = Math.ceil((SE.startOfDay(due.getTime()) - SE.startOfDay(Date.now())) / SE.DAY);
    const label = due.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return days < 0 ? `Was due ${label}` : days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due ${label}`;
  };
  SE.dueText = dueText;

  /* ───────── Quick tasks in the shared modal ─────────
   * Any button can open these: data-add-students="<classId>", data-message-class="<classId or empty>",
   * data-note-student="<studentId>". The page behind re-renders when the modal closes. */
  const picChip = (pid) => `<span class="pic-chip">${icon(pid)}<span>${esc(SE.pictureById[pid].name)}</span></span>`;
  function loginCard(st, cls, tools = "") {
    return `
      <article class="login-card">
        <header><span class="login-card__brand">${SE.brandLogo(17)}</span><strong>${esc(st.displayName)}</strong></header>
        <p class="login-card__code">Class code <b>${esc(cls.code)}</b></p>
        <div class="login-card__pics">${st.picCode.map(picChip).join("")}</div>
        ${tools}
      </article>`;
  }

  function addStudentsModal(cls) {
    const existing = () => SE.store.studentsIn(cls.id).map((s) => s.displayName);
    let changed = false;
    SE.modal.open({
      title: `Add students to ${cls.name}`, wide: true,
      onClose: () => { if (changed) SE.route(true); },
      body: `
        <form id="ms-form" class="ms-form" novalidate>
          <div class="ms-cols">
            <div class="form__field">
              <label for="ms-names">Names, one per line</label>
              <textarea id="ms-names" class="input" rows="8" placeholder="Sam P.&#10;Maya R.&#10;Jonah T." aria-describedby="ms-help"></textarea>
              <p class="field-help" id="ms-help">Paste a list or type one name per line. Use a first name and last initial. No emails, birthdays, or other personal details.</p>
            </div>
            <div class="ms-side">
              <h3 class="ms-side__h">Check</h3>
              <ul class="ms-check" id="ms-check" aria-live="polite"><li class="muted">Names you type show up here.</li></ul>
            </div>
          </div>
          <div class="form__field">
            <label for="ms-grade">Grade band for these students</label>
            <select id="ms-grade" class="input">${STEM.gradeBands.map((g) => `<option value="${g.id}" ${g.id === "4-5" ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select>
          </div>
          <p class="form__error" id="ms-err" role="alert"></p>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn--primary" id="ms-add">${icon("plus")}Add students</button>
          </div>
        </form>`,
      onOpen(dlg) {
        const ta = dlg.querySelector("#ms-names"), list = dlg.querySelector("#ms-check"), btn = dlg.querySelector("#ms-add");
        const refresh = () => {
          const rows = SE.roster.checkNames(ta.value, existing());
          const ok = rows.filter((r) => r.ok).length;
          list.innerHTML = rows.length ? rows.map((r) => `<li class="${r.ok ? "is-ok" : "is-bad"}">${icon(r.ok ? "check" : "alert")}<span><strong>${esc(r.name)}</strong>${r.ok ? " Ready" : ` ${esc(r.reason)}`}</span></li>`).join("")
            : `<li class="muted">Names you type show up here.</li>`;
          btn.innerHTML = `${icon("plus")}${ok ? `Add ${plural(ok, "student", "students")}` : "Add students"}`;
        };
        ta.addEventListener("input", refresh);
        dlg.querySelector("#ms-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const rows = SE.roster.checkNames(ta.value, existing()).filter((r) => r.ok);
          const err = dlg.querySelector("#ms-err");
          if (!rows.length) { err.textContent = "Add at least one name that's ready."; ta.focus(); return; }
          const grade = dlg.querySelector("#ms-grade").value;
          const added = rows.map((r) => SE.store.addStudent(cls.id, { displayName: r.name, gradeBand: grade })).filter((r) => r.ok).map((r) => r.student);
          const skipped = SE.roster.checkNames(ta.value, []).length - added.length;
          changed = true;
          const body = dlg.querySelector(".modal__body");
          body.innerHTML = `
            <p class="ms-done" tabindex="-1">${icon("check")}<span><strong>Added ${plural(added.length, "student", "students")}.</strong>${skipped > 0 ? ` ${plural(skipped, "name was", "names were")} skipped. Fix ${skipped === 1 ? "it" : "them"} and add again.` : ""} Hand out these login cards.</span></p>
            <div class="login-cards ms-cards">${added.map((st) => loginCard(st, cls)).join("")}</div>
            <div class="modal__actions">
              <button type="button" class="btn btn--ghost" id="ms-more">${icon("plus")}Add more</button>
              <button type="button" class="btn btn--ghost" id="ms-print">${icon("print")}Print these cards</button>
              <button type="button" class="btn btn--primary" data-modal-close>Done</button>
            </div>`;
          body.querySelector(".ms-done").focus();
          body.querySelector("#ms-print").addEventListener("click", () => {
            document.body.classList.add("modal-printing");
            window.print();
            document.body.classList.remove("modal-printing");
          });
          body.querySelector("#ms-more").addEventListener("click", () => { SE.modal.close(); setTimeout(() => addStudentsModal(cls), 0); });
        });
      }
    });
  }

  function messageModal(user, classId) {
    const classes = SE.store.classesFor(user.id);
    if (!classes.length) return SE.toast("Add a class first.");
    const one = classes.find((c) => c.id === classId) || (classes.length === 1 ? classes[0] : null);
    let changed = false;
    SE.modal.open({
      title: one ? `Message ${one.name}` : "Message a class",
      onClose: () => { if (changed) SE.route(true); },
      body: `
        <form id="mm-form" class="form" novalidate>
          ${one ? `<input type="hidden" id="mm-class" value="${one.id}">` : `<div class="form__field"><label for="mm-class">Class</label>
            <select id="mm-class" class="input">${classes.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("")}</select></div>`}
          <div class="form__field">
            <label for="mm-body">Message</label>
            <textarea id="mm-body" class="input" rows="3" maxlength="500" placeholder="Example: Finish Lobster Trap Logic by Thursday. Bring your flowchart." aria-describedby="mm-help"></textarea>
            <p class="field-help" id="mm-help">Every student in the class sees it on Home. Keep it short and about class work. No student names or personal details.</p>
          </div>
          <p class="form__error" id="mm-err" role="alert"></p>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn--primary">${icon("message")}Post message</button>
          </div>
        </form>`,
      onOpen(dlg) {
        dlg.querySelector("#mm-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const text = dlg.querySelector("#mm-body").value.trim();
          if (!text) { dlg.querySelector("#mm-err").textContent = "Write a message first."; dlg.querySelector("#mm-body").focus(); return; }
          const cid = dlg.querySelector("#mm-class").value;
          SE.store.postMessage(cid, text);
          changed = true;
          SE.modal.close();
          SE.toast(`Posted to ${(SE.store.classById(cid) || {}).name}`);
        });
      }
    });
  }

  function noteModal(student) {
    let changed = false;
    SE.modal.open({
      title: `Note to ${student.displayName}`,
      onClose: () => { if (changed) SE.route(true); },
      body: `
        <form id="mn-form" class="form" novalidate>
          <div class="form__field">
            <label for="mn-body">Your note</label>
            <textarea id="mn-body" class="input" rows="3" maxlength="200" placeholder="Example: Great test notes on the bridge. Try one more change before you send it." aria-describedby="mn-help"></textarea>
            <p class="field-help" id="mn-help">Only ${esc(student.displayName)} sees it, on their Home. Keep it about their work.</p>
          </div>
          <p class="form__error" id="mn-err" role="alert"></p>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn--primary">${icon("message")}Send note</button>
          </div>
        </form>`,
      onOpen(dlg) {
        dlg.querySelector("#mn-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const note = dlg.querySelector("#mn-body").value.trim().slice(0, 200);
          if (!note) { dlg.querySelector("#mn-err").textContent = "Write a note first."; dlg.querySelector("#mn-body").focus(); return; }
          SE.store.teacherLog(student.id, "teacher_note", { note });
          changed = true;
          SE.modal.close();
          SE.toast(`Note sent to ${student.displayName}`);
        });
      }
    });
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add-students], [data-message-class], [data-note-student]");
    if (!b) return;
    const user = SE.store.currentUser();
    if (!user || user.role !== "educator") return;
    e.preventDefault();
    if (b.dataset.addStudents !== undefined) { const c = SE.store.classById(b.dataset.addStudents); if (c) addStudentsModal(c); }
    else if (b.dataset.messageClass !== undefined) messageModal(user, b.dataset.messageClass);
    else { const s = SE.store.studentById ? SE.store.studentById(b.dataset.noteStudent) : null; if (s) noteModal(s); }
  });
  SE.teachQuick = { addStudents: addStudentsModal, message: messageModal, note: noteModal };

  /* ───────── Bits used on library pages ───────── */
  SE.views.educatorStrip = function (user) {
    const { cls } = getClass(user);
    if (!cls) return "";
    const sum = SE.game.classSummary(cls.id);
    const waiting = pendingChecks(sum).length;
    return `
      <div class="wrap"><div class="edu-strip">
        ${icon("clipboard")}
        <p><strong>${esc(cls.name)}</strong> · ${plural(sum.students.length, "student", "students")} · ${plural(waiting, "check", "checks")} waiting</p>
        <a class="btn btn--primary btn--small" href="#/teach">Open educator dashboard ${icon("arrowRight")}</a>
      </div></div>`;
  };

  SE.views.activityClassBox = function (user, a) {
    const { cls } = getClass(user);
    if (!cls) return SE.planPicker ? SE.planPicker(user, a) : "";
    const sum = SE.game.classSummary(cls.id);
    const done = sum.profiles.filter((p) => p.prof.completedIds.has(a.id));
    const opened = sum.profiles.filter((p) => !p.prof.completedIds.has(a.id) && p.prof.opened.has(a.id));
    return `
      ${SE.planPicker ? SE.planPicker(user, a) : ""}
      <div class="block">
        <h2>In ${esc(cls.name)}</h2>
        <p><strong>${done.length} of ${sum.students.length}</strong> passed${opened.length ? ` · ${opened.length} in progress` : ""}</p>
        <div class="mini-meter"><span style="width:${sum.students.length ? (done.length / sum.students.length) * 100 : 0}%"></span></div>
        ${done.length ? `<p class="muted small">${done.map((p) => esc(p.student.displayName)).join(", ")}</p>` : ""}
      </div>`;
  };
})();
