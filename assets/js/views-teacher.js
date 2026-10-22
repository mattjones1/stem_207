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
  /* A student's status on one mission, as a small chip (word + shape, not color alone). */
  const STATUS_ICON = { confirmed: "shield", tryagain: "refresh", checked: "flask", submitted: "check", started: "clock", none: "clock" };
  const statusChip = (st) => `<span class="st-chip st-chip--${st.state}">${icon(STATUS_ICON[st.state])}${esc(st.label)}</span>`;
  /* Record a teacher check: confirm the target skill (spoken, demo, or work) or ask for another try. */
  const checkActions = (student, a, st) => st.state === "confirmed" ? "" : `
    <details class="check-act">
      <summary>${icon("shield")}Record a check</summary>
      <form class="check-act__form" data-check-student="${student.id}" data-check-activity="${a.id}">
        ${a.check ? `<p class="muted small"><strong>Check:</strong> ${esc(a.check)}</p>` : ""}
        <label>How did you check? <select class="input input--small" name="how">
          <option value="oral">Spoken check (they told me)</option><option value="demo">Watched them show it</option><option value="work">Reviewed their work</option></select></label>
        <label>Note for ${esc(student.displayName.split(" ")[0])} <span class="muted">(needed for Try again)</span>
          <input class="input input--small" name="note" maxlength="200" placeholder="What to try next, or what they did well"></label>
        <div class="check-act__btns">
          <button type="submit" class="btn btn--primary btn--small" name="act" value="confirm">${icon("check")}Confirm</button>
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
      SE.toast(act === "confirm" ? "Confirmed" : "Sent back with your note");
      SE.route(true);
    });
  }
  /* What a teacher needs before class, from the activity's own materials and setup. */
  const prepLine = (a) => {
    if (a.launch.status === "lab") return `<span class="prep-line">${icon("check")}${a.time && a.time.prep ? `Teacher prep: about ${a.time.prep} min to check devices. Runs inside STEM 207.` : "No prep: runs inside STEM 207"}</span>`;
    const mats = (a.before && a.before.materials) || [], setup = (a.before && a.before.setup) || [];
    return `<details class="prep-line"><summary>${icon("clipboard")}Teacher prep: ${a.time && a.time.prep ? `about ${a.time.prep} min, ` : ""}${mats.length} material${mats.length === 1 ? "" : "s"}${setup.length ? `, ${setup.length} setup step${setup.length === 1 ? "" : "s"}` : ""}</summary>
      ${mats.length ? `<p><strong>Materials:</strong> ${mats.map(esc).join("; ")}</p>` : ""}${setup.length ? `<p><strong>Setup:</strong> ${setup.map(esc).join(" ")}</p>` : ""}</details>`;
  };
  const FEED_NOISE = ["step_checked", "signed_in", "lab_test_run", "lab_opened", "lab_hint", "lab_clue", "lab_compass", "lab_fps", "lab_play", "lab_prediction", "lab_trained", "lab_bug", "lab_miss", "profile_custom"];
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
      case "teacher_confirmed": return { icon: "shield", text: `Teacher confirmed ${withName ? esc((SE.store.studentById(e.studentId) || {}).displayName) + "’s " : ""}${title}${e.data.how ? ` (${esc({ oral: "spoken check", demo: "watched a demo", work: "reviewed work" }[e.data.how] || "")})` : ""}`, strong: true };
      case "teacher_try_again": return { icon: "refresh", text: `Teacher asked ${withName ? esc((SE.store.studentById(e.studentId) || {}).displayName) : "them"} to try again on ${title}` };
      case "help_requested": return { icon: "question", text: `${who}asked for help on ${title}`, strong: true };
      case "mission_opened": return { icon: "eye", text: `${who}opened ${title}` };
      case "launched": return { icon: "external", text: `${who}launched ${a ? esc(a.launch.provider) : "a resource"} for ${title}` };
      case "step_checked": return { icon: "list", text: `${who}${e.data.checked ? "checked off" : "unchecked"} step ${e.data.step + 1} of ${title}` };
      case "mission_completed": return { icon: "check", text: `${who}${e.data.evidence ? "sent" : "marked"} ${title}${e.data.evidence ? "" : " complete"} ${completionTag(e)}`, strong: true };
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

  /* ───────── Frame: header, tabs, demo banner ───────── */
  function frame(user, cls, classes, active, body, opts = {}) {
    const summary = cls ? SE.game.classSummary(cls.id) : null;
    const pendingRefl = summary ? pendingReflections(summary).length : 0;
    const pendingClaims = summary ? pendingStageClaims(summary).length : 0;
    const tabs = [
      ["overview", "#/teach", "Overview", "chart", 0],
      ["missions", "#/teach/missions", "Missions", "rocket", 0],
      ["pathway", "#/teach/pathway", "Coding pathway", "flag", pendingClaims],
      ["reflections", "#/teach/reflections", "Reflections", "message", pendingRefl],
      ["class", "#/teach/class", "Class & logins", "users", 0]
    ];
    return `
      <section class="page-top page-top--teach">
        <div class="wrap page-top__inner">
          <div class="teach-head">
            <div>
              <span class="eyebrow">Educator dashboard</span>
              <h1 tabindex="-1">${opts.title || (cls ? esc(cls.name) : "Your classes")}</h1>
            </div>
            ${cls ? `
            <div class="teach-head__tools">
              ${classes.length > 1 ? `
                <label class="visually-hidden" for="class-switch">Class</label>
                <select id="class-switch" class="select-dark">${classes.map((c) => `<option value="${c.id}" ${c.id === cls.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select>` : ""}
              <span class="code-chip" title="Students use this code to sign in">${icon("key")}Class code <b>${esc(cls.code)}</b></span>
            </div>` : ""}
          </div>
          ${cls ? `<nav class="tabs" aria-label="Dashboard sections">
            ${tabs.map(([id, href, label, ic, badge]) => `<a href="${href}" class="tab" ${active === id ? 'aria-current="page"' : ""}>${icon(ic)}${label}${badge ? `<span class="tab__badge" aria-label="${badge} waiting">${badge}</span>` : ""}${id === "missions" && cls && SE.store.assignmentsFor(cls.id).length ? `<span class="tab__count" aria-label="${SE.store.assignmentsFor(cls.id).length} assigned">${SE.store.assignmentsFor(cls.id).length}</span>` : ""}</a>`).join("")}
          </nav>` : ""}
        </div>
      </section>
      ${cls && cls.isDemo ? `
        <div class="wrap"><div class="demo-banner">
          ${icon("flag")}
          <p><strong>Sample class.</strong> These students and their activity are made up to show how the dashboard works. ${SE.store.mode === "cloud" ? "It lives in your account so you can explore; remove it anytime by resetting it or ignore it." : "Changes you make here are saved in this browser."}</p>
          <button type="button" class="btn btn--ghost btn--small" id="reset-demo">${icon("refresh")}Reset sample data</button>
        </div></div>` : ""}
      ${body}`;
  }

  function bindFrame(user) {
    const sw = document.getElementById("class-switch");
    if (sw) sw.addEventListener("change", () => { currentClassId = sw.value; SE.route(true); });
    const rd = document.getElementById("reset-demo");
    if (rd) rd.addEventListener("click", async () => { rd.disabled = true; try { const c = await SE.store.resetDemo(); if (c) currentClassId = c.id; SE.toast("Sample data reset"); } catch (e) { SE.toast("Couldn't reset the sample class. Try again."); } SE.route(true); });
    const ad = document.getElementById("add-demo");
    if (ad) ad.addEventListener("click", async () => { ad.disabled = true; ad.textContent = "Adding the sample class…"; try { const c = await SE.store.resetDemo(); if (c) currentClassId = c.id; SE.toast("Sample class added"); location.hash = "#/teach"; } catch (e) { SE.toast("Couldn't add the sample class. Try again."); } SE.route(true); });
  }

  function pendingReflections(summary) {
    const out = [];
    summary.profiles.forEach(({ student, prof }) => {
      prof.completions.forEach((c) => {
        // Waiting for you: unread written answers, and "I'll show you" submissions not yet checked.
        // A teacher check (confirm or try again) after the submission also counts as reviewed.
        const st = SE.game.statusFor(prof, c.activity);
        const checkedSince = (st.confirmed && st.confirmed.at > c.event.at) || (st.tryAgain && st.tryAgain.at > c.event.at);
        const latest = st.sub && st.sub.id === c.event.id;
        if (checkedSince) return;
        if ((c.event.data.reflection || "").trim() && !prof.reviewed[c.event.id]) out.push({ student, prof, c });
        else if (latest && c.event.data.evidence === "show" && st.state === "submitted") out.push({ student, prof, c });
      });
    });
    return out.sort((a, b) => b.c.event.at - a.c.event.at);
  }
  function pendingStageClaims(summary) {
    const out = [];
    summary.profiles.forEach(({ student, prof }) => {
      Object.entries(prof.stages).forEach(([stage, st]) => { if (st.status === "claimed") out.push({ student, stage: Number(stage), at: st.at }); });
    });
    return out.sort((a, b) => a.at - b.at);
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
      location.hash = "#/teach/class";
    });
  }

  /* ───────── Overview ───────── */
  SE.views.teach = function (user) {
    const { classes, cls } = getClass(user);
    if (!cls) return noClass(user);
    const sum = SE.game.classSummary(cls.id);
    const now = Date.now();
    const weekAgo = now - 7 * SE.DAY;
    const twoWeeksAgo = now - 14 * SE.DAY;
    const completions = sum.events.filter((e) => e.type === "mission_completed");
    const thisWeek = completions.filter((e) => e.at >= weekAgo).length;
    const lastWeek = completions.filter((e) => e.at >= twoWeeksAgo && e.at < weekAgo).length;
    const activeIds = new Set(sum.events.filter((e) => e.at >= weekAgo && !e.by).map((e) => e.studentId));
    const refl = pendingReflections(sum);
    const claims = pendingStageClaims(sum);

    // Attention list
    const attention = [];
    sum.profiles.forEach(({ student, prof }) => {
      if (!prof.lastActive) attention.push({ student, why: "Hasn't signed in yet", icon: "user" });
      else if (now - prof.lastActive > 7 * SE.DAY) attention.push({ student, why: `No activity for ${Math.floor((now - prof.lastActive) / SE.DAY)} days`, icon: "clock" });
      const recent = prof.completions.slice(-3);
      const stuck = recent.filter((c) => c.event.data.confidence === "figuring").length;
      if (stuck >= 2) attention.push({ student, why: `Said “still figuring it out” on ${stuck} of their last ${recent.length} missions`, icon: "question" });
      const help = SE.store.eventsFor(student.id).filter((e) => e.type === "help_requested" && now - e.at < SE.DAY).pop();
      if (help) { const ha = SE.activityById[help.data.activityId]; attention.unshift({ student, why: `Asked for help ${SE.timeAgo(help.at)}${ha ? ` on ${ha.title}` : ""}`, icon: "message" }); }
    });

    // 14-day chart
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const start = SE.startOfDay(now - i * SE.DAY);
      days.push({ start, n: completions.filter((e) => e.at >= start && e.at < start + SE.DAY).length });
    }
    const maxDay = Math.max(1, ...days.map((d) => d.n));
    const yMax = Math.max(2, Math.ceil(maxDay / 2) * 2);

    // Areas
    const areaCounts = STEM.areas.map((a) => ({ a, n: completions.filter((e) => SE.activityById[e.data.activityId] && SE.activityById[e.data.activityId].area === a.id).length }));
    const maxArea = Math.max(1, ...areaCounts.map((x) => x.n));

    const delta = thisWeek - lastWeek;
    const body = `
      <section class="wrap section">
        <div class="kpis">
          <a class="kpi" href="#roster"><span class="kpi__label">Active this week</span><span class="kpi__value">${activeIds.size}<small> of ${sum.students.length}</small></span><span class="kpi__foot">explorers signed in or worked</span></a>
          <div class="kpi"><span class="kpi__label">Missions this week</span><span class="kpi__value">${thisWeek}</span><span class="kpi__foot ${delta > 0 ? "is-up" : delta < 0 ? "is-down" : ""}">${delta === 0 ? "same as last week" : `${delta > 0 ? "▲" : "▼"} ${Math.abs(delta)} vs. last week`}</span></div>
          <a class="kpi ${refl.length ? "kpi--action" : ""}" href="#/teach/reflections"><span class="kpi__label">Reflections to read</span><span class="kpi__value">${refl.length}</span><span class="kpi__foot">${refl.length ? "Review answers" : "All caught up"}</span></a>
          <a class="kpi ${claims.length ? "kpi--action" : ""}" href="#/teach/pathway"><span class="kpi__label">“I can” checks</span><span class="kpi__value">${claims.length}</span><span class="kpi__foot">${claims.length ? "Waiting for you" : "None waiting"}</span></a>
        </div>
      </section>
      <section class="wrap section">${messageBlock(cls)}</section>

      <section class="wrap section teach-grid">
        <div class="block chart-block">
          <div class="block__head"><h2>Missions completed</h2><span class="muted">Last 14 days</span></div>
          <div class="colchart" role="img" aria-label="Missions completed per day over the last 14 days: ${days.map((d) => d.n).join(", ")}">
            <div class="colchart__grid" aria-hidden="true">
              ${[yMax, yMax / 2, 0].map((v) => `<span><b>${v}</b></span>`).join("")}
            </div>
            <div class="colchart__bars">
              ${days.map((d, i) => `<div class="colchart__col ${i === days.length - 1 ? "is-today" : ""}" title="${SE.dateShort(d.start)}: ${d.n}">
                <span class="colchart__bar" style="height:${(d.n / yMax) * 100}%">${d.n ? `<em>${d.n}</em>` : ""}</span>
                <span class="colchart__x">${i % 2 === 1 || i === days.length - 1 ? (i === days.length - 1 ? "Today" : new Date(d.start).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })) : ""}</span>
              </div>`).join("")}
            </div>
          </div>
        </div>
        <div class="block">
          <div class="block__head"><h2>Where they're exploring</h2><span class="muted">All time</span></div>
          <ul class="hbars">
            ${areaCounts.map(({ a, n }) => `<li><span class="hbars__label">${icon(a.icon)}${esc(a.short)}</span><span class="hbars__track"><span style="width:${(n / maxArea) * 100}%"></span></span><b>${n}</b></li>`).join("")}
          </ul>
        </div>
        ${(() => {
          const list = SE.store.assignmentsFor(cls.id).map((x) => ({ x, a: SE.activityById[x.activityId] })).filter((r) => r.a);
          return `<div class="block">
            <div class="block__head"><h2>Assigned missions</h2><a class="muted" href="#/teach/missions">${list.length ? "Manage" : "Assign missions"}</a></div>
            ${list.length ? `<ul class="alist alist--compact">${list.map(({ x, a }) => `<li class="alist__item"><div class="alist__main"><a href="#/activity/${a.id}">${esc(a.title)}</a><small>${x.dueDate ? esc(dueText(x.dueDate)) : "No due date"}</small>${prepLine(a)}</div>${progressMarkup(classProgress(sum, a))}</li>`).join("")}</ul>`
              : `<p class="muted">Pick missions by discipline on the <a href="#/teach/missions">Missions</a> tab. They'll show up first on every student's home screen.</p>`}
          </div>`;
        })()}
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
        <div class="block">
          <div class="block__head"><h2>Needs a check-in</h2><span class="muted">${attention.length ? plural(attention.length, "item", "items") : ""}</span></div>
          ${attention.length ? `<ul class="attn">${attention.map((x) => `<li>${icon(x.icon)}<span><a href="#/teach/student/${x.student.id}"><strong>${esc(x.student.displayName)}</strong></a><small>${esc(x.why)}</small></span></li>`).join("")}</ul>`
            : `<p class="muted">Everyone has been active this week and nobody is flagging trouble.</p>`}
        </div>
        <div class="block">
          <div class="block__head"><h2>Class journey</h2><span class="muted">${sum.journey.goal.next ? `Next stop: ${esc(sum.journey.goal.next.name)}` : "Katahdin reached"}</span></div>
          ${SE.classJourneyBlock(sum.journey)}
          <p class="muted">Only class work moves the journey: missions you assign, and missions and stages you confirm. Students see this on Today and My expedition. Their own XP, ranks, patches, and harbor still count everything they do.</p>
        </div>
      </section>

      <section class="wrap section" id="roster" aria-labelledby="roster-title">
        <div class="section__head"><div><span class="eyebrow">Roster</span><h2 id="roster-title">${plural(sum.students.length, "explorer", "explorers")}</h2></div>
          <a class="btn btn--ghost btn--small" href="#/teach/class">${icon("plus")}Add students</a></div>
        ${rosterTable(sum)}
      </section>

      <section class="wrap section" aria-labelledby="feed-title">
        <div class="section__head"><div><span class="eyebrow">Live log</span><h2 id="feed-title">Recent activity</h2></div></div>
        <ol class="feed">
          ${sum.events.filter((e) => !FEED_NOISE.includes(e.type)).slice(-14).reverse().map((e) => {
            const d = describe(e, true);
            return `<li class="${d.strong ? "is-strong" : ""}">${icon(d.icon)}<span>${d.text}</span><time datetime="${new Date(e.at).toISOString()}">${SE.timeAgo(e.at)}</time></li>`;
          }).join("") || `<li>${icon("clock")}<span>No activity yet. Share your class code to get started.</span></li>`}
        </ol>
      </section>`;

    app().innerHTML = frame(user, cls, classes, "overview", body);
    bindFrame(user);
    bindRoster(sum);
    bindMessages(cls);
  };

  /* Class messages: a short note to the whole class, shown under "From your teacher" on Today. */
  function messageBlock(cls) {
    const list = SE.store.messagesFor(cls.id);
    return `
      <div class="block msg-block" id="class-messages">
        <div class="block__head"><h2>${icon("message")}Message your class</h2><span class="muted">Students see the newest 3 on their Today page</span></div>
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

  function rosterTable(sum) {
    const rows = sum.profiles.map(({ student, prof }) => {
      let stage = 0;
      while (prof.stages[stage + 1] && prof.stages[stage + 1].status === "cleared") stage++;
      return { student, prof, stage };
    });
    const k = rosterSort.key, d = rosterSort.dir;
    rows.sort((x, y) => {
      const v = {
        name: x.student.displayName.localeCompare(y.student.displayName),
        xp: x.prof.xp - y.prof.xp,
        missions: x.prof.counts.missions - y.prof.counts.missions,
        patches: x.prof.earnedCount - y.prof.earnedCount,
        stage: x.stage - y.stage,
        active: (x.prof.lastActive || 0) - (y.prof.lastActive || 0)
      }[k];
      return v * d;
    });
    const th = (key, label, num) => {
      const sorted = rosterSort.key === key;
      return `<th scope="col" class="${num ? "num" : ""}" aria-sort="${sorted ? (rosterSort.dir === 1 ? "ascending" : "descending") : "none"}">
        <button type="button" data-sort="${key}">${label}<span aria-hidden="true">${sorted ? (rosterSort.dir === 1 ? " ▲" : " ▼") : ""}</span></button></th>`;
    };
    if (!rows.length) return `<div class="empty">${icon("users")}<h3>No students yet</h3><p>Add students on the Class & logins tab, then hand out login cards.</p><a class="btn btn--primary" href="#/teach/class">${icon("plus")}Add students</a></div>`;
    return `
      <div class="table-wrap">
        <table class="roster">
          <thead><tr>${th("name", "Explorer")}<th scope="col">Rank</th>${th("xp", "XP", true)}${th("missions", "Missions", true)}${th("patches", "Patches", true)}${th("stage", "Pathway", true)}${th("active", "Last active", true)}</tr></thead>
          <tbody>
            ${rows.map(({ student, prof, stage }) => {
              const stale = !prof.lastActive || Date.now() - prof.lastActive > 7 * SE.DAY;
              return `<tr>
                <th scope="row"><a class="roster-name" href="#/teach/student/${student.id}">${SE.studentAvatar(student.id, 30, prof)}${esc(student.displayName)}</a><small>${esc(SE.gradeById[student.gradeBand] ? SE.gradeById[student.gradeBand].name : "")}</small></th>
                <td><span class="rank-cell">${SE.insignia(prof.rank, 22)}${esc(prof.rank.name)}</span></td>
                <td class="num">${SE.num(prof.xp)}</td>
                <td class="num">${prof.counts.missions}</td>
                <td class="num">${prof.earnedCount}</td>
                <td class="num"><span class="stage-pips" aria-label="${stage} of 7 stages cleared">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<i class="${n <= stage ? "on" : prof.stages[n] ? "wait" : ""}"></i>`).join("")}</span></td>
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
      document.querySelector(".table-wrap").outerHTML = rosterTable(sum);
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
        <a class="btn btn--ghost btn--small" href="#/teach">${icon("arrowLeft")}Back to class overview</a>
        <div class="student-head">
          ${SE.studentAvatar(student.id, 72, prof)}
          <div>
            <h2>${esc(student.displayName)}</h2>
            <p class="muted">${esc(prof.rank.name)} · ${esc(SE.gradeById[student.gradeBand] ? SE.gradeById[student.gradeBand].name : "")} · last active ${prof.lastActive ? SE.timeAgo(prof.lastActive) : "never"}</p>
            ${SE.rankBar(prof, true)}
          </div>
          <dl class="xstats xstats--light">
            <div><dt>XP</dt><dd>${SE.num(prof.xp)}</dd></div>
            <div><dt>Missions</dt><dd>${prof.counts.missions}</dd></div>
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
            <div class="block__head"><h2>Assigned missions</h2><span class="muted">${doneN} of ${list.length} done</span></div>
            <ul class="astatus">${list.map(({ x, a }) => { const d = SE.game.missionDone(prof, a); const late = !d && x.dueDate && new Date(`${x.dueDate}T23:59:59`).getTime() < Date.now();
              const st = SE.game.statusFor(prof, a);
              return `<li class="${d ? "is-done" : late ? "is-late" : ""}">${icon(d ? "check" : late ? "alert" : "clock")}<span class="astatus__main"><a href="#/activity/${a.id}">${esc(a.title)}</a><small>${x.dueDate ? esc(dueText(x.dueDate)) : "No due date"}</small></span>${statusChip(st)}${checkActions(student, a, st)}</li>`; }).join("")}</ul>
          </div>`;
        })()}
        <div class="block">
          <div class="block__head"><h2>Coding pathway</h2></div>
          <ol class="stage-list">
            ${STEM.pathway.map((s) => {
              const st = prof.stages[s.stage];
              return `<li class="${st ? `is-${st.status}` : ""}">
                <span class="stage-list__n">${s.stage}</span>
                <span class="stage-list__t"><strong>${esc(s.title)}</strong><small>${esc(s.iCan)}</small></span>
                ${st && st.status === "cleared" ? `<span class="chip chip--done">${icon("check")}Cleared</span>`
                  : st ? `<span class="stage-actions"><button class="btn btn--primary btn--small" data-verify="${s.stage}">${icon("check")}Confirm</button><button class="btn btn--ghost btn--small" data-return="${s.stage}">Not yet</button></span>`
                  : `<span class="muted">Not claimed</span>`}
              </li>`;
            }).join("")}
          </ol>
        </div>
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
            return `<li><span><a href="#/lab/${lab.id}">${esc(lab.title)}</a><small>${n} of ${lab.levels.length} levels · ${st.runs} tests · ${st.hints} hints</small>${ls && ["checked", "confirmed", "tryagain"].includes(ls.state) ? statusChip(ls) : ""}</span><span class="meter"><span style="width:${(n / lab.levels.length) * 100}%"></span></span></li>`;
          }).join("")}</ul>
        </div>
        <div class="block">
          <div class="block__head"><h2>Creations</h2><span class="muted">From the Pixel Animation Studio</span></div>
          ${SE.views.creationsGallery(prof) || `<p class="muted">No saved animations yet.</p>`}
        </div>
      </section>

      <section class="wrap section" aria-labelledby="slog-title">
        <div class="section__head"><div><span class="eyebrow">Mission log</span><h2 id="slog-title">${plural(log.length, "completed mission", "completed missions")}</h2></div></div>
        ${log.length ? `<ol class="mission-log">${log.map((c) => reflectionItem(student, prof, c, false)).join("")}</ol>` : `<p class="muted">No missions completed yet.</p>`}
      </section>

      <section class="wrap section" aria-labelledby="tl-title">
        <div class="section__head"><div><span class="eyebrow">Activity</span><h2 id="tl-title">Everything ${esc(student.displayName.split(" ")[0])} did</h2></div><span class="muted">${plural(events.length, "event", "events")}</span></div>
        <ol class="feed">${events.filter((e) => !TIMELINE_NOISE.includes(e.type)).slice(0, 60).map((e) => { const d = describe(e, false); return `<li class="${d.strong ? "is-strong" : ""}">${icon(d.icon)}<span>${d.text}</span><time datetime="${new Date(e.at).toISOString()}">${SE.timeAgo(e.at)}</time></li>`; }).join("")}</ol>
      </section>`;

    app().innerHTML = frame(user, cls, classes, "", body, { title: esc(cls.name) });
    bindFrame(user);
    bindStageButtons();
    bindReflectionActions();
    bindCheckActions();
  };

  function bindStageButtons() {
    app().querySelectorAll("[data-verify]").forEach((b) => b.addEventListener("click", () => {
      SE.store.teacherLog(b.dataset.student || location.hash.split("/").pop(), "ican_verified", { stage: Number(b.dataset.verify) });
      SE.toast(`Stage ${b.dataset.verify} confirmed`);
      SE.route(true);
    }));
    app().querySelectorAll("[data-return]").forEach((b) => b.addEventListener("click", () => {
      SE.store.teacherLog(b.dataset.student || location.hash.split("/").pop(), "ican_returned", { stage: Number(b.dataset.return) });
      SE.toast(`Stage ${b.dataset.return} marked “not yet”`);
      SE.route(true);
    }));
  }

  /* ───────── Reflections ───────── */
  function reflectionItem(student, prof, c, withName) {
    const r = prof.reviewed[c.event.id];
    const conf = P.confidence.find((x) => x.id === c.event.data.confidence);
    const answer = (c.event.data.reflection || "").trim();
    return `
      <li class="${r ? "is-reviewed" : ""}">
        <div class="mission-log__head">
          <span class="icon-badge">${icon(SE.areaById[c.activity.area].icon)}</span>
          <div>
            ${withName ? `<a href="#/teach/student/${student.id}"><strong>${esc(student.displayName)}</strong></a> · ` : ""}<a href="#/activity/${c.activity.id}">${withName ? esc(c.activity.title) : `<strong>${esc(c.activity.title)}</strong>`}</a>
            <span>${SE.dateShort(c.event.at)} · ${completionTag(c.event)} · ${c.event.data.stepsDone || 0}/${c.event.data.stepsTotal || c.activity.steps.length} steps · ${c.event.data.extension ? "tried the challenge" : "no challenge"}</span>
          </div>
          ${conf ? `<span class="conf conf--${conf.id}">${esc(conf.name)}</span>` : ""}
        </div>
        ${(() => { const st = SE.game.statusFor(prof, c.activity); return st.sub && st.sub.id === c.event.id ? `<div class="check-row-wrap">${statusChip(st)}${checkActions(student, c.activity, st)}</div>` : ""; })()}
        ${c.event.data.extensionNote ? `<p class="muted small"><strong>Take it further:</strong> “${esc(c.event.data.extensionNote)}”</p>` : ""}
        ${answer ? `<p class="mission-log__q">${esc(c.event.data.evidence && c.activity.check ? c.activity.check : c.activity.reflect)}</p><p class="mission-log__answer">“${esc(answer)}”</p>` : (c.event.data.evidence === "show" ? `<p class="muted">${icon("users", 'class="inline-icon"')}Chose to show or tell you instead of writing.</p>` : `<p class="muted">No answer to the reflection question.</p>`)}
        ${r ? (r.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>You replied:</strong> ${esc(r.data.note)}</span></p>` : `<p class="muted">${icon("eye", 'class="inline-icon"')}Marked as read</p>`)
          : answer ? `
          <form class="reply-form" data-completion="${c.event.id}" data-student="${student.id}">
            <label class="visually-hidden" for="reply-${c.event.id}">Reply to ${esc(student.displayName)}</label>
            <input id="reply-${c.event.id}" class="input" maxlength="200" placeholder="Optional reply. ${esc(student.displayName.split(" ")[0])} will see it.">
            <button type="submit" class="btn btn--primary btn--small">${icon("check")}Mark read</button>
          </form>` : ""}
      </li>`;
  }

  function bindReflectionActions() {
    app().querySelectorAll(".reply-form").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = f.querySelector("input").value.trim();
      SE.store.teacherLog(f.dataset.student, "reflection_reviewed", { completionId: f.dataset.completion, note });
      SE.toast(note ? "Reply sent" : "Marked as read");
      SE.route(true);
    }));
  }

  SE.views.teachReflections = function (user) {
    const { classes, cls } = getClass(user);
    if (!cls) return noClass(user);
    const sum = SE.game.classSummary(cls.id);
    const pending = pendingReflections(sum);
    const reviewed = [];
    if (showReviewed) sum.profiles.forEach(({ student, prof }) => prof.completions.forEach((c) => {
      if ((c.event.data.reflection || "").trim() && prof.reviewed[c.event.id]) reviewed.push({ student, prof, c });
    }));
    reviewed.sort((a, b) => b.c.event.at - a.c.event.at);

    const body = `
      <section class="wrap section">
        <div class="section__head">
          <div><span class="eyebrow">Think about it</span><h2>${pending.length ? `${plural(pending.length, "answer", "answers")} to read` : "You're all caught up"}</h2></div>
          <label class="check-row"><input type="checkbox" id="show-reviewed" ${showReviewed ? "checked" : ""}> Show answers you've already read</label>
        </div>
        <p class="muted section-note">Reflections show how students are thinking. A short reply, like “Great evidence,” keeps them writing. Students see your reply on their home screen and in their mission log.</p>
        ${pending.length ? `<ol class="mission-log">${pending.map((x) => reflectionItem(x.student, x.prof, x.c, true)).join("")}</ol>`
          : `<div class="empty">${icon("message")}<h3>No new reflections</h3><p>When students answer “Think about it” at the end of a mission, their answers show up here.</p></div>`}
        ${showReviewed ? `<h3 class="subhead">Already read</h3><ol class="mission-log">${reviewed.map((x) => reflectionItem(x.student, x.prof, x.c, true)).join("")}</ol>` : ""}
      </section>`;
    app().innerHTML = frame(user, cls, classes, "reflections", body);
    bindFrame(user);
    bindReflectionActions();
    bindCheckActions();
    document.getElementById("show-reviewed").addEventListener("change", (e) => { showReviewed = e.target.checked; SE.route(true); });
  };

  /* ───────── Coding pathway (educator) ─────────
     The same seven stages students see, from the same data (STEM.pathway), plus the class's
     status on each stage, checks waiting, what a confirm looks like, and assigning. */
  SE.views.teachPathway = function (user) {
    const { classes, cls } = getClass(user);
    if (!cls) return noClass(user);
    const sum = SE.game.classSummary(cls.id);
    const claims = pendingStageClaims(sum);
    const claimRow = (x, withStage) => {
      const s = STEM.pathway.find((p) => p.stage === x.stage);
      return `<li>
        <div><a href="#/teach/student/${x.student.id}"><strong>${esc(x.student.displayName)}</strong></a><span>${withStage ? `Stage ${x.stage}: ${esc(s.title)} · ` : ""}asked ${SE.timeAgo(x.at)}</span>${withStage ? `<em>“${esc(s.iCan)}”</em>` : ""}</div>
        <span class="stage-actions"><button class="btn btn--primary btn--small" data-verify="${x.stage}" data-student="${x.student.id}">${icon("check")}Confirm</button><button class="btn btn--ghost btn--small" data-return="${x.stage}" data-student="${x.student.id}">Not yet</button></span>
      </li>`;
    };
    const stageCard = (st) => {
      const acts = st.activities.map((id) => SE.activityById[id]).filter(Boolean);
      const cleared = sum.profiles.filter((p) => p.prof.stages[st.stage] && p.prof.stages[st.stage].status === "cleared");
      const waiting = claims.filter((c) => c.stage === st.stage);
      const notYet = sum.students.length - cleared.length - waiting.length;
      const unassigned = acts.filter((a) => !SE.store.assignmentFor(cls.id, a.id));
      const labLevels = (SE.roverLevels || []).map((l, i) => (l.stage === st.stage ? i + 1 : 0)).filter(Boolean);
      const t = st.teach || {};
      return `
        <li class="stage tstage" id="tstage-${st.stage}">
          <div class="stage__node" aria-hidden="true"><div><small>Stage</small><b>${st.stage}</b></div></div>
          <article class="block stage__card" aria-labelledby="tstage-title-${st.stage}">
            <div class="stage__head">
              <div>
                <h2 id="tstage-title-${st.stage}"><span class="visually-hidden">Stage ${st.stage}: </span>${esc(st.title)}</h2>
                <p class="stage__concepts">${esc(st.concepts)}</p>
              </div>
              <p class="tstage__status" aria-label="Class status for stage ${st.stage}">
                <span class="tchip is-cleared">${icon("check")}${cleared.length} cleared</span>
                <span class="tchip is-claimed">${icon("clock")}${waiting.length} waiting</span>
                <span class="tchip">${notYet} not yet</span>
              </p>
            </div>
            ${waiting.length ? `<div class="tstage__waiting"><h3>${icon("flag")}Waiting for your check</h3><ul class="claims claims--compact">${waiting.map((x) => claimRow(x, false)).join("")}</ul></div>` : ""}
            <div class="ican">${icon("check")}<span><span class="visually-hidden">Readiness check: </span>${esc(st.iCan)}</span></div>
            <div class="tstage__teach">
              <div><h3>What a confirm looks like</h3><p>${esc(t.lookFor || "")}</p></div>
              <div><h3>Common misconception</h3><p>${esc(t.misconception || "")}</p></div>
            </div>
            <details class="tstage__more"><summary>Learning goal, project, and prerequisites</summary>
              <div class="stage__grid">
                <div><h3>Learning goal</h3><p>${esc(st.goal)}</p></div>
                <div><h3>Project</h3><p>${esc(st.project)}</p></div>
                <div><h3>Prerequisite</h3><p>${esc(st.prerequisite)}</p></div>
                <div><h3>Debugging habit</h3><p>${esc(st.debugging)}</p></div>
                <div class="prep__full"><h3>Suggested starting point</h3><p>${esc(st.suggestedStart)}</p></div>
              </div>
            </details>
            <div class="tstage__missions-head">
              <h3>Missions in this stage <span class="muted">${acts.length}</span></h3>
              ${unassigned.length ? `<button type="button" class="btn btn--ghost btn--small" data-assign-many="${unassigned.map((a) => a.id).join(",")}">${icon("plus")}Assign stage ${st.stage} (${unassigned.length})</button>` : `<span class="chip chip--done">${icon("check")}All assigned</span>`}
            </div>
            <ul class="mlist">${acts.map((a) => missionRow(a, cls, sum)).join("")}</ul>
            ${labLevels.length ? `<div class="stage__lab"><span>${icon("flask")}Harbor Code Lab levels for this stage</span>${labLevels.map((lv) => `<a class="lvl-chip" href="#/lab/rover/${lv}">${lv}</a>`).join("")}</div>` : ""}
          </article>
        </li>`;
    };
    const body = `
      <section class="wrap section">
        <div class="section__head">
          <div><span class="eyebrow">Coding pathway</span><h2>The stages your students see, with your class on each one</h2></div>
          <span class="tpath-tools"><a class="btn btn--ghost btn--small" href="#/pathway/student">${icon("eye")}Preview the student view</a><a class="btn btn--ghost btn--small" href="#checks-guide" data-jump="checks-guide">${icon("question")}How checks work</a></span>
        </div>
        <div class="block tpath-queue">
          <div class="block__head"><h2>${claims.length ? `${plural(claims.length, "check", "checks")} waiting` : "No checks waiting"}</h2></div>
          ${claims.length ? `<p class="muted section-note">Ask each student to show you the “I can” statement. Confirm clears the stage (+${P.xp.stageCleared} XP for them). Not yet lets them keep practicing and ask again.</p><ul class="claims">${claims.map((x) => claimRow(x, true)).join("")}</ul>`
            : `<p class="muted">When a student taps “I can do this” on a stage, it shows up here and on that stage below.</p>`}
        </div>
      </section>
      <section class="wrap section">${SE.checksGuide("teacher")}</section>
      <ol class="wrap stages tstages">${STEM.pathway.map(stageCard).join("")}</ol>
      <section class="wrap section">
        <div class="section__head"><div><span class="eyebrow">Readiness</span><h2>Class pathway map</h2></div></div>
        <div class="table-wrap">
          <table class="matrix">
            <thead><tr><th scope="col">Explorer</th>${STEM.pathway.map((s) => `<th scope="col" title="${esc(s.title)}"><span>Stage ${s.stage}</span><small>${esc(s.title)}</small></th>`).join("")}</tr></thead>
            <tbody>${sum.profiles.map(({ student, prof }) => `<tr><th scope="row"><a class="roster-name" href="#/teach/student/${student.id}">${SE.studentAvatar(student.id, 30, prof)}${esc(student.displayName)}</a></th>${STEM.pathway.map((s) => {
              const st = prof.stages[s.stage];
              return `<td class="${st ? `is-${st.status}` : ""}">${st ? (st.status === "cleared" ? `${icon("check")}<span class="visually-hidden">Cleared</span>` : `${icon("clock")}<span class="visually-hidden">Waiting for check</span>`) : `<span class="visually-hidden">Not yet</span>`}</td>`;
            }).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="legend"><span class="legend__k is-cleared">${icon("check")}</span>Cleared <span class="legend__k is-claimed">${icon("clock")}</span>Waiting for your check <span class="legend__k"></span>Not claimed yet</p>
      </section>`;
    app().innerHTML = frame(user, cls, classes, "pathway", body);
    bindFrame(user);
    bindStageButtons();
  };

  /* ───────── Class & logins ───────── */
  SE.views.teachClass = function (user) {
    const { classes, cls } = getClass(user);
    if (!cls) return noClass(user);
    const students = SE.store.studentsIn(cls.id);
    const pic = (id) => `<span class="pic-chip">${icon(id)}<span>${esc(SE.pictureById[id].name)}</span></span>`;
    const body = `
      <section class="wrap section teach-grid teach-grid--class">
        <div class="block">
          <div class="block__head"><h2>Add a student</h2></div>
          <form id="add-student" class="form" novalidate>
            <div class="form__field">
              <label for="as-name">Display name</label>
              <input id="as-name" class="input" maxlength="24" placeholder="First name and last initial, like Sam P." aria-describedby="as-help as-err">
              <p class="field-help" id="as-help">Use a first name and last initial. Don't add emails, birthdays, or other personal details.</p>
              <p class="form__error" id="as-err" role="alert"></p>
            </div>
            <div class="form__field">
              <label for="as-grade">Grade band</label>
              <select id="as-grade" class="input">${STEM.gradeBands.map((g) => `<option value="${g.id}" ${g.id === "4-5" ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select>
            </div>
            <button class="btn btn--primary" type="submit">${icon("plus")}Add student</button>
          </form>
        </div>
        <div class="block class-code-block">
          <div class="block__head"><h2>How students sign in</h2></div>
          <ol class="how-steps">
            <li>Go to this site and choose <strong>I'm a student</strong>.</li>
            <li>Type the class code <b class="big-code">${esc(cls.code)}</b></li>
            <li>Tap their name, then their 3 secret pictures from their login card.</li>
          </ol>
          <form id="new-class" class="inline-form">
            <label class="visually-hidden" for="nc-name">New class name</label>
            <input id="nc-name" class="input" placeholder="Add another class">
            <button class="btn btn--ghost btn--small" type="submit">${icon("plus")}Create</button>
          </form>
          ${SE.store.mode === "cloud" && !classes.some((c) => c.isDemo) ? `<p class="muted">Want to see the dashboard with data? <button type="button" class="linkish" id="add-demo">Add a sample class</button></p>` : ""}
        </div>
      </section>

      <section class="wrap section" aria-labelledby="cards-title">
        <div class="section__head">
          <div><span class="eyebrow">Login cards</span><h2 id="cards-title">${plural(students.length, "student", "students")}</h2></div>
          <p>Cut these out and hand them to students. Each card has the class code and that student's secret pictures.</p>
        </div>
        ${students.length ? `<div class="login-cards">
          ${students.map((s) => `
            <article class="login-card">
              <header><span class="login-card__brand">${SE.brandLogo(17)}</span><strong>${esc(s.displayName)}</strong></header>
              <p class="login-card__code">Class code <b>${esc(cls.code)}</b></p>
              <div class="login-card__pics">${s.picCode.map(pic).join("")}</div>
              <footer class="login-card__tools">
                <label class="visually-hidden" for="g-${s.id}">Grade band for ${esc(s.displayName)}</label>
                <select id="g-${s.id}" class="input input--small" data-grade="${s.id}">${STEM.gradeBands.map((g) => `<option value="${g.id}" ${g.id === s.gradeBand ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select>
                <button type="button" class="btn btn--ghost btn--small" data-newpics="${s.id}">${icon("refresh")}New pictures</button>
                ${pendingRemove === s.id
                  ? `<span class="confirm-inline">Remove ${esc(s.displayName)} and their progress? <button type="button" class="btn btn--danger btn--small" data-remove-yes="${s.id}">Remove</button><button type="button" class="btn btn--ghost btn--small" data-remove-no>Keep</button></span>`
                  : `<button type="button" class="btn btn--ghost btn--small" data-remove="${s.id}">${icon("trash")}Remove</button>`}
              </footer>
            </article>`).join("")}
        </div>` : `<div class="empty">${icon("users")}<h3>No students yet</h3><p>Add your first student above. Their login card appears here.</p></div>`}
      </section>`;

    app().innerHTML = frame(user, cls, classes, "class", body);
    bindFrame(user);

    document.getElementById("add-student").addEventListener("submit", (e) => {
      e.preventDefault();
      const res = SE.store.addStudent(cls.id, { displayName: document.getElementById("as-name").value, gradeBand: document.getElementById("as-grade").value });
      if (!res.ok) {
        document.getElementById("as-err").textContent = res.error;
        document.getElementById("as-name").setAttribute("aria-invalid", "true");
        document.getElementById("as-name").focus();
        return;
      }
      SE.toast(`${res.student.displayName} added`);
      SE.route(true);
      document.getElementById("as-name").focus();
    });
    document.getElementById("new-class").addEventListener("submit", (e) => {
      e.preventDefault();
      const c = SE.store.createClass(user.id, document.getElementById("nc-name").value);
      currentClassId = c.id;
      SE.toast(`Created ${c.name}. Class code ${c.code}`);
      SE.route(true);
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


  /* ───────── Missions: browse by discipline and assign to the class ───────── */
  const DISCIPLINES = () => [
    { id: "pathway", name: "Coding pathway", short: "Pathway", icon: "list", blurb: "Seven readiness-based stages, from first instructions to independent projects. Assign a whole stage or pick missions inside it." },
    ...STEM.areas.map((a) => ({ id: a.id, name: a.name, short: a.short, icon: a.icon, blurb: a.description }))
  ];
  const missionFilters = { grade: "", time: "", q: "", maine: false, pilot: false };
  const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

  function classProgress(sum, a) {
    const by = { confirmed: 0, checked: 0, submitted: 0, tryagain: 0, started: 0 };
    sum.profiles.forEach((p) => { const s = SE.game.statusFor(p.prof, a).state; if (by[s] != null) by[s]++; });
    const done = sum.profiles.filter((p) => SE.game.missionDone(p.prof, a)).length;
    const started = sum.profiles.filter((p) => !SE.game.missionDone(p.prof, a) && (p.prof.opened.has(a.id) || (a.launch.labId && (p.prof.labLevels[a.launch.labId] || new Set()).size))).length;
    // Lab missions are checked by the lab itself; anything else is marked complete by the student.
    return { done, started, total: sum.students.length, self: !a.launch.labId, by };
  }
  const progressMarkup = (pr) => {
    const b = pr.by || {};
    const parts = [b.confirmed && `${b.confirmed} confirmed`, b.checked && `${b.checked} checked in lab`, b.submitted && `${b.submitted} submitted`, b.tryagain && `${b.tryagain} try again`, b.started && `${b.started} started`].filter(Boolean);
    const solid = (b.confirmed || 0) + (b.checked || 0), sent = b.submitted || 0, began = (b.started || 0) + (b.tryagain || 0);
    const w = (n) => (pr.total ? (n / pr.total) * 100 : 0);
    return `
    <span class="mprog" aria-label="${pr.total} students: ${parts.join(", ") || "none started"}">
      <span class="mprog__bar"><span style="width:${w(solid)}%"></span><span class="mprog__sent" style="width:${w(sent)}%"></span><span class="mprog__started" style="width:${w(began)}%"></span></span>
      <span class="mprog__text">${parts.length ? `${parts.join(" · ")}<span class="muted"> of ${pr.total}</span>` : "No one has started yet"}</span>
    </span>`;
  };
  const assignBtn = (a, assigned) => `<button type="button" class="btn btn--small ${assigned ? "btn--assigned" : "btn--ghost"}" data-assign="${a.id}" aria-pressed="${!!assigned}">${icon(assigned ? "check" : "plus")}${assigned ? "Assigned" : "Assign"}</button>`;
  const dueText = (d) => {
    if (!d) return "";
    const due = new Date(`${d}T23:59:59`);
    const days = Math.ceil((SE.startOfDay(due.getTime()) - SE.startOfDay(Date.now())) / SE.DAY);
    const label = due.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return days < 0 ? `Was due ${label}` : days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due ${label}`;
  };
  SE.dueText = dueText;

  function missionRow(a, cls, sum) {
    const asg = SE.store.assignmentFor(cls.id, a.id);
    const area = SE.areaById[a.area];
    const lab = a.launch && a.launch.status === "lab";
    return `
      <li class="mrow ${asg ? "is-assigned" : ""}">
        <div class="mrow__main">
          <div class="mrow__tags">
            ${lab ? `<span class="mtag mtag--lab">${icon("flask")}Interactive lab · ${SE.labs.byId(a.launch.labId) ? SE.labs.byId(a.launch.labId).levels.length : ""} levels</span>` : ""}
            ${SE.isMaine && SE.isMaine(a) ? `<span class="maine-tag">${SE.pine(13)}Made in Maine</span>` : ""}
            ${a.pathwayStage ? `<span class="mtag">${icon("list")}Pathway stage ${a.pathwayStage}</span>` : ""}
            ${a.track ? `<span class="track-tag">Grades ${esc(a.track.replace("-", "–"))} track</span>` : ""}
          </div>
          <h4><a href="#/activity/${a.id}">${esc(a.title)}</a></h4>
          <p>${esc(a.summary)}</p>
          <div class="mrow__meta">
            <span>${SE.levelMarkup(a.level)}</span>
            <span>${icon("grade")}${SE.gradesText(a.grades)}</span>
            <span>${icon("clock")}${SE.timeText(a)}</span>${a.pilot ? `<span class="mtag mtag--pilot">${icon("flag")}Pilot</span>` : ""}
            <span>${icon("users")}${esc(STEM.formats[a.format].name)}</span>
            <span>${icon("tools")}${esc(SE.equipmentText(a.equipment))}</span>
          </div>
          ${prepLine(a)}
        </div>
        <div class="mrow__side">
          ${progressMarkup(classProgress(sum, a))}
          ${assignBtn(a, asg)}
          ${asg && asg.dueDate ? `<span class="mrow__due">${icon("clock")}${esc(dueText(asg.dueDate))}</span>` : ""}
        </div>
      </li>`;
  }

  function filtered(list) {
    const q = missionFilters.q.trim().toLowerCase();
    return list.filter((a) =>
      (!missionFilters.grade || a.grades.includes(missionFilters.grade)) &&
      (!missionFilters.time || SE.timeMax(a) <= Number(missionFilters.time)) &&
      (!missionFilters.pilot || a.pilot) &&
      (!missionFilters.maine || (SE.isMaine && SE.isMaine(a))) &&
      (!q || `${a.title} ${a.summary} ${(a.keywords || []).join(" ")}`.toLowerCase().includes(q)));
  }

  function disciplineBody(disc, cls, sum) {
    if (disc.id === "pathway") {
      return STEM.pathway.map((st) => {
        const acts = filtered(st.activities.map((id) => SE.activityById[id]).filter(Boolean));
        const cleared = sum.profiles.filter((p) => p.prof.stages[st.stage] && p.prof.stages[st.stage].status === "cleared").length;
        const waiting = sum.profiles.filter((p) => p.prof.stages[st.stage] && p.prof.stages[st.stage].status === "claimed").length;
        const labLevels = (SE.roverLevels || []).map((l, i) => (l.stage === st.stage ? i + 1 : 0)).filter(Boolean);
        const unassigned = acts.filter((a) => !SE.store.assignmentFor(cls.id, a.id));
        return `
          <section class="mstage" aria-labelledby="mstage-${st.stage}">
            <header class="mstage__head">
              <span class="mstage__num"><small>Stage</small>${st.stage}</span>
              <div>
                <h3 id="mstage-${st.stage}">${esc(st.title)}</h3>
                <p class="muted">${esc(st.concepts)} · ${esc(st.suggestedStart)}</p>
                <p class="mstage__ready">${icon("check")}${cleared} of ${sum.students.length} cleared${waiting ? ` · ${waiting} waiting for your check` : ""}</p>
              </div>
              ${unassigned.length ? `<button type="button" class="btn btn--ghost btn--small" data-assign-many="${unassigned.map((a) => a.id).join(",")}">${icon("plus")}Assign stage ${st.stage} (${unassigned.length})</button>` : acts.length ? `<span class="chip chip--done">${icon("check")}All assigned</span>` : ""}
            </header>
            <p class="mstage__ican"><strong>I can:</strong> ${esc(st.iCan.replace(/^I can /, ""))}</p>
            ${acts.length ? `<ul class="mlist">${acts.map((a) => missionRow(a, cls, sum)).join("")}</ul>` : `<p class="muted">No missions in this stage match your filters.</p>`}
            ${labLevels.length ? `<div class="stage__lab"><span>${icon("flask")}Practice in the Harbor Code Lab</span>${labLevels.map((lv) => `<a class="lvl-chip" href="#/lab/rover/${lv}">${lv}</a>`).join("")}</div>` : ""}
          </section>`;
      }).join("");
    }
    const all = STEM.activities.filter((a) => a.area === disc.id);
    const acts = filtered(all).sort((x, y) => (y.launch.status === "lab") - (x.launch.status === "lab") || LEVEL_ORDER[x.level] - LEVEL_ORDER[y.level] || x.duration - y.duration);
    const groups = [
      ["Interactive labs", acts.filter((a) => a.launch.status === "lab")],
      ["Beginner", acts.filter((a) => a.launch.status !== "lab" && a.level === "beginner")],
      ["Intermediate", acts.filter((a) => a.launch.status !== "lab" && a.level === "intermediate")],
      ["Advanced", acts.filter((a) => a.launch.status !== "lab" && a.level === "advanced")]
    ].filter(([, l]) => l.length);
    if (!acts.length) return `<div class="empty">${icon("search")}<h3>No missions match these filters</h3><p>Try a different grade band or time, or clear the search.</p><button type="button" class="btn btn--ghost" data-clear-filters>Clear filters</button></div>`;
    return groups.map(([label, list]) => `
      <section class="mgroup" aria-label="${esc(label)}">
        <h3 class="mgroup__title">${esc(label)} <span class="muted">${list.length}</span></h3>
        <ul class="mlist">${list.map((a) => missionRow(a, cls, sum)).join("")}</ul>
      </section>`).join("");
  }

  function assignedPanel(cls, sum) {
    const list = SE.store.assignmentsFor(cls.id).map((x) => ({ x, a: SE.activityById[x.activityId] })).filter((r) => r.a);
    if (!list.length) return `
      <div class="block assigned-panel assigned-panel--empty">
        <div class="block__head"><h2>Assigned to ${esc(cls.name)}</h2></div>
        <p class="muted">Nothing assigned yet. Pick a discipline below and press <strong>Assign</strong>. Assigned missions show up first on every student's home screen, with your due dates.</p>
      </div>`;
    return `
      <div class="block assigned-panel">
        <div class="block__head"><h2>Assigned to ${esc(cls.name)}</h2><span class="muted">${plural(list.length, "mission", "missions")}</span></div>
        <ol class="alist">
          ${list.map(({ x, a }) => {
            const pr = classProgress(sum, a);
            const late = x.dueDate && new Date(`${x.dueDate}T23:59:59`).getTime() < Date.now();
            return `<li class="alist__item">
              <span class="icon-badge">${icon(SE.areaById[a.area].icon)}</span>
              <div class="alist__main"><a href="#/activity/${a.id}">${esc(a.title)}</a><small>${esc(SE.areaById[a.area].short)} · ${SE.timeText(a)} · ${SE.gradesText(a.grades)}</small>${prepLine(a)}
                <details class="alist__note" ${x.note ? "open" : ""}><summary>${icon("clipboard")}${x.note ? "Instructions for students" : "Add instructions for students"}</summary>
                  <form class="note-form" data-note-form="${a.id}"><label class="visually-hidden" for="note-${a.id}">Instructions for ${esc(a.title)}</label>
                    <textarea id="note-${a.id}" class="input input--small" rows="2" maxlength="500" placeholder="Example: Work with your table group.">${esc(x.note || "")}</textarea>
                    <button type="submit" class="btn btn--ghost btn--small">${icon("check")}Save</button></form>
                </details></div>
              ${progressMarkup(pr)}
              <label class="alist__due ${late && pr.done < pr.total ? "is-late" : ""}"><span>Due</span><input type="date" class="input input--small" value="${x.dueDate || ""}" data-due="${a.id}" aria-label="Due date for ${esc(a.title)}"></label>
              <button type="button" class="icon-btn" data-assign="${a.id}" aria-pressed="true" aria-label="Unassign ${esc(a.title)}" title="Unassign">✕</button>
            </li>`;
          }).join("")}
        </ol>
      </div>`;
  }

  SE.views.teachMissions = function (user, discId) {
    const { classes, cls } = getClass(user);
    if (!cls) return noClass(user);
    const sum = SE.game.classSummary(cls.id);
    const discs = DISCIPLINES();
    const disc = discs.find((d) => d.id === discId) || discs[0];
    const countFor = (d) => (d.id === "pathway" ? STEM.pathway.reduce((n, s) => n + s.activities.length, 0) : STEM.activities.filter((a) => a.area === d.id).length);
    const assignedIn = (d) => SE.store.assignmentsFor(cls.id).filter((x) => { const a = SE.activityById[x.activityId]; return a && (d.id === "pathway" ? !!a.pathwayStage || STEM.pathway.some((s) => s.activities.includes(a.id)) : a.area === d.id); }).length;
    const body = `
      <section class="wrap section">${assignedPanel(cls, sum)}</section>
      <section class="wrap section missions" aria-labelledby="disc-title">
        <div class="section__head"><div><span class="eyebrow">Mission library by discipline</span><h2 id="disc-title">Choose missions for ${esc(cls.name)}</h2></div></div>
        <nav class="disc-tabs" aria-label="Disciplines">
          ${discs.map((d) => `<a href="#/teach/missions/${d.id}" class="disc-tab" ${d.id === disc.id ? 'aria-current="page"' : ""}>
            <span class="disc-tab__icon">${icon(d.icon)}</span><span class="disc-tab__name">${esc(d.name)}</span>
            <span class="disc-tab__n">${countFor(d)} missions${assignedIn(d) ? ` · <b>${assignedIn(d)} assigned</b>` : ""}</span></a>`).join("")}
        </nav>
        <div class="disc-panel">
          <div class="disc-panel__head">
            <div><h3>${icon(disc.icon)}${esc(disc.name)}</h3><p class="muted">${esc(disc.blurb)}</p></div>
            ${disc.id === "pathway" ? `<a class="btn btn--ghost btn--small" href="#/teach/pathway">${icon("flag")}Open the coding pathway and checks</a>` : SE.labs.forArea(disc.id).length ? `<a class="btn btn--ghost btn--small" href="#/lab/${SE.labs.forArea(disc.id)[0].id}">${icon("flask")}Preview the lab</a>` : ""}
          </div>
          <form class="mfilters" id="mfilters" role="search" aria-label="Filter missions">
            <label><span>Grade band</span><select class="input input--small" name="grade"><option value="">All grades</option>${STEM.gradeBands.map((g) => `<option value="${g.id}" ${missionFilters.grade === g.id ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select></label>
            <label><span>Time</span><select class="input input--small" name="time"><option value="">Any length</option>${STEM.durations.map((d) => `<option value="${d.max}" ${missionFilters.time === String(d.max) ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label>
            <label class="mfilters__q"><span>Search</span><input class="input input--small" name="q" type="search" value="${esc(missionFilters.q)}" placeholder="loops, tides, robots…"></label>
            <label class="check-row"><input type="checkbox" name="maine" ${missionFilters.maine ? "checked" : ""}> Made in Maine only</label>
            <label class="check-row"><input type="checkbox" name="pilot" ${missionFilters.pilot ? "checked" : ""}> Pilot missions only</label>
          </form>
          <div id="disc-body">${disciplineBody(disc, cls, sum)}</div>
        </div>
      </section>`;
    app().innerHTML = frame(user, cls, classes, "missions", body);
    bindFrame(user);

    const form = document.getElementById("mfilters");
    const refresh = () => { document.getElementById("disc-body").innerHTML = disciplineBody(disc, cls, SE.game.classSummary(cls.id)); };
    form.addEventListener("input", () => {
      missionFilters.grade = form.grade.value; missionFilters.time = form.time.value; missionFilters.q = form.q.value; missionFilters.maine = form.maine.checked; missionFilters.pilot = form.pilot.checked;
      refresh();
    });
    form.addEventListener("submit", (e) => e.preventDefault());
    app().querySelectorAll("[data-note-form]").forEach((f) => f.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = f.dataset.noteForm, v = f.querySelector("textarea").value;
      SE.store.setAssignmentNote(cls.id, id, v);
      SE.toast(v.trim() ? "Instructions saved. Students see them on Today." : "Instructions removed");
      SE.route(true);
    }));
    app().querySelectorAll("[data-due]").forEach((inp) => inp.addEventListener("change", () => {
      SE.store.setDueDate(cls.id, inp.dataset.due, inp.value);
      SE.toast(inp.value ? `Due date set: ${dueText(inp.value).replace(/^Due /, "")}` : "Due date removed");
      SE.route(true);
    }));
  };

  /* Assign / unassign buttons work anywhere on the page (Missions tab, activity pages). */
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-clear-filters]")) { Object.assign(missionFilters, { grade: "", time: "", q: "", maine: false, pilot: false }); SE.route(true); return; }
    const one = e.target.closest("[data-assign]");
    const many = e.target.closest("[data-assign-many]");
    if (!one && !many) return;
    const user = SE.store.currentUser();
    if (!user || user.role !== "educator") return;
    const { cls } = getClass(user);
    if (!cls) return;
    e.preventDefault();
    const y = window.scrollY;
    if (many) {
      const ids = many.dataset.assignMany.split(",").filter(Boolean);
      SE.store.assign(cls.id, ids);
      SE.toast(`Assigned ${plural(ids.length, "mission", "missions")} to ${cls.name}`);
    } else {
      const id = one.dataset.assign, a = SE.activityById[id];
      if (SE.store.assignmentFor(cls.id, id)) { SE.store.unassign(cls.id, id); SE.toast(`Removed ${a ? a.title : "mission"} from ${cls.name}`); }
      else { SE.store.assign(cls.id, id); SE.toast(`Assigned ${a ? a.title : "mission"} to ${cls.name}`); }
    }
    SE.route(true);
    window.scrollTo(0, y);
    const again = document.querySelector(one ? `[data-assign="${one.dataset.assign}"]` : "[data-assign-many]");
    if (again) again.focus({ preventScroll: true });
  });

  /* ───────── Bits used on library pages ───────── */
  SE.views.educatorStrip = function (user) {
    const { cls } = getClass(user);
    if (!cls) return "";
    const sum = SE.game.classSummary(cls.id);
    const refl = pendingReflections(sum).length;
    const claims = pendingStageClaims(sum).length;
    return `
      <div class="wrap"><div class="edu-strip">
        ${icon("clipboard")}
        <p><strong>${esc(cls.name)}</strong> · ${plural(sum.students.length, "explorer", "explorers")} · ${refl} reflections and ${claims} “I can” checks waiting</p>
        <a class="btn btn--primary btn--small" href="#/teach">Open educator dashboard ${icon("arrowRight")}</a>
      </div></div>`;
  };

  SE.views.activityClassBox = function (user, a) {
    const { cls } = getClass(user);
    if (!cls) return "";
    const sum = SE.game.classSummary(cls.id);
    const done = sum.profiles.filter((p) => p.prof.completedIds.has(a.id));
    const opened = sum.profiles.filter((p) => !p.prof.completedIds.has(a.id) && p.prof.opened.has(a.id));
    const asg = SE.store.assignmentFor(cls.id, a.id);
    return `
      <div class="block">
        <h2>In ${esc(cls.name)}</h2>
        <div class="class-box__assign">${assignBtn(a, asg)}${asg ? `<span class="muted small">${asg.dueDate ? esc(dueText(asg.dueDate)) : "No due date"} · <a href="#/teach/missions">Manage</a></span>` : `<span class="muted small">Assigned missions appear first on students' home screens.</span>`}</div>
        <p><strong>${done.length} of ${sum.students.length}</strong> completed${opened.length ? ` · ${opened.length} started` : ""}</p>
        <div class="mini-meter"><span style="width:${sum.students.length ? (done.length / sum.students.length) * 100 : 0}%"></span></div>
        ${done.length ? `<p class="muted small">${done.map((p) => esc(p.student.displayName)).join(", ")}</p>` : ""}
      </div>`;
  };
})();
