/*
 * STEM 207 — student views: Home, the activity debrief,
 * the celebration after sending, and the explorer profile (Me).
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

  /* Log "mission_opened" at most once per 30 minutes per activity, so re-renders don't flood the log. */
  SE.logOpen = (user, activityId) => {
    const evs = SE.store.eventsFor(user.id);
    const recent = evs.slice().reverse().find((e) => e.type === "mission_opened" && e.data.activityId === activityId);
    if (!recent || Date.now() - recent.at > 30 * 60000) SE.store.log("mission_opened", { activityId });
  };

  /* ───────── Class journey ───────── */
  /* Class journey: points and badges the class earns together (separate from personal XP). */
  SE.classJourneyBlock = function (journey, opts = {}) {
    const g = journey.goal, cp = P.classPoints;
    const earned = journey.badges.filter((b) => b.earned);
    const badge = (b) => `<li class="cbadge ${b.earned ? "is-earned" : ""}">${icon(b.badge.icon)}<span><strong>${esc(b.badge.name)}</strong><small>${b.earned ? "Earned" : esc(b.badge.how)}</small></span></li>`;
    if (opts.compact) return `
      <div class="cjourney cjourney--compact">
        <h3>${icon("boat")}Class journey</h3>
        <p class="cjourney__pts"><strong>${SE.num(journey.points)} class points</strong>${g.next ? ` · next stop ${esc(g.next.name)} (${SE.num(g.next.pts - journey.points)} to go)` : " · Katahdin reached!"}</p>
        ${SE.goalTrack(g)}
        <p class="cjourney__badges">${icon("star")}${earned.length} of ${journey.badges.length} class badges${earned.length ? `: ${earned.map((b) => esc(b.badge.name)).join(", ")}` : ""}</p>
      </div>`;
    return `
      <div class="cjourney">
        <p class="cjourney__pts"><strong>${SE.num(journey.points)} class points</strong>${g.next ? ` · ${SE.num(g.next.pts - journey.points)} to ${esc(g.next.name)}` : ""}</p>
        ${SE.goalTrack(g)}
        <p class="cjourney__how">${icon("users")}<span><strong>How the class earns points:</strong> +${cp.passed} each time your teacher passes an activity from your class work (an assigned activity, or one in a class Learning Plan). Activities you choose on your own earn your own XP when they pass.</span></p>
        <h3 class="cjourney__bh">Class badges <span class="muted">${earned.length} of ${journey.badges.length}</span></h3>
        <ul class="cbadges">${journey.badges.map(badge).join("")}</ul>
      </div>`;
  };

  /* One line for Home: the class's points and the next stop. Badges and the full track are on Me. */
  SE.classJourneyLine = function (journey) {
    const g = journey.goal;
    return `<p class="home-line home-journey">${icon("boat")}<span><strong>Class journey:</strong> ${SE.num(journey.points)} class points${g.next ? ` · ${SE.num(g.next.pts - journey.points)} to ${esc(g.next.name)}` : " · Katahdin reached!"}</span> <a href="#/me#class-journey">See class badges</a></p>`;
  };

  /* ───────── Home: one calm column ─────────
   * A greeting, then exactly one "Up next" card: a Try again first (it's direction from the teacher),
   * then the next activity in a current Learning Plan, then an older single assignment, then the
   * student's own work in progress, then a suggestion. Below it: one line for what's waiting, the
   * newest message, one line for the class journey, and two ways onward. */
  SE.home = {};
  SE.home.upNext = function (user, prof) {
    const statuses = Object.values(SE.activityById).filter((a) => !SE.hiddenForUser(a)).map((a) => ({ a, st: SE.game.statusFor(prof, a) }));
    const retry = statuses.filter((r) => r.st.state === "tryagain").sort((p, q) => q.st.tryAgain.at - p.st.tryAgain.at)[0];
    if (retry) return { a: retry.a, kind: "tryagain", why: "Your teacher asked you to try again", note: retry.st.tryAgain.data.note || null, noteLabel: "Your teacher says" };
    const plans = user.classId ? SE.store.pathwayAssignmentsFor(user.classId).filter((x) => x.snapshot && !SE.store.planFinished(x)) : [];
    for (const asg of plans) {
      const pr = SE.plans.progress(prof, asg.snapshot);
      if (pr.next) return { a: pr.next.a, kind: "plan", why: `Next in ${asg.snapshot.title}`, note: pr.next.step.note, noteLabel: "From your teacher", plan: asg };
    }
    const due = (x) => x.dueDate || "9999";
    const old = (user.classId ? SE.store.assignmentsFor(user.classId) : []).map((x) => ({ x, a: SE.activityById[x.activityId] }))
      .filter((r) => r.a && !SE.hiddenForUser(r.a) && !SE.game.missionDone(prof, r.a)).sort((p, q) => due(p.x).localeCompare(due(q.x)))[0];
    if (old) return { a: old.a, kind: "assigned", why: old.x.dueDate ? `Assigned · ${SE.dueText(old.x.dueDate)}` : "Assigned by your teacher", note: old.x.note || null, noteLabel: "Instructions" };
    const mine = statuses.find((r) => r.st.state === "started");
    if (mine) return { a: mine.a, kind: "own", why: "Pick up where you left off" };
    const rec = SE.game.recommendations(user, prof, 1)[0];
    if (rec) return { a: rec.activity, kind: "suggested", why: rec.reason === "Ready for you" ? "A good next step" : rec.reason };
    return null;
  };

  SE.views.today = function (user) {
    const prof = SE.game.profile(user.id);
    const next = SE.home.upNext(user, prof);
    const labOf = (a) => a.launch.status === "lab" && SE.labs.byId(a.launch.labId);
    const waiting = Object.values(SE.activityById).filter((a) => SE.game.statusFor(prof, a).state === "submitted").length;
    const messages = user.classId ? SE.store.messagesFor(user.classId) : [];
    const note = prof.notes.find((e) => Date.now() - e.at < 14 * SE.DAY);
    const first = user.displayName.split(" ")[0];
    const msg = (m) => `<li><p>${esc(m.body)}</p><small>${SE.timeAgo(m.createdAt)}</small></li>`;

    let card;
    if (next) {
      const a = next.a, lab = labOf(a);
      const started = SE.game.statusFor(prof, a).state !== "none";
      const verb = next.kind === "tryagain" ? "Try again" : started ? "Continue" : "Start";
      card = `
        <article class="today-card upnext upnext--${next.kind}" id="upnext" aria-labelledby="upnext-title">
          <span class="today-card__why">${icon(next.kind === "tryagain" ? "refresh" : next.kind === "plan" ? "map" : SE.areaById[a.area].icon)}${esc(next.why)}</span>
          <h2 id="upnext-title" class="today-card__title">${esc(a.title)}</h2>
          ${next.note ? `<p class="today-card__note">${icon("message")}<span><strong>${esc(next.noteLabel)}:</strong> “${esc(next.note)}”</span></p>` : ""}
          ${a.notice ? `<p class="today-card__note">${icon("alert")}<span><strong>Update:</strong> ${esc(a.notice)}</span></p>` : ""}
          <p class="today-card__what">${esc(a.summary)}</p>
          <p class="today-card__meta">${icon("clock")}${SE.timeText(a)}${lab ? ` · ${(prof.labLevels[lab.id] || new Set()).size} of ${lab.levels.length} levels done` : ""}</p>
          ${a.stopAt ? `<p class="today-card__stop">${icon("flag")}<span><strong>You're done when:</strong> ${esc(a.stopAt)}</span></p>` : ""}
          <div class="today-card__actions">
            <a class="btn btn--launch btn--big" href="${lab ? `#/lab/${lab.id}` : `#/activity/${a.id}`}">${icon(started ? "arrowRight" : "rocket")}${verb}<span class="visually-hidden">: ${esc(a.title)}</span></a>
            <button type="button" class="btn btn--ghost btn--big" id="help-btn" aria-expanded="false" aria-controls="help-panel">${icon("question")}I need help</button>
          </div>
          <div class="help-panel" id="help-panel" hidden>
            <h3>Stuck? Try these, in order</h3>
            <ol><li>Read the step you're on again, out loud.</li>
              ${a.stuck ? `<li>Open the activity and look at <strong>Stuck? Try these</strong>.</li>` : lab ? `<li>In the lab, press <strong>Need a hint?</strong></li>` : ""}
              <li>Ask a partner.</li>
              <li>Still stuck? <button type="button" class="btn btn--small btn--primary" id="help-ask" data-activity="${a.id}">${icon("message")}Let my teacher know</button></li></ol>
            <p class="help-panel__status" id="help-status" role="status" aria-live="polite"></p>
          </div>
        </article>`;
    } else card = `
        <article class="today-card upnext upnext--empty" id="upnext" aria-labelledby="upnext-title">
          <h2 id="upnext-title" class="today-card__title">You're all caught up</h2>
          <p class="today-card__what">Nothing new from your teacher right now. Explore an activity you like.</p>
        </article>`;

    app().innerHTML = `
      <section class="today-top ridge" aria-labelledby="home-title">
        <div class="wrap today-top__inner">
          <a class="today-top__avatar" href="#/base" title="My harbor">${SE.ownAvatar(user.id, 56, "Your explorer")}</a>
          <div><span class="eyebrow">${esc(user.cls ? user.cls.name : "Explorer")}</span>
            <h1 id="home-title" tabindex="-1">Hi, ${esc(first)}.</h1></div>
          <a class="home-rank" href="#/me">${SE.insignia(prof.rank, 26)}<span><strong>${esc(prof.rank.name)}</strong><small>${SE.num(prof.xp)} XP</small></span></a>
        </div>
      </section>
      <div class="wrap home">
        ${card}
        ${waiting ? `<p class="home-line home-waiting">${icon("clock")}<span><strong>Waiting for your teacher:</strong> ${waiting}</span> <a href="#/me#log-title">See what you sent</a></p>` : ""}
        ${messages.length || note ? `
        <section class="home-msg" aria-labelledby="msg-title">
          <h2 id="msg-title">${icon("message")}From your teacher</h2>
          ${note ? `<div class="home-note"><span class="home-note__tag">${icon("star")}Just for you</span><p>${esc(note.data.note)}</p><small>${SE.timeAgo(note.at)}</small></div>` : ""}
          ${messages.length ? `<ul class="home-msg__list">${msg(messages[0])}</ul>` : ""}
          ${messages.length > 1 ? `<details class="home-msg__more"><summary>Older messages (${messages.length - 1})</summary><ul class="home-msg__list">${messages.slice(1).map(msg).join("")}</ul></details>` : ""}
        </section>` : ""}
        ${user.classId ? SE.classJourneyLine(SE.game.classJourney(user.classId)) : ""}
        <nav class="home-actions" aria-label="More">
          <a class="btn btn--primary btn--big" href="#/plans">${icon("map")}My Learning Plans</a>
          <a class="btn btn--ghost btn--big" href="#/activities">${icon("search")}Explore activities</a>
        </nav>
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

  /* ───────── Activity debrief: the reflection is the deliverable ─────────
   * Every activity works the same way: the student sends a reflection (written, or "I'll show or
   * tell my teacher"), and the teacher marks it Pass (the XP is earned) or Try again (it reopens,
   * with the teacher's note). The student can revise and send again at any time. */
  const STATUS_TEXT = {
    submitted: "Sent. Your teacher will check it.",
    confirmed: "Your teacher passed it. Nice work!",
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
    const xpLine = st.state === "confirmed" ? "You already passed this one. Sending again is practice: your teacher can read your new answer."
      : st.state === "tryagain" ? "Fix it up and send it again. Your teacher will look at your new answer."
      : `Worth <strong>${base} XP</strong>${!prof.counts.sectors.has(a.area) ? ` + ${P.xp.newSector} for your first pass in ${esc(SE.areaById[a.area].short)}` : ""} when your teacher passes it.`;
    const how = (st.confirmed && st.confirmed.data.how) ? ` (${esc({ oral: "spoken check", demo: "watched you show it", work: "reviewed your work" }[st.confirmed.data.how] || st.confirmed.data.how)})` : "";
    return `
      ${last || st.confirmed ? `
      <section class="block block--complete status--${st.state}" aria-labelledby="s-done">
        <h2 id="s-done">${icon(st.state === "tryagain" ? "refresh" : "check")}${esc(st.label)}</h2>
        <p>${esc(STATUS_TEXT[st.state] || "")}${how}${last ? ` You sent it on ${SE.dateShort(last.event.at)}.` : ""}</p>
        ${st.state === "tryagain" && st.tryAgain.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(st.tryAgain.data.note)}</span></p>` : ""}
        ${st.state === "confirmed" && st.confirmed.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(st.confirmed.data.note)}</span></p>` : ""}
        ${last && last.event.data.reflection ? `<blockquote class="your-answer"><span>Your answer</span>${esc(last.event.data.reflection)}</blockquote>` : last && last.event.data.evidence === "show" ? `<p class="muted">You chose to show or tell your teacher.</p>` : ""}
        ${review && review.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(review.data.note)}</span></p>` : ""}
      </section>` : ""}

      ${SE.checksGuide("student")}
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
            <span class="debrief-q__tag">${icon("rocket")}Go deeper (optional)</span>
            <label for="d-extend-note">Did you try Go deeper? What did you find?</label>
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

  /* ───────── Activity complete overlay ───────── */
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
        <div class="celebrate__stamp">${SE.patchArt({ name: "Sent", icon: SE.areaById[a.area].icon, ring: "orange" }, true, 120)}</div>
        <h2 id="cel-title" tabindex="-1">${gained.event.data.evidence === "show" ? "Sent! Now show your teacher." : "Sent to your teacher!"}</h2>
        <p class="celebrate__sub">${esc(a.title)}</p>
        ${gained.event.data.evidence === "show" ? `<p class="celebrate__note celebrate__note--show">${icon("users")}Now show or tell your teacher what you did.</p>` : ""}
        <p class="celebrate__note">${after.missions[a.id] && after.missions[a.id].confirmed
          ? "You already passed this one, so this is practice. Your teacher can read your new answer."
          : `Your teacher will check it. When they pass it, you earn <strong>${SE.game.baseXp(a)} XP</strong>. If they ask you to try again, you'll see their note on Home.`}</p>
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
          <a class="btn btn--ghost" href="#/" data-close>${icon("map")}Back to Home</a>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    document.body.classList.add("has-overlay");
    const title = wrap.querySelector("#cel-title");
    title.focus();


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
          <p class="page-top__lede">${esc(prof.rank.name)} · ${SE.num(prof.xp)} XP · ${plural(prof.completedIds.size, "activity", "activities")} passed · ${prof.earnedCount} of ${P.patches.length} patches</p>
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
        <div class="section__head"><div><span class="eyebrow">Activity patches</span><h2 id="all-patches">${prof.earnedCount} of ${P.patches.length} earned</h2></div></div>
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

      ${user.classId ? `
      <section class="section wrap" aria-labelledby="class-journey">
        <div class="section__head"><div><span class="eyebrow">Together with ${esc(user.cls ? user.cls.name : "your class")}</span><h2 id="class-journey" tabindex="-1">Class journey</h2></div></div>
        ${SE.classJourneyBlock(SE.game.classJourney(user.classId))}
      </section>` : ""}

      ${SE.views.creationsGallery(prof) ? `<section class="section wrap" aria-labelledby="gal-title"><div class="section__head"><div><span class="eyebrow">Gallery</span><h2 id="gal-title">My creations</h2></div></div>${SE.views.creationsGallery(prof)}</section>` : ""}
      ${SE.labsStrip(user, null, "My labs")}

      ${prof.notes.length ? `
      <section class="section wrap" aria-labelledby="notes-title">
        <div class="section__head"><div><span class="eyebrow">Just for you</span><h2 id="notes-title">Notes from your teacher</h2></div></div>
        <ul class="home-msg__list notes-list">${prof.notes.map((e) => `<li><p>${esc(e.data.note)}</p><small>${SE.dateShort(e.at)}</small></li>`).join("")}</ul>
      </section>` : ""}

      <section class="section wrap" aria-labelledby="log-title">
        <div class="section__head"><div><span class="eyebrow">Activity log</span><h2 id="log-title" tabindex="-1">${log.length ? "Everything you've sent" : "Your log is empty, for now"}</h2></div></div>
        ${log.length ? `<ol class="mission-log">
          ${log.map((c) => {
            const r = prof.reviewed[c.event.id];
            return `
            <li>
              <div class="mission-log__head">
                <span class="icon-badge">${icon(SE.areaById[c.activity.area].icon)}</span>
                <div><a href="#/activity/${c.activity.id}"><strong>${esc(c.activity.title)}</strong></a><span>${SE.dateShort(c.event.at)} · ${esc((P.confidence.find((x) => x.id === c.event.data.confidence) || {}).name || "")}</span></div>
                ${SE.studentStatusChip(SE.game.statusFor(prof, c.activity))}
              </div>
              ${c.event.data.reflection ? `<p class="mission-log__answer">“${esc(c.event.data.reflection)}”</p>` : ""}
              ${r && r.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Teacher:</strong> ${esc(r.data.note)}</span></p>` : ""}
            </li>`;
          }).join("")}
        </ol>` : `<div class="empty">${icon("map")}<h3>Send an activity to start your log</h3><p>Every reflection you send is saved here, with notes from your teacher.</p><a class="btn btn--primary" href="#/">${icon("rocket")}Find an activity</a></div>`}
      </section>`;
  };
})();
