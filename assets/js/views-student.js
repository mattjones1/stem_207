/*
 * STEM Explorers — student views: expedition home, mission debrief,
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
      <section class="xhero" aria-labelledby="xhero-title">
        <div class="wrap xhero__inner">
          <div class="xhero__id">
            ${SE.insignia(prof.rank, 64)}
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

      ${notes ? `
      <div class="wrap"><div class="teacher-note-banner">
        ${icon("message")}
        <p><strong>Note from your teacher</strong> on <a href="#/activity/${notes.c.activity.id}">${esc(notes.c.activity.title)}</a>: “${esc(notes.r.data.note)}”</p>
      </div></div>` : ""}

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
              <span class="next-card__meta">${r.activity.duration} min · +${SE.game.baseXp(r.activity)} XP</span>
            </a>`).join("")}
        </div>
      </section>

      <section class="section wrap" aria-labelledby="map-title">
        <div class="section__head">
          <div><span class="eyebrow">Expedition map</span><h2 id="map-title">Light up every star</h2></div>
          <p>Each star is a mission. Finish one and it lights up and joins its constellation. Glowing rings are suggested for you.</p>
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

  /* ───────── Mission debrief (bottom of an activity page) ───────── */
  SE.views.debrief = function (user, a, prof) {
    const past = prof.completions.filter((c) => c.activity.id === a.id);
    const last = past[past.length - 1];
    const review = last ? prof.reviewed[last.event.id] : null;
    const base = SE.game.baseXp(a);
    const first = !last;
    const xpLine = first
      ? `Worth <strong>${base} XP</strong>${!prof.counts.sectors.has(a.area) ? ` + ${P.xp.newSector} for a new area` : ""}. Answer the question for +${P.xp.reflection}, try the challenge for +${P.xp.extension}.`
      : `You've done this one. Doing it again earns <strong>${Math.round(base * P.xp.replay)} XP</strong>.`;

    return `
      ${last ? `
      <section class="block block--complete" aria-labelledby="s-done">
        <h2 id="s-done">${icon("check")}Mission complete</h2>
        <p>You finished this on ${SE.dateShort(last.event.at)} and earned <strong>${last.xp} XP</strong>.</p>
        ${last.event.data.reflection ? `<blockquote class="your-answer"><span>Your answer to “${esc(a.reflect)}”</span>${esc(last.event.data.reflection)}</blockquote>` : ""}
        ${review && review.data.note ? `<p class="teacher-reply">${icon("message")}<span><strong>Your teacher wrote:</strong> ${esc(review.data.note)}</span></p>` : review ? `<p class="muted">${icon("eye", 'class="inline-icon"')}Your teacher read your answer.</p>` : ""}
      </section>` : ""}

      <section class="block block--debrief" aria-labelledby="s-debrief">
        <h2 id="s-debrief">${icon("flag")}${last ? "Do it again" : "Mission debrief"}</h2>
        <p class="block__hint">${xpLine}</p>
        <form id="debrief-form" novalidate>
          <div class="debrief-q">
            <label for="d-reflect"><span class="debrief-q__tag">${icon("question")}Think about it</span>${esc(a.reflect)}</label>
            <textarea id="d-reflect" rows="4" maxlength="600" placeholder="Write what you noticed or figured out."></textarea>
            <p class="field-help">Write about your thinking. Don't include personal details like your full name, address, or phone number.</p>
          </div>
          <div class="debrief-q debrief-q--extend">
            <span class="debrief-q__tag">${icon("rocket")}Take it further</span>
            <p>${esc(a.extend)}</p>
            <label class="check-row"><input type="checkbox" id="d-extend"> I tried this challenge</label>
          </div>
          <fieldset class="debrief-q confidence">
            <legend><span class="debrief-q__tag">${icon("target")}How did it go?</span></legend>
            <div class="confidence__opts">
              ${P.confidence.map((c, i) => `
                <label class="confidence__opt"><input type="radio" name="d-conf" value="${c.id}" ${i === 1 ? "checked" : ""}><span>${esc(c.name)}</span></label>`).join("")}
            </div>
          </fieldset>
          <button type="submit" class="btn btn--launch btn--big">${icon("check")}${last ? "Complete it again" : "Complete mission"}</button>
        </form>
      </section>`;
  };

  SE.views.bindDebrief = function (user, a) {
    const form = document.getElementById("debrief-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const before = SE.game.profile(user.id);
      const stepsDone = (before.steps[a.id] || new Set()).size;
      SE.store.log("mission_completed", {
        activityId: a.id,
        reflection: document.getElementById("d-reflect").value.trim().slice(0, 600),
        extension: document.getElementById("d-extend").checked,
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
        <h2 id="cel-title" tabindex="-1">${rankUp ? `Promoted to ${esc(after.rank.name)}!` : "Mission complete!"}</h2>
        <p class="celebrate__sub">${esc(a.title)}</p>
        <p class="celebrate__xp">+<span id="cel-xp">${reduce ? gained.xp : 0}</span> XP</p>
        <ul class="celebrate__parts">${gained.parts.map(([label, n]) => `<li><span>${esc(label)}</span><b>+${n}</b></li>`).join("")}</ul>
        ${rankUp ? `<div class="celebrate__rank">${SE.insignia(after.rank, 56)}<p><strong>${esc(after.rank.name)}</strong><br>${esc(after.rank.motto)}</p></div>` : ""}
        <div class="celebrate__bar">${rankBar(after, true)}</div>
        ${newPatches.length ? `
          <div class="celebrate__patches">
            <p class="eyebrow">New ${newPatches.length === 1 ? "patch" : "patches"} earned</p>
            <div class="patch-row patch-row--center">
              ${newPatches.map((p) => `<figure class="patch-tile patch-tile--new">${SE.patchArt(p.patch, true, 88)}<figcaption><strong>${esc(p.patch.name)}</strong></figcaption></figure>`).join("")}
            </div>
          </div>` : ""}
        <div class="celebrate__actions">
          ${next ? `<a class="btn btn--launch" href="#/activity/${next.activity.id}" data-close>${icon("rocket")}Next: ${esc(next.activity.title)}</a>` : ""}
          <a class="btn btn--ghost" href="#/" data-close>${icon("map")}Back to my expedition</a>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    document.body.classList.add("has-overlay");
    const title = wrap.querySelector("#cel-title");
    title.focus();

    if (!reduce) {
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

  /* ───────── Explorer profile ───────── */
  SE.views.me = function (user) {
    const prof = SE.game.profile(user.id);
    const log = prof.completions.slice().reverse();
    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${SE.backLink()}</div>
          <div class="page-top__head">
            ${SE.insignia(prof.rank, 64)}
            <div><span class="eyebrow">Explorer profile</span><h1 tabindex="-1">${esc(user.displayName)}</h1></div>
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
