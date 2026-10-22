/*
 * STEM 207 — lab framework.
 *
 * A lab is an interactive, leveled learning app that runs inside STEM 207.
 * Each lab file registers itself with SE.labs.register({...}). The shell handles
 * the page layout, level list, concept intro, hints, the "level complete" panel,
 * and saving progress to the activity log.
 *
 * A lab definition:
 *   id, area, title, tagline, intro
 *   levels: [{ title, concept, learn, why, goal, steps?: [], hint | hints: [], learned }]
 *     learn: "What you'll learn" (shown first); why: "Why it matters" (shown first, repeated on the win panel)
 *   simulation (optional): a sentence telling students the lab is a model, not real-world data
 *   chapters (optional): [{ title, short, from, to, blurb }] groups levels (indexes from..to)
 *   mount(el, levelIndex, api) → optional cleanup function
 *
 * The api passed to mount:
 *   api.win(data, opts)  mark the level complete (data is saved with the event)
 *                        opts.extra: HTML shown at the top of the win panel; opts.title: its heading
 *   api.say(text, kind)  show feedback ("info" | "good" | "warn")
 *   api.log(type, data)  record a lab action (e.g. "lab_test_run")
 *   api.saved()          data from this student's last completion of this level
 *   api.user             current user (or null for guests)
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const app = () => document.getElementById("app");
  const registry = [];
  SE.views = SE.views || {};
  const guestProgress = {}; // labId -> Set of levels, for guests (not saved)

  SE.labs = {
    register(def) { registry.push(def); },
    /* Add "What you'll learn" / "Why it matters" to levels: list is [[learn, why], ...] by index. */
    goals(levels, list) {
      list.forEach((g, i) => { if (levels[i] && g) { levels[i].learn = levels[i].learn || g[0]; levels[i].why = levels[i].why || g[1]; } });
      return levels;
    },
    all: () => registry.slice(),
    byId: (id) => registry.find((l) => l.id === id),
    forArea: (areaId) => registry.filter((l) => l.area === areaId),

    /* Levels this student has completed, from their activity log. */
    progressFor(userOrProf, labId) {
      if (!userOrProf || userOrProf.role === "guest") return guestProgress[labId] || new Set();
      const prof = userOrProf.labLevels ? userOrProf : SE.game.profile(userOrProf.id);
      return prof.labLevels[labId] || new Set();
    }
  };

  let cleanup = null;

  SE.views.lab = function (user, labId, levelParam) {
    if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
    const lab = SE.labs.byId(labId);
    if (!lab) return SE.views.notFound();
    const area = SE.areaById[lab.area];
    const isStudent = user && user.role === "student";
    const done = SE.labs.progressFor(user, lab.id);
    // Default to the first unfinished level
    let idx = levelParam != null && !isNaN(Number(levelParam)) ? Math.max(0, Math.min(lab.levels.length - 1, Number(levelParam) - 1)) : lab.levels.findIndex((_, i) => !done.has(i));
    if (idx < 0) idx = 0;
    const level = lab.levels[idx];
    const activity = STEM_activityForLab(lab.id);
    const chapters = lab.chapters || null;
    const chapterOf = (i) => (chapters ? chapters.findIndex((c) => i >= c.from && i <= c.to) : -1);
    const ch = chapterOf(idx);
    const inView = (i) => !chapters || (i >= chapters[ch].from && i <= chapters[ch].to);
    const firstOpen = (c) => { for (let i = c.from; i <= c.to; i++) if (!done.has(i)) return i; return c.from; };

    app().innerHTML = `
      <section class="page-top page-top--lab">
        <div class="wrap page-top__inner">
          <div class="backbar">
            ${SE.backLink(`#/activities/${area.id}`, area.short)}
            ${activity ? `<a class="crumbs" href="#/activity/${activity.id}">Teacher guide and activity page</a>` : ""}
          </div>
          <div class="lab-head">
            <span class="icon-badge">${icon(area.icon)}</span>
            <div>
              <span class="eyebrow">${esc(area.name)} · Interactive lab</span>
              <h1 tabindex="-1">${esc(lab.title)}</h1>
              <p class="page-top__lede">${esc(lab.tagline)}</p>
            </div>
          </div>
          ${chapters ? `<nav class="lab-chapters" aria-label="Voyages">${chapters.map((c, ci) => {
            const n = c.to - c.from + 1, d = [...done].filter((i) => i >= c.from && i <= c.to).length;
            return `<a href="#/lab/${lab.id}/${firstOpen(c) + 1}" class="lab-chapter ${ci === ch ? "is-current" : ""} ${d === n ? "is-done" : ""}" ${ci === ch ? 'aria-current="true"' : ""}>
              <span class="lab-chapter__t">${esc(c.title)}</span><span class="lab-chapter__n">${d === n ? icon("check") : ""}${d} of ${n} levels</span></a>`;
          }).join("")}</nav>` : ""}
          <ol class="lab-levels" aria-label="${chapters ? `${esc(chapters[ch].title)} levels` : "Levels"}">
            ${lab.levels.map((l, i) => !inView(i) ? "" : `
              <li><a href="#/lab/${lab.id}/${i + 1}" class="${i === idx ? "is-current" : ""} ${done.has(i) ? "is-done" : ""}" ${i === idx ? 'aria-current="step"' : ""}>
                <span class="lab-levels__n">${done.has(i) ? icon("check") : i + 1}</span>
                <span class="lab-levels__t">${esc(l.title)}</span>
              </a></li>`).join("")}
          </ol>
        </div>
      </section>

      <div class="wrap lab-body">
        <section class="lab-brief" aria-labelledby="lvl-title">
          ${chapters ? `<p class="lab-voyage">${esc(chapters[ch].title)} · level ${idx - chapters[ch].from + 1} of ${chapters[ch].to - chapters[ch].from + 1}</p>${idx === chapters[ch].from ? `<p class="lab-voyage__blurb">${esc(chapters[ch].blurb)}</p>` : ""}` : ""}
          <span class="lab-concept">${icon("bulb")}${esc(level.concept)}</span>
          <h2 id="lvl-title">Level ${idx + 1}: ${esc(level.title)}</h2>
          ${level.learn || level.why ? `<div class="lab-objective">
            ${level.learn ? `<p><span class="lab-objective__k">${icon("target")}What you'll learn</span>${esc(level.learn)}</p>` : ""}
            ${level.why ? `<p><span class="lab-objective__k">${icon("bulb")}Why it matters</span>${esc(level.why)}</p>` : ""}
          </div>` : ""}
          ${lab.simulation ? `<p class="lab-sim">${icon("alert")}<span><strong>Simulation.</strong> ${esc(lab.simulation)}</span></p>` : ""}
          <p class="lab-goal"><strong>Your goal:</strong> ${esc(level.goal)}</p>
          ${level.steps ? `<ol class="lab-steps">${level.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
          <div class="lab-brief__tools">
            <button type="button" class="btn btn--ghost btn--small" id="lab-hint-btn" aria-expanded="false" aria-controls="lab-hint">${icon("question")}Need a hint?</button>
            ${done.has(idx) ? `<span class="chip chip--done">${icon("check")}You finished this level</span>` : ""}
          </div>
          ${level.hints ? `<div class="lab-hint" id="lab-hint" hidden>${level.hints.map((h, i) => `<p data-hint="${i}" ${i ? "hidden" : ""}><strong>Hint ${i + 1} of ${level.hints.length}:</strong> ${esc(h)}</p>`).join("")}</div>` : `<p class="lab-hint" id="lab-hint" hidden>${esc(level.hint)}</p>`}
        </section>

        <section class="lab-stage" aria-label="Lab workspace">
          <div id="lab-mount"></div>
          <p class="lab-feedback" id="lab-feedback" role="status" aria-live="polite"></p>
          <div class="lab-win" id="lab-win" hidden></div>
        </section>
      </div>
      ${!user || user.role === "guest" ? `<div class="wrap"><p class="muted lab-guest">${icon("user", 'class="inline-icon"')}Exploring as a guest: your lab progress won't be saved. <a href="#/signin">Sign in</a> to save your progress.</p></div>` : ""}`;

    const hintBtn = document.getElementById("lab-hint-btn");
    hintBtn.addEventListener("click", () => {
      const h = document.getElementById("lab-hint");
      // Levels with a list of hints reveal them one at a time.
      if (level.hints && !h.hidden) {
        const next = h.querySelector("[data-hint][hidden]");
        if (next) {
          next.hidden = false;
          if (!h.querySelector("[data-hint][hidden]")) hintBtn.innerHTML = `${icon("question")}Hide hints`;
          if (isStudent) SE.store.log("lab_hint", { labId: lab.id, level: idx, hint: Number(next.dataset.hint) + 1 });
          return;
        }
      }
      h.hidden = !h.hidden;
      hintBtn.setAttribute("aria-expanded", String(!h.hidden));
      if (level.hints) hintBtn.innerHTML = `${icon("question")}${h.hidden ? "Need a hint?" : level.hints.length > 1 ? "Show another hint" : "Hide hint"}`;
      if (level.hints && h.hidden) h.querySelectorAll("[data-hint]").forEach((p, i) => { p.hidden = i > 0; });
      if (!h.hidden && isStudent) SE.store.log("lab_hint", { labId: lab.id, level: idx });
    });

    let won = false;
    const api = SE.labs.active = {
      user,
      levelIndex: idx,
      say(text, kind = "info") {
        const f = document.getElementById("lab-feedback");
        if (!f) return;
        f.className = `lab-feedback is-${kind}`;
        f.textContent = text;
      },
      log(type, data = {}) { if (isStudent) SE.store.log(type, { labId: lab.id, level: idx, ...data }); },
      saved() {
        if (!isStudent) return null;
        const ev = SE.store.eventsFor(user.id).filter((e) => e.type === "lab_level_completed" && e.data.labId === lab.id && e.data.level === idx).pop();
        return ev ? ev.data.result || null : null;
      },
      win(result = {}, opts = {}) {
        if (won) return;
        won = true;
        const before = isStudent ? SE.game.profile(user.id) : null;
        const first = !done.has(idx);
        if (isStudent) SE.store.log("lab_level_completed", { labId: lab.id, level: idx, result });
        else { guestProgress[lab.id] = guestProgress[lab.id] || new Set(); guestProgress[lab.id].add(idx); }
        const after = isStudent ? SE.game.profile(user.id) : null;
        const newPatches = after ? after.patches.filter((p) => p.earned && !before.patches.find((b) => b.patch.id === p.patch.id).earned) : [];
        const next = idx + 1 < lab.levels.length ? idx + 1 : null;
        const allDone = isStudent ? SE.labs.progressFor(after, lab.id).size === lab.levels.length : guestProgress[lab.id].size === lab.levels.length;
        const panel = document.getElementById("lab-win");
        panel.innerHTML = `
          ${opts.extra || ""}
          <div class="lab-win__head">
            <span class="lab-win__badge">${icon("check")}</span>
            <div>
              <h2 tabindex="-1" id="lab-win-title">${opts.title ? esc(opts.title) : `Level ${idx + 1} complete${allDone && next === null ? ". Lab finished!" : "!"}`}</h2>
            </div>
          </div>
          <div class="lab-win__learned"><span class="eyebrow">What you just learned</span><p>${esc(level.learned)}</p>${level.why ? `<p class="lab-win__why"><strong>Why it matters:</strong> ${esc(level.why)}</p>` : ""}</div>
          ${newPatches.length ? `<div class="patch-row">${newPatches.map((p) => `<figure class="patch-tile patch-tile--new">${SE.patchArt(p.patch, true, 76)}<figcaption><strong>${esc(p.patch.name)}</strong></figcaption></figure>`).join("")}</div>` : ""}
          ${isStudent ? SE.base.unlockStrip(SE.base.newUnlocks(before, after)) : ""}
          <div class="lab-win__actions">
            ${next !== null ? `<a class="btn btn--launch" href="#/lab/${lab.id}/${next + 1}">${icon("arrowRight")}${chapters && chapterOf(next) !== ch ? `Start ${esc(chapters[chapterOf(next)].title)}` : `Next level: ${esc(lab.levels[next].title)}`}</a>` : ""}
            <button type="button" class="btn btn--ghost" id="lab-replay">${icon("refresh")}Try this level again</button>
            ${next === null && activity ? `<a class="btn btn--primary" href="#/activity/${activity.id}#s-debrief">${icon("flag")}Finish with the activity debrief</a>` : ""}
          </div>`;
        panel.hidden = false;
        document.getElementById("lab-replay").addEventListener("click", () => SE.route(true));
        panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
        document.getElementById("lab-win-title").focus({ preventScroll: true });
        // Refresh the level list ticks without re-rendering the workspace
        const link = app().querySelector(`.lab-levels a[href="#/lab/${lab.id}/${idx + 1}"]`);
        if (link) { link.classList.add("is-done"); link.querySelector(".lab-levels__n").innerHTML = icon("check"); }
      }
    };

    if (isStudent) api.log("lab_opened");
    const mountEl = document.getElementById("lab-mount");
    mountEl.className = `lab-mount lab-mount--${lab.id}`;
    const c = lab.mount(mountEl, idx, api);
    if (typeof c === "function") cleanup = c;
  };

  /* Find the library activity that points at a lab (for its teacher guide). */
  function STEM_activityForLab(labId) {
    return window.STEM.activities.find((a) => a.launch && a.launch.status === "lab" && a.launch.labId === labId);
  }
  SE.activityForLab = STEM_activityForLab;

  /* Clean up running animations when leaving a lab page. */
  window.addEventListener("hashchange", () => {
    if (!location.hash.startsWith("#/lab/") && cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; }
  });
  SE.labs._stop = () => { if (cleanup) { try { cleanup(); } catch (e) { /* ignore */ } cleanup = null; } };

  /* Small helper used by several labs: a seeded shuffle. */
  SE.shuffle = (arr, seed) => {
    const r = SE.rng(seed);
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
})();
