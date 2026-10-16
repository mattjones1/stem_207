/*
 * STEM Explorers — library views: dashboard, exploration areas, activity pages, coding pathway.
 * These views adapt to who is signed in: guests browse, students earn progress,
 * educators see how their class is doing.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const { areas, activities, levels, gradeBands, durations, formats, equipment, pathway } = STEM;
  const { icon, esc, plural } = SE;
  const app = () => document.getElementById("app");
  SE.views = SE.views || {};

  /* ───────── Shared pieces ───────── */
  function accessChips(a, prof) {
    const chips = [];
    if (prof && prof.completedIds.has(a.id)) {
      chips.push(`<span class="chip chip--done">${icon("check")}Completed</span>`);
    } else if (prof) {
      chips.push(`<span class="chip chip--xp">+${SE.game.baseXp(a)} XP</span>`);
    }
    if (a.launch.status === "lab") chips.push(`<span class="chip chip--lab">${icon("flask")}Interactive lab</span>`);
    else if (a.launch.status === "ready") chips.push(`<span class="chip">${icon("external")}Opens ${esc(a.launch.provider)}</span>`);
    else if (a.launch.status === "coming-soon") chips.push(`<span class="chip chip--soon">${icon("clock")}Resource coming soon</span>`);
    else chips.push(`<span class="chip chip--ok">${icon("check")}Hands-on, no link needed</span>`);
    if (a.access.account === "required") chips.push(`<span class="chip chip--warn">${icon("key")}Account required</span>`);
    if (a.access.account === "optional") chips.push(`<span class="chip">${icon("key")}Account optional</span>`);
    if (a.access.cost === "paid") chips.push(`<span class="chip chip--warn">${icon("coin")}Paid resource</span>`);
    if (a.equipment.includes("vr")) chips.push(`<span class="chip chip--warn">${icon("headset")}VR headset optional</span>`);
    if (a.access.supervision) chips.push(`<span class="chip chip--warn">${icon("shield")}Teacher supervision</span>`);
    return chips.join("");
  }

  function activityCard(a, prof) {
    const area = SE.areaById[a.area];
    const done = prof && prof.completedIds.has(a.id);
    return `
      <article class="card ${done ? "card--done" : ""}">
        <div class="card__area"><span class="icon-badge">${icon(area.icon)}</span>${esc(area.short)}</div>
        <h3><a href="#/activity/${a.id}">${esc(a.title)}</a></h3>
        <p class="card__summary">${esc(a.summary)}</p>
        <div class="meta">
          <span class="meta__item"><span class="visually-hidden">Experience level: </span>${SE.levelMarkup(a.level)}</span>
          <span class="meta__item">${icon("grade")}${SE.gradesText(a.grades)}</span>
          <span class="meta__item">${icon("clock")}${a.duration} min</span>
          <span class="meta__item">${icon("users")}${esc(formats[a.format].name)}</span>
          <span class="meta__item meta__item--wide">${icon("tools")}<span><span class="visually-hidden">Equipment: </span>${esc(SE.equipmentText(a.equipment))}</span></span>
        </div>
        <div class="card__foot">${accessChips(a, prof)}</div>
      </article>`;
  }
  SE.activityCard = activityCard;

  function factsList(a) {
    return `
      <dl class="facts">
        <div><dt>Topic</dt><dd>${esc(SE.areaById[a.area].name)}</dd></div>
        <div><dt>Level</dt><dd>${SE.levelMarkup(a.level)}</dd></div>
        <div><dt>Grades</dt><dd>${SE.gradesText(a.grades)}</dd></div>
        <div><dt>Time</dt><dd>About ${a.duration} minutes</dd></div>
        <div><dt>Format</dt><dd>${esc(formats[a.format].name)}</dd></div>
        <div><dt>Equipment</dt><dd>${esc(SE.equipmentText(a.equipment))}</dd></div>
      </dl>`;
  }

  const sortActivities = (list) =>
    list.slice().sort((x, y) =>
      areas.findIndex((a) => a.id === x.area) - areas.findIndex((a) => a.id === y.area) ||
      (x.pathwayStage || 99) - (y.pathwayStage || 99) ||
      SE.levelOrder[x.level] - SE.levelOrder[y.level] ||
      x.duration - y.duration);
  SE.sortActivities = sortActivities;

  const backLink = (href = "#/", label = "Dashboard") => `<a class="back-link" href="${href}">${icon("arrowLeft")}${label}</a>`;
  SE.backLink = backLink;

  /* ───────── Library state ───────── */
  const defaultFilters = () => ({ q: "", area: "", level: "", grade: "", time: "", equip: "", status: "" });
  let filters = defaultFilters();
  let filtersFor = null; // the user the filters were set up for

  function matches(a, f, prof) {
    if (f.area && a.area !== f.area) return false;
    if (f.level && a.level !== f.level) return false;
    if (f.grade && !a.grades.includes(f.grade)) return false;
    if (f.time && a.duration > durations.find((d) => d.id === f.time).max) return false;
    if (f.equip && !a.equipment.includes(f.equip)) return false;
    if (f.status && prof) {
      const done = prof.completedIds.has(a.id);
      if (f.status === "todo" && done) return false;
      if (f.status === "done" && !done) return false;
    }
    if (f.q) {
      const hay = [a.title, a.summary, a.mission, SE.areaById[a.area].name, ...(a.keywords || [])].join(" ").toLowerCase();
      if (!f.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
    }
    return true;
  }

  function selectField(id, label, key, anyLabel, options) {
    return `
      <div class="field">
        <label for="${id}">${label}</label>
        <select id="${id}" data-key="${key}" class="${filters[key] ? "is-set" : ""}">
          <option value="">${anyLabel}</option>
          ${options.map(([v, t]) => `<option value="${esc(v)}" ${filters[key] === v ? "selected" : ""}>${esc(t)}</option>`).join("")}
        </select>
      </div>`;
  }

  function librarySection(user, prof) {
    return `
      <section class="section wrap" id="library" aria-labelledby="library-title">
        <div class="section__head">
          <div>
            <span class="eyebrow">Activity library</span>
            <h2 id="library-title" tabindex="-1">Find your next mission</h2>
          </div>
          <p>Search by name or idea, or narrow by topic, level, grade, time, and equipment.</p>
        </div>
        <div class="library-panel">
          <div class="search">
            ${icon("search")}
            <label for="f-q" class="visually-hidden">Search activities</label>
            <input id="f-q" type="search" placeholder="Search activities, like maze, loops, or bridge" autocomplete="off" value="${esc(filters.q)}">
          </div>
          <div class="filters ${prof ? "filters--six" : ""}">
            ${selectField("f-area", "Topic", "area", "All topics", areas.map((a) => [a.id, a.name]))}
            ${selectField("f-level", "Experience", "level", "Any level", levels.map((l) => [l.id, l.name]))}
            ${selectField("f-grade", "Grade band", "grade", "Any grade", gradeBands.map((g) => [g.id, g.name]))}
            ${selectField("f-time", "Time", "time", "Any length", durations.map((d) => [d.id, d.name]))}
            ${selectField("f-equip", "Equipment", "equip", "Any equipment",
              Object.entries(equipment).filter(([, v]) => v.filter).map(([k, v]) => [k, v.name]))}
            ${prof ? selectField("f-status", "My progress", "status", "All missions", [["todo", "Not done yet"], ["done", "Completed"]]) : ""}
          </div>
          <div class="results-bar">
            <p class="results-bar__count" id="results-count" aria-live="polite"></p>
            <button type="button" class="btn btn--ghost btn--small" id="reset-filters">Reset filters</button>
          </div>
        </div>
        <div id="results"></div>
      </section>`;
  }

  function bindLibrary(prof) {
    const q = document.getElementById("f-q");
    q.addEventListener("input", () => { filters.q = q.value.trim(); renderResults(prof); });
    app().querySelectorAll(".filters select").forEach((sel) => {
      sel.addEventListener("change", () => {
        filters[sel.dataset.key] = sel.value;
        sel.classList.toggle("is-set", !!sel.value);
        if (sel.dataset.key === "time") syncTimeButtons();
        renderResults(prof);
      });
    });
    document.getElementById("reset-filters").addEventListener("click", () => resetFilters(prof));
    app().querySelectorAll(".time-picker button").forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.time = filters.time === btn.dataset.time ? "" : btn.dataset.time;
        const sel = document.getElementById("f-time");
        sel.value = filters.time;
        sel.classList.toggle("is-set", !!filters.time);
        syncTimeButtons();
        renderResults(prof);
        if (filters.time) document.getElementById("library").scrollIntoView({ block: "start" });
      });
    });
    renderResults(prof);
  }

  function syncTimeButtons() {
    app().querySelectorAll(".time-picker button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.time === filters.time)));
  }

  function resetFilters(prof) {
    filters = defaultFilters();
    document.getElementById("f-q").value = "";
    app().querySelectorAll(".filters select").forEach((s) => { s.value = ""; s.classList.remove("is-set"); });
    syncTimeButtons();
    renderResults(prof);
    document.getElementById("f-q").focus();
  }

  function renderResults(prof) {
    const list = sortActivities(activities.filter((a) => matches(a, filters, prof)));
    const names = [];
    if (filters.q) names.push(`“${filters.q}”`);
    if (filters.area) names.push(SE.areaById[filters.area].name);
    if (filters.level) names.push(SE.levelById[filters.level].name);
    if (filters.grade) names.push(SE.gradeById[filters.grade].name);
    if (filters.time) names.push(durations.find((d) => d.id === filters.time).name);
    if (filters.equip) names.push(equipment[filters.equip].name);
    if (filters.status) names.push(filters.status === "done" ? "Completed" : "Not done yet");

    document.getElementById("reset-filters").hidden = names.length === 0;
    document.getElementById("results-count").innerHTML = names.length
      ? `${plural(list.length, "activity", "activities")} <span>matching ${esc(names.join(" · "))}</span>`
      : `All ${activities.length} activities`;

    const results = document.getElementById("results");
    if (!list.length) {
      results.innerHTML = `
        <div class="empty" role="status">
          ${icon("mountain")}
          <h3>No activities match all of those filters</h3>
          <p>Try removing one filter, choosing a longer time, or searching for a broader word like “code” or “build.” You can also start fresh.</p>
          <button type="button" class="btn btn--primary" id="empty-reset">Reset filters</button>
        </div>`;
      document.getElementById("empty-reset").addEventListener("click", () => resetFilters(prof));
      return;
    }
    results.innerHTML = `<div class="cards">${list.map((a) => activityCard(a, prof)).join("")}</div>`;
  }

  /* ───────── Dashboard ───────── */
  function radarSvg() {
    const cx = 170, cy = 170;
    const blips = areas.map((a, i) => {
      const angle = (-90 + i * 60) * (Math.PI / 180);
      const r = [118, 82, 132, 96, 124, 70][i];
      const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
      const lx = cx + 158 * Math.cos(angle), ly = cy + 158 * Math.sin(angle);
      const anchor = Math.abs(Math.cos(angle)) < 0.2 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";
      return `<circle class="blip ${i === 0 ? "blip--hot" : ""}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 0 ? 7 : 5}"/>
              <text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="${anchor}">${esc(a.short)}</text>`;
    }).join("");
    return `
      <svg viewBox="-40 -10 420 360" role="img" aria-label="Mission scope showing the six exploration areas">
        <defs><linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7fd8d3" stop-opacity="0"/><stop offset="1" stop-color="#7fd8d3" stop-opacity=".28"/></linearGradient></defs>
        <circle class="ring" cx="170" cy="170" r="145"/><circle class="ring" cx="170" cy="170" r="105"/><circle class="ring" cx="170" cy="170" r="62"/>
        <line class="axis" x1="25" y1="170" x2="315" y2="170"/><line class="axis" x1="170" y1="25" x2="170" y2="315"/>
        <path class="sweep" d="M170 170 L315 170 A145 145 0 0 0 272.5 67.5 Z"/>
        <circle cx="170" cy="170" r="5" fill="#ec7a2f"/>${blips}
      </svg>`;
  }

  const timePicker = () => `
    <div class="time-picker" role="group" aria-labelledby="time-picker-label">
      <span class="time-picker__label" id="time-picker-label">How much time do you have?</span>
      ${durations.map((d) => `<button type="button" data-time="${d.id}" aria-pressed="${filters.time === d.id}">${icon("clock")}${d.max} min</button>`).join("")}
    </div>`;

  function areasSection(prof, eyebrow = "Explore the lab") {
    return `
      <section class="section wrap" aria-labelledby="explore-title">
        <div class="section__head">
          <div><span class="eyebrow">${eyebrow}</span><h2 id="explore-title">Choose your exploration</h2></div>
          <p>Six areas to explore. Each has missions for different grades, time slots, and equipment.</p>
        </div>
        <div class="areas">
          ${areas.map((a) => {
            const total = activities.filter((x) => x.area === a.id).length;
            const done = prof ? (prof.counts.areas[a.id] || 0) : null;
            return `
            <a class="area-card" href="#/area/${a.id}">
              <div class="area-card__top"><span class="icon-badge">${icon(a.icon)}</span><h3>${esc(a.name)}</h3></div>
              <p>${esc(a.tagline)}</p>
              ${SE.labs && SE.labs.forArea(a.id).length ? `<span class="chip chip--lab">${icon("flask")}${SE.labs.forArea(a.id).length === 1 ? "Interactive lab" : `${SE.labs.forArea(a.id).length} interactive labs`}</span>` : ""}
              ${prof ? `<div class="mini-meter" aria-hidden="true"><span style="width:${(done / total) * 100}%"></span></div>` : ""}
              <span class="area-card__foot">${prof ? `${done} of ${total} missions complete` : `Explore the lab · ${plural(total, "activity", "activities")}`} ${icon("arrowRight")}</span>
            </a>`;
          }).join("")}
        </div>
      </section>`;
  }

  function pathwayStrip(prof) {
    return `
      <section class="section wrap" aria-labelledby="pathway-title">
        <div class="section__head">
          <div><span class="eyebrow">Coding pathway</span><h2 id="pathway-title">Seven stages, start where you're ready</h2></div>
          <a class="btn btn--ghost btn--small" href="#/pathway">See the full pathway ${icon("arrowRight")}</a>
        </div>
        <ol class="track">
          ${pathway.map((s) => {
            const st = prof && prof.stages[s.stage];
            const tag = st ? (st.status === "cleared" ? `<span class="track__status is-cleared">${icon("check")}Cleared</span>` : `<span class="track__status is-claimed">${icon("clock")}Teacher check</span>`) : "";
            return `<li><a href="#/pathway#stage-${s.stage}" class="${st && st.status === "cleared" ? "is-cleared" : ""}">
              <span class="track__num">Stage ${s.stage}</span>
              <span class="track__title">${esc(s.title)}</span>
              <span class="track__concepts">${esc(s.concepts)}</span>${tag}
            </a></li>`;
          }).join("")}
        </ol>
      </section>`;
  }

  function featuredSection() {
    const featured = activities.find((a) => a.featured) || activities[0];
    const fArea = SE.areaById[featured.area];
    return `
      <section class="section wrap" aria-labelledby="featured-title">
        <div class="section__head"><div><span class="eyebrow">Featured classroom mission</span><h2 id="featured-title" class="visually-hidden">Featured classroom mission</h2></div></div>
        <article class="featured">
          <div class="featured__body">
            <div class="card__area"><span class="icon-badge">${icon(fArea.icon)}</span>${esc(fArea.name)}</div>
            <h3>${esc(featured.title)}</h3>
            <p class="featured__mission">${esc(featured.mission)}</p>
            <div class="card__foot">${accessChips(featured)}</div>
            <div class="featured__actions">
              <a class="btn btn--primary" href="#/activity/${featured.id}">${icon("rocket")}See the mission</a>
            </div>
          </div>
          <div class="featured__side">${factsList(featured)}</div>
        </article>
      </section>`;
  }

  SE.views.dashboard = function (user) {
    const isStudent = user && user.role === "student";
    if (filtersFor !== (user && user.id)) {
      filters = defaultFilters();
      if (isStudent && user.gradeBand) filters.grade = user.gradeBand;
      filtersFor = user && user.id;
    }

    if (isStudent) {
      const prof = SE.game.profile(user.id);
      app().innerHTML = SE.views.expeditionHome(user, prof) + labsStrip(user, null, "Your labs") + areasSection(prof) + pathwayStrip(prof) + librarySection(user, prof);
      SE.views.bindExpeditionHome && SE.views.bindExpeditionHome(user, prof);
      bindLibrary(prof);
      return;
    }

    const guestBanner = user && user.role === "guest" ? `
      <div class="wrap"><div class="guest-banner">
        ${icon("user")}<p><strong>You're exploring as a guest.</strong> Missions work, but nothing is saved. Sign in to earn XP, collect patches, and track your expedition.</p>
        <a class="btn btn--primary btn--small" href="#/signin">Sign in</a>
      </div></div>` : "";

    app().innerHTML = `
      <section class="hero" aria-labelledby="hero-title">
        <div class="wrap hero__inner">
          <div>
            <span class="eyebrow">Mission control</span>
            <h1 id="hero-title" tabindex="-1">Big ideas start with curious minds.</h1>
            <p class="hero__lede">Choose your next adventure. Pick an area to explore, read your mission, and launch the activity.</p>
            ${timePicker()}
          </div>
          <div class="radar">${radarSvg()}</div>
        </div>
      </section>
      ${guestBanner}
      ${user && user.role === "educator" ? SE.views.educatorStrip(user) : ""}
      ${areasSection(null)}
      ${labsStrip(user, null, "Interactive labs")}
      ${featuredSection()}
      ${pathwayStrip(null)}
      ${librarySection(user, null)}`;
    bindLibrary(null);
  };
  SE.views.timePicker = timePicker;

  /* ───────── Area ───────── */
  SE.views.area = function (user, id) {
    const area = SE.areaById[id];
    if (!area) return SE.views.notFound();
    const prof = user && user.role === "student" ? SE.game.profile(user.id) : null;
    const list = sortActivities(activities.filter((a) => a.area === id));
    const done = prof ? list.filter((a) => prof.completedIds.has(a.id)).length : 0;

    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${backLink()}</div>
          <div class="page-top__head">
            <span class="icon-badge">${icon(area.icon)}</span>
            <div><span class="eyebrow">Exploration area</span><h1 tabindex="-1">${esc(area.name)}</h1></div>
          </div>
          <p class="page-top__lede">${esc(area.description)}</p>
          <ul class="topic-list" aria-label="Topics in this area">${area.topics.map((t) => `<li class="chip">${esc(t)}</li>`).join("")}</ul>
          ${prof ? `<p class="page-top__progress"><strong>${done} of ${list.length}</strong> missions complete in this area</p>` : ""}
        </div>
      </section>
      ${labsStrip(user, id)}
      ${id === "coding" ? `
        <section class="wrap section">
          <div class="notice notice--row">
            <p><strong>New to coding, or ready for the next step?</strong> The coding pathway shows seven stages with an “I can” check for each one.</p>
            <a class="btn btn--primary btn--small" href="#/pathway">Open the coding pathway ${icon("arrowRight")}</a>
          </div>
        </section>` : ""}
      <section class="wrap section" aria-labelledby="area-acts">
        <div class="section__head">
          <div><span class="eyebrow">Choose your next adventure</span><h2 id="area-acts">${plural(list.length, "mission", "missions")}</h2></div>
        </div>
        <div class="cards">${list.map((a) => activityCard(a, prof)).join("")}</div>
      </section>`;
  };

  /* Interactive labs for an area (or all areas), with this user's progress */
  function labsStrip(user, areaId, title) {
    const labs = areaId ? SE.labs.forArea(areaId) : SE.labs.all();
    if (!labs.length) return "";
    return `
      <section class="wrap section" aria-labelledby="labs-${areaId || "all"}">
        <div class="section__head">
          <div><span class="eyebrow">Interactive ${labs.length === 1 ? "lab" : "labs"}</span><h2 id="labs-${areaId || "all"}">${title || "Explore the lab"}</h2></div>
          <p>Hands-on, leveled practice that runs right here. Each level teaches one idea, then checks that you've got it.</p>
        </div>
        <div class="lab-cards ${areaId ? "lab-cards--area" : ""}">${labs.map((lab) => labCard(user, lab)).join("")}</div>
      </section>`;
  }
  function labCard(user, lab) {
    const area = SE.areaById[lab.area];
    const done = SE.labs.progressFor(user, lab.id);
    const pct = (done.size / lab.levels.length) * 100;
    const next = lab.levels.findIndex((_, i) => !done.has(i));
    return `
      <a class="lab-card" href="#/lab/${lab.id}">
        <span class="lab-card__top"><span class="icon-badge">${icon(area.icon)}</span><span class="lab-card__area">${esc(area.short)}</span></span>
        <strong>${esc(lab.title)}</strong>
        <span class="lab-card__tag">${esc(lab.tagline)}</span>
        <span class="lab-card__levels">${lab.levels.map((l, i) => `<i class="${done.has(i) ? "on" : ""}" title="${esc(l.title)}"></i>`).join("")}</span>
        <span class="lab-card__foot"><span>${done.size ? `${done.size} of ${lab.levels.length} levels` : `${lab.levels.length} levels`}</span><span class="lab-card__go">${done.size === lab.levels.length ? "Replay" : done.size ? `Continue: level ${next + 1}` : "Start"} ${icon("arrowRight")}</span></span>
        <span class="visually-hidden">${Math.round(pct)}% complete</span>
      </a>`;
  }
  SE.labsStrip = labsStrip;

  /* ───────── Activity ───────── */
  function launchPanel(a, id, user) {
    if (a.launch.status === "lab") {
      const lab = SE.labs.byId(a.launch.labId);
      const done = lab ? SE.labs.progressFor(user, lab.id) : new Set();
      return `
        <section class="launch-panel launch-panel--lab" aria-labelledby="${id}">
          <h2 id="${id}">Launch activity</h2>
          <p class="launch-panel__note">${esc(a.launch.note)}</p>
          ${lab ? `<div class="lab-progress"><span>${done.size} of ${lab.levels.length} levels complete</span><span class="meter"><span style="width:${(done.size / lab.levels.length) * 100}%"></span></span></div>` : ""}
          <a class="btn btn--launch" href="#/lab/${esc(a.launch.labId)}">${icon("rocket")}${done.size ? "Continue the lab" : esc(a.launch.label)}</a>
          <p class="launch-panel__small">The lab opens right here in STEM Explorers. Use the Dashboard button to come back anytime.</p>
        </section>`;
    }
    if (a.launch.status === "ready") {
      return `
        <section class="launch-panel" aria-labelledby="${id}">
          <h2 id="${id}">Launch activity</h2>
          <p class="launch-panel__note">${esc(a.launch.note)}</p>
          <a class="btn btn--launch" data-launch href="${esc(a.launch.url)}" target="_blank" rel="noopener noreferrer">
            ${icon("rocket")}${esc(a.launch.label)}<span class="visually-hidden"> (opens in a new tab)</span>${icon("external")}
          </a>
          <p class="launch-panel__small">Opens ${esc(a.launch.provider)} in a new tab, so this page stays open. ${a.access.accountNote ? esc(a.access.accountNote) : ""}</p>
        </section>`;
    }
    if (a.launch.status === "coming-soon") {
      return `
        <section class="launch-panel launch-panel--soon" aria-labelledby="${id}">
          <h2 id="${id}">Resource coming soon</h2>
          <p>${esc(a.launch.note)}</p>
          <p class="launch-panel__small">No link is shown until the program chooses and checks a resource.</p>
        </section>`;
    }
    return `
      <section class="launch-panel launch-panel--handson" aria-labelledby="${id}">
        <h2 id="${id}">Hands-on activity</h2>
        <p>Everything you need is on this page. No website or account is needed. Gather the materials above and follow the steps.</p>
      </section>`;
  }

  function quickLaunch(a) {
    if (a.launch.status === "lab")
      return `<a class="btn btn--launch" href="#/lab/${esc(a.launch.labId)}">${icon("rocket")}Open the lab</a>`;
    if (a.launch.status === "ready")
      return `<a class="btn btn--launch" data-launch href="${esc(a.launch.url)}" target="_blank" rel="noopener noreferrer">${icon("rocket")}Launch activity<span class="visually-hidden">: ${esc(a.launch.label)} (opens in a new tab)</span></a>`;
    if (a.launch.status === "coming-soon")
      return `<a class="btn btn--ghost" href="#s-launch" data-jump="s-launch">${icon("clock")}Resource coming soon</a>`;
    return `<a class="btn btn--ghost" href="#s-steps" data-jump="s-steps">${icon("list")}Start with step 1</a>`;
  }

  function requirementsList(a) {
    const ok = (t, s) => `<li class="ok">${icon("check")}<span><strong>${esc(t)}</strong>${s ? `<small>${esc(s)}</small>` : ""}</span></li>`;
    const warn = (t, s) => `<li class="warn">${icon("alert")}<span><strong>${esc(t)}</strong>${s ? `<small>${esc(s)}</small>` : ""}</span></li>`;
    const rows = [];
    if (a.access.account === "none") rows.push(ok("No account needed", a.access.accountNote));
    else if (a.access.account === "optional") rows.push(ok("Account optional", a.access.accountNote));
    else rows.push(warn("Account required", a.access.accountNote));
    rows.push(a.access.cost === "paid" ? warn("Paid resource", "Check your program's license before class.") : ok("Free to use"));
    rows.push(a.access.hardware && a.access.hardware.length ? warn("Hardware", a.access.hardware.join(". ") + ".") : ok("No special hardware"));
    rows.push(a.access.supervision
      ? warn("Teacher supervision", a.area === "ai" ? "Run this as a teacher-guided activity. Students don't enter personal information." : "An adult should guide or monitor this activity.")
      : ok("Students can work with light guidance"));
    rows.push(ok(formats[a.format].name, formats[a.format].hint));
    return `<ul class="reqs">${rows.join("")}</ul>`;
  }

  SE.views.activity = function (user, id) {
    const a = SE.activityById[id];
    if (!a) return SE.views.notFound();
    const area = SE.areaById[a.area];
    const stage = a.pathwayStage ? pathway.find((s) => s.stage === a.pathwayStage) : null;
    const isStudent = user && user.role === "student";
    const prof = isStudent ? SE.game.profile(user.id) : null;
    const related = sortActivities(activities.filter((x) => x.area === a.area && x.id !== a.id)).slice(0, 3);
    const checked = prof ? (prof.steps[a.id] || new Set()) : new Set();
    const lastCompletion = prof ? prof.completions.filter((c) => c.activity.id === a.id).pop() : null;

    const stepsHtml = isStudent
      ? `<ol class="steps steps--check">${a.steps.map((x, i) => `
          <li><label class="step-check">
            <input type="checkbox" data-step="${i}" ${checked.has(i) ? "checked" : ""}>
            <span class="step-check__box" aria-hidden="true">${icon("check")}</span>
            <span class="step-check__num" aria-hidden="true">${i + 1}</span>
            <span class="step-check__text"><span class="visually-hidden">Step ${i + 1}: </span>${esc(x)}</span>
          </label></li>`).join("")}</ol>
         <p class="steps-progress" id="steps-progress" aria-live="polite"></p>`
      : `<ol class="steps">${a.steps.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ol>`;

    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">
            ${backLink()}
            <nav class="crumbs" aria-label="Breadcrumb"><a href="#/area/${area.id}">${esc(area.name)}</a> / <span aria-current="page">${esc(a.title)}</span></nav>
          </div>
          <div class="page-top__head">
            <span class="icon-badge">${icon(area.icon)}</span>
            <div>
              <span class="eyebrow">${esc(area.name)}${stage ? ` · Pathway stage ${stage.stage}` : ""}</span>
              <h1 tabindex="-1">${esc(a.title)}</h1>
            </div>
          </div>
          <p class="page-top__lede">${esc(a.summary)}</p>
          <div class="page-top__tags">
            ${a.source === "original" ? `<span class="label-original">${icon("flag")}Original STEM Explorers sample lesson</span>` : ""}
            ${isStudent ? (lastCompletion
              ? `<span class="chip chip--done-dark">${icon("check")}Completed ${SE.dateShort(lastCompletion.event.at)}</span>`
              : `<span class="chip chip--xp-dark">Worth ${SE.game.baseXp(a)} XP</span>`) : ""}
          </div>
        </div>
      </section>

      <div class="wrap activity-layout">
        <div class="activity-main">
          <section class="block block--mission" aria-labelledby="s-mission">
            <h2 id="s-mission">${icon("target")}Your mission</h2>
            <p>${esc(a.mission)}</p>
          </section>
          <section class="block" aria-labelledby="s-learn">
            <h2 id="s-learn">${icon("bulb")}What you’ll learn</h2>
            <ul class="bullets objectives">${a.learn.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
          </section>
          <section class="block" aria-labelledby="s-before">
            <h2 id="s-before">${icon("box")}Before you begin</h2>
            <div class="prep">
              <div><h3>Materials</h3><ul class="bullets">${a.before.materials.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul></div>
              <div><h3>Setup</h3><ul class="bullets">${a.before.setup.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul></div>
              <div class="prep__full"><h3>Prerequisites</h3><p>${esc(a.before.prerequisites)}</p></div>
            </div>
          </section>
          ${a.vr ? `
          <section class="block" aria-labelledby="s-vr">
            <h2 id="s-vr">${icon("headset")}VR setup for teachers</h2>
            <ul class="bullets">${a.vr.setup.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
            <h3>Taking part without a headset</h3><p>${esc(a.vr.nonHeadset)}</p>
          </section>` : ""}
          <section class="block" aria-labelledby="s-steps">
            <h2 id="s-steps">${icon("list")}Your steps</h2>
            ${isStudent ? `<p class="block__hint">Check off each step as you finish it.</p>` : ""}
            ${stepsHtml}
          </section>
          ${launchPanel(a, "s-launch", user)}
          ${isStudent ? SE.views.debrief(user, a, prof) : `
          <section class="block block--reflect" aria-labelledby="s-reflect">
            <h2 id="s-reflect">${icon("question")}Think about it</h2><p>${esc(a.reflect)}</p>
          </section>
          <section class="block block--extend" aria-labelledby="s-extend">
            <h2 id="s-extend">${icon("rocket")}Take it further</h2><p>${esc(a.extend)}</p>
          </section>`}
          ${isStudent ? "" : `
          <details class="block teacher-notes" open>
            <summary><h2>${icon("clipboard")}Teacher notes</h2><span class="toggle-hint" aria-hidden="true"></span></summary>
            <div class="teacher-notes__body">
              <ul class="bullets">${a.teacherNotes.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
              ${stage ? `<p><strong>Pathway check (Stage ${stage.stage}):</strong> “${esc(stage.iCan)}” <a href="#/pathway#stage-${stage.stage}">See the stage</a></p>` : ""}
            </div>
          </details>`}
        </div>

        <aside class="aside" aria-label="Activity at a glance">
          <div class="block launch-mini">
            <h2>At a glance</h2>
            ${factsList(a)}
            ${quickLaunch(a)}
          </div>
          ${user && user.role === "educator" ? SE.views.activityClassBox(user, a) : ""}
          <div class="block"><h2>Before you launch</h2>${requirementsList(a)}</div>
        </aside>
      </div>

      ${related.length ? `
      <section class="wrap section" aria-labelledby="related-title">
        <div class="section__head">
          <div><span class="eyebrow">More in ${esc(area.short)}</span><h2 id="related-title">Explore the lab</h2></div>
          <a class="btn btn--ghost btn--small" href="#/">${icon("arrowLeft")}Back to dashboard</a>
        </div>
        <div class="cards">${related.map((r) => activityCard(r, prof)).join("")}</div>
      </section>` : ""}`;

    // Student tracking
    if (isStudent) {
      SE.logOpen(user, a.id);
      const updateProgress = () => {
        const n = app().querySelectorAll("[data-step]:checked").length;
        document.getElementById("steps-progress").textContent = `${n} of ${a.steps.length} steps done${n === a.steps.length ? ". Nice work! Finish your debrief below." : ""}`;
      };
      app().querySelectorAll("[data-step]").forEach((cb) => {
        cb.addEventListener("change", () => {
          SE.store.log("step_checked", { activityId: a.id, step: Number(cb.dataset.step), checked: cb.checked });
          updateProgress();
        });
      });
      updateProgress();
      SE.views.bindDebrief(user, a);
    }
    app().querySelectorAll("[data-launch]").forEach((l) => l.addEventListener("click", () => {
      if (isStudent) SE.store.log("launched", { activityId: a.id });
    }));
  };

  /* ───────── Pathway ───────── */
  const ROVER_FOR_STAGE = { 1: [1, 2, 3], 2: [7], 3: [4, 5, 6], 4: [8, 9], 5: [10], 6: [11], 7: [12] };
  SE.views.pathway = function (user) {
    const isStudent = user && user.role === "student";
    const prof = isStudent ? SE.game.profile(user.id) : null;
    let nextStage = 1;
    if (prof) while (prof.stages[nextStage] && prof.stages[nextStage].status === "cleared") nextStage++;
    const smallIcon = (n) => icon(n, 'class="inline-icon"');

    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${backLink()}</div>
          <div class="page-top__head">
            <span class="icon-badge">${icon("code")}</span>
            <div><span class="eyebrow">Coding & Computer Science</span><h1 tabindex="-1">The coding pathway</h1></div>
          </div>
          <p class="page-top__lede">Seven stages organized by readiness, not by grade. Suggested grades help you choose a starting point. Move on when you can show the “I can” statement, at your own pace.</p>
          ${prof ? `<p class="page-top__progress"><strong>${prof.counts.stagesCleared} of 7</strong> stages cleared · each cleared stage is worth ${STEM.progression.xp.stageCleared} XP</p>` : ""}
        </div>
      </section>
      <div class="wrap pathway-intro">
        <div class="block"><h2>${smallIcon("flag")}Pick a starting stage</h2><p>Read the prerequisites. If you can already do them, start there. A quick review of an earlier stage never hurts.</p></div>
        <div class="block"><h2>${smallIcon("bug")}Debug at every stage</h2><p>Every stage has its own debugging habit. Finding and fixing mistakes is part of the learning, not a detour.</p></div>
        <div class="block"><h2>${smallIcon("check")}Check with “I can”</h2><p>${isStudent ? "When you can do the “I can” statement, tell your teacher with the button. They'll check it with you." : "Each “I can” statement is something you can watch a student do. When they can, they're ready for the next stage."}</p></div>
      </div>
      <ol class="wrap stages">
        ${pathway.map((s) => {
          const st = prof && prof.stages[s.stage];
          const status = !prof ? "" : st && st.status === "cleared"
            ? `<span class="stage-status is-cleared">${icon("check")}Cleared</span>`
            : st ? `<span class="stage-status is-claimed">${icon("clock")}Waiting for your teacher to check</span>`
              : s.stage === nextStage ? `<span class="stage-status is-next">${icon("flag")}Your next stage</span>` : "";
          const claimBtn = prof && !st ? `<button type="button" class="btn btn--primary btn--small" data-claim="${s.stage}">${icon("check")}I can do this</button>` : "";
          return `
          <li class="stage ${st && st.status === "cleared" ? "stage--cleared" : ""}" id="stage-${s.stage}">
            <div class="stage__node" aria-hidden="true"><div><small>Stage</small><b>${s.stage}</b></div></div>
            <article class="block stage__card" aria-labelledby="stage-title-${s.stage}">
              <div class="stage__head">
                <div>
                  <h2 id="stage-title-${s.stage}"><span class="visually-hidden">Stage ${s.stage}: </span>${esc(s.title)}</h2>
                  <p class="stage__concepts">${esc(s.concepts)}</p>
                </div>
                ${status}
              </div>
              <div class="stage__grid">
                <div><h3>Learning goal</h3><p>${esc(s.goal)}</p></div>
                <div><h3>Project</h3><p>${esc(s.project)}</p></div>
                <div><h3>Prerequisite</h3><p>${esc(s.prerequisite)}</p></div>
                <div><h3>Debugging habit</h3><p>${esc(s.debugging)}</p></div>
                <div class="prep__full"><h3>Suggested starting point</h3><p>${esc(s.suggestedStart)}</p></div>
              </div>
              <div class="ican">${icon("check")}<span><span class="visually-hidden">Readiness check: </span>${esc(s.iCan)}</span>${claimBtn}</div>
              <div class="stage__links">
                ${(ROVER_FOR_STAGE[s.stage] || []).map((lv) => `<a class="btn btn--ghost btn--small btn--lab" href="#/lab/rover/${lv}">${icon("flask")}Rover Code Lab · level ${lv}${prof && SE.labs.progressFor(prof, "rover").has(lv - 1) ? " ✓" : ""}</a>`).join("")}
                ${s.activities.map((id) => SE.activityById[id]).filter(Boolean).map((a) => `
                  <a class="btn btn--ghost btn--small ${prof && prof.completedIds.has(a.id) ? "is-done" : ""}" href="#/activity/${a.id}">${icon(prof && prof.completedIds.has(a.id) ? "check" : SE.areaById[a.area].icon)}${esc(a.title)} · ${a.duration} min</a>`).join("")}
              </div>
            </article>
          </li>`;
        }).join("")}
      </ol>`;

    app().querySelectorAll("[data-claim]").forEach((b) => b.addEventListener("click", () => {
      const stageN = Number(b.dataset.claim);
      SE.store.log("ican_claimed", { stage: stageN });
      SE.toast(`Stage ${stageN} sent to your teacher to check`);
      SE.views.pathway(user);
      const el = document.getElementById(`stage-${stageN}`);
      if (el) { el.scrollIntoView({ block: "center" }); }
    }));
  };

  SE.views.notFound = function () {
    app().innerHTML = `
      <section class="wrap section">
        <div class="empty">
          ${icon("mountain")}
          <h1 tabindex="-1" class="empty__title">We couldn’t find that page</h1>
          <p>The page may have moved, or the link may be mistyped.</p>
          <a class="btn btn--primary" href="#/">${icon("arrowLeft")}Back to dashboard</a>
        </div>
      </section>`;
  };
})();
