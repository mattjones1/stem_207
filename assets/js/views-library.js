/*
 * STEM 207 — library views: dashboard, exploration areas, activity pages, coding pathway.
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

  SE.isMaine = (a) => (a.keywords || []).includes("maine");
  const maineTag = (a) => (SE.isMaine(a) ? `<span class="maine-tag">${SE.pine(14)}Made in Maine</span>` : "") + pilotTag(a);
  /* Pilot missions are only flagged for educators; students just see a normal mission. */
  const pilotTag = (a) => a.pilot && ((SE.store.currentUser && SE.store.currentUser()) || {}).role === "educator" ? `<span class="pilot-tag">${icon("flag")}Pilot</span>` : "";
  function activityCard(a, prof) {
    const area = SE.areaById[a.area];
    const done = prof && prof.completedIds.has(a.id);
    return `
      <article class="card ${done ? "card--done" : ""}">
        <div class="card__area"><span class="icon-badge">${icon(area.icon)}</span>${esc(area.short)}${maineTag(a)}</div>
        <h3><a href="#/activity/${a.id}">${esc(a.title)}</a></h3>
        <p class="card__summary">${esc(a.summary)}</p>
        <div class="meta">
          <span class="meta__item"><span class="visually-hidden">Experience level: </span>${SE.levelMarkup(a.level)}</span>
          <span class="meta__item">${icon("grade")}${SE.gradesText(a.grades)}</span>
          <span class="meta__item">${icon("clock")}${SE.timeText(a)}</span>
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
        ${a.time ? `<div><dt>Student time</dt><dd>${SE.timeText(a)}${a.time.verified ? "" : ' <span class="muted small">(pilot estimate)</span>'}</dd></div>
        <div><dt>Teacher prep</dt><dd>${a.time.prep ? `About ${a.time.prep} min` : "None"}</dd></div>` : `<div><dt>Time</dt><dd>About ${a.duration} minutes</dd></div>`}
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

  /* What "home" (#/) is called for whoever is signed in: Today, Educator dashboard, or Home. */
  SE.homeLabel = () => { const u = SE.store.currentUser(); return !u || u.role === "guest" ? "Home" : u.role === "student" ? "Today" : "Educator dashboard"; };
  const backLink = (href = "#/", label) => `<a class="back-link" href="${href}">${icon("arrowLeft")}${label || SE.homeLabel()}</a>`;
  SE.backLink = backLink;

  /* ───────── Library state ───────── */
  const defaultFilters = () => ({ q: "", area: "", level: "", grade: "", time: "", equip: "", status: "", pilot: "" });
  let filters = defaultFilters();
  let filtersFor = null; // the user the filters were set up for

  /* Placeholders ("Resource coming soon") stay out of student lists until a resource is chosen. */
  SE.hiddenForUser = (a) => a.launch.status === "coming-soon" && ((SE.store.currentUser && SE.store.currentUser()) || {}).role === "student";
  function matches(a, f, prof) {
    if (SE.hiddenForUser(a)) return false;
    if (f.area && a.area !== f.area) return false;
    if (f.level && a.level !== f.level) return false;
    if (f.grade && !a.grades.includes(f.grade)) return false;
    if (f.time && SE.timeMax(a) > durations.find((d) => d.id === f.time).max) return false;
    if (f.pilot && !a.pilot) return false;
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
            <span class="eyebrow">Mission library</span>
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
            ${user && user.role === "educator" ? selectField("f-pilot", "Collection", "pilot", "All missions", [["yes", "Pilot missions"]]) : ""}
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
    if (!q) {
      // No library on this page (the student expedition page): time buttons open Missions with that filter.
      app().querySelectorAll(".time-picker button").forEach((btn) => btn.addEventListener("click", () => { filters.time = btn.dataset.time; location.hash = "#/library"; }));
      return;
    }
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
  /* Coastal scene for the dashboard hero: a lighthouse sweeping its beam over Casco Bay-style
     water, granite ledge, a pine ridge, Katahdin in the distance, and one lobster buoy per
     exploration area. Each buoy is a link to its area. */
  const BUOYS = [
    { x: 182, y: 270, label: "Coding", c1: "#8cc832", c2: "#302568" },
    { x: 290, y: 270, label: "VR", c1: "#ffffff", c2: "#8cc832" },
    { x: 398, y: 270, label: "AI", c1: "#f2c14e", c2: "#302568" },
    { x: 128, y: 312, label: "Engineering", c1: "#e9603f", c2: "#ffffff" },
    { x: 238, y: 312, label: "Science", c1: "#8cc832", c2: "#ffffff" },
    { x: 348, y: 312, label: "Creative", c1: "#ffffff", c2: "#e9603f" }
  ];
  function coastSvg() {
    const sky = SE.rng("maine-sky");
    const stars = Array.from({ length: 34 }, () => `<circle cx="${(sky() * 440).toFixed(1)}" cy="${(sky() * 120).toFixed(1)}" r="${(sky() * 1 + .4).toFixed(2)}" fill="#fff" opacity="${(sky() * .5 + .2).toFixed(2)}"/>`).join("");
    const pr = SE.rng("maine-ridge");
    const pines = [];
    for (let x = 150; x < 450; x += 9 + pr() * 9) {
      const h = 26 + pr() * 34;
      pines.push(`<use href="#pine207" x="${x.toFixed(1)}" y="${(252 - h).toFixed(1)}" width="${(h * 117 / 332).toFixed(1)}" height="${h.toFixed(1)}"/>`);
    }
    const buoys = areas.map((a, i) => {
      const b = BUOYS[i];
      return `<a href="#/area/${a.id}" aria-label="${esc(a.name)}">
        <g transform="translate(${b.x} ${b.y})">
          <ellipse class="buoy-ring" cx="0" cy="1" rx="13" ry="3.5" fill="none" stroke="#b9e27f" stroke-opacity=".35" stroke-width="1.2"/>
          <g class="buoy">
            <line x1="0" y1="-24" x2="0" y2="-36" stroke="#d9d6f0" stroke-width="1.6"/>
            <rect x="-6.5" y="-25" width="13" height="25" rx="6.5" fill="${b.c1}"/>
            <rect x="-6.5" y="-16" width="13" height="7" fill="${b.c2}"/>
            <rect x="-6.5" y="-25" width="13" height="25" rx="6.5" fill="none" stroke="#1d1647" stroke-opacity=".35"/>
          </g>
          <text x="0" y="19" text-anchor="middle">${esc(b.label)}</text>
        </g></a>`;
    }).join("");
    return `
      <svg viewBox="0 0 440 340" role="group" aria-label="Six lobster buoys float off a Maine lighthouse, one for each exploration area">
        <defs>
          <symbol id="pine207" viewBox="1138 172 117 332"><path d="${SE.brand.PINE_D}"/></symbol>
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff9d6" stop-opacity=".75"/><stop offset="1" stop-color="#fff9d6" stop-opacity="0"/></linearGradient>
          <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2170"/><stop offset="1" stop-color="#171240"/></linearGradient>
          <linearGradient id="fadeX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".12" stop-color="#fff"/><stop offset=".88" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
          <linearGradient id="fadeY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".78" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
          <mask id="coastFadeX" maskUnits="userSpaceOnUse" x="0" y="0" width="440" height="340"><rect width="440" height="340" fill="url(#fadeX)"/></mask>
          <mask id="coastFadeY" maskUnits="userSpaceOnUse" x="0" y="0" width="440" height="340"><rect width="440" height="340" fill="url(#fadeY)"/></mask>
        </defs>
        <g mask="url(#coastFadeX)"><g mask="url(#coastFadeY)">
        ${stars}
        <circle cx="384" cy="46" r="15" fill="#f6f1d3" opacity=".9"/><circle cx="391" cy="41" r="13" fill="#2b2263" opacity=".9"/>
        <path d="M150 252 L214 196 L236 206 L262 168 L284 180 L300 160 L338 196 L372 214 L440 232 L440 252 Z" fill="#3c3190"/>
        <path d="M262 168 L270 172 L284 180 L275 183 L268 177 Z M300 160 L310 170 L304 172 Z" fill="#c9c4ec" opacity=".55"/>
        <g fill="#1a1440">${pines.join("")}</g>
        <rect x="0" y="250" width="440" height="90" fill="url(#seaGrad)"/>
        <g stroke="#8cc832" stroke-opacity=".18" stroke-width="1.2" fill="none" stroke-linecap="round">
          <path d="M160 262 q8 -3 16 0 t16 0"/><path d="M330 290 q8 -3 16 0 t16 0"/><path d="M60 326 q8 -3 16 0 t16 0"/><path d="M280 332 q8 -3 16 0 t16 0"/><path d="M410 300 q8 -3 16 0 t16 0"/>
        </g>
        <path d="M70 262 L56 340 L84 340 Z" fill="#fff9d6" opacity=".08"/>
        <path class="beam" style="--lx:70px;--ly:140px" d="M70 140 L440 100 L440 176 Z" fill="url(#beamGrad)"/>
        <path d="M0 240 C18 230 40 236 58 232 C80 228 104 236 124 244 C146 252 160 262 170 276 C150 282 120 280 96 284 C64 290 30 284 0 288 Z" fill="#3b3a4a"/>
        <path d="M0 252 C24 246 46 252 70 248 C94 244 120 254 140 262 C120 270 90 268 64 274 C40 278 18 274 0 278 Z" fill="#55546a"/>
        <path d="M22 258 l18 -4 M80 256 l22 3 M108 266 l14 -2" stroke="#7b7a8c" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M96 246 h34 v-20 h-34 Z" fill="#efece2"/><path d="M92 228 L113 214 L134 228 Z" fill="#8a2c2c"/><rect x="104" y="232" width="7" height="8" fill="#f2c14e" opacity=".85"/><rect x="117" y="232" width="7" height="8" fill="#2b2263"/>
        <path d="M58 248 L62 150 H78 L82 248 Z" fill="#f4f2ea"/>
        <path d="M60.6 200 H79.4" stroke="#d9d5c6" stroke-width="2"/>
        <rect x="56" y="146" width="28" height="5" rx="1" fill="#1d1647"/>
        <rect x="62" y="132" width="16" height="14" fill="#1d1647"/>
        <rect x="64" y="134" width="12" height="10" fill="#fff4b0"/>
        <circle cx="70" cy="139" r="9" fill="#fff4b0" opacity=".35"/>
        <path d="M60 132 L70 122 L80 132 Z" fill="#1d1647"/><line x1="70" y1="122" x2="70" y2="116" stroke="#1d1647" stroke-width="1.6"/>
        </g></g>
        ${buoys}
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
            const total = activities.filter((x) => x.area === a.id && !SE.hiddenForUser(x)).length;
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

  /* Made in Maine: activities and labs rooted in Maine places, work, and wildlife. */
  function maineSection(prof) {
    const list = activities.filter((a) => SE.isMaine(a) && !a.launch.labId && !SE.hiddenForUser(a));
    return `
      <section class="section wrap maine" aria-labelledby="maine-title">
        <div class="section__head">
          <div><span class="eyebrow">${SE.pine(14)} Made in Maine</span><h2 id="maine-title">Missions from the coast to the County</h2></div>
          <p>Lobster boats, tide pools, sugarhouses, and snow days. These missions start right here in the 207.</p>
        </div>
        <div class="cards cards--rail">${list.map((a) => activityCard(a, prof)).join("")}</div>
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

  SE.views.dashboard = function (user, mode) {
    const isStudent = user && user.role === "student";
    if (filtersFor !== (user && user.id)) {
      filters = defaultFilters();
      if (isStudent && user.gradeBand) filters.grade = user.gradeBand;
      filtersFor = user && user.id;
    }

    if (isStudent) {
      const prof = SE.game.profile(user.id);
      // Students: "explore" is the expedition page (map, patches, class goal); "library" is the mission finder.
      app().innerHTML = mode === "library"
        ? `<section class="page-top"><div class="wrap page-top__inner"><div class="backbar">${backLink("#/", "Today")}</div><h1 tabindex="-1">Missions</h1><p class="page-top__lede">Search for a mission, or narrow by topic, grade, and time.</p></div></section>` + librarySection(user, prof)
        : SE.views.expeditionHome(user, prof) + labsStrip(user, null, "Your labs") + maineSection(prof) + areasSection(prof) + pathwayStrip(prof);
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
      <section class="hero ridge" aria-labelledby="hero-title">
        <div class="wrap hero__inner">
          <div>
            <span class="eyebrow">STEM 207 · Grades 2–8 · Made in Maine</span>
            <h1 id="hero-title" tabindex="-1">From the coast to Katahdin, big ideas start here.</h1>
            <p class="hero__lede">Pick an area to explore, read your mission, and launch it. Coding, virtual field trips, AI, engineering, science, and art, built for Maine classrooms.</p>
            ${timePicker()}
          </div>
          <div class="coast">${coastSvg()}</div>
        </div>
      </section>
      ${guestBanner}
      ${user && user.role === "educator" ? SE.views.educatorStrip(user) : ""}
      ${areasSection(null)}
      ${featuredSection()}
      ${maineSection(null)}
      ${labsStrip(user, null, "Interactive labs")}
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
    const list = sortActivities(activities.filter((a) => a.area === id && !SE.hiddenForUser(a)));
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
      ${id === "ai" ? `
        <section class="wrap section">
          <div class="notice notice--row">
            <p><strong>Not sure where to start?</strong> The AI learning route puts these missions in order, from patterns to responsible use.</p>
            <a class="btn btn--primary btn--small" href="#/ai-route">See the AI learning route ${icon("arrowRight")}</a>
          </div>
        </section>` : ""}
      ${id === "coding" ? `
        <section class="wrap section">
          <div class="notice notice--row">
            <p><strong>New to coding, or ready for the next step?</strong> The coding pathway shows seven stages with an “I can” check for each one.</p>
            <a class="btn btn--primary btn--small" href="#/pathway">Open the coding pathway ${icon("arrowRight")}</a>
          </div>
        </section>` : ""}
      ${id === "engineering" && SE.moxie.pathwayVisible(user) ? `
        <section class="wrap section">
          <div class="notice notice--row">
            <p><strong>Moxie: ${esc(STEM.moxie.tagline)}</strong> A 16-session pathway that ends with a device you build for someone.${STEM.moxie.pub === "published" ? "" : ` <span class="muted">(${esc(SE.moxie.PUB[STEM.moxie.pub])}: only educators see this.)</span>`}</p>
            <a class="btn btn--primary btn--small" href="#/moxie">Open Moxie ${icon("arrowRight")}</a>
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
          <p class="launch-panel__small">The lab opens right here in STEM 207. Use the Dashboard button to come back anytime.</p>
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

  /* ───────── Block pictures: where blocks go, drawn Scratch-style, with a text version ───────── */
  const FIGURES = {
    "score-keeper-star": {
      title: "The star's script",
      caption: "Both if blocks go inside the forever loop, so the star checks them again and again. (The score still doesn't reset at the start. You'll find that bug in step 7.)",
      lines: [
        [0, "event", "when green flag clicked"],
        [0, "motion", "go to x: (pick random -200 to 200) y: 170"],
        [0, "control", "forever"],
        [1, "motion", "change y by -5"],
        [1, "control", "if < touching catcher? > then"],
        [2, "variables", "change score by 1"],
        [2, "motion", "go to x: (pick random -200 to 200) y: 170"],
        [1, "end", ""],
        [1, "control", "if < (y position) < -170 > then"],
        [2, "motion", "go to x: (pick random -200 to 200) y: 170"],
        [1, "end", ""],
        [0, "end", ""]
      ]
    }
  };
  const BLOCK_FILL = { event: "#ffbf00", motion: "#4c97ff", control: "#ffab19", variables: "#ff8c1a", end: "#ffab19" };
  function figureMarkup(key) {
    const f = FIGURES[key];
    if (!f) return "";
    const rowH = 34, indent = 26, x0 = 12;
    const rows = f.lines.map(([d, kind, text], i) => {
      const x = x0 + d * indent, y = 12 + i * rowH, w = kind === "end" ? 70 : Math.max(150, text.length * 7.4 + 28);
      return `<g><rect x="${x}" y="${y}" width="${w}" height="${kind === "end" ? 16 : 28}" rx="${kind === "event" ? 12 : 4}" fill="${BLOCK_FILL[kind]}" stroke="rgba(0,0,0,.25)"/>${text ? `<text x="${x + 10}" y="${y + 19}" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="700" fill="${kind === "event" || kind === "control" || kind === "variables" ? "#1d1647" : "#ffffff"}">${esc(text)}</text>` : ""}</g>`;
    }).join("");
    // The left arm of each C block (forever, if): from its row down to its matching end.
    const arms = f.lines.map(([d, kind], i) => {
      if (kind !== "control") return "";
      const j = f.lines.findIndex((l, k) => k > i && l[0] === d && l[1] === "end");
      if (j < 0) return "";
      return `<rect x="${x0 + d * indent}" y="${12 + i * rowH + 20}" width="${indent - 4}" height="${(j - i) * rowH - 12}" fill="${BLOCK_FILL.control}" stroke="rgba(0,0,0,.25)"/>`;
    }).join("");
    const h = 24 + f.lines.length * rowH, w = 520;
    return `
      <figure class="block-fig">
        <figcaption><strong>${esc(f.title)}</strong> ${esc(f.caption)}</figcaption>
        <div class="block-fig__art"><svg viewBox="0 0 ${w} ${h}" width="${w}" role="img" aria-label="${esc(f.title)}: ${esc(f.lines.filter((l) => l[2]).map((l) => l[2]).join("; "))}">${arms}${rows}</svg></div>
        <details class="block-fig__text"><summary>Read the script as text</summary><ol>${f.lines.filter((l) => l[2]).map(([d, , t]) => `<li style="margin-left:${d * 1.5}rem">${esc(t)}</li>`).join("")}</ol></details>
      </figure>`;
  }

  SE.views.activity = function (user, id) {
    const a = SE.activityById[id];
    if (!a) return SE.views.notFound();
    if (a.moxie) return SE.views.moxieSession(user, a);   // Moxie sessions have their own layout (views-moxie.js)
    const area = SE.areaById[a.area];
    const stage = a.pathwayStage ? pathway.find((s) => s.stage === a.pathwayStage) : null;
    const isStudent = user && user.role === "student";
    const prof = isStudent ? SE.game.profile(user.id) : null;
    const related = sortActivities(activities.filter((x) => x.area === a.area && x.id !== a.id && !SE.hiddenForUser(x))).slice(0, 3);
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
            ${a.source === "original" ? `<span class="label-original">${icon("flag")}Original STEM 207 lesson</span>` : ""}${maineTag(a)}${isStudent && SE.store.assignmentFor(user.classId, a.id) ? `<span class="assigned-tag">${icon("clipboard")}Assigned by your teacher${SE.store.assignmentFor(user.classId, a.id).dueDate ? ` · ${esc(SE.dueText(SE.store.assignmentFor(user.classId, a.id).dueDate))}` : ""}</span>` : ""}
            ${isStudent ? (lastCompletion
              ? `<span class="chip chip--done-dark">${icon("check")}${esc(SE.game.statusFor(prof, a).label === "Legacy" ? `Completed ${SE.dateShort(lastCompletion.event.at)}` : SE.game.statusFor(prof, a).label)}</span>`
              : `<span class="chip chip--xp-dark">Worth ${SE.game.baseXp(a)} XP</span>`) : ""}
          </div>
        </div>
      </section>

      <div class="wrap activity-layout">
        <div class="activity-main">
          <section class="block block--mission" aria-labelledby="s-mission">
            <h2 id="s-mission">${icon("target")}Your mission</h2>
            <p>${esc(a.mission)}</p>
            ${a.board ? `<div class="board"><p class="board__title">${esc(a.board.title)}</p><ol class="${a.board.code ? "board--code" : ""}">${a.board.lines.map((x) => `<li>${a.board.code ? `<code>${esc(x)}</code>` : esc(x)}</li>`).join("")}</ol>${a.board.note ? `<p class="board__note">${esc(a.board.note)}</p>` : ""}</div>` : ""}
          </section>
          ${a.bridge && SE.activityById[a.bridge.from] ? `<p class="bridge">${icon("arrowRight")}<span><strong>You've seen this idea before.</strong> ${esc(a.bridge.text)} <a href="#/activity/${a.bridge.from}">${esc(SE.activityById[a.bridge.from].title)}</a></span></p>` : ""}
          <section class="block" aria-labelledby="s-learn">
            <h2 id="s-learn">${icon("bulb")}What you’ll learn</h2>
            <ul class="bullets objectives">${a.learn.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
          </section>
          ${a.why ? `
          <section class="block block--why" aria-labelledby="s-why">
            <h2 id="s-why">${icon("star")}Why it matters</h2>
            <p>${esc(a.why)}</p>
            ${a.realWorld ? `<p class="why-real"><strong>In the real world:</strong> ${esc(a.realWorld)}</p>` : ""}
            ${a.vocab ? `<h3>Key words</h3><dl class="vocab">${a.vocab.map((v) => `<div><dt>${esc(v.term)}</dt><dd>${esc(v.def)}</dd></div>`).join("")}</dl>` : ""}
          </section>` : ""}
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
            ${a.starter ? `<div class="starter">${icon("box")}<span><strong>Starter project:</strong> ${esc(a.starter.how)}</span><a class="btn btn--primary btn--small" href="${esc(a.starter.file)}" download>${icon("arrowRight")}${esc(a.starter.label)}</a></div>` : ""}
            ${stepsHtml}
            ${a.figure ? figureMarkup(a.figure) : ""}
            ${a.stopAt ? `<p class="stop-at">${icon("flag")}<span><strong>You're done when:</strong> ${esc(a.stopAt)}</span></p>` : ""}
          </section>
          ${a.stuck ? `
          <section class="block block--stuck" aria-labelledby="s-stuck">
            <h2 id="s-stuck">${icon("question")}Stuck? Try these</h2>
            <ol class="stuck-list">${a.stuck.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
            <p class="muted">Still stuck? Ask a partner, then ask your teacher.</p>
          </section>` : ""}
          ${a.check ? `
          <section class="block block--check" aria-labelledby="s-check">
            <h2 id="s-check">${icon("target")}Show what you know</h2>
            <p>${esc(a.check)}</p>
            ${isStudent ? `<p class="muted">You can say it out loud to your teacher or a partner, or write it in your debrief below.</p>` : `<p class="muted">Students can show this out loud, by demonstrating it, or in writing. A quick listen while you walk the room is enough.</p>`}
          </section>` : ""}
          ${a.next && SE.activityById[a.next] ? `<p class="next-up">${icon("arrowRight")}<span><strong>Next up:</strong> <a href="#/activity/${a.next}">${esc(SE.activityById[a.next].title)}</a></span></p>` : ""}
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
          <a class="btn btn--ghost btn--small" href="#/">${icon("arrowLeft")}Back to ${SE.homeLabel() === "Home" ? "home" : SE.homeLabel()}</a>
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
  /* Harbor Code Lab levels that practice each pathway stage (from each level's `stage`). */
  const roverLevelsFor = (stage) => (SE.roverLevels || []).map((l, i) => (l.stage === stage ? i + 1 : 0)).filter(Boolean);
  /* "How checks work": one picture of who does what, where, and what it changes.
     kind "teacher" shows both kinds of check; "student" shows the short stage-check version. */
  SE.checksGuide = function (kind) {
    const step = (who, what, where) => `<li class="cg-step cg-step--${who === "You" || who === "Teacher" ? "teach" : "student"}"><span class="cg-who">${esc(who)}</span><span class="cg-what">${what}</span>${where ? `<span class="cg-where">${icon("map")}${where}</span>` : ""}</li>`;
    if (kind === "student") return `
      <details class="block cg cg--student" id="checks-guide">
        <summary><span>${icon("question")}How stage checks work</span></summary>
        <ol class="cg-flow">
          ${step("You", "Practice the missions and lab levels in a stage.", "")}
          ${step("You", "When you can do the “I can” statement, tap <strong>I can do this</strong>.", "On this page")}
          ${step("Teacher", "Your teacher asks you to show it, then chooses <strong>Confirm</strong> or <strong>Not yet</strong>.", "In class")}
          ${step("You", "Confirmed: the stage is cleared and you earn " + STEM.progression.xp.stageCleared + " XP. Not yet: keep practicing and tap it again.", "On this page")}
        </ol>
      </details>`;
    return `
      <details class="block cg" id="checks-guide" open>
        <summary><span>${icon("question")}How checks work</span><span class="muted cg-sub">Two kinds of check. Students ask, you decide.</span></summary>
        <div class="cg-grid">
          <section aria-labelledby="cg-m">
            <h3 id="cg-m">${icon("rocket")}Mission checks</h3>
            <p class="muted">Did the student do this mission? One per mission.</p>
            <ol class="cg-flow">
              ${step("Student", "Finishes the steps, then sends the <strong>Mission debrief</strong>: a written answer, or “Show or tell my teacher.”", "Mission page")}
              ${step("You", "See it in the <strong>Reflections</strong> tab (a badge shows how many are waiting) or on the student's page.", "Reflections tab · student page")}
              ${step("You", "Choose <strong>Confirm</strong> (how they showed you: said it, showed it, or their work) or <strong>Try again</strong> with a short note.", "Student page")}
              ${step("Student", "Confirm: the mission shows as confirmed (+" + STEM.progression.xp.teacherConfirmed + " XP). Try again: it comes back on their Today page with your note until they send it again.", "Today · mission page")}
            </ol>
          </section>
          <section aria-labelledby="cg-s">
            <h3 id="cg-s">${icon("flag")}Stage checks</h3>
            <p class="muted">Is the student ready for the next pathway stage? One per stage.</p>
            <ol class="cg-flow">
              ${step("Student", "Practices the stage, then taps <strong>I can do this</strong> on that stage.", "Coding pathway page")}
              ${step("You", "See it under <strong>Checks waiting</strong> on this page, with a badge on the tab.", "Coding pathway tab")}
              ${step("You", "Ask them to show the “I can” statement. Choose <strong>Confirm</strong> or <strong>Not yet</strong>.", "This page · student page")}
              ${step("Student", "Confirm: the stage is cleared (+" + STEM.progression.xp.stageCleared + " XP) and suggestions move to the next stage. Not yet: the request goes away and they can ask again.", "Coding pathway · Today")}
            </ol>
          </section>
        </div>
        <p class="cg-key">${icon("check")}<span><strong>Only your Confirm clears a stage.</strong> Missions and lab levels are practice and evidence. Finishing them never clears a stage on its own, and a student can ask for a stage check at any time.</span></p>
      </details>`;
  };

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
          ${user && user.role === "educator" ? `<p class="preview-note">${icon("eye")}<span><strong>Student view preview.</strong> This is what students see. Their “I can do this” buttons appear once they sign in.</span> <a class="btn btn--ghost btn--small" href="#/teach/pathway">${icon("arrowLeft")}Back to your pathway</a></p>` : ""}
          ${prof ? `<p class="page-top__progress"><strong>${prof.counts.stagesCleared} of 7</strong> stages cleared · each cleared stage is worth ${STEM.progression.xp.stageCleared} XP</p>` : ""}
        </div>
      </section>
      <div class="wrap pathway-intro">
        <div class="block"><h2>${smallIcon("flag")}Pick a starting stage</h2><p>Read the prerequisites. If you can already do them, start there. A quick review of an earlier stage never hurts.</p></div>
        <div class="block"><h2>${smallIcon("bug")}Debug at every stage</h2><p>Every stage has its own debugging habit. Finding and fixing mistakes is part of the learning, not a detour.</p></div>
        <div class="block"><h2>${smallIcon("check")}Check with “I can”</h2><p>${isStudent ? "When you can do the “I can” statement, tell your teacher with the button. They'll check it with you." : "Each “I can” statement is something you can watch a student do. When they can, they're ready for the next stage."}</p></div>
      </div>
      <section class="wrap start-here" aria-labelledby="start-here-title">
        <h2 id="start-here-title">${smallIcon("rocket")}New to coding? Start here</h2>
        <div class="start-here__grid">${(STEM.startHere || []).map((t) => `
          <article class="block start-here__track ${prof && user.gradeBand === t.band ? "is-mine" : ""}">
            <h3>${esc(t.title)}</h3><p>${esc(t.frame)}</p>
            <ol>${t.activities.map((id) => SE.activityById[id]).filter(Boolean).map((a) => `<li><a href="#/activity/${a.id}">${esc(a.title)}</a> <span class="muted">${SE.timeText(a)}</span></li>`).join("")}</ol>
          </article>`).join("")}</div>
        <p class="muted">Already coding? Skip ahead: pick the first stage below whose prerequisites you can already do. Your grade doesn't limit how far you go.</p>
        ${prof ? SE.checksGuide("student") : ""}
        <p class="track-note ${prof && user.gradeBand === "6-8" ? "is-mine" : ""}">${icon("star")}<span><strong>Grades 6–8 track.</strong> Every stage has a mission tagged <span class="track-tag">Grades 6–8</span>. It practices the same idea, a step further: broadcasts, clones, and/or/not, lists, custom blocks with inputs, and a first taste of Python.</span></p>
      </section>
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
                ${roverLevelsFor(s.stage).length ? `<div class="stage__lab"><span>${icon("flask")}Harbor Code Lab levels</span>${roverLevelsFor(s.stage).map((lv) => { const d = prof && SE.labs.progressFor(prof, "rover").has(lv - 1); return `<a class="lvl-chip ${d ? "is-done" : ""}" href="#/lab/rover/${lv}" aria-label="Harbor Code Lab level ${lv}${d ? ", finished" : ""}">${d ? icon("check") : ""}${lv}</a>`; }).join("")}</div>` : ""}
                ${s.activities.map((id) => SE.activityById[id]).filter(Boolean).map((a) => `
                  <a class="btn btn--ghost btn--small ${prof && prof.completedIds.has(a.id) ? "is-done" : ""}" href="#/activity/${a.id}">${icon(prof && prof.completedIds.has(a.id) ? "check" : SE.areaById[a.area].icon)}${esc(a.title)} · ${SE.timeText(a)}${a.track ? ` <span class="track-tag">Grades ${esc(a.track.replace("-", "–"))}</span>` : ""}</a>`).join("")}
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

  /* ───────── The AI learning route ───────── */
  SE.views.aiRoute = function (user) {
    const prof = user && user.role === "student" ? SE.game.profile(user.id) : null;
    app().innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${backLink("#/area/ai", "Artificial Intelligence")}</div>
          <div class="page-top__head"><span class="icon-badge">${icon("ai")}</span>
            <div><span class="eyebrow">Artificial Intelligence</span><h1 tabindex="-1">The AI learning route</h1></div></div>
          <p class="page-top__lede">Six steps, from spotting patterns to deciding when AI should be trusted. Each step uses missions you can do now. Go in order the first time.</p>
        </div>
      </section>
      <ol class="wrap ai-route">${(STEM.aiRoute || []).map((s) => `
        <li class="block ai-route__step">
          <span class="ai-route__n" aria-hidden="true">${s.step}</span>
          <div><h2><span class="visually-hidden">Step ${s.step}: </span>${esc(s.title)}</h2><p>${esc(s.idea)}</p>
            <ul class="ai-route__acts">${s.activities.map((id) => SE.activityById[id]).filter((a) => a && !SE.hiddenForUser(a)).map((a) => {
              const st = prof ? SE.game.statusFor(prof, a) : null;
              return `<li><a href="#/activity/${a.id}">${esc(a.title)}</a> <span class="muted">${SE.timeText(a)} · ${esc(formats[a.format].name)}</span>${st && st.state !== "none" ? ` <span class="muted">· ${esc(st.label)}</span>` : ""}</li>`; }).join("")}</ul>
            ${s.note ? `<p class="muted small">${esc(s.note)}</p>` : ""}</div>
        </li>`).join("")}</ol>`;
  };

  SE.views.notFound = function () {
    app().innerHTML = `
      <section class="wrap section">
        <div class="empty">
          ${icon("mountain")}
          <h1 tabindex="-1" class="empty__title">We couldn’t find that page</h1>
          <p>The page may have moved, or the link may be mistyped.</p>
          <a class="btn btn--primary" href="#/">${icon("arrowLeft")}Back to ${SE.homeLabel() === "Home" ? "home" : SE.homeLabel()}</a>
        </div>
      </section>`;
  };
})();
