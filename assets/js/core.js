/*
 * STEM 207 — shared helpers, icons, and lookups.
 * Every other script hangs off the global `SE` namespace.
 */
(function () {
  "use strict";
  const STEM = window.STEM;
  const SE = (window.SE = window.SE || {});

  /* ───────── Lookups ───────── */
  SE.areaById = Object.fromEntries(STEM.areas.map((a) => [a.id, a]));
  SE.levelById = Object.fromEntries(STEM.levels.map((l) => [l.id, l]));
  SE.gradeById = Object.fromEntries(STEM.gradeBands.map((g) => [g.id, g]));
  SE.activityById = Object.fromEntries(STEM.activities.map((a) => [a.id, a]));
  SE.levelOrder = Object.fromEntries(STEM.levels.map((l, i) => [l.id, i]));
  SE.patchById = Object.fromEntries(STEM.progression.patches.map((p) => [p.id, p]));
  SE.pictureById = Object.fromEntries(STEM.progression.pictures.map((p) => [p.id, p]));

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
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
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
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 16l-4-4 4-4M6 12h10"/>',
    map: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    message: '<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
    /* Picture-code symbols */
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>',
    comet: '<circle cx="15.5" cy="8.5" r="3.5"/><path d="M12.8 11.2L4 20M10.5 8.2L3.5 15.2M15.8 12L9.2 18.6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    wave: '<path d="M2 10c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-3 5-1.5M2 16c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-3 5-1.5"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l8-8"/>',
    crystal: '<path d="M12 2l6 6-6 14-6-14z"/><path d="M6 8h12M10 8l2 14 2-14"/>',
    telescope: '<path d="M3 11l13-5 2 5-13 5z"/><path d="M10 14l-3 7M11 14l3 7M18 8.5l3-1"/>',
    pine: '<path d="M12 2.5 7.2 9h3L6 14.5h4L6 19.5h12l-4-5h4L13.8 9h3z"/><path d="M12 19.5v3"/>',
    boat: '<path d="M2.5 15h19l-2.6 5H5.2z"/><path d="M6.5 15v-5h7l2.5 5"/><path d="M9 10V5.5M9 5.5h3"/>',
    snowflake: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="M9.5 3.6 12 6l2.5-2.4M9.5 20.4 12 18l2.5 2.4"/>',
    buoy: '<rect x="9" y="6" width="6" height="12" rx="3"/><path d="M9 11h6M12 6V2.5M5 21c2.3-1.4 4.7 1.4 7 0s4.7 1.4 7 0"/>',
    lighthouse: '<path d="M9 21l1.2-12h3.6L15 21z"/><path d="M8.5 9h7M10 6h4l-.5 3h-3z"/><path d="M12 3v3M4 6l4 1.5M20 6l-4 1.5M6 21h12"/>'
  };
  SE.icon = (name, extra = "") =>
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ${extra}>${ICONS[name] || ""}</svg>`;
  SE.iconPaths = (name) => ICONS[name] || "";

  /* Brand artwork (logo, Maine mark, pine) lives in brand.js. */

  /* ───────── Text and number helpers ───────── */
  SE.esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  SE.plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  SE.num = (n) => Math.round(n).toLocaleString("en-US");

  SE.gradesText = (ids) => {
    const nums = ids.map((id) => id.split("-").map(Number)).flat();
    return `Grades ${Math.min(...nums)}–${Math.max(...nums)}`;
  };
  SE.levelMarkup = (id) => {
    const l = SE.levelById[id];
    const pips = [1, 2, 3].map((n) => `<i class="${n <= l.pips ? "on" : ""}"></i>`).join("");
    return `<span class="level"><span class="level__pips" aria-hidden="true">${pips}</span>${SE.esc(l.name)}</span>`;
  };
  SE.equipmentText = (keys) => keys.map((k) => STEM.equipment[k]?.name || k).join(", ");

  const DAY = 86400000;
  SE.DAY = DAY;
  SE.startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  SE.timeAgo = (t) => {
    const diff = Date.now() - t;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    const today = SE.startOfDay(Date.now());
    if (t >= today) return `today, ${new Date(t).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    if (t >= today - DAY) return "yesterday";
    const days = Math.ceil((today - t) / DAY);
    if (days < 7) return `${days} days ago`;
    return new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  SE.dateShort = (t) => new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  /* Deterministic random numbers, so drawings and demo data look the same every time. */
  SE.rng = (seed) => {
    let s = 0;
    for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  SE.uid = (prefix) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

  /* Small toast for confirmations ("Saved", "Note sent"). */
  SE.toast = (msg) => {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(SE._toastT);
    SE._toastT = setTimeout(() => el.classList.remove("is-on"), 2600);
  };
})();
