/*
 * STEM 207 — drawn elements: rank insignia, mission patches,
 * the expedition star map, and the class goal track.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const STEM = window.STEM;
  const P = STEM.progression;
  let uid = 0;

  /* Fixed object colors: insignia and patches are "physical" objects, so they keep
     their colors in both themes, like a real embroidered patch would. */
  const C = { navy: "#012d2b", navyDeep: "#01201e", teal: "#037872", tealLight: "#b9e27f", orange: "#94c93d", cream: "#f7f6f0", ink: "#01201e" };

  function starPath(cx, cy, r) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
    }
    return `M${pts.join("L")}Z`;
  }

  /* Rank insignia: a shield with chevrons and stars. */
  SE.insignia = (rank, size = 40) => {
    const chev = [];
    for (let i = 0; i < rank.chevrons; i++) {
      const y = 40 - i * 8;
      chev.push(`<polyline points="13,${y - 6} 24,${y} 35,${y - 6}" fill="none" stroke="${C.orange}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    const starX = { 1: [24], 2: [18, 30], 3: [14, 24, 34] }[rank.stars] || [];
    const stars = starX.map((x) => `<path d="${starPath(x, 15, 4.4)}" fill="${C.cream}"/>`).join("");
    const dot = rank.chevrons === 0 ? `<circle cx="24" cy="30" r="5" fill="none" stroke="${C.tealLight}" stroke-width="2.5"/>` : "";
    return `<svg class="insignia" width="${size}" height="${Math.round(size * 1.15)}" viewBox="0 0 48 55" role="img" aria-label="${SE.esc(rank.name)} insignia">
      <path d="M24 2 L44 9 V28 C44 41 35 49 24 53 C13 49 4 41 4 28 V9 Z" fill="${C.navy}" stroke="${C.tealLight}" stroke-width="2"/>
      ${stars}${chev.join("")}${dot}
    </svg>`;
  };

  /* Mission patch: an embroidered-style roundel with the name stitched along the bottom. */
  SE.patchArt = (patch, earned, size = 96) => {
    const id = `arc${++uid}`;
    const ring = { teal: C.teal, orange: C.orange, navy: C.navy }[patch.ring] || C.teal;
    const inner = patch.ring === "navy" ? "#037872" : C.navy;
    const cls = earned ? "patch" : "patch patch--locked";
    const ink = patch.ring === "orange" ? C.ink : C.cream; // dark lettering on the lime ring
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${SE.esc(patch.name)} patch${earned ? "" : ", not earned yet"}">
      <defs><path id="${id}" d="M 13 60 A 47 47 0 0 0 107 60"/></defs>
      <circle class="patch__ring" cx="60" cy="60" r="57" fill="${ring}"/>
      <circle class="patch__stitch" cx="60" cy="60" r="53" fill="none" stroke="${ink}" stroke-width="1.6" stroke-dasharray="3 3"/>
      <circle class="patch__inner" cx="60" cy="60" r="42" fill="${inner}"/>
      <g class="patch__icon" transform="translate(39 31) scale(1.75)" fill="none" stroke="${C.cream}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${SE.iconPaths(patch.icon)}</g>
      <text class="patch__text" font-family="Montserrat, sans-serif" font-weight="700" font-size="9.5" letter-spacing="1" fill="${ink}">
        <textPath href="#${id}" startOffset="50%" text-anchor="middle">${SE.esc(patch.name.toUpperCase())}</textPath>
      </text>
      ${earned ? "" : `<g transform="translate(46 46)"><circle cx="14" cy="14" r="14" class="patch__lockbg"/><g transform="translate(5 5) scale(.75)" fill="none" class="patch__lock" stroke-width="2.4" stroke-linecap="round">${SE.iconPaths("lock")}</g></g>`}
    </svg>`;
  };

  /* Expedition map: each exploration area is a constellation; each activity a star. */
  const SECTORS = [[170, 125], [480, 95], [800, 130], [250, 315], [570, 320], [860, 310]];
  SE.starMap = (prof, recIds = [], opts = {}) => {
    const parts = [];
    const labels = [];
    // Faint background stars
    const bg = SE.rng("sky");
    for (let i = 0; i < 70; i++) {
      parts.push(`<circle cx="${(bg() * 960).toFixed(1)}" cy="${(bg() * 440).toFixed(1)}" r="${(bg() * 1.2 + 0.3).toFixed(2)}" fill="${C.cream}" opacity="${(bg() * 0.35 + 0.1).toFixed(2)}"/>`);
    }
    STEM.areas.forEach((area, ai) => {
      const [cx, cy] = SECTORS[ai];
      const acts = STEM.activities.filter((a) => a.area === area.id && !(SE.hiddenForUser && SE.hiddenForUser(a)));
      const r = SE.rng(`sector-${area.id}`);
      const pts = acts.map((a, i) => {
        const ang = (i / acts.length) * Math.PI * 2 + r() * 0.8;
        const rad = 28 + r() * 48;
        return { a, x: cx + Math.cos(ang) * rad * 1.25, y: cy + Math.sin(ang) * rad * 0.8 };
      });
      // Constellation guide lines (faint), then lines between completed stars (bright)
      for (let i = 1; i < pts.length; i++) {
        parts.push(`<line x1="${pts[i - 1].x.toFixed(1)}" y1="${pts[i - 1].y.toFixed(1)}" x2="${pts[i].x.toFixed(1)}" y2="${pts[i].y.toFixed(1)}" stroke="${C.tealLight}" stroke-opacity=".14" stroke-width="1" stroke-dasharray="2 4"/>`);
      }
      const done = pts.filter((p) => prof && prof.completedIds.has(p.a.id));
      for (let i = 1; i < done.length; i++) {
        parts.push(`<line x1="${done[i - 1].x.toFixed(1)}" y1="${done[i - 1].y.toFixed(1)}" x2="${done[i].x.toFixed(1)}" y2="${done[i].y.toFixed(1)}" stroke="${C.orange}" stroke-opacity=".75" stroke-width="2"/>`);
      }
      pts.forEach((p) => {
        const isDone = prof && prof.completedIds.has(p.a.id);
        const isRec = recIds.includes(p.a.id);
        const state = isDone ? "completed" : isRec ? "suggested for you" : "not explored yet";
        const mark = isDone
          ? `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="13" fill="${C.orange}" opacity=".18"/><path d="${starPath(p.x, p.y, 8.5)}" fill="${C.orange}" stroke="${C.cream}" stroke-width=".8"/>`
          : isRec
            ? `<circle class="map-pulse" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="9" fill="none" stroke="${C.tealLight}" stroke-width="2"/><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${C.tealLight}"/>`
            : `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.6" fill="${C.cream}" opacity=".55"/>`;
        // Decorative maps (the sign-in background) draw stars without links, so they aren't tab stops.
        parts.push(opts.decorative ? `<g>${mark}</g>` : `<a href="#/activity/${p.a.id}" class="map-star" aria-label="${SE.esc(p.a.title)}, ${state}">
          <title>${SE.esc(p.a.title)} (${state})</title>
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="16" fill="transparent"/>${mark}</a>`);
      });
      const count = done.length;
      labels.push(`<text x="${cx}" y="${cy + 92}" text-anchor="middle" class="map-label">${SE.esc(area.short.toUpperCase())}</text>
        <text x="${cx}" y="${cy + 108}" text-anchor="middle" class="map-count">${count} of ${acts.length} stars</text>`);
    });
    // A pine ridge along the bottom: the Maine North Woods under a dark-sky night.
    const pr = SE.rng("starmap-ridge");
    const pines = [];
    for (let x = -10; x < 970; x += 10 + pr() * 12) {
      const h = 24 + pr() * 44;
      pines.push(`<use href="#mapPine" x="${x.toFixed(1)}" y="${(492 - h).toFixed(1)}" width="${(h * 117 / 332).toFixed(1)}" height="${h.toFixed(1)}"/>`);
    }
    return `<svg class="starmap" viewBox="0 0 960 500" role="group" aria-label="Expedition map of the Maine night sky. Each star is a mission; completed missions light up.">
      <defs><symbol id="mapPine" viewBox="1138 172 117 332"><path d="${SE.brand.PINE_D}"/></symbol>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.navyDeep}"/><stop offset=".8" stop-color="${C.navy}"/><stop offset="1" stop-color="#0a6f6a"/></linearGradient></defs>
      <rect width="960" height="500" fill="url(#skyGrad)"/>
      ${parts.join("")}${labels.join("")}
      <path d="M0 470 L120 452 L210 462 L330 440 L420 455 L560 438 L700 458 L820 446 L960 460 V500 H0Z" fill="#063532"/>
      <g fill="#011817">${pines.join("")}</g><rect y="490" width="960" height="10" fill="#011817"/>
    </svg>`;
  };

  /* Class goal: a route up the Maine coast and inland to Katahdin, with the class's position on it. */
  SE.goalTrack = (goal) => {
    const g = P.classGoal;
    const pos = (goal.index + goal.progress) / (g.length - 1);
    return `
      <div class="goal">
        <div class="goal__track" role="img" aria-label="Class journey: ${SE.num(goal.points)} class points. Reached ${SE.esc(goal.reached.name)}${goal.next ? `, ${Math.round(goal.progress * 100)}% of the way to ${SE.esc(goal.next.name)}` : ""}.">
          <div class="goal__fill" style="width:${(pos * 100).toFixed(1)}%"></div>
          ${g.map((m, i) => `<span class="goal__stop ${i <= goal.index ? "is-reached" : ""}" style="left:${((i / (g.length - 1)) * 100).toFixed(1)}%"></span>`).join("")}
          <span class="goal__ship" style="left:${(pos * 100).toFixed(1)}%">${SE.icon("boat")}</span>
        </div>
        <ol class="goal__labels" aria-hidden="true">
          ${g.map((m, i) => `<li class="${i <= goal.index ? "is-reached" : ""} ${i === goal.index ? "is-current" : ""} ${i === goal.index + 1 ? "is-next" : ""}" style="left:${((i / (g.length - 1)) * 100).toFixed(1)}%"><b>${SE.esc(m.name)}</b><span>${SE.num(m.pts)} pts</span></li>`).join("")}
        </ol>
      </div>`;
  };
})();
