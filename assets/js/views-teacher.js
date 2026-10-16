/*
 * STEM Explorer Academy — educator dashboard.
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
            ${tabs.map(([id, href, label, ic, badge]) => `<a href="${href}" class="tab" ${active === id ? 'aria-current="page"' : ""}>${icon(ic)}${label}${badge ? `<span class="tab__badge" aria-label="${badge} waiting">${badge}</span>` : ""}</a>`).join("")}
          </nav>` : ""}
        </div>
      </section>
      ${cls && cls.isDemo ? `
        <div class="wrap"><div class="demo-banner">
          ${icon("flag")}
          <p><strong>Sample class.</strong> These students and their activity are made up to show how the dashboard works. Changes you make here are saved in this browser.</p>
          <button type="button" class="btn btn--ghost btn--small" id="reset-demo">${icon("refresh")}Reset sample data</button>
        </div></div>` : ""}
      ${body}`;
  }

  function bindFrame(user) {
    const sw = document.getElementById("class-switch");
    if (sw) sw.addEventListener("change", () => { currentClassId = sw.value; SE.route(true); });
    const rd = document.getElementById("reset-demo");
    if (rd) rd.addEventListener("click", async () => { await SE.store.resetDemo(); SE.toast("Sample data reset"); SE.route(true); });
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
      </div></section>`);
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
              <header><span class="login-card__brand">${SE.brandMark(28)}STEM Explorer Academy</span><strong>${esc(s.displayName)}</strong></header>
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
    return `
      <div class="block">
        <h2>In ${esc(cls.name)}</h2>
        <p><strong>${done.length} of ${sum.students.length}</strong> completed${opened.length ? ` · ${opened.length} started` : ""}</p>
        <div class="mini-meter"><span style="width:${sum.students.length ? (done.length / sum.students.length) * 100 : 0}%"></span></div>
        ${done.length ? `<p class="muted small">${done.map((p) => esc(p.student.displayName)).join(", ")}</p>` : ""}
      </div>`;
  };
})();
