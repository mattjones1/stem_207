/*
 * STEM 207 — student views: expedition home, mission debrief,
 * mission-complete celebration, and the explorer profile.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const P = STEM.progression;
  const { icon, esc, plural } = SE;
  const app = () => document.getElementById("app");

  function rankBar(prof, compact) {
    const pct = Math.round(prof.progress * 100);
    return `
      <div class="rankbar ${compact ? "rankbar--compact" : ""}">
        <div class="rankbar__labels">
          <span><strong>${esc(prof.rank.name)}</strong></span>
          <span>${prof.next ? `${SE.num(prof.next.xp - prof.xp)} XP to ${esc(prof.next.name)}` : "Top rank reached"}</span>
        </div>
        <div class="rankbar__track" role="progressbar" aria-label="Progress to next rank" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
          <span style="width:${pct}%"></span>
        </div>
      </div>`;
  }
  SE.rankBar = rankBar;

  /* Log "mission_opened" at most once per 30 minutes per mission, so re-renders don't flood the log. */
  SE.logOpen = (user, activityId) => {
    const evs = SE.store.eventsFor(user.id);
    const recent = evs.slice().reverse().find((e) => e.type === "mission_opened" && e.data.activityId === activityId);
    if (!recent || Date.now() - recent.at > 30 * 60000) SE.store.log("mission_opened", { activityId });
  };

  /* ───────── Expedition home (top of the student dashboard) ───────── */
  SE.views.expeditionHome = function (user, prof) {
    const recs = SE.game.recommendations(user, prof, 3);
    const summary = SE.game.classSummary(user.classId);
    const nextPatches = prof.patches.filter((p) => !p.earned).sort((a, b) => (b.progress / b.target) - (a.progress / a.target)).slice(0, 3);
    const recent = prof.patches.filter((p) => p.earned).sort((a, b) => b.earnedAt - a.earnedAt).slice(0, 4);
    const inProgress = Object.entries(prof.steps)
      .filter(([id, set]) => set.size > 0 && !prof.completedIds.has(id))
      .map(([id, set]) => ({ a: SE.activityById[id], n: set.size }))
      .filter((x) => x.a)[0];
    const notes = prof.completions
      .map((c) => ({ c, r: prof.reviewed[c.event.id] }))
      .filter((x) => x.r && x.r.data.note && Date.now() - x.r.at < 14 * SE.DAY)
      .slice(-1)[0];
    const firstName = user.displayName.split(" ")[0];

    return `
      <section class="xhero ridge" aria-labelledby="xhero-title">
        <div class="wrap xhero__inner">
          <div class="xhero__id">
            <a class="xhero__avatar" href="#/base" title="Customize your explorer">${SE.ownAvatar(user.id, 76, "Your explorer")}<span class="xhero__badge">${SE.insignia(prof.rank, 30)}</span></a>
            <div class="xhero__who">
              <span class="eyebrow">${esc(user.cls ? user.cls.name : "Explorer")}</span>
              <h1 id="xhero-title" tabindex="-1">Welcome back, ${esc(firstName)}.</h1>
              <p class="xhero__motto">${esc(prof.rank.motto)}</p>
            </div>
          </div>
          <dl class="xstats">
            <div><dt>Total XP</dt><dd>${SE.num(prof.xp)}</dd></div>
            <div><dt>Missions</dt><dd>${prof.counts.missions}</dd></div>
            <div><dt>Patches</dt><dd>${prof.earnedCount}<small>/${P.patches.length}</small></dd></div>
            <div><dt>Week streak</dt><dd>${prof.streak}<small>${prof.streak === 1 ? " week" : " weeks"}</small></dd></div>
          </dl>
          <div class="xhero__rank">${rankBar(prof)}</div>
        </div>
      </section>

      ${(() => {
        const ul = SE.base.unlocks(prof);
        const nextUp = ul.filter((x) => !x.open && x.prog).sort((x, y) => (y.prog.have / y.prog.want) - (x.prog.have / x.prog.want))[0];
        return `<div class="wrap"><a class="harbor-teaser" href="#/base">
          <div class="harbor-teaser__art">${SE.base.harbor(prof, SE.base.customFor(user.id), { seed: user.id })}</div>
          <div class="harbor-teaser__text"><span class="eyebrow">My harbor</span>
            <strong>${ul.filter((x) => x.open).length} of ${ul.length} unlocks earned</strong>
            ${nextUp ? `<span>Next up: <b>${esc(nextUp.name)}</b> · ${esc(nextUp.how)}</span>` : "<span>Everything unlocked. Wicked good!</span>"}
            <span class="harbor-teaser__go">Design your explorer and boat ${icon("arrowRight")}</span></div>
        </a></div>`;
      })()}

      ${notes ? `
      <div class="wrap"><div class="teacher-note-banner">
        ${icon("message")}
        <p><strong>Note from your teacher</strong> on <a href="#/activity/${notes.c.activity.id}">${esc(notes.c.activity.title)}</a>: “${esc(notes.r.data.note)}”</p>
      </div></div>` : ""}

      ${(() => {
        const list = SE.store.assignmentsFor(user.classId).map((x) => ({ x, a: SE.activityById[x.activityId] })).filter((r) => r.a);
        if (!list.length) return "";
        const done = list.filter(({ a }) => SE.game.missionDone(prof, a)).length;
        const order = list.slice().sort((p, q) => SE.game.missionDone(prof, p.a) - SE.game.missionDone(prof, q.a) || (p.x.dueDate || "9999").localeCompare(q.x.dueDate || "9999"));
        return `
      <section class="section wrap" aria-labelledby="assigned-title">
        <div class="section__head">
          <div><span class="eyebrow">From your teacher</span><h2 id="assigned-title">Your assigned missions</h2></div>
          <p class="assigned-count"><b>${done}</b> of ${list.length} done</p>
        </div>
        <div class="mini-meter assigned-meter" aria-hidden="true"><span style="width:${(done / list.length) * 100}%"></span></div>
        <div class="next-grid next-grid--assigned">
          ${order.map(({ x, a }) => {
            const d = SE.game.missionDone(prof, a);
            const late = !d && x.dueDate && new Date(`${x.dueDate}T23:59:59`).getTime() < Date.now();
            const lab = a.launch.status === "lab" && SE.labs.byId(a.launch.labId);
            const lv = lab ? (prof.labLevels[lab.id] || new Set()).size : 0;
            return `<a class="next-card next-card--assigned ${d ? "is-done" : ""} ${late ? "is-late" : ""}" href="${lab && !d ? `#/lab/${lab.id}` : `#/activity/${a.id}`}">
              <span class="next-card__tag">${icon(d ? "check" : SE.areaById[a.area].icon)}${d ? "Done" : x.dueDate ? esc(SE.dueText(x.dueDate)) : "Assigned"}</span>
              <strong>${esc(a.title)}</strong>
              <span>${esc(a.summary)}</span>
              <span class="next-card__meta">${lab ? `${lv} of ${lab.levels.length} lab levels` : `${SE.timeText(a)} · +${SE.game.baseXp(a)} XP`}</span>
            </a>`;
          }).join("")}
        </div>
      </section>`;
      })()}

      <section class="section wrap" aria-labelledby="next-title">
        <div class="section__head">
          <div><span class="eyebrow">Choose your next adventure</span><h2 id="next-title">${inProgress ? "Pick up where you left off" : "Suggested missions"}</h2></div>
          ${SE.views.timePicker().replace("time-picker", "time-picker time-picker--light")}
        </div>
        <div class="next-grid">
          ${inProgress ? `
            <a class="next-card next-card--resume" href="#/activity/${inProgress.a.id}">
              <span class="next-card__tag">${icon("clock")}In progress · ${inProgress.n} of ${inProgress.a.steps.length} steps</span>
              <strong>${esc(inProgress.a.title)}</strong>
              <span>${esc(inProgress.a.summary)}</span>
              <span class="next-card__go">Continue mission ${icon("arrowRight")}</span>
            </a>` : ""}
          ${recs.slice(0, inProgress ? 2 : 3).map((r) => `
            <a class="next-card" href="#/activity/${r.activity.id}">
              <span class="next-card__tag">${icon(SE.areaById[r.activity.area].icon)}${esc(r.reason)}</span>
              <strong>${esc(r.activity.title)}</strong>
              <span>${esc(r.activity.summary)}</span>
              <span class="next-card__meta">${SE.timeText(r.activity)} · +${SE.game.baseXp(r.activity)} XP</span>
            </a>`).join("")}
        </div>
      </section>

      <section class="section wrap" aria-labelledby="map-title">
        <div class="section__head">
          <div><span class="eyebrow">Expedition map</span><h2 id="map-title">Light up the Maine night sky</h2></div>
          <p>Far from city lights, Maine's North Woods have some of the darkest skies in the East. Each star is a mission. Finish one and it lights up and joins its constellation. Glowing rings are suggested for you.</p>
        </div>
        <div class="map-frame">${SE.starMap(prof, recs.map((r) => r.activity.id))}</div>
      </section>

      <section class="section wrap split" aria-labelledby="patches-title">
        <div class="split__main">
          <div class="section__head">
            <div><span class="eyebrow">Mission patches</span><h2 id="patches-title">${prof.earnedCount ? "Your latest patches" : "Patches you can earn"}</h2></div>
            <a class="btn btn--ghost btn--small" href="#/me">See all ${P.patches.length} patches ${icon("arrowRight")}</a>
          </div>
          <div class="patch-row">
            ${(recent.length ? recent : nextPatches).map((p) => `
              <figure class="patch-tile">${SE.patchArt(p.patch, p.earned, 88)}
                <figcaption><strong>${esc(p.patch.name)}</strong><span>${p.earned ? `Earned ${SE.dateShort(p.earnedAt)}` : `${p.progress} of ${p.target}`}</span></figcaption>
              </figure>`).join("")}
          </div>
          ${recent.length && nextPatches.length ? `
          <h3 class="subhead">Closest to earning</h3>
          <ul class="near-list">
            ${nextPatches.map((p) => `
              <li><span class="near-list__name">${esc(p.patch.name)}</span><span class="near-list__how">${esc(p.patch.how)}</span>
                <span class="mini-meter" aria-label="${p.progress} of ${p.target}"><span style="width:${(p.progress / p.target) * 100}%"></span></span>
                <span class="near-list__n">${p.progress}/${p.target}</span></li>`).join("")}
          </ul>` : ""}
        </div>
        <aside class="split__side block" aria-labelledby="goal-title">
          <span class="eyebrow">Class expedition</span>
          <h2 id="goal-title">${summary.goal.next ? `Next stop: ${esc(summary.goal.next.name)}` : "Destination reached!"}</h2>
          <p class="muted">Every mission anyone in ${esc(user.cls ? user.cls.name : "your class")} finishes moves the whole class forward.</p>
          ${SE.goalTrack(summary.goal)}
          <p class="goal__total"><strong>${SE.num(summary.totalXp)} XP</strong> together${summary.goal.next ? ` · ${SE.num(summary.goal.next.xp - summary.totalXp)} to go` : ""}</p>
        </aside>
      </section>`;
  };

  SE.views.bindExpeditionHome = function () {};

  /* ───────── Today: my class, and on my own ─────────
   * Two clearly separate halves. "My class" holds everything the teacher set: class messages,
   * try-agains, assigned missions (with the teacher's instructions), and what's waiting for a
   * check. "On my own" holds the student's own exploring: work in progress, suggestions, and
   * the rest of the site. The help button sits on the first big card. */
  SE.views.today = function (user) {
    const prof = SE.game.profile(user.id);
    const due = (r) => r.x.dueDate || "9999";
    const assigned = SE.store.assignmentsFor(user.classId).map((x) => ({ x, a: SE.activityById[x.activityId] })).filter((r) => r.a && !SE.hiddenForUser(r.a));
    const assignedIds = new Set(assigned.map((r) => r.a.id));
    const open = assigned.filter((r) => !SE.game.missionDone(prof, r.a)).sort((p, q) => due(p).localeCompare(due(q)));
    const doneN = assigned.length - open.length;
    const labOf = (a) => a.launch.status === "lab" && SE.labs.byId(a.launch.labId);
    const hrefOf = (a) => (labOf(a) ? `#/lab/${a.launch.labId}` : `#/activity/${a.id}`);
    const startedOn = (a) => prof.opened.has(a.id) || (prof.steps[a.id] && prof.steps[a.id].size > 0) || (labOf(a) && (prof.labLevels[a.launch.labId] || new Set()).size > 0);
    const statuses = STEM.activities.map((a) => ({ a, st: SE.game.statusFor(prof, a) }));

    // My class: a try-again comes first (it's direction from the teacher), then the earliest-due assignment.
    let classMain = null, classWhy = "", retry = null, classNote = null;
    const retryA = statuses.filter((r) => r.st.state === "tryagain").sort((p, q) => q.st.tryAgain.at - p.st.tryAgain.at)[0];
    if (retryA) { classMain = retryA.a; retry = retryA.st.tryAgain; classWhy = "Your teacher asked you to try again"; }
    else if (open.length) { classMain = open[0].a; classWhy = open[0].x.dueDate ? `Assigned · ${SE.dueText(open[0].x.dueDate)}` : "Assigned by your teacher"; }
    if (classMain) { const asg = assigned.find((r) => r.a.id === classMain.id); classNote = asg && asg.x.note; }
    const messages = user.classId ? SE.store.messagesFor(user.classId) : [];
    const notes = prof.completions.map((c) => ({ c, r: prof.reviewed[c.event.id] })).filter((x) => x.r && x.r.data.note && Date.now() - x.r.at < 14 * SE.DAY).slice(-1)[0];
    const waiting = statuses.filter((r) => r.st.state === "submitted").sort((p, q) => ((q.st.sub && q.st.sub.at) || 0) - ((p.st.sub && p.st.sub.at) || 0)).map((r) => ({ label: r.a.title, href: `#/activity/${r.a.id}`, what: "Mission sent" }))
      .concat(Object.entries(prof.stages).filter(([, st]) => st.status === "claimed").map(([n]) => ({ label: `Stage ${n}: ${STEM.pathway.find((p) => p.stage === Number(n)).title}`, href: `#/pathway#stage-${n}`, what: "Stage check" })));

    // On my own: unassigned work in progress first, then suggestions (which already skip assigned missions).
    const ownInProgress = Object.entries(prof.steps).filter(([id, set]) => set.size > 0 && !prof.completedIds.has(id) && !assignedIds.has(id)).map(([id]) => SE.activityById[id]).filter(Boolean)[0];
    const recs = SE.game.recommendations(user, prof, 4).filter((r) => !ownInProgress || r.activity.id !== ownInProgress.id);
    const ownMain = ownInProgress || (recs[0] && recs[0].activity);
    const ownWhy = ownInProgress ? "Pick up where you left off" : recs[0] ? (recs[0].reason === "Ready for you" ? "A good next step" : recs[0].reason) : "";
    const ownMore = recs.filter((r) => r.activity !== ownMain).slice(0, 2);
    const first = user.displayName.split(" ")[0];
    const helpOn = classMain ? "class" : "own";

    const bigCard = (a, why, kind, extra = "") => {
      const lab = labOf(a), started = startedOn(a);
      return `
        <article class="today-card today-card--${kind}" aria-labelledby="today-${kind}-title">
          <span class="today-card__why">${icon(SE.areaById[a.area].icon)}${esc(why)}</span>
          <h3 id="today-${kind}-title" class="today-card__title">${esc(a.title)}</h3>
          ${extra}
          <p class="today-card__what">${esc(a.summary)}</p>
          <p class="today-card__meta">${icon("clock")}${SE.timeText(a)}${lab ? ` · ${(prof.labLevels[lab.id] || new Set()).size} of ${lab.levels.length} levels done` : ""}</p>
          ${a.stopAt ? `<p class="today-card__stop">${icon("flag")}<span><strong>You're done when:</strong> ${esc(a.stopAt)}</span></p>` : ""}
          <div class="today-card__actions">
            <a class="btn btn--launch btn--big" href="${hrefOf(a)}">${icon(started ? "arrowRight" : "rocket")}${started ? "Continue" : "Start"}</a>
            ${helpOn === kind ? `<button type="button" class="btn btn--ghost btn--big" id="help-btn" aria-expanded="false" aria-controls="help-panel">${icon("question")}I need help</button>` : ""}
          </div>
          ${helpOn === kind ? `<div class="help-panel" id="help-panel" hidden>
            <h3>Stuck? Try these, in order</h3>
            <ol><li>Read the step you're on again, out loud.</li>
              ${a.stuck ? `<li>Open the mission and look at <strong>Stuck? Try these</strong>.</li>` : lab ? `<li>In the lab, press <strong>Need a hint?</strong></li>` : ""}
              <li>Ask a partner.</li>
              <li>Still stuck? <button type="button" class="btn btn--small btn--primary" id="help-ask" data-activity="${a.id}">${icon("message")}Let my teacher know</button></li></ol>
            <p class="help-panel__status" id="help-status" role="status" aria-live="polite"></p>
          </div>` : ""}
        </article>`;
    };

    app().innerHTML = `
      <section class="today-top ridge" aria-labelledby="today-title">
        <div class="wrap today-top__inner">
          <a class="today-top__avatar" href="#/base" title="My harbor">${SE.ownAvatar(user.id, 56, "Your explorer")}</a>
          <div><span class="eyebrow">${esc(user.cls ? user.cls.name : "Explorer")}</span>
            <h1 id="today-title" tabindex="-1">Hi, ${esc(first)}. Here's today.</h1></div>
        </div>
      </section>
      <div class="wrap today today--split">
        <section class="today-col today-col--class" aria-labelledby="class-title">
          <header class="today-col__head">
            <span class="today-col__icon">${icon("users")}</span>
            <div><span class="eyebrow">My class${user.cls ? ` · ${esc(user.cls.name)}` : ""}</span><h2 id="class-title">With your class</h2></div>
          </header>
          ${messages.length ? `
          <div class="class-board" aria-labelledby="board-title">
            <h3 id="board-title">${icon("message")}From your teacher</h3>
            <ul class="class-board__list">${messages.slice(0, 3).map((m) => `<li><p>${esc(m.body)}</p><small>${SE.timeAgo(m.createdAt)}</small></li>`).join("")}</ul>
            ${messages.length > 3 ? `<details class="class-board__more"><summary>Older messages (${messages.length - 3})</summary><ul class="class-board__list">${messages.slice(3).map((m) => `<li><p>${esc(m.body)}</p><small>${SE.timeAgo(m.createdAt)}</small></li>`).join("")}</ul></details>` : ""}
          </div>` : ""}
          ${notes ? `<div class="teacher-note-banner">${icon("message")}<p><strong>Note from your teacher</strong> on <a href="#/activity/${notes.c.activity.id}">${esc(notes.c.activity.title)}</a>: “${esc(notes.r.data.note)}”</p></div>` : ""}
          ${classMain ? bigCard(classMain, classWhy, "class",
            (retry && retry.data.note ? `<p class="today-card__retry">${icon("message")}<span><strong>Your teacher says:</strong> “${esc(retry.data.note)}”</span></p>` : "")
            + (classNote ? `<p class="today-card__note">${icon("clipboard")}<span><strong>Instructions:</strong> ${esc(classNote)}</span></p>` : "")) : `
          <div class="today-empty">
            <h3>${assigned.length ? "All your class missions are done!" : "Nothing assigned right now"}</h3>
            <p>${assigned.length ? "Nice work. Explore on your own until your teacher adds more." : "When your teacher assigns a mission, it shows up here."}</p>
          </div>`}
          ${open.length > (retry ? 0 : 1) || doneN ? `
          <section class="today-more" aria-labelledby="also-title">
            <h3 id="also-title">Class missions <span class="muted">${doneN} of ${assigned.length} done</span></h3>
            <ul class="today-list">${open.filter((r) => r.a !== classMain).map(({ x, a }) => `<li><a href="${hrefOf(a)}">${icon(SE.areaById[a.area].icon)}<span><strong>${esc(a.title)}</strong><small>${x.dueDate ? esc(SE.dueText(x.dueDate)) : "No due date"} · ${SE.timeText(a)}</small>${x.note ? `<small class="today-list__note">${icon("clipboard")}${esc(x.note)}</small>` : ""}</span></a></li>`).join("")}
              ${assigned.filter((r) => SE.game.missionDone(prof, r.a)).map(({ a }) => `<li class="is-done"><a href="#/activity/${a.id}">${icon("check")}<span><strong>${esc(a.title)}</strong><small>Done</small></span></a></li>`).join("")}</ul>
          </section>` : ""}
          ${waiting.length ? `
          <section class="today-waiting" aria-labelledby="waiting-title">
            <h3 id="waiting-title">${icon("clock")}Waiting for your teacher to check</h3>
            <ul>${waiting.filter((w) => w.what === "Stage check").concat(waiting.filter((w) => w.what !== "Stage check")).slice(0, 3).map((w) => `<li><a href="${w.href}"><strong>${esc(w.label)}</strong></a><small>${esc(w.what)}</small></li>`).join("")}</ul>
            ${waiting.length > 3 ? `<a class="today-waiting__more" href="#/me">${waiting.length - 3} more in your mission log ${icon("arrowRight")}</a>` : ""}
          </section>` : ""}
          <a class="today-col__link" href="#/explore">${icon("map")}See the class journey on My expedition ${icon("arrowRight")}</a>
        </section>

        <section class="today-col today-col--own" aria-labelledby="own-title">
          <header class="today-col__head">
            <span class="today-col__icon">${icon("compass")}</span>
            <div><span class="eyebrow">On my own</span><h2 id="own-title">Explore on your own</h2></div>
          </header>
          <p class="today-col__lede">Your own picks, any time. They don't change your class list.</p>
          ${ownMain ? bigCard(ownMain, ownWhy, "own") : `<div class="today-empty"><h3>Pick anything you like</h3><p>Search all the missions and labs.</p></div>`}
          ${ownMore.length ? `<ul class="today-list today-list--own">${ownMore.map((r) => `<li><a href="${hrefOf(r.activity)}">${icon(SE.areaById[r.activity.area].icon)}<span><strong>${esc(r.activity.title)}</strong><small>${esc(r.reason)} · ${SE.timeText(r.activity)}</small></span></a></li>`).join("")}</ul>` : ""}
          <nav class="today-explore" aria-label="More to explore">
            <div class="today-explore__grid">
              <a href="#/library">${icon("search")}<span><strong>All missions</strong><small>Search and pick any mission</small></span></a>
              <a href="#/explore">${icon("map")}<span><strong>My expedition</strong><small>Star map, patches, and class goal</small></span></a>
              <a href="#/base">${icon("lighthouse")}<span><strong>My harbor</strong><small>Your explorer and boat</small></span></a>
              <a href="#/pathway">${icon("list")}<span><strong>Coding pathway</strong><small>Seven stages, step by step</small></span></a>
            </div>
          </nav>
        </section>
      </div>`;

    const btn = document.getElementById("help-btn");
    if (btn) btn.addEventListener("click", () => {
      const panel = document.getElementById("help-panel");
      panel.hidden = !panel.hidden;
      btn.setAttribute("aria-expanded", String(!panel.hidden));
    });
    const ask = document.getElementById("help-ask");
    if (ask) ask.addEventListener("click", () => {
      SE.store.log("help_requested", { activityId: ask.dataset.activity });
      ask.disabled = true;
      document.getElementById("help-status").textContent = "Your teacher can see that you asked for help. Keep trying the steps while you wait.";
    });
  };

  /* ───────── Mission debrief (bottom of an activity page) ───────── */
  /* ───────── Mission debrief: show what you know ─────────
   * A submission needs evidence: a written answer, or "I'll show or tell my teacher" (no typing).
   * It's recorded as Submitted. A teacher can then confirm it or ask the student to try again,
   * and the student can revise and send it again at any time. */
  const STATUS_TEXT = {
    submitted: "Submitted. Your teacher will check it.",
    checked: "Checked in the lab. Your teacher may still ask you to show it.",
    confirmed: "Your teacher confirmed it. Nice work!",
    tryagain: "Your teacher asked you to try again."
  };
  SE.views.debrief = function (user, a, prof) {
    const past = prof.completions.filter((c) => c.activity.id === a.id);
    const last = past[past.length - 1];
    const review = last ? prof.reviewed[last.event.id] : null;
    const st = SE.game.statusFor(prof, a);
    const base = SE.game.baseXp(a);
    const first = !last;
    const prompt = a.check || a.reflect;
    const xpLine = first
      ? `Worth <strong>${base} XP</strong>${!prof.counts.sectors.has(a.area) ? ` + ${P.xp.newSector} for a new area` : ""} when you send it.`
      : st.state === "tryagain" ? "Fix it up and send it again. Your teacher will look at your new answer."
      : "Sending it again is practice: it doesn't add XP, but your teacher can read your new answer.";
    const how = (st.confirmed && st.confirmed.data.how) ? ` (${esc({ oral: "spoken check", demo: "watched you show it", work: "reviewed your work" }[st.confirmed.data.how] || st.confirmed.data.how)})` : "";
    return `
      ${last || st.confirmed ? `
      <section class="block block--complete status--${st.state}" aria-labelledby="s-done">
        <h2 id="s-done">${icon(st.state === "tryagain" ? "refresh" : "check")}${esc(st.label === "Legacy" ? "Marked complete" : st.label)}</h2>
        <p>${esc(STATUS_TEXT[st.state] || "")}${how}${last ? ` You sent it on ${SE.dateShort(last.event.at)}.` : ""}</p>
        ${st.state === "tryagain" && st.tryAgain.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(st.tryAgain.data.note)}</span></p>` : ""}
        ${st.state === "confirmed" && st.confirmed.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(st.confirmed.data.note)}</span></p>` : ""}
        ${last && last.event.data.reflection ? `<blockquote class="your-answer"><span>Your answer</span>${esc(last.event.data.reflection)}</blockquote>` : last && last.event.data.evidence === "show" ? `<p class="muted">You chose to show or tell your teacher.</p>` : ""}
        ${review && review.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(review.data.note)}</span></p>` : ""}
      </section>` : ""}

      <section class="block block--debrief" aria-labelledby="s-debrief">
        <h2 id="s-debrief">${icon("flag")}${first ? "Show what you know" : st.state === "tryagain" ? "Try it again" : "Send a new answer"}</h2>
        <p class="block__hint">${xpLine}</p>
        <form id="debrief-form" novalidate>
          <div class="debrief-q">
            <p class="debrief-q__prompt"><span class="debrief-q__tag">${icon("question")}${a.check ? "Show what you know" : "Think about it"}</span>${esc(prompt)}</p>
            <fieldset class="evidence">
              <legend>How will you show it?</legend>
              <label class="evidence__opt"><input type="radio" name="d-ev" value="written" checked><span>${icon("message")}Write it here</span></label>
              <label class="evidence__opt"><input type="radio" name="d-ev" value="show"><span>${icon("users")}Show or tell my teacher</span></label>
            </fieldset>
            <div id="d-write">
              <label for="d-reflect" class="visually-hidden">Your answer</label>
              <textarea id="d-reflect" rows="4" maxlength="600" placeholder="Write what you did and what you figured out."></textarea>
              <p class="field-help">Don't include personal details like your full name, address, or phone number.</p>
            </div>
            <p class="field-help" id="d-show-help" hidden>Great. Your teacher will ask you to say it or show it. You can still add a few words below if you want.</p>
            <p class="form__error" id="d-err" role="alert"></p>
          </div>
          <div class="debrief-q debrief-q--extend">
            <span class="debrief-q__tag">${icon("rocket")}Take it further (optional)</span>
            <p>${esc(a.extend)}</p>
            <label for="d-extend-note">Did you try it? What happened?</label>
            <input id="d-extend-note" class="input" maxlength="200" placeholder="Optional">
          </div>
          <fieldset class="debrief-q confidence">
            <legend><span class="debrief-q__tag">${icon("target")}How did it go?</span></legend>
            <div class="confidence__opts">
              ${P.confidence.map((c, i) => `
                <label class="confidence__opt"><input type="radio" name="d-conf" value="${c.id}" ${i === 1 ? "checked" : ""}><span>${esc(c.name)}</span></label>`).join("")}
            </div>
          </fieldset>
          <button type="submit" class="btn btn--launch btn--big">${icon("check")}${first ? "Send it" : "Send again"}</button>
        </form>
      </section>`;
  };

  SE.views.bindDebrief = function (user, a) {
    const form = document.getElementById("debrief-form");
    if (!form) return;
    const sync = () => {
      const show = form.querySelector("input[name=d-ev]:checked").value === "show";
      document.getElementById("d-show-help").hidden = !show;
      document.getElementById("d-reflect").placeholder = show ? "Optional: a few words" : "Write what you did and what you figured out.";
    };
    form.querySelectorAll("input[name=d-ev]").forEach((r) => r.addEventListener("change", sync));
    let sent = false;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (sent) return;   // a double-click or a second Enter must not record twice
      const evidence = form.querySelector("input[name=d-ev]:checked").value;
      const text = document.getElementById("d-reflect").value.trim().slice(0, 600);
      const err = document.getElementById("d-err");
      if (evidence === "written" && !/[a-z0-9]/i.test(text)) {
        err.textContent = "Write your answer first, or choose “Show or tell my teacher.”";
        document.getElementById("d-reflect").focus();
        return;
      }
      err.textContent = "";
      sent = true;
      const btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.setAttribute("aria-disabled", "true"); }
      const before = SE.game.profile(user.id);
      const stepsDone = (before.steps[a.id] || new Set()).size;
      SE.store.log("mission_completed", {
        activityId: a.id,
        evidence,
        reflection: text,
        extensionNote: document.getElementById("d-extend-note").value.trim().slice(0, 200),
        confidence: (form.querySelector("input[name=d-conf]:checked") || {}).value || "got-it",
        stepsDone,
        stepsTotal: a.steps.length
      });
      const after = SE.game.profile(user.id);
      celebrate(user, a, before, after);
    });
  };

  /* ───────── Mission complete overlay ───────── */
  function celebrate(user, a, before, after) {
    const gained = after.completions[after.completions.length - 1];
    const newPatches = after.patches.filter((p) => p.earned && !before.patches.find((b) => b.patch.id === p.patch.id).earned);
    const rankUp = after.index > before.index;
    const recs = SE.game.recommendations(user, after, 1);
    const next = recs[0];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const wrap = document.createElement("div");
    wrap.className = "overlay";
    wrap.innerHTML = `
      <div class="celebrate" role="dialog" aria-modal="true" aria-labelledby="cel-title">
        <div class="celebrate__stamp">${SE.patchArt({ name: "Mission complete", icon: SE.areaById[a.area].icon, ring: "orange" }, true, 120)}</div>
        <h2 id="cel-title" tabindex="-1">${rankUp ? `Promoted to ${esc(after.rank.name)}!` : gained.first ? (gained.event.data.evidence === "show" ? "Sent! Now show your teacher." : "Sent to your teacher!") : "Practice saved"}</h2>
        <p class="celebrate__sub">${esc(a.title)}</p>
        ${gained.event.data.evidence === "show" ? `<p class="celebrate__note celebrate__note--show">${icon("users")}Now show or tell your teacher what you did.</p>` : ""}
        ${gained.xp ? `<p class="celebrate__xp">+<span id="cel-xp">${reduce ? gained.xp : 0}</span> XP</p>
        <ul class="celebrate__parts">${gained.parts.map(([label, n]) => `<li><span>${esc(label)}</span><b>+${n}</b></li>`).join("")}</ul>` : `<p class="celebrate__note">Repeats are practice, so they don't add XP. Your teacher can read your new answer.</p>`}
        ${rankUp ? `<div class="celebrate__rank">${SE.insignia(after.rank, 56)}<p><strong>${esc(after.rank.name)}</strong><br>${esc(after.rank.motto)}</p></div>` : ""}
        <div class="celebrate__bar">${rankBar(after, true)}</div>
        ${SE.base.unlockStrip(SE.base.newUnlocks(before, after))}
        ${newPatches.length ? `
          <div class="celebrate__patches">
            <p class="eyebrow">New ${newPatches.length === 1 ? "patch" : "patches"} earned</p>
            <div class="patch-row patch-row--center">
              ${newPatches.map((p) => `<figure class="patch-tile patch-tile--new">${SE.patchArt(p.patch, true, 88)}<figcaption><strong>${esc(p.patch.name)}</strong></figcaption></figure>`).join("")}
            </div>
          </div>` : ""}
        <div class="celebrate__actions">
          ${next ? `<a class="btn btn--launch" href="#/activity/${next.activity.id}" data-close>${icon("rocket")}Next: ${esc(next.activity.title)}</a>` : ""}
          <a class="btn btn--ghost" href="#/" data-close>${icon("map")}Back to Today</a>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    document.body.classList.add("has-overlay");
    const title = wrap.querySelector("#cel-title");
    title.focus();

    if (!reduce && gained.xp) {
      const el = wrap.querySelector("#cel-xp");
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 900);
        el.textContent = Math.round(gained.xp * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    const close = () => {
      wrap.remove();
      document.body.classList.remove("has-overlay");
    };
    wrap.querySelectorAll("[data-close]").forEach((l) => l.addEventListener("click", () => {
      close();
      // If the link points to the current page, re-render it.
      if (l.getAttribute("href") === location.hash) SE.route(true);
    }));
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { close(); SE.route(true); }
      if (e.key === "Tab") {
        const f = [...wrap.querySelectorAll("a, button, [tabindex]")];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ───────── Pixel creations (looping, CSS-only animation) ───────── */
  let animId = 0;
  SE.pixelAnim = (res, size = 96) => {
    if (!res || !res.frames || !res.frames.length) return "";
    const id = `pxa${++animId}`;
    const N = res.frames.length;
    const dur = N / (res.fps || 6);
    const pct = (100 / N).toFixed(3);
    return `<span class="pix-anim" id="${id}" style="width:${size}px;height:${size}px">
      <style>@keyframes ${id}k { 0% { opacity: 1; } ${pct}% { opacity: 0; } 100% { opacity: 0; } }
        #${id} > svg { animation: ${id}k ${dur}s steps(1, end) infinite; }
        ${res.frames.map((_, i) => `#${id} > svg:nth-of-type(${i + 1}) { animation-delay: ${((i * dur) / N - dur).toFixed(3)}s; }`).join("")}
        @media (prefers-reduced-motion: reduce) { #${id} > svg { animation: none; opacity: 0; } #${id} > svg:first-of-type { opacity: 1; } }</style>
      ${res.frames.map((f, i) => SE.pixelSvg(f, res.n, size, i === 0 ? `Animation with ${N} frames` : "")).join("")}
    </span>`;
  };
  SE.views.creationsGallery = (prof) => {
    const r = prof.labResults["pixel-studio"];
    if (!r) return "";
    const lab = SE.labs.byId("pixel-studio");
    const items = Object.entries(r).sort((a, b) => b[0] - a[0]).filter(([, v]) => v.result && v.result.frames);
    if (!items.length) return "";
    return `<div class="creations">${items.map(([lvl, v]) => `<figure class="creation">${v.result.frames.length > 1 ? SE.pixelAnim(v.result, 96) : SE.pixelSvg(v.result.frames[0], v.result.n, 96, "Pixel art")}<figcaption><strong>${esc(lab ? lab.levels[lvl].title : "Creation")}</strong><span>${v.result.frames.length} frame${v.result.frames.length > 1 ? "s" : ""}${v.result.frames.length > 1 ? ` · ${v.result.fps} fps` : ""} · ${SE.dateShort(v.at)}</span></figcaption></figure>`).join("")}</div>`;
  };

  /* ───────── Explorer profile ───────── */
  SE.views.me = function (user) {
    const prof = SE.game.profile(user.id);
    const log = prof.completions.slice().reverse();
    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink()}</div>
          <div class="page-top__head">
            <a class="xhero__avatar" href="#/base" title="Customize your explorer">${SE.ownAvatar(user.id, 72, "Your explorer")}<span class="xhero__badge">${SE.insignia(prof.rank, 28)}</span></a>
            <div><span class="eyebrow">Explorer profile</span><h1 tabindex="-1">${esc(user.displayName)}</h1><a class="btn btn--ghost btn--small" href="#/base">${icon("lighthouse")}Visit my harbor</a></div>
          </div>
          <p class="page-top__lede">${esc(prof.rank.name)} · ${SE.num(prof.xp)} XP · ${plural(prof.counts.missions, "mission", "missions")} · ${prof.earnedCount} of ${P.patches.length} patches</p>
          <div class="page-top__rank">${rankBar(prof)}</div>
        </div>
      </section>

      <section class="section wrap" aria-labelledby="ranks-title">
        <div class="section__head"><div><span class="eyebrow">Ranks</span><h2 id="ranks-title">Your climb</h2></div></div>
        <ol class="rank-ladder">
          ${P.ranks.map((r, i) => `
            <li class="${i < prof.index ? "is-past" : i === prof.index ? "is-current" : ""}">
              ${SE.insignia(r, 40)}
              <strong>${esc(r.name)}</strong>
              <span>${SE.num(r.xp)} XP</span>
              ${i === prof.index ? `<em>You are here</em>` : ""}
            </li>`).join("")}
        </ol>
      </section>

      <section class="section wrap" aria-labelledby="all-patches">
        <div class="section__head"><div><span class="eyebrow">Mission patches</span><h2 id="all-patches">${prof.earnedCount} of ${P.patches.length} earned</h2></div></div>
        <div class="patch-grid">
          ${prof.patches.map((p) => `
            <figure class="patch-tile ${p.earned ? "" : "is-locked"}">${SE.patchArt(p.patch, p.earned, 96)}
              <figcaption>
                <strong>${esc(p.patch.name)}</strong>
                <span>${p.earned ? `Earned ${SE.dateShort(p.earnedAt)}` : esc(p.patch.how)}</span>
                ${p.earned ? "" : `<span class="mini-meter" aria-label="${p.progress} of ${p.target}"><span style="width:${(p.progress / p.target) * 100}%"></span></span>`}
              </figcaption>
            </figure>`).join("")}
        </div>
      </section>

      ${SE.views.creationsGallery(prof) ? `<section class="section wrap" aria-labelledby="gal-title"><div class="section__head"><div><span class="eyebrow">Gallery</span><h2 id="gal-title">My creations</h2></div></div>${SE.views.creationsGallery(prof)}</section>` : ""}
      ${SE.labsStrip(user, null, "My labs")}

      <section class="section wrap" aria-labelledby="log-title">
        <div class="section__head"><div><span class="eyebrow">Mission log</span><h2 id="log-title">${log.length ? "Everything you've completed" : "Your log is empty, for now"}</h2></div></div>
        ${log.length ? `<ol class="mission-log">
          ${log.map((c) => {
            const r = prof.reviewed[c.event.id];
            return `
            <li>
              <div class="mission-log__head">
                <span class="icon-badge">${icon(SE.areaById[c.activity.area].icon)}</span>
                <div><a href="#/activity/${c.activity.id}"><strong>${esc(c.activity.title)}</strong></a><span>${SE.dateShort(c.event.at)} · ${esc((P.confidence.find((x) => x.id === c.event.data.confidence) || {}).name || "")}</span></div>
                <b class="mission-log__xp">+${c.xp} XP</b>
              </div>
              ${c.event.data.reflection ? `<p class="mission-log__answer">“${esc(c.event.data.reflection)}”</p>` : ""}
              ${r && r.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Teacher:</strong> ${esc(r.data.note)}</span></p>` : ""}
            </li>`;
          }).join("")}
        </ol>` : `<div class="empty">${icon("map")}<h3>Complete a mission to start your log</h3><p>Every mission you finish is saved here, with your answers and notes from your teacher.</p><a class="btn btn--primary" href="#/">${icon("rocket")}Find a mission</a></div>`}
      </section>`;
  };
})();
