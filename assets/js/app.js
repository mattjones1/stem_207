/*
 * STEM Explorers — app shell.
 * A small hash router renders four views from the data files:
 *   #/                 dashboard (areas, featured mission, pathway strip, library)
 *   #/library          dashboard scrolled to the library
 *   #/area/<id>        one exploration area
 *   #/activity/<id>    activity detail
 *   #/pathway          coding pathway
 */
(function () {
  "use strict";

  const { areas, activities, levels, gradeBands, durations, formats, equipment, pathway } = window.STEM;
  const app = document.getElementById("app");
  const main = document.getElementById("main");

  /* ───────── Lookups ───────── */
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const levelById = Object.fromEntries(levels.map((l) => [l.id, l]));
  const gradeById = Object.fromEntries(gradeBands.map((g) => [g.id, g]));
  const activityById = Object.fromEntries(activities.map((a) => [a.id, a]));
  const levelOrder = Object.fromEntries(levels.map((l, i) => [l.id, i]));

  /* ───────── Icons (inline SVG, stroke-based) ───────── */
  const ICONS = {
    code: '<polyline points="8 6 2 12 8 18"/><polyline points="16 6 22 12 16 18"/><line x1="13.5" y1="4" x2="10.5" y2="20"/>',
    vr: '<path d="M3 8h18a1 1 0 0 1 1 1v6a2 2 0 0 1-2 2h-4.2l-2.3-3h-3l-2.3 3H4a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1z"/><circle cx="7.5" cy="12" r="1.6"/><circle cx="16.5" cy="12" r="1.6"/>',
    ai: '<circle cx="12" cy="4.5" r="2"/><circle cx="4.5" cy="19" r="2"/><circle cx="19.5" cy="19" r="2"/><circle cx="12" cy="13" r="2.4"/><path d="M12 6.5v4.1M10.1 14.6l-4 3M13.9 14.6l4 3M6.5 19h11"/>',
    gear: '<rect x="5" y="8" width="14" height="11" rx="2.5"/><path d="M12 4.5V8"/><circle cx="12" cy="3.5" r="1.2"/><circle cx="9.5" cy="12.8" r="1.3"/><circle cx="14.5" cy="12.8" r="1.3"/><path d="M9.5 16.2h5M3 11.5v4M21 11.5v4"/>',
    flask: '<path d="M9 3h6M10 3v6.2L4.6 18.4A1.7 1.7 0 0 0 6.1 21h11.8a1.7 1.7 0 0 0 1.5-2.6L14 9.2V3"/><path d="M7.2 15h9.6"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.1"/><circle cx="10" cy="7.3" r="1.1"/><circle cx="14.6" cy="7.3" r="1.1"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c3 .2 5.5 2.6 5.5 5.8"/>',
    grade: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c2 2 10 2 12 0v-5"/>',
    tools: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.6-.6-.6-2.6z"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5v.01"/>',
    rocket: '<path d="M12 15c-1.5-1.5-2.5-3-3-5 2-5 6-7.5 11-7.5 0 5-2.5 9-7.5 11-2-.5-3.5-1.5-5-3z" transform="translate(-1 1)"/><circle cx="14" cy="9" r="1.6"/><path d="M7 14l-3 1 1-4 3-1M10 17l-1 3 4-1 1-3"/><path d="M5.5 17.5L3 21"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    box: '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    mountain: '<path d="M3 20l6-10 4 6 2.5-3.5L21 20z"/><circle cx="17" cy="6" r="2"/>',
    clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    headset: '<path d="M3 8h18a1 1 0 0 1 1 1v6a2 2 0 0 1-2 2h-4.2l-2.3-3h-3l-2.3 3H4a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2c-.5-.8-1.4-1.2-2.5-1.2-1.6 0-2.7.8-2.7 2s1.1 1.7 2.7 2 2.7.8 2.7 2-1.1 2-2.7 2c-1.2 0-2.1-.5-2.6-1.3M12 6.5V8M12 16v1.5"/>',
    bug: '<rect x="7.5" y="7" width="9" height="13" rx="4.5"/><path d="M12 7v13M9 4.5l1.5 2.5M15 4.5L13.5 7M3.5 10.5h4M16.5 10.5h4M3.5 15h4M16.5 15h4"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'
  };
  const icon = (name, extra = "") =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${extra}>${ICONS[name] || ""}</svg>`;

  /* ───────── Helpers ───────── */
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const gradesText = (ids) => {
    const nums = ids.map((id) => id.split("-").map(Number)).flat();
    return `Grades ${Math.min(...nums)}–${Math.max(...nums)}`;
  };
  const levelMarkup = (id) => {
    const l = levelById[id];
    const pips = [1, 2, 3].map((n) => `<i class="${n <= l.pips ? "on" : ""}"></i>`).join("");
    return `<span class="level"><span class="level__pips" aria-hidden="true">${pips}</span>${esc(l.name)}</span>`;
  };
  const equipmentText = (keys) => keys.map((k) => equipment[k]?.name || k).join(", ");
  const countFor = (areaId) => activities.filter((a) => a.area === areaId).length;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  /* Short, honest summary of what an activity needs before it can start. */
  function accessChips(a) {
    const chips = [];
    if (a.launch.status === "ready") {
      chips.push(`<span class="chip">${icon("external")}Opens ${esc(a.launch.provider)}</span>`);
    } else if (a.launch.status === "coming-soon") {
      chips.push(`<span class="chip chip--soon">${icon("clock")}Resource coming soon</span>`);
    } else {
      chips.push(`<span class="chip chip--ok">${icon("check")}Hands-on, no link needed</span>`);
    }
    if (a.access.account === "required") chips.push(`<span class="chip chip--warn">${icon("key")}Account required</span>`);
    if (a.access.account === "optional") chips.push(`<span class="chip">${icon("key")}Account optional</span>`);
    if (a.access.cost === "paid") chips.push(`<span class="chip chip--warn">${icon("coin")}Paid resource</span>`);
    if (a.equipment.includes("vr")) chips.push(`<span class="chip chip--warn">${icon("headset")}VR headset optional</span>`);
    if (a.access.supervision) chips.push(`<span class="chip chip--warn">${icon("shield")}Teacher supervision</span>`);
    return chips.join("");
  }

  /* ───────── Library state ───────── */
  const defaultFilters = () => ({ q: "", area: "", level: "", grade: "", time: "", equip: "" });
  let filters = defaultFilters();

  function matches(a, f) {
    if (f.area && a.area !== f.area) return false;
    if (f.level && a.level !== f.level) return false;
    if (f.grade && !a.grades.includes(f.grade)) return false;
    if (f.time) {
      const max = durations.find((d) => d.id === f.time).max;
      if (a.duration > max) return false;
    }
    if (f.equip && !a.equipment.includes(f.equip)) return false;
    if (f.q) {
      const hay = [a.title, a.summary, a.mission, areaById[a.area].name, ...(a.keywords || [])].join(" ").toLowerCase();
      const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  }
  const sortActivities = (list) =>
    list.slice().sort((x, y) =>
      areas.findIndex((a) => a.id === x.area) - areas.findIndex((a) => a.id === y.area) ||
      (x.pathwayStage || 99) - (y.pathwayStage || 99) ||
      levelOrder[x.level] - levelOrder[y.level] ||
      x.duration - y.duration
    );

  /* ───────── Components ───────── */
  function activityCard(a, headingLevel = 3) {
    const area = areaById[a.area];
    const h = `h${headingLevel}`;
    return `
      <article class="card">
        <div class="card__area"><span class="icon-badge">${icon(area.icon)}</span>${esc(area.short)}</div>
        <${h}><a href="#/activity/${a.id}">${esc(a.title)}</a></${h}>
        <p class="card__summary">${esc(a.summary)}</p>
        <div class="meta">
          <span class="meta__item"><span class="visually-hidden">Experience level: </span>${levelMarkup(a.level)}</span>
          <span class="meta__item">${icon("grade")}${gradesText(a.grades)}</span>
          <span class="meta__item">${icon("clock")}${a.duration} min</span>
          <span class="meta__item">${icon("users")}${esc(formats[a.format].name)}</span>
          <span class="meta__item meta__item--wide">${icon("tools")}<span><span class="visually-hidden">Equipment: </span>${esc(equipmentText(a.equipment))}</span></span>
        </div>
        <div class="card__foot">${accessChips(a)}</div>
      </article>`;
  }

  function factsList(a) {
    return `
      <dl class="facts">
        <div><dt>Topic</dt><dd>${esc(areaById[a.area].name)}</dd></div>
        <div><dt>Level</dt><dd>${levelMarkup(a.level)}</dd></div>
        <div><dt>Grades</dt><dd>${gradesText(a.grades)}</dd></div>
        <div><dt>Time</dt><dd>About ${a.duration} minutes</dd></div>
        <div><dt>Format</dt><dd>${esc(formats[a.format].name)}</dd></div>
        <div><dt>Equipment</dt><dd>${esc(equipmentText(a.equipment))}</dd></div>
      </dl>`;
  }

  function radarSvg() {
    // Six blips, one per exploration area, placed around the scope.
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
        <defs>
          <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#7fd8d3" stop-opacity="0"/>
            <stop offset="1" stop-color="#7fd8d3" stop-opacity=".28"/>
          </linearGradient>
        </defs>
        <circle class="ring" cx="170" cy="170" r="145"/>
        <circle class="ring" cx="170" cy="170" r="105"/>
        <circle class="ring" cx="170" cy="170" r="62"/>
        <line class="axis" x1="25" y1="170" x2="315" y2="170"/>
        <line class="axis" x1="170" y1="25" x2="170" y2="315"/>
        <path class="sweep" d="M170 170 L315 170 A145 145 0 0 0 272.5 67.5 Z"/>
        <circle cx="170" cy="170" r="5" fill="#ec7a2f"/>
        ${blips}
      </svg>`;
  }

  /* ───────── Views ───────── */
  function viewDashboard() {
    const featured = activities.find((a) => a.featured) || activities[0];
    const fArea = areaById[featured.area];

    app.innerHTML = `
      <section class="hero" aria-labelledby="hero-title">
        <div class="wrap hero__inner">
          <div>
            <span class="eyebrow">Mission control</span>
            <h1 id="hero-title" tabindex="-1">Big ideas start with curious minds.</h1>
            <p class="hero__lede">Choose your next adventure. Pick an area to explore, read your mission, and launch the activity.</p>
            <div class="time-picker" role="group" aria-labelledby="time-picker-label">
              <span class="time-picker__label" id="time-picker-label">How much time do you have?</span>
              ${durations.map((d) => `
                <button type="button" data-time="${d.id}" aria-pressed="${filters.time === d.id}">
                  ${icon("clock")}${d.max} min
                </button>`).join("")}
            </div>
          </div>
          <div class="radar">${radarSvg()}</div>
        </div>
      </section>

      <section class="section wrap" aria-labelledby="explore-title">
        <div class="section__head">
          <div>
            <span class="eyebrow">Step 1</span>
            <h2 id="explore-title">Choose your exploration</h2>
          </div>
          <p>Six areas to explore. Each one has activities for different grades, time slots, and equipment.</p>
        </div>
        <div class="areas">
          ${areas.map((a) => `
            <a class="area-card" href="#/area/${a.id}">
              <div class="area-card__top">
                <span class="icon-badge">${icon(a.icon)}</span>
                <h3>${esc(a.name)}</h3>
              </div>
              <p>${esc(a.tagline)}</p>
              <span class="area-card__foot">Explore the lab · ${plural(countFor(a.id), "activity", "activities")} ${icon("arrowRight")}</span>
            </a>`).join("")}
        </div>
      </section>

      <section class="section wrap" aria-labelledby="featured-title">
        <div class="section__head">
          <div>
            <span class="eyebrow">Featured classroom mission</span>
            <h2 id="featured-title" class="visually-hidden">Featured classroom mission</h2>
          </div>
        </div>
        <article class="featured">
          <div class="featured__body">
            <div class="card__area"><span class="icon-badge">${icon(fArea.icon)}</span>${esc(fArea.name)}</div>
            <h3>${esc(featured.title)}</h3>
            <p class="featured__mission">${esc(featured.mission)}</p>
            <div class="card__foot">${accessChips(featured)}</div>
            <div class="featured__actions">
              <a class="btn btn--primary" href="#/activity/${featured.id}">${icon("rocket")}See the mission</a>
              ${featured.launch.status === "ready" ? `
                <a class="btn btn--ghost" href="${esc(featured.launch.url)}" target="_blank" rel="noopener noreferrer">
                  ${icon("external")}${esc(featured.launch.label)}<span class="visually-hidden"> (opens in a new tab)</span>
                </a>` : ""}
            </div>
          </div>
          <div class="featured__side">${factsList(featured)}</div>
        </article>
      </section>

      <section class="section wrap" aria-labelledby="pathway-title">
        <div class="section__head">
          <div>
            <span class="eyebrow">Coding pathway</span>
            <h2 id="pathway-title">Seven stages, start where you're ready</h2>
          </div>
          <a class="btn btn--ghost btn--small" href="#/pathway">See the full pathway ${icon("arrowRight")}</a>
        </div>
        <ol class="track">
          ${pathway.map((s) => `
            <li><a href="#/pathway#stage-${s.stage}" data-stage="${s.stage}">
              <span class="track__num">Stage ${s.stage}</span>
              <span class="track__title">${esc(s.title)}</span>
              <span class="track__concepts">${esc(s.concepts)}</span>
            </a></li>`).join("")}
        </ol>
      </section>

      <section class="section wrap" id="library" aria-labelledby="library-title">
        <div class="section__head">
          <div>
            <span class="eyebrow">Step 2</span>
            <h2 id="library-title" tabindex="-1">Activity library</h2>
          </div>
          <p>Search by name or idea, or narrow by topic, level, grade, time, and equipment.</p>
        </div>
        <div class="library-panel">
          <div class="search">
            ${icon("search")}
            <label for="f-q" class="visually-hidden">Search activities</label>
            <input id="f-q" type="search" placeholder="Search activities, like maze, loops, or bridge" autocomplete="off" value="${esc(filters.q)}">
          </div>
          <div class="filters">
            ${selectField("f-area", "Topic", "area", "All topics", areas.map((a) => [a.id, a.name]))}
            ${selectField("f-level", "Experience", "level", "Any level", levels.map((l) => [l.id, l.name]))}
            ${selectField("f-grade", "Grade band", "grade", "Any grade", gradeBands.map((g) => [g.id, g.name]))}
            ${selectField("f-time", "Time", "time", "Any length", durations.map((d) => [d.id, d.name]))}
            ${selectField("f-equip", "Equipment", "equip", "Any equipment",
              Object.entries(equipment).filter(([, v]) => v.filter).map(([k, v]) => [k, v.name]))}
          </div>
          <div class="results-bar">
            <p class="results-bar__count" id="results-count" aria-live="polite"></p>
            <button type="button" class="btn btn--ghost btn--small" id="reset-filters">Reset filters</button>
          </div>
        </div>
        <div id="results"></div>
      </section>`;

    bindLibrary();
    renderResults();
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

  function bindLibrary() {
    const q = document.getElementById("f-q");
    q.addEventListener("input", () => { filters.q = q.value.trim(); renderResults(); });

    app.querySelectorAll(".filters select").forEach((sel) => {
      sel.addEventListener("change", () => {
        filters[sel.dataset.key] = sel.value;
        sel.classList.toggle("is-set", !!sel.value);
        if (sel.dataset.key === "time") syncTimeButtons();
        renderResults();
      });
    });

    document.getElementById("reset-filters").addEventListener("click", resetFilters);

    app.querySelectorAll(".time-picker button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.time;
        filters.time = filters.time === id ? "" : id;
        const sel = document.getElementById("f-time");
        sel.value = filters.time;
        sel.classList.toggle("is-set", !!filters.time);
        syncTimeButtons();
        renderResults();
        if (filters.time) document.getElementById("library").scrollIntoView({ block: "start" });
      });
    });
  }

  function syncTimeButtons() {
    app.querySelectorAll(".time-picker button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.time === filters.time)));
  }

  function resetFilters() {
    filters = defaultFilters();
    document.getElementById("f-q").value = "";
    app.querySelectorAll(".filters select").forEach((s) => { s.value = ""; s.classList.remove("is-set"); });
    syncTimeButtons();
    renderResults();
    document.getElementById("f-q").focus();
  }

  function activeFilterNames() {
    const names = [];
    if (filters.q) names.push(`“${filters.q}”`);
    if (filters.area) names.push(areaById[filters.area].name);
    if (filters.level) names.push(levelById[filters.level].name);
    if (filters.grade) names.push(gradeById[filters.grade].name);
    if (filters.time) names.push(durations.find((d) => d.id === filters.time).name);
    if (filters.equip) names.push(equipment[filters.equip].name);
    return names;
  }

  function renderResults() {
    const list = sortActivities(activities.filter((a) => matches(a, filters)));
    const active = activeFilterNames();
    const count = document.getElementById("results-count");
    const results = document.getElementById("results");
    const resetBtn = document.getElementById("reset-filters");

    resetBtn.hidden = active.length === 0;
    count.innerHTML = active.length
      ? `${plural(list.length, "activity", "activities")} <span>matching ${esc(active.join(" · "))}</span>`
      : `All ${activities.length} activities`;

    if (!list.length) {
      results.innerHTML = `
        <div class="empty" role="status">
          ${icon("mountain")}
          <h3>No activities match all of those filters</h3>
          <p>Try removing one filter, choosing a longer time, or searching for a broader word like “code” or “build.” You can also start fresh.</p>
          <button type="button" class="btn btn--primary" id="empty-reset">Reset filters</button>
        </div>`;
      document.getElementById("empty-reset").addEventListener("click", resetFilters);
      return;
    }
    results.innerHTML = `<div class="cards">${list.map((a) => activityCard(a)).join("")}</div>`;
  }

  function viewArea(id) {
    const area = areaById[id];
    if (!area) return viewNotFound();
    const list = sortActivities(activities.filter((a) => a.area === id));

    app.innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${backLink()}</div>
          <div class="page-top__head">
            <span class="icon-badge">${icon(area.icon)}</span>
            <div>
              <span class="eyebrow">Exploration area</span>
              <h1 tabindex="-1">${esc(area.name)}</h1>
            </div>
          </div>
          <p class="page-top__lede">${esc(area.description)}</p>
          <ul class="topic-list" aria-label="Topics in this area">
            ${area.topics.map((t) => `<li class="chip">${esc(t)}</li>`).join("")}
          </ul>
        </div>
      </section>

      ${id === "coding" ? `
        <section class="wrap section">
          <div class="notice" style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between">
            <p><strong>New to coding, or ready for the next step?</strong> The coding pathway shows seven stages with an “I can” check for each one.</p>
            <a class="btn btn--primary btn--small" href="#/pathway">Open the coding pathway ${icon("arrowRight")}</a>
          </div>
        </section>` : ""}

      <section class="wrap section" aria-labelledby="area-acts">
        <div class="section__head">
          <div>
            <span class="eyebrow">Choose your next adventure</span>
            <h2 id="area-acts">${plural(list.length, "activity", "activities")}</h2>
          </div>
          <a class="btn btn--ghost btn--small" href="#/library" data-filter-area="${area.id}">Filter in the full library ${icon("arrowRight")}</a>
        </div>
        <div class="cards">${list.map((a) => activityCard(a)).join("")}</div>
      </section>`;

    app.querySelector("[data-filter-area]").addEventListener("click", () => {
      filters = { ...defaultFilters(), area: area.id };
    });
  }

  function viewActivity(id) {
    const a = activityById[id];
    if (!a) return viewNotFound();
    const area = areaById[a.area];
    const stage = a.pathwayStage ? pathway.find((s) => s.stage === a.pathwayStage) : null;
    const related = sortActivities(activities.filter((x) => x.area === a.area && x.id !== a.id)).slice(0, 3);

    app.innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">
            ${backLink()}
            <nav class="crumbs" aria-label="Breadcrumb">
              <a href="#/area/${area.id}">${esc(area.name)}</a> / <span aria-current="page">${esc(a.title)}</span>
            </nav>
          </div>
          <div class="page-top__head">
            <span class="icon-badge">${icon(area.icon)}</span>
            <div>
              <span class="eyebrow">${esc(area.name)}${stage ? ` · Pathway stage ${stage.stage}` : ""}</span>
              <h1 tabindex="-1">${esc(a.title)}</h1>
            </div>
          </div>
          <p class="page-top__lede">${esc(a.summary)}</p>
          ${a.source === "original" ? `<span class="label-original">${icon("flag")}Original STEM Explorers sample lesson</span>` : ""}
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
              <div>
                <h3>Materials</h3>
                <ul class="bullets">${a.before.materials.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
              </div>
              <div>
                <h3>Setup</h3>
                <ul class="bullets">${a.before.setup.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
              </div>
              <div class="prep__full">
                <h3>Prerequisites</h3>
                <p>${esc(a.before.prerequisites)}</p>
              </div>
            </div>
          </section>

          ${a.vr ? `
          <section class="block" aria-labelledby="s-vr">
            <h2 id="s-vr">${icon("headset")}VR setup for teachers</h2>
            <ul class="bullets">${a.vr.setup.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
            <h3>Taking part without a headset</h3>
            <p>${esc(a.vr.nonHeadset)}</p>
          </section>` : ""}

          <section class="block" aria-labelledby="s-steps">
            <h2 id="s-steps">${icon("list")}Your steps</h2>
            <ol class="steps">${a.steps.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ol>
          </section>

          ${launchPanel(a, "s-launch")}

          <section class="block block--reflect" aria-labelledby="s-reflect">
            <h2 id="s-reflect">${icon("question")}Think about it</h2>
            <p>${esc(a.reflect)}</p>
          </section>

          <section class="block block--extend" aria-labelledby="s-extend">
            <h2 id="s-extend">${icon("rocket")}Take it further</h2>
            <p>${esc(a.extend)}</p>
          </section>

          <details class="block teacher-notes" open>
            <summary><h2>${icon("clipboard")}Teacher notes</h2><span class="toggle-hint" aria-hidden="true"></span></summary>
            <div class="teacher-notes__body">
              <ul class="bullets">${a.teacherNotes.map((x) => `<li><span>${esc(x)}</span></li>`).join("")}</ul>
              ${stage ? `<p><strong>Pathway check (Stage ${stage.stage}):</strong> “${esc(stage.iCan)}” <a href="#/pathway#stage-${stage.stage}">See the stage</a></p>` : ""}
            </div>
          </details>
        </div>

        <aside class="aside" aria-label="Activity at a glance">
          <div class="block launch-mini">
            <h2>At a glance</h2>
            ${factsList(a)}
            ${quickLaunch(a)}
          </div>
          <div class="block">
            <h2>Before you launch</h2>
            ${requirementsList(a)}
          </div>
        </aside>
      </div>

      ${related.length ? `
      <section class="wrap section" aria-labelledby="related-title">
        <div class="section__head">
          <div>
            <span class="eyebrow">More in ${esc(area.short)}</span>
            <h2 id="related-title">Explore the lab</h2>
          </div>
          <a class="btn btn--ghost btn--small" href="#/">${icon("arrowLeft")}Back to dashboard</a>
        </div>
        <div class="cards">${related.map((r) => activityCard(r)).join("")}</div>
      </section>` : ""}`;
  }

  function quickLaunch(a) {
    if (a.launch.status === "ready") {
      return `<a class="btn btn--launch" href="${esc(a.launch.url)}" target="_blank" rel="noopener noreferrer">
        ${icon("rocket")}Launch activity<span class="visually-hidden">: ${esc(a.launch.label)} (opens in a new tab)</span></a>`;
    }
    if (a.launch.status === "coming-soon") {
      return `<a class="btn btn--ghost" href="#s-launch" data-jump="s-launch">${icon("clock")}Resource coming soon</a>`;
    }
    return `<a class="btn btn--ghost" href="#s-steps" data-jump="s-steps">${icon("list")}Start with step 1</a>`;
  }

  function launchPanel(a, id) {
    if (a.launch.status === "ready") {
      return `
        <section class="launch-panel" aria-labelledby="${id}">
          <h2 id="${id}">Launch activity</h2>
          <p class="launch-panel__note">${esc(a.launch.note)}</p>
          <a class="btn btn--launch" href="${esc(a.launch.url)}" target="_blank" rel="noopener noreferrer">
            ${icon("rocket")}${esc(a.launch.label)}<span class="visually-hidden"> (opens in a new tab)</span>
            ${icon("external")}
          </a>
          <p class="launch-panel__small">Opens ${esc(a.launch.provider)} in a new tab, so this page stays open. ${a.access.accountNote ? esc(a.access.accountNote) : ""}</p>
        </section>`;
    }
    if (a.launch.status === "coming-soon") {
      return `
        <section class="launch-panel launch-panel--soon" aria-labelledby="${id}">
          <h2 id="${id}">${icon("clock", 'style="width:1.4rem;height:1.4rem;fill:none;stroke:currentColor;stroke-width:2;vertical-align:-3px;margin-right:.4rem"')}Resource coming soon</h2>
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

  function requirementsList(a) {
    const rows = [];
    const ok = (title, text) => `<li class="ok">${icon("check")}<span><strong>${esc(title)}</strong>${text ? `<small>${esc(text)}</small>` : ""}</span></li>`;
    const warn = (title, text) => `<li class="warn">${icon("alert")}<span><strong>${esc(title)}</strong>${text ? `<small>${esc(text)}</small>` : ""}</span></li>`;

    if (a.access.account === "none") rows.push(ok("No account needed", a.access.accountNote));
    else if (a.access.account === "optional") rows.push(ok("Account optional", a.access.accountNote));
    else rows.push(warn("Account required", a.access.accountNote));

    rows.push(a.access.cost === "paid" ? warn("Paid resource", "Check your program's license before class.") : ok("Free to use"));

    if (a.access.hardware && a.access.hardware.length) rows.push(warn("Hardware", a.access.hardware.join(". ") + "."));
    else rows.push(ok("No special hardware"));

    rows.push(a.access.supervision
      ? warn("Teacher supervision", a.area === "ai" ? "Run this as a teacher-guided activity. Students don't enter personal information." : "An adult should guide or monitor this activity.")
      : ok("Students can work with light guidance"));

    rows.push(ok(formats[a.format].name, formats[a.format].hint));
    return `<ul class="reqs">${rows.join("")}</ul>`;
  }

  function viewPathway() {
    app.innerHTML = `
      <section class="page-top">
        <div class="wrap page-top__inner">
          <div class="backbar">${backLink()}</div>
          <div class="page-top__head">
            <span class="icon-badge">${icon("code")}</span>
            <div>
              <span class="eyebrow">Coding & Computer Science</span>
              <h1 tabindex="-1">The coding pathway</h1>
            </div>
          </div>
          <p class="page-top__lede">Seven stages organized by readiness, not by grade. Suggested grades help you choose a starting point. Students move on when they can show the “I can” statement, at their own pace.</p>
        </div>
      </section>

      <div class="wrap pathway-intro">
        <div class="block">
          <h2>${icon("flag", 'style="width:1.3rem;height:1.3rem;fill:none;stroke:var(--teal);stroke-width:2;vertical-align:-3px;margin-right:.35rem"')}Pick a starting stage</h2>
          <p>Read the prerequisites. If students can already do them, start there. A quick review of an earlier stage never hurts.</p>
        </div>
        <div class="block">
          <h2>${icon("bug", 'style="width:1.3rem;height:1.3rem;fill:none;stroke:var(--teal);stroke-width:2;vertical-align:-3px;margin-right:.35rem"')}Debug at every stage</h2>
          <p>Every stage has its own debugging habit. Finding and fixing mistakes is part of the learning, not a detour.</p>
        </div>
        <div class="block">
          <h2>${icon("check", 'style="width:1.3rem;height:1.3rem;fill:none;stroke:var(--teal);stroke-width:2;vertical-align:-3px;margin-right:.35rem"')}Check with “I can”</h2>
          <p>Each “I can” statement is something you can watch a student do. When they can, they're ready for the next stage.</p>
        </div>
      </div>

      <ol class="wrap stages">
        ${pathway.map((s) => `
          <li class="stage" id="stage-${s.stage}">
            <div class="stage__node" aria-hidden="true"><div><small>Stage</small><b>${s.stage}</b></div></div>
            <article class="block stage__card" aria-labelledby="stage-title-${s.stage}">
              <div>
                <h2 id="stage-title-${s.stage}"><span class="visually-hidden">Stage ${s.stage}: </span>${esc(s.title)}</h2>
                <p class="stage__concepts">${esc(s.concepts)}</p>
              </div>
              <div class="stage__grid">
                <div><h3>Learning goal</h3><p>${esc(s.goal)}</p></div>
                <div><h3>Project</h3><p>${esc(s.project)}</p></div>
                <div><h3>Prerequisite</h3><p>${esc(s.prerequisite)}</p></div>
                <div><h3>Debugging habit</h3><p>${esc(s.debugging)}</p></div>
                <div class="prep__full"><h3>Suggested starting point</h3><p>${esc(s.suggestedStart)}</p></div>
              </div>
              <p class="ican">${icon("check")}<span><span class="visually-hidden">Readiness check: </span>${esc(s.iCan)}</span></p>
              <div class="stage__links">
                ${s.activities.map((id) => activityById[id]).filter(Boolean).map((a) => `
                  <a class="btn btn--ghost btn--small" href="#/activity/${a.id}">${icon(areaById[a.area].icon)}${esc(a.title)} · ${a.duration} min</a>`).join("")}
              </div>
            </article>
          </li>`).join("")}
      </ol>`;
  }

  function viewNotFound() {
    app.innerHTML = `
      <section class="wrap section">
        <div class="empty">
          ${icon("mountain")}
          <h1 tabindex="-1" style="font-size:var(--step-3)">We couldn’t find that page</h1>
          <p>The activity may have moved or the link may be mistyped.</p>
          <a class="btn btn--primary" href="#/">${icon("arrowLeft")}Back to dashboard</a>
        </div>
      </section>`;
  }

  const backLink = () => `<a class="back-link" href="#/">${icon("arrowLeft")}Dashboard</a>`;

  /* ───────── Router ───────── */
  function parseRoute() {
    const raw = location.hash.replace(/^#/, "");
    // Allow "#/pathway#stage-3" style links to a section on a page.
    const [path, anchor] = raw.split("#");
    const parts = path.split("/").filter(Boolean);
    return { name: parts[0] || "", id: parts[1] || "", anchor: anchor || "" };
  }

  let lastRouteKey = null;
  function route() {
    const r = parseRoute();
    const key = `${r.name}/${r.id}`;
    if (key === lastRouteKey && r.anchor) { jumpTo(r.anchor); return; }
    lastRouteKey = key;

    let navKey = "dashboard";
    if (r.name === "" || r.name === "library") { viewDashboard(); document.title = "STEM Explorers"; }
    else if (r.name === "area") { viewArea(r.id); navKey = ""; document.title = `${areaById[r.id]?.name || "Not found"} · STEM Explorers`; }
    else if (r.name === "activity") { viewActivity(r.id); navKey = ""; document.title = `${activityById[r.id]?.title || "Not found"} · STEM Explorers`; }
    else if (r.name === "pathway") { viewPathway(); navKey = "pathway"; document.title = "Coding pathway · STEM Explorers"; }
    else if (activityById[r.name] || /^s-/.test(r.name)) { return; } // in-page anchors
    else { viewNotFound(); navKey = ""; }

    if (r.name === "library") navKey = "library";
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a.dataset.nav === navKey) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    // Move focus and scroll for each new view so keyboard and screen reader users land in the right place.
    if (r.name === "library") {
      const lib = document.getElementById("library");
      lib.scrollIntoView({ block: "start" });
      document.getElementById("library-title").focus({ preventScroll: true });
    } else if (r.anchor) {
      jumpTo(r.anchor);
    } else {
      window.scrollTo(0, 0);
      const h1 = app.querySelector("h1");
      if (h1 && lastRouteKey !== null && document.readyState === "complete") h1.focus({ preventScroll: true });
    }
  }

  function jumpTo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    const target = el.querySelector("h2") || el;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  // In-page jump buttons (e.g. "Start with step 1") shouldn't change the route.
  app.addEventListener("click", (e) => {
    const j = e.target.closest("[data-jump]");
    if (!j) return;
    e.preventDefault();
    jumpTo(j.dataset.jump);
  });

  // Account for the sticky header when jumping to sections.
  const setScrollPad = () => {
    const h = document.querySelector(".site-header").offsetHeight;
    document.documentElement.style.scrollPaddingTop = `${h + 12}px`;
  };
  window.addEventListener("resize", setScrollPad);

  /* ───────── Projector mode (per-device convenience) ───────── */
  const projBtn = document.getElementById("projector-toggle");
  const setProjector = (on) => {
    document.documentElement.classList.toggle("projector", on);
    projBtn.setAttribute("aria-pressed", String(on));
    try { localStorage.setItem("stem-explorers-projector", on ? "1" : "0"); } catch (e) { /* storage unavailable */ }
    setScrollPad();
  };
  projBtn.addEventListener("click", () => setProjector(!document.documentElement.classList.contains("projector")));
  try { if (localStorage.getItem("stem-explorers-projector") === "1") setProjector(true); } catch (e) { /* ignore */ }

  window.addEventListener("hashchange", route);
  setScrollPad();
  route();
})();
