/*
 * STEM 207 — educator dashboard.
 *   #/teach                   class overview
 *   #/teach/student/<id>      one student's progress and log
 *   #/teach/pathway           coding pathway readiness checks
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
  const FEED_NOISE = ["step_checked", "signed_in", "lab_test_run", "lab_opened", "lab_hint", "lab_clue", "lab_compass", "lab_fps", "lab_play", "lab_prediction", "lab_trained", "lab_bug", "lab_miss"];
  const TIMELINE_NOISE = ["lab_test_run", "lab_clue", "lab_compass", "lab_fps", "lab_play", "lab_prediction", "lab_trained", "lab_bug", "lab_miss"];
  let rosterSort = { key: "name", dir: 1 };
  let showReviewed = false;
  let pendingRemove = null;

  function getClass(user) {
    const classes = SE.store.classesFor(user.id);
    if (!classes.length) return { classes, cls: null };
    if (!classes.some((c) => c.id === currentClassId)) currentClassId = classes[0].id;
    return { classes, cls: classes.find((c) => c.id === currentClassId) };
  }

  /* ───────── Event descriptions ───────── */
  function describe(e, withName) {
    const a = e.data && e.data.activityId ? SE.activityById[e.data.activityId] : null;
    const title = a ? `<a href="#/activity/${a.id}">${esc(a.title)}</a>` : "";
    const who = withName ? `<strong>${esc((SE.store.studentById(e.studentId) || {}).displayName || "A student")}</strong> ` : "";
    switch (e.type) {
      case "signed_in": return { icon: "user", text: `${who}signed in` };
      case "mission_opened": return { icon: "eye", text: `${who}opened ${title}` };
      case "launched": return { icon: "external", text: `${who}launched ${a ? esc(a.launch.provider) : "a resource"} for ${title}` };
      case "step_checked": return { icon: "list", text: `${who}${e.data.checked ? "checked off" : "unchecked"} step ${e.data.step + 1} of ${title}` };
      case "mission_completed": return { icon: "check", text: `${who}completed ${title}`, strong: true };
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
      default: return { icon: "clock", text: esc(e.type) };
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
      ["pathway", "#/teach/pathway", "Pathway checks", "flag", pendingClaims],
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
        if ((c.event.data.reflection || "").trim() && !prof.reviewed[c.event.id]) out.push({ student, prof, c });
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
            ${list.length ? `<ul class="alist alist--compact">${list.map(({ x, a }) => `<li class="alist__item"><div class="alist__main"><a href="#/activity/${a.id}">${esc(a.title)}</a><small>${x.dueDate ? esc(dueText(x.dueDate)) : "No due date"}</small></div>${progressMarkup(classProgress(sum, a))}</li>`).join("")}</ul>`
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
          <div class="block__head"><h2>Class expedition</h2><span class="muted">${SE.num(sum.totalXp)} XP together</span></div>
          ${SE.goalTrack(sum.goal)}
          <p class="muted">${sum.goal.next ? `${SE.num(sum.goal.next.xp - sum.totalXp)} XP until the class reaches ${esc(sum.goal.next.name)}. Students see this on their home screen.` : "Your class reached the final destination."}</p>
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
  };

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
                <th scope="row"><a href="#/teach/student/${student.id}">${esc(student.displayName)}</a><small>${esc(SE.gradeById[student.gradeBand] ? SE.gradeById[student.gradeBand].name : "")}</small></th>
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
          ${SE.insignia(prof.rank, 64)}
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
              return `<li class="${d ? "is-done" : late ? "is-late" : ""}">${icon(d ? "check" : late ? "alert" : "clock")}<a href="#/activity/${a.id}">${esc(a.title)}</a><small>${d ? "Done" : prof.opened.has(a.id) ? "Started" : "Not started"}${x.dueDate ? ` · ${esc(dueText(x.dueDate))}` : ""}</small></li>`; }).join("")}</ul>
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
            return `<li><span><a href="#/lab/${lab.id}">${esc(lab.title)}</a><small>${n} of ${lab.levels.length} levels · ${st.runs} tests · ${st.hints} hints</small></span><span class="meter"><span style="width:${(n / lab.levels.length) * 100}%"></span></span></li>`;
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
            <span>${SE.dateShort(c.event.at)} · ${c.event.data.stepsDone || 0}/${c.event.data.stepsTotal || c.activity.steps.length} steps · ${c.event.data.extension ? "tried the challenge" : "no challenge"}</span>
          </div>
          ${conf ? `<span class="conf conf--${conf.id}">${esc(conf.name)}</span>` : ""}
        </div>
        ${answer ? `<p class="mission-log__q">${esc(c.activity.reflect)}</p><p class="mission-log__answer">“${esc(answer)}”</p>` : `<p class="muted">No answer to the reflection question.</p>`}
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
    document.getElementById("show-reviewed").addEventListener("change", (e) => { showReviewed = e.target.checked; SE.route(true); });
  };

  /* ───────── Pathway checks ───────── */
  SE.views.teachPathway = function (user) {
    const { classes, cls } = getClass(user);
    if (!cls) return noClass(user);
    const sum = SE.game.classSummary(cls.id);
    const claims = pendingStageClaims(sum);
    const body = `
      <section class="wrap section">
        <div class="section__head">
          <div><span class="eyebrow">Coding pathway</span><h2>${claims.length ? `${plural(claims.length, "student is", "students are")} waiting for a check` : "No checks waiting"}</h2></div>
          <a class="btn btn--ghost btn--small" href="#/pathway">See the stages ${icon("arrowRight")}</a>
        </div>
        <p class="muted section-note">When a student taps “I can do this,” ask them to show you the “I can” statement. Confirm it to clear the stage (+${P.xp.stageCleared} XP for them), or choose Not yet so they can keep practicing.</p>
        ${claims.length ? `<ul class="claims">${claims.map((x) => {
          const s = STEM.pathway.find((p) => p.stage === x.stage);
          return `<li>
            <div><a href="#/teach/student/${x.student.id}"><strong>${esc(x.student.displayName)}</strong></a><span>Stage ${x.stage}: ${esc(s.title)} · asked ${SE.timeAgo(x.at)}</span><em>“${esc(s.iCan)}”</em></div>
            <span class="stage-actions"><button class="btn btn--primary btn--small" data-verify="${x.stage}" data-student="${x.student.id}">${icon("check")}Confirm</button><button class="btn btn--ghost btn--small" data-return="${x.stage}" data-student="${x.student.id}">Not yet</button></span>
          </li>`;
        }).join("")}</ul>` : ""}
      </section>
      <section class="wrap section">
        <div class="section__head"><div><span class="eyebrow">Readiness</span><h2>Class pathway map</h2></div></div>
        <div class="table-wrap">
          <table class="matrix">
            <thead><tr><th scope="col">Explorer</th>${STEM.pathway.map((s) => `<th scope="col" title="${esc(s.title)}"><span>Stage ${s.stage}</span><small>${esc(s.title)}</small></th>`).join("")}</tr></thead>
            <tbody>${sum.profiles.map(({ student, prof }) => `<tr><th scope="row"><a href="#/teach/student/${student.id}">${esc(student.displayName)}</a></th>${STEM.pathway.map((s) => {
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
  const missionFilters = { grade: "", time: "", q: "", maine: false };
  const LEVEL_ORDER = { beginner: 0, intermediate: 1, advanced: 2 };

  function classProgress(sum, a) {
    const done = sum.profiles.filter((p) => SE.game.missionDone(p.prof, a)).length;
    const started = sum.profiles.filter((p) => !SE.game.missionDone(p.prof, a) && (p.prof.opened.has(a.id) || (a.launch.labId && (p.prof.labLevels[a.launch.labId] || new Set()).size))).length;
    return { done, started, total: sum.students.length };
  }
  const progressMarkup = (pr) => `
    <span class="mprog" aria-label="${pr.done} of ${pr.total} students finished${pr.started ? `, ${pr.started} started` : ""}">
      <span class="mprog__bar"><span style="width:${pr.total ? (pr.done / pr.total) * 100 : 0}%"></span><span class="mprog__started" style="width:${pr.total ? (pr.started / pr.total) * 100 : 0}%"></span></span>
      <span class="mprog__text"><b>${pr.done}</b>/${pr.total} done${pr.started ? ` · ${pr.started} started` : ""}</span>
    </span>`;
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
          </div>
          <h4><a href="#/activity/${a.id}">${esc(a.title)}</a></h4>
          <p>${esc(a.summary)}</p>
          <div class="mrow__meta">
            <span>${SE.levelMarkup(a.level)}</span>
            <span>${icon("grade")}${SE.gradesText(a.grades)}</span>
            <span>${icon("clock")}${a.duration} min</span>
            <span>${icon("users")}${esc(STEM.formats[a.format].name)}</span>
            <span>${icon("tools")}${esc(SE.equipmentText(a.equipment))}</span>
          </div>
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
      (!missionFilters.time || a.duration <= Number(missionFilters.time)) &&
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
              <div class="alist__main"><a href="#/activity/${a.id}">${esc(a.title)}</a><small>${esc(SE.areaById[a.area].short)} · ${a.duration} min · ${SE.gradesText(a.grades)}</small></div>
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
            ${disc.id === "pathway" ? "" : SE.labs.forArea(disc.id).length ? `<a class="btn btn--ghost btn--small" href="#/lab/${SE.labs.forArea(disc.id)[0].id}">${icon("flask")}Preview the lab</a>` : ""}
          </div>
          <form class="mfilters" id="mfilters" role="search" aria-label="Filter missions">
            <label><span>Grade band</span><select class="input input--small" name="grade"><option value="">All grades</option>${STEM.gradeBands.map((g) => `<option value="${g.id}" ${missionFilters.grade === g.id ? "selected" : ""}>${esc(g.name)}</option>`).join("")}</select></label>
            <label><span>Time</span><select class="input input--small" name="time"><option value="">Any length</option>${STEM.durations.map((d) => `<option value="${d.max}" ${missionFilters.time === String(d.max) ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label>
            <label class="mfilters__q"><span>Search</span><input class="input input--small" name="q" type="search" value="${esc(missionFilters.q)}" placeholder="loops, tides, robots…"></label>
            <label class="check-row"><input type="checkbox" name="maine" ${missionFilters.maine ? "checked" : ""}> Made in Maine only</label>
          </form>
          <div id="disc-body">${disciplineBody(disc, cls, sum)}</div>
        </div>
      </section>`;
    app().innerHTML = frame(user, cls, classes, "missions", body);
    bindFrame(user);

    const form = document.getElementById("mfilters");
    const refresh = () => { document.getElementById("disc-body").innerHTML = disciplineBody(disc, cls, SE.game.classSummary(cls.id)); };
    form.addEventListener("input", () => {
      missionFilters.grade = form.grade.value; missionFilters.time = form.time.value; missionFilters.q = form.q.value; missionFilters.maine = form.maine.checked;
      refresh();
    });
    form.addEventListener("submit", (e) => e.preventDefault());
    app().querySelectorAll("[data-due]").forEach((inp) => inp.addEventListener("change", () => {
      SE.store.setDueDate(cls.id, inp.dataset.due, inp.value);
      SE.toast(inp.value ? `Due date set: ${dueText(inp.value).replace(/^Due /, "")}` : "Due date removed");
      SE.route(true);
    }));
  };

  /* Assign / unassign buttons work anywhere on the page (Missions tab, activity pages). */
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-clear-filters]")) { Object.assign(missionFilters, { grade: "", time: "", q: "", maine: false }); SE.route(true); return; }
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
