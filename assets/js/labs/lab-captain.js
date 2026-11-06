/*
 * Captain Code — Program a Lobster Boat Along the Maine Coast (lab id "captain-code").
 * The flagship coding workshop: 90 minutes, grades 2–8. Casco Bay (10 levels) is the workshop; Penobscot Bay
 * and Down East (12 each) are for students who finish early. Levels live in captain-levels.js.
 *
 * Built on Harbor Code's engine (harbor-engine.js: run, check, sail, fog sight) and block editor
 * (harbor-editor.js, with Undo/Redo here). What Captain Code adds on top:
 *   predict first (tap where the boat will stop), plot your course (the run shows where it left the plan),
 *   real fog (only the squares around the boat are drawn), channels (one program must pass every map),
 *   block budgets that still let a working route run and then ask for a smarter one, three marks per level
 *   (Made it, Par, Compass), feedback that names the student's own numbers, Extra help, an educator Demo,
 *   See your code in Python side by side, a free-build chart designer, a Voyage Card, and a certificate.
 * Pure helpers for tests: SE.captain.feedback(L, result, ctx), SE.captain.marks(L, ctx), SE.captain.LEVELS.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const H = SE.harbor;
  const { CASCO, PENOBSCOT, DOWNEAST } = SE.captainLevels;
  const LEVELS = [...CASCO, ...PENOBSCOT, ...DOWNEAST];
  const REGIONS = [
    { title: "Casco Bay", short: "Casco Bay", from: 0, to: CASCO.length - 1, blurb: "The workshop: ten levels, from your first program to a voyage you design yourself." },
    { title: "Penobscot Bay", short: "Penobscot Bay", from: CASCO.length, to: CASCO.length + PENOBSCOT.length - 1, blurb: "Rockland, Vinalhaven, and the islands: the same ideas, combined in new ways." },
    { title: "Down East", short: "Down East", from: CASCO.length + PENOBSCOT.length, to: LEVELS.length - 1, blurb: "Big tides and narrow passages. Nested loops, wall-following, and your own navigation toolkit." }
  ];
  const DIR_WORD = { N: "north", E: "east", S: "south", W: "west" };
  const pyOpts = (L) => ({ varName: L.varName, goal: "mooring" });
  const HELP_KEY = "stem207.captain.help";
  const helpOn = () => { try { return sessionStorage.getItem(HELP_KEY) === "1"; } catch (e) { return false; } };
  const setHelp = (on) => { try { sessionStorage.setItem(HELP_KEY, on ? "1" : "0"); } catch (e) { /* private mode */ } };

  /* Block words for a level: the mooring, the level's variable and its own block. */
  const labeler = (L) => (type) => {
    const v = L.varName || "steps";
    if (type === "call") return L.fnName || "My Move";
    if (type === "untilGoal") return "Repeat until at mooring";
    if (type === "setVar") return `Set ${v} to`;
    if (type === "changeVar") return `Change ${v} by`;
    if (type === "repeatVar") return `Repeat ${v} times`;
    return H.BLOCKS[type].label;
  };

  /* ───────── The student's own boat (My harbor), or the standard one ───────── */
  function boatFor(user) {
    const B = SE.base || {};
    const custom = user && user.role === "student" && B.customFor ? B.customFor(user.id) : {};
    const b = Object.assign({ hull: 0, stripe: 2, a: 0, b: 0 }, custom.boat || {});
    const hulls = B.HULLS || ["#f7f6f0"], stripes = B.BUOY_COLORS || ["#e9603f", "#f2c14e", "#94c93d"];
    const named = !!(custom.boat && B.NAME_A);
    return { hull: hulls[b.hull] || hulls[0], stripe: stripes[b.stripe] || "#94c93d", name: named ? `${B.NAME_A[b.a]} ${B.NAME_B[b.b]}` : "" };
  }
  const boatSvg = (boat, cls = "cc-boat__svg") => `<svg viewBox="0 0 40 40" class="${cls}" aria-hidden="true">
      <path d="M2 30 Q-1 20 2 10" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
      <path d="M5 11 H25 Q36 13 39 20 Q36 27 25 29 H5 Q3.5 20 5 11 Z" fill="${boat.hull}" stroke="#01201e" stroke-width="2" stroke-linejoin="round"/>
      <path d="M6 14.5 H25 Q32 16 35 20 Q32 24 25 25.5 H6" fill="none" stroke="${boat.stripe}" stroke-width="2"/>
      <rect x="15" y="14" width="10" height="12" rx="2" fill="#012d2b"/>
      <rect x="22" y="15.5" width="2.5" height="9" rx="1" fill="#b9e2f5"/>
      <rect x="7" y="16" width="5" height="8" rx="1" fill="#e9603f" stroke="#01201e" stroke-width="1"/>
    </svg>`;

  /* ───────── Feedback: specific, encouraging, with the student's own numbers ───────── */
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  /* How many squares the boat could still sail straight ahead to reach the mooring (0 = it can't). */
  function shortBy(g, st) {
    const [dx, dy] = H.DIRS[st.dir];
    for (let k = 1; k <= 4; k++) {
      const x = st.x + dx * k, y = st.y + dy * k;
      if (H.isWall(g, x, y)) return 0;
      if (x === g.goal[0] && y === g.goal[1]) return k;
    }
    return 0;
  }
  const hasType = (list, type) => list.some((b) => b.type === type || (b.body && hasType(b.body, type)) || (b.else && hasType(b.else, type)));
  function overBudgetTip(L) {
    if (/Function/.test(L.concept)) return `Can your own block, ${L.fnName}, do the job that repeats?`;
    if (/Variable/.test(L.concept)) return "Can a variable let one loop sail sides of different lengths?";
    if (/if/i.test(L.concept)) return "Can the boat decide for itself with an if block, instead of following one fixed route?";
    return "Can you find a repeating pattern and use one loop to make it shorter?";
  }
  /* result: SE.harbor.check(...). ctx: { g, st, program, fn, count, lastTurn, world } */
  function feedback(L, result, ctx) {
    const v = result.values;
    switch (result.reason) {
      case "crash": return ctx.lastTurn
        ? "There's a granite ledge ahead. Your last turn pointed the bow at it. Was that the boat's left, or yours? Check the highlighted block."
        : "There's a granite ledge ahead. The highlighted block tried to sail into it. Count the open squares before that block.";
      case "nogem": return "There's no trap buoy on this square. Haul trap only works when the boat is right on a buoy.";
      case "nospot": return "This square isn't an empty dashed circle. Set trap only works on one.";
      case "empty": return "There are no traps on the boat to set. Haul a trap first, then set it on a dashed circle.";
      case "loop": return "The boat went around and around and never reached the mooring. Make sure something in the loop moves the boat closer.";
      case "short": {
        const k = ctx.g ? shortBy(ctx.g, ctx.st) : 0;
        if (k) return `The boat stopped ${plural(k, "square", "squares")} short of the mooring, facing right at it.${hasType(ctx.program || [], "repeat") ? " Does a Repeat need to run more times?" : " How many more Forward blocks?"}`;
        return `Your program ended, but the boat isn't at the mooring yet. It's facing ${DIR_WORD[v.dir]}. Step through to see where it stops.`;
      }
      case "traps": return v.hauled === 0
        ? "Your boat reached the mooring, but it didn't haul any traps. Which block could help?"
        : `Your boat reached the mooring, but it hauled ${v.hauled} of ${v.traps} traps. Which trap did it sail past?`;
      case "spots": return `Your boat reached the mooring, but it set ${v.set} of ${v.spots} traps. Every dashed circle needs one.`;
      case "marks": return `Your boat reached the mooring, but it sailed over ${v.marked} of ${v.marks} search marks (✕). Which one did it miss?`;
      case "calls": return `Your boat made it! This level is about your own block: use ${L.fnName} at least ${v.minCalls} times. You used it ${plural(v.calls, "time", "times")}.`;
      case "budget": return `Your route works! It uses ${ctx.count} blocks, and this level allows ${L.budget}. ${overBudgetTip(L)}`;
      default: return "";
    }
  }
  /* The three marks: Made it (always on a win), Par (at or under par, when the level has one), and the Compass:
     a correct prediction, a stretch target, or a clean first run, depending on the level. null = not on this level. */
  function marks(L, ctx) {
    const made = true;
    const par = L.par && !ctx.custom ? ctx.count <= L.par : null;
    let compass = null;
    if (L.predict) compass = !!ctx.predictedRight;
    else if (L.stretch && L.stretch.blocks) compass = ctx.count <= L.stretch.blocks;
    else if (L.stretch) compass = ctx.failedRuns === 0;
    return { made, par, compass };
  }
  const MARKS = [
    { k: "made", label: "Made it", glyph: "check" },
    { k: "par", label: "Par", glyph: "star" },
    { k: "compass", label: "Compass", glyph: "compass" }
  ];
  const markRow = (m) => `<ul class="cc-marks" aria-label="Your marks">${MARKS.filter((x) => m[x.k] !== null && m[x.k] !== undefined).map((x) =>
    `<li class="cc-mark ${m[x.k] ? "is-on" : ""}">${icon(x.glyph)}<span>${x.label}${m[x.k] ? "" : " (not yet)"}</span></li>`).join("")}</ul>`;
  const compassText = (L) => L.predict ? "Compass: predict exactly where the boat stops." : L.stretch ? `Compass: ${L.stretch.text}` : "";

  /* ───────── Python: side by side, highlighted, explained ───────── */
  const HELPERS = [
    ["move", "move()", "sail forward one square"], ["left", "turn_left()", "turn the bow left; the boat stays put"],
    ["right", "turn_right()", "turn the bow right"], ["pick", "haul()", "haul the trap under the boat"],
    ["drop", "set_trap()", "set a trap on a dashed circle"], ["ifWall", "ledge_ahead()", "True if granite is right in front"],
    ["ifLedgeLeft", "ledge_left()", "True if granite is on the boat's left"], ["ifLedgeRight", "ledge_right()", "True if granite is on the boat's right"],
    ["ifGem", "at_buoy()", "True if a trap buoy is under the boat"], ["ifSpot", "at_spot()", "True if the boat is on a dashed circle"],
    ["untilGoal", "at_mooring()", "True when the boat is at its mooring"]
  ];
  function highlightPy(text) {
    return esc(text).replace(/(#.*)$/, '<span class="py-c">$1</span>').replace(/\b(\d+)\b/g, '<span class="py-n">$1</span>')
      .replace(/\b(def|for|in|while|not|if|else|pass)\b/g, '<span class="py-k">$1</span>').replace(/\b(range)\b/g, '<span class="py-b">$1</span>');
  }
  function pyNotes(lines) {
    const t = lines.map((l) => l.text).join("\n"), out = [];
    if (/^def /m.test(t)) out.push("<code>def</code> defines your own block. Calling it, like <code>name()</code>, runs it.");
    if (/for i in range\(\d+\)/.test(t)) out.push("<code>for i in range(4):</code> repeats the indented lines 4 times.");
    if (/for i in range\([a-z_]+\)/.test(t)) out.push("<code>range(distance)</code> uses the variable's value right now, so the loop can change length.");
    if (/while not/.test(t)) out.push("<code>while not at_mooring():</code> keeps repeating until the boat is home.");
    if (/^\s*if /m.test(t)) out.push("<code>if</code> checks a question. The indented lines run only when the answer is True.");
    if (/^\s*else:/m.test(t)) out.push("<code>else</code> runs when the answer is False.");
    if (/ = \d/.test(t)) out.push("<code>distance = 1</code> stores a number. <code>+= 1</code> adds to it.");
    if (/^\s*pass$/m.test(t)) out.push("<code>pass</code> means \"nothing here yet\": an empty block.");
    return out;
  }

  /* ───────── Mount ───────── */
  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const labelOf = labeler(L);
    const body = el.closest(".lab-body");
    if (body) body.classList.add("lab-body--wide");   // a narrower brief, so the three panes fit
    const isTeacher = !!(api.user && api.user.role === "educator");
    const boat = boatFor(api.user);
    const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let help = helpOn();
    let grids = L.grids.map((g) => g.slice());
    let dir = L.dir;
    let w = 0, g = H.parseGrid(grids[0]);
    let gen = null, st = null, timer = null, running = false, finished = false, speed = reduce ? 140 : 380;
    let seen = new Set(), passed = new Set(), testingAll = false;
    let mode = L.plan || (help && !L.fog) ? "plan" : null;     // null | "plan" | "predict" | "design"
    let plan = [], planBroke = null, prediction = null, predicted = !L.predict, predictedRight = false;
    let failedRuns = 0, lastTurn = false, custom = false, demo = false, tool = "#", stepsTaken = 0;
    const worldName = (i) => (L.worlds ? L.worlds[i] : `Map ${i + 1}`);

    const starter = L.starter ? H.clone(SE.minipy.parse(L.starter, pyOpts(L)).main) : [];
    const bad = grids.map(H.validateGrid).flat();
    if (bad.length) { el.innerHTML = `<p class="lab-feedback is-warn">This level's map has a problem: ${esc(bad[0])}</p>`; return () => {}; }

    el.innerHTML = `
      <div class="cc ${help ? "cc--help" : ""}" id="cc">
        <div class="cc__bar">
          <div class="cc__goalchips">
            ${L.budget ? `<span class="var-chip">Budget <b>${L.budget}</b> blocks</span>` : ""}
            ${L.par ? `<span class="var-chip cc-hide-help" id="cc-par">Par <b>${L.par}</b></span>` : ""}
            ${compassText(L) ? `<span class="cc-compass cc-hide-help">${icon("compass")}${esc(compassText(L))}</span>` : ""}
          </div>
          <div class="cc__bartools">
            <button type="button" class="btn btn--ghost btn--small" id="cc-help" aria-pressed="${help}">${icon("bulb")}Extra help</button>
            ${isTeacher ? `<button type="button" class="btn btn--ghost btn--small" id="cc-demo">${icon("eye")}Demo the solution</button>` : ""}
          </div>
        </div>
        <div class="cc__panes">
          <section class="cc__py" id="cc-py" hidden aria-labelledby="cc-py-title">
            <div class="cc__pyhead"><h3 id="cc-py-title">${icon("code")}See your code in Python</h3>
              <button type="button" class="linkish" id="cc-copy">${icon("clipboard")}Copy</button></div>
            <pre class="cc-py__code" id="cc-py-code"></pre>
            <ul class="cc-py__notes" id="cc-py-notes"></ul>
            <details class="cc-py__help"><summary>Where do <code>move()</code> and the other boat commands come from?</summary>
              <p>They're the boat's commands. STEM 207 wrote them for this harbor. They are not built into Python, so a real program would define them first, like this:</p>
              <pre class="cc-py__code">${esc(HELPERS.filter(([t]) => L.blocks.includes(t) || t === "untilGoal" && L.blocks.includes("untilGoal")).map(([, f, what]) => `def ${f.replace("()", "():")}  # ${what}\n    ...`).join("\n"))}</pre>
              <p>The <code>...</code> stands for the code that talks to the boat's engine and wheel.</p>
            </details>
          </section>
          <div class="cc__code rover__code" id="cc-code"></div>
          <div class="cc__chart">
            ${grids.length > 1 ? `<div class="cc-tabs" role="tablist" aria-label="Channels">${grids.map((_, i) => `<button type="button" role="tab" class="cc-tab" id="cc-tab-${i}" data-world="${i}" aria-selected="${i === 0}"><span>${esc(worldName(i))}</span><b class="cc-tab__ok" data-ok="${i}"></b></button>`).join("")}</div>` : ""}
            <div class="cc__gridwrap" id="cc-gridwrap"></div>
            <div class="cc__readout rover__readout" aria-live="polite">
              <span id="cc-status">Ready</span>
              <span id="cc-chips"></span>
            </div>
            <div class="cc__controls rover__controls">
              <button type="button" class="btn btn--launch" id="cc-run">${icon("rocket")}Run</button>
              <button type="button" class="btn btn--ghost" id="cc-step">${icon("arrowRight")}Step</button>
              <button type="button" class="btn btn--ghost" id="cc-reset">${icon("refresh")}Reset</button>
              ${grids.length > 1 ? `<button type="button" class="btn btn--ghost" id="cc-all">${icon("check")}Test ${grids.length === 2 ? "both" : "all"} ${L.worlds && /tide/i.test(L.worlds[0]) ? "tides" : "channels"}</button>` : ""}
              <label class="speed"><span>Speed</span>
                <select id="cc-speed" class="input input--small"><option value="700">Slow</option><option value="380" ${speed === 380 ? "selected" : ""}>Normal</option><option value="140" ${speed === 140 ? "selected" : ""}>Fast</option></select>
              </label>
            </div>
            <div class="cc__modes">
              ${L.fog ? "" : `<button type="button" class="btn btn--ghost btn--small" id="cc-plan" aria-pressed="false">${icon("map")}Plot your course</button>`}
              ${L.predict ? `<button type="button" class="btn btn--ghost btn--small" id="cc-predict" aria-pressed="false">${icon("target")}Guess where it stops</button>` : ""}
              <button type="button" class="btn btn--ghost btn--small" id="cc-pybtn" aria-pressed="false" aria-controls="cc-py">${icon("code")}See your code in Python</button>
              ${L.design ? `<button type="button" class="btn btn--ghost btn--small" id="cc-design" aria-pressed="false">${icon("palette")}Design my chart</button>` : ""}
            </div>
            <div class="cc__modepanel" id="cc-modepanel" aria-live="polite"></div>
          </div>
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    // Feedback sits right under the chart's status line, so it's on the first screen next to the boat.
    const fb = document.getElementById("lab-feedback");
    if (fb) $(".cc__readout").after(fb);
    const ed = H.editor($("#cc-code"), {
      blocks: L.blocks, labelOf, usesFn: L.usesFn, fnName: L.fnName || "My Move", maxBlocks: L.budget, par: help ? null : L.par,
      starter, countFn: true, undo: true, python: false, varName: L.varName, goal: "mooring",
      isBusy: () => running,
      onEdit: () => { passed.clear(); markTabs(); resetWorld(); api.say(""); renderPy(); }
    });

    /* ───────── The chart ───────── */
    const key = (x, y) => `${x},${y}`;
    function cellInfo(x, y) {
      const ch = g.rows[y][x], k = key(x, y);
      const fogged = L.fog && !seen.has(k);
      if (fogged) return { cls: "cc-cell--fog", html: "", say: "fog" };
      if (ch === "#") return { cls: "cc-cell--ledge", html: "", say: "granite ledge" };
      const got = st && st.got.has(k), set = st && st.dropped.has(k), hit = st && st.visited.has(k);
      if (ch === "G") return { cls: "cc-cell--mooring", html: `<span class="cc-moor" aria-hidden="true"><i></i></span>`, say: "your mooring" };
      if (ch === "S") return { cls: "cc-cell--dock", html: "", say: "the dock" };
      if (ch === "*") return { cls: got ? "is-got" : "", html: got ? "" : `<span class="cc-buoy">${icon("buoy")}</span>`, say: got ? "open water (trap hauled)" : "a trap buoy" };
      if (ch === "o") return { cls: set ? "is-set" : "", html: `<span class="cc-spot"><i></i>${set ? icon("buoy") : ""}</span>`, say: set ? "a trap you set" : "a dashed circle (set a trap here)" };
      if (ch === "x") return { cls: hit ? "is-hit" : "", html: `<span class="cc-x" aria-hidden="true">✕</span>`, say: hit ? "a search mark you sailed over" : "a search mark" };
      return { cls: "", html: "", say: "open water" };
    }
    function chartLabel() {
      if (L.fog) return "Chart in fog: you can only see the squares around your boat. Ledges and the mooring appear as the boat gets close.";
      return `Harbor chart, ${g.w - 2} by ${g.h - 2} squares. Your boat starts at the dock facing ${DIR_WORD[dir]}. Reach your mooring${g.gems.length ? `, hauling ${plural(g.gems.length, "trap", "traps")}` : ""}${g.spots.length ? `, setting traps on ${plural(g.spots.length, "dashed circle", "dashed circles")}` : ""}${g.marks.length ? `, sailing over ${plural(g.marks.length, "search mark", "search marks")}` : ""}. Granite ledges are hatched gray squares.`;
    }
    function renderGrid() {
      const interactive = mode === "plan" || mode === "predict" || mode === "design";
      const planAt = new Map(plan.map((k, i) => [k, i + 1]));
      const cells = g.rows.map((r, y) => [...r].map((_, x) => {
        const c = cellInfo(x, y), k = key(x, y);
        const n = planAt.get(k);
        const extra = `${n ? `<b class="cc-plan" aria-hidden="true">${n}</b>` : ""}${prediction === k ? `<span class="cc-guess" aria-hidden="true">${icon("target")}</span>` : ""}`;
        const cls = `cc-cell ${c.cls} ${planBroke === k ? "is-off" : ""}`;
        const say = `Row ${y}, column ${x}: ${c.say}${n ? `, plan step ${n}` : ""}${prediction === k ? ", your guess" : ""}`;
        return interactive
          ? `<button type="button" class="${cls}" data-x="${x}" data-y="${y}" tabindex="-1" aria-label="${esc(say)}">${c.html}${extra}</button>`
          : `<div class="${cls}" data-x="${x}" data-y="${y}">${c.html}${extra}</div>`;
      }).join("")).join("");
      $("#cc-gridwrap").innerHTML = `<div class="cc__grid ${interactive ? "is-picking" : ""}" style="--cols:${g.w};--rows:${g.h}" ${interactive ? `role="group" aria-label="${esc(mode === "design" ? "Tap a square to paint it with your tool" : mode === "plan" ? "Tap squares to plot your course" : "Tap the square where the boat will stop")}"` : `role="img" aria-label="${esc(chartLabel())}"`}>
        ${cells}<div class="cc-boat" id="cc-boat" style="width:calc(100% / ${g.w});height:calc(100% / ${g.h})">${boatSvg(boat)}</div></div>`;
      if (interactive) {
        const first = $("#cc-gridwrap button.cc-cell:not(.cc-cell--ledge)") || $("#cc-gridwrap button.cc-cell");
        if (first) first.tabIndex = 0;
      }
      if (st) place(st.x, st.y, st.dir, false);
    }
    function place(x, y, d, animate = true) {
      const b = $("#cc-boat");
      if (!b) return;
      const t = animate && !reduce ? `transform ${Math.min(speed, 350)}ms ease` : "none";
      b.style.transition = t; b.firstElementChild.style.transition = t;
      b.style.transform = `translate(${x * 100}%, ${y * 100}%)`;
      b.firstElementChild.style.transform = `rotate(${H.ROT[d]}deg)`;
    }
    function reveal() {
      if (!L.fog) return false;
      let grew = false;
      H.visibleFrom(g, st.x, st.y, L.fog).forEach((k) => { if (!seen.has(k)) { seen.add(k); grew = true; } });
      return grew;
    }
    function refreshCells() {   // update only what changed during a run (traps, marks, fog)
      el.querySelectorAll(".cc-cell").forEach((n) => {
        const x = Number(n.dataset.x), y = Number(n.dataset.y), c = cellInfo(x, y);
        const want = `cc-cell ${c.cls} ${planBroke === key(x, y) ? "is-off" : ""}`.trim().replace(/\s+/g, " ");
        if (n.className.trim().replace(/\s+/g, " ") !== want) {
          const keep = [...n.querySelectorAll(".cc-plan, .cc-guess")].map((e) => e.outerHTML).join("");
          n.className = want; n.innerHTML = c.html + keep;
        }
      });
    }
    function chips() {
      const v = [];
      if (L.blocks.includes("setVar")) v.push(`<span class="var-chip">${esc(L.varName || "steps")} = <b>${st.vars.steps}</b></span>`);
      if (g.gems.length) v.push(`<span class="var-chip">hauled <b>${st.got.size}</b>/${g.gems.length}</span>`);
      if (g.spots.length) v.push(`<span class="var-chip">set <b>${st.dropped.size}</b>/${g.spots.length}</span>`);
      if (g.marks.length) v.push(`<span class="var-chip">marks <b>${g.marks.filter((k) => st.visited.has(k)).length}</b>/${g.marks.length}</span>`);
      if (L.usesFn && L.minCalls) v.push(`<span class="var-chip">${esc(L.fnName)} used <b>${st.calls}</b></span>`);
      $("#cc-chips").innerHTML = v.join("");
    }
    const setStatus = (t) => { $("#cc-status").textContent = t; };

    function resetWorld() {
      stop();
      g = H.parseGrid(grids[w]);
      st = H.startState(g, dir);
      gen = null; finished = false; planBroke = null; stepsTaken = 0; lastTurn = false;
      seen = L.fog ? H.visibleFrom(g, st.x, st.y, L.fog) : new Set();
      renderGrid();
      ed.clearHighlight(); pyActive(null);
      setStatus("Ready"); chips(); runLabel();
    }
    function markTabs() {
      el.querySelectorAll("[data-ok]").forEach((n) => { const i = Number(n.dataset.ok); n.innerHTML = passed.has(i) ? `${icon("check")}<span class="visually-hidden">passed</span>` : ""; });
    }
    function switchWorld(i) {
      w = i;
      el.querySelectorAll(".cc-tab").forEach((t) => t.setAttribute("aria-selected", String(Number(t.dataset.world) === i)));
      resetWorld();
    }

    /* ───────── Running ───────── */
    function stop() { clearInterval(timer); timer = null; running = false; el.classList.remove("is-running"); runLabel(); }
    function runLabel() {
      const b = $("#cc-run");
      if (b) b.innerHTML = running ? `${icon("clock")}Pause` : gen && !finished ? `${icon("rocket")}Resume` : `${icon("rocket")}Run`;
    }
    function begin() {
      if (!ed.program.length) { api.say("Your program is empty. Tap a block to add it.", "warn"); return false; }
      if (!predicted && !demo) {
        setMode("predict");
        api.say("Before you run it: tap the square where you think the boat will stop. Then press Run.", "info");
        return false;
      }
      st = H.startState(g, dir);
      gen = H.run(ed.program, st, { g, fn: ed.fn, depth: 0, carry: !!L.carry });
      api.log("lab_test_run", { blocks: ed.count(), world: w });
      return true;
    }
    function stepOnce() {
      if (!gen && !begin()) { stop(); return false; }
      const r = gen.next();
      if (r.done) { finish(); return false; }
      const b = r.value;
      ed.highlight(b); pyActive(b.id);
      if (b.type === "left" || b.type === "right") lastTurn = true;
      else if (b.type === "move" && !st.error) lastTurn = false;
      if (b.type === "move" && !st.error) {
        stepsTaken++;
        const want = plan[stepsTaken - 1];
        if (plan.length && planBroke === null && want && want !== key(st.x, st.y)) planBroke = key(st.x, st.y);
      }
      reveal();
      place(st.x, st.y, st.dir);
      refreshCells(); chips();
      if (st.error) { finish(); return false; }
      setStatus(b.checking ? `Checking: ${labelOf(b.type)}` : labelOf(b.type));
      return true;
    }
    function finish() {
      stop();
      finished = true; runLabel();
      const res = H.check(L, st, g);
      const count = ed.count();
      const ctx = { g, st, program: ed.program, fn: ed.fn, count, lastTurn };
      let note = "";
      if (prediction && !demo) {
        const [px, py] = prediction.split(",").map(Number);
        predictedRight = px === st.x && py === st.y;
        note = predictedRight ? " You predicted exactly where it stopped!" : ` You guessed row ${py}, column ${px}. It stopped at row ${st.y}, column ${st.x}.`;
        prediction = null; refreshPredict();
      }
      if (planBroke) note += " The red square is where the boat left your plan.";
      if (!res.ok) {
        failedRuns++; testingAll = false;
        if (res.reason === "crash") {
          const [dx, dy] = H.DIRS[st.dir];
          const c = el.querySelector(`.cc-cell[data-x="${st.x + dx}"][data-y="${st.y + dy}"]`);
          if (c) c.classList.add("is-crash");
          api.log("lab_bug", { kind: "crash" });
        }
        setStatus({ crash: "Bump!", loop: "Going in circles", short: "Stopped", traps: "Traps missing", marks: "Marks missed", calls: "Use your block" }[res.reason] || "Try again");
        api.say(feedback(L, res, ctx) + note + (help && failedRuns >= 2 ? " Need a clue? Press Need a hint? above." : ""), "warn");
        return;
      }
      if (L.budget && count > L.budget) { testingAll = false; setStatus("Works, but too long"); api.say(feedback(L, { reason: "budget", values: res.values }, ctx) + note, "warn"); return; }
      passed.add(w); markTabs();
      const left = grids.map((_, i) => i).filter((i) => !passed.has(i));
      if (left.length) {
        setStatus(`Works at ${worldName(w)}`);
        if (testingAll) { api.say(`It works at ${worldName(w)}! Now ${worldName(left[0])}…`, "good"); setTimeout(() => { if (testingAll) { switchWorld(left[0]); go(); } }, reduce ? 50 : 700); }
        else api.say(`It works at ${worldName(w)}! Now try ${worldName(left[0])}: switch tabs, or press the Test button.`, "good");
        return;
      }
      testingAll = false;
      setStatus("Made it!");
      win(count, note);
    }
    function go() {
      if (running) return;
      if (finished || (st && st.error)) resetWorld();
      running = true; el.classList.add("is-running"); runLabel();
      api.say("");
      if (!stepOnce()) return;
      timer = setInterval(() => { if (!stepOnce()) stop(); }, speed);
    }

    /* ───────── Winning ───────── */
    const summarize = (list) => list.map((b) => b.type + (b.n != null ? b.n : "") + (b.body ? `[${summarize(b.body)}]` : "") + (b.else ? `{${summarize(b.else)}}` : "")).join(",");
    function win(count, note) {
      const m = marks(L, { count, predictedRight, failedRuns, custom });
      const python = SE.minipy.toPython(ed.program, ed.fn, L.fnName || "My Move", pyOpts(L));
      const msg = L.par && !custom
        ? (count <= L.par ? `You did it in ${count} blocks. That's par!` : `You did it in ${count} blocks. Par is ${L.par}. Can you find a shorter program?`)
        : L.budget ? `You did it in ${count} blocks, inside the budget of ${L.budget}.` : "Your boat made it to the mooring!";
      api.say(msg + note, "good");
      const result = { blocks: count, program: summarize(ed.program), fn: summarize(ed.fn), marks: m, channels: grids.length, python: python.slice(0, 1500) };
      if (L.design) Object.assign(result, { grid: grids[0], dir, custom });
      const done = new Set(SE.labs.progressFor(api.user, "captain-code")); done.add(idx);
      const regionDone = (r) => { for (let i = r.from; i <= r.to; i++) if (!done.has(i)) return false; return true; };
      let extra = `<div class="cc-win">${markRow(m)}${demo ? `<p class="muted">Demo run: the reference solution.</p>` : ""}</div>`;
      if (L.design) extra += voyageCard(python, count, m);
      const r = REGIONS.findIndex((x) => idx === x.to);
      if (r >= 0 && regionDone(REGIONS[r])) extra += graduation(r);
      api.win(result, { extra });
      wireWinPanel(python);
    }
    function voyageCard(python, count, m) {
      const mini = grids[0].map((row) => `<div class="cc-mini__row">${[...row].map((ch) => `<i class="cc-mini__c cc-mini--${{ "#": "l", S: "s", G: "g", "*": "t", o: "o", x: "x" }[ch] || "w"}"></i>`).join("")}</div>`).join("");
      return `<section class="cc-card" id="cc-card" aria-labelledby="cc-card-title">
        <h3 id="cc-card-title">${icon("map")}My Voyage Card</h3>
        <p class="cc-card__who">${esc(api.user && api.user.displayName ? `Captain ${api.user.displayName}` : "Captain ____________")}${boat.name ? ` · the ${esc(boat.name)}` : ""}</p>
        <div class="cc-card__body"><div class="cc-mini" role="img" aria-label="${custom ? "The chart you designed" : "The Casco Bay chart"}">${mini}</div>
          <pre class="cc-py__code">${esc(python)}</pre></div>
        <p>${custom ? "A chart I designed myself." : "The Captain's Challenge chart."} ${count} blocks. ${markRow(m)}</p>
        <button type="button" class="btn btn--ghost" id="cc-card-print">${icon("print")}Print my Voyage Card</button>
      </section>`;
    }
    function graduation(r) {
      const R = REGIONS[r];
      const award = r === 0 ? "Casco Bay Certified Captain" : `${R.title} Captain`;
      const learned = r === 0 ? ["Sequences: exact steps, in order", "Planning a route before you code", "Debugging by stepping through", "Precision: tracking which way the boat faces", "Loops for repeated patterns", "If / else: deciding from what the boat senses", "Programs that work on more than one map", "Variables that change while the program runs", "Your own blocks (functions)", "Designing and improving your own voyage"] : null;
      const info = { award, course: "Captain Code: Program a Lobster Boat Along the Maine Coast", detail: `Finished all ${R.to - R.from + 1} ${R.title} levels`, name: api.user && api.user.role === "student" ? api.user.displayName : "", className: api.user && api.user.cls ? api.user.cls.name : "", at: Date.now() };
      return `<section class="cc-grad" aria-labelledby="cc-grad-title">
        <div class="cc-grad__boat">${boatSvg(boat, "cc-grad__svg")}${boat.name ? `<p>${esc(boat.name)}</p>` : ""}</div>
        <div>
          <p class="eyebrow">Captain Code</p>
          <h3 id="cc-grad-title">${esc(award)}</h3>
          ${learned ? `<p>You programmed your way across Casco Bay. Here's what you learned:</p><ul class="cc-grad__list">${learned.map((t) => `<li>${icon("check")}${esc(t)}</li>`).join("")}</ul>` : `<p>You finished every level in ${esc(R.title)}.</p>`}
          <p class="cc-grad__human"><strong>Keep the humanity in technology.</strong> Your boat followed your code, but you did the thinking: the planning, the judgment, the patience to find each bug, and the ideas. That's what programming really is.</p>
          <div class="cc-grad__actions">
            ${SE.certificate ? SE.certificate.button(info, "Print my certificate") : ""}
            <button type="button" class="btn btn--ghost" id="cc-grad-py">${icon("code")}See your code in Python</button>
            ${r < 2 ? `<a class="btn btn--ghost" href="#/lab/captain-code/${REGIONS[r + 1].from + 1}">${icon("arrowRight")}Sail on to ${esc(REGIONS[r + 1].title)}</a>` : ""}
          </div>
        </div>
      </section>`;
    }
    function wireWinPanel() {
      const p = document.getElementById("cc-card-print");
      if (p) p.addEventListener("click", () => {
        document.body.classList.add("cc-printing");
        window.print();
        setTimeout(() => document.body.classList.remove("cc-printing"), 500);
      });
      const py = document.getElementById("cc-grad-py");
      if (py) py.addEventListener("click", () => { showPy(true); $("#cc-py").scrollIntoView({ block: "nearest" }); });
    }

    /* ───────── Python view ───────── */
    function renderPy() {
      const lines = ed.program.length || ed.fn.length ? SE.minipy.toPythonLines(ed.program, ed.fn, L.fnName || "My Move", pyOpts(L)) : [{ text: "# Add blocks to see them in Python.", id: null }];
      $("#cc-py-code").innerHTML = lines.map((l) => `<span class="cc-py__line" ${l.id ? `data-pyid="${l.id}"` : ""}>${highlightPy(l.text) || " "}</span>`).join("\n");
      $("#cc-py-notes").innerHTML = pyNotes(lines).map((t) => `<li>${t}</li>`).join("");
    }
    function pyActive(id) {
      el.querySelectorAll(".cc-py__line.is-active").forEach((n) => n.classList.remove("is-active"));
      if (id) { const n = el.querySelector(`.cc-py__line[data-pyid="${id}"]`); if (n) n.classList.add("is-active"); }
    }
    function showPy(on) {
      $("#cc-py").hidden = !on;
      $("#cc").classList.toggle("cc--py", on);
      $("#cc-pybtn").setAttribute("aria-pressed", String(on));
      if (on) { renderPy(); api.log("lab_python_view", {}); }
    }

    /* ───────── Plan, predict, design ───────── */
    function setMode(m) {
      if (mode === "design" && m === "design" && !finishDesign()) return;   // a chart that breaks the rules stays open
      mode = mode === m ? null : m;
      ["plan", "predict", "design"].forEach((k) => { const b = $(`#cc-${k}`); if (b) b.setAttribute("aria-pressed", String(mode === k)); });
      const p = $("#cc-modepanel");
      if (mode === "plan") p.innerHTML = `<p>${icon("map", 'class="inline-icon"')}Tap the squares your boat will sail through, in order, starting next to the boat. Tap the last one again to take it back.</p><button type="button" class="linkish" id="cc-plan-clear">${icon("trash")}Clear my plan</button>`;
      else if (mode === "predict") p.innerHTML = `<p>${icon("target", 'class="inline-icon"')}Read your program. Tap the square where you think the boat will stop.</p>`;
      else if (mode === "design") p.innerHTML = `<div class="cc-tools" role="group" aria-label="Chart tools">${[["#", "Ledge"], [".", "Water"], ["*", "Trap buoy"], ["S", "Boat start"], ["G", "Mooring"]].map(([t, n]) => `<button type="button" class="btn btn--ghost btn--small" data-tool="${t}" aria-pressed="${tool === t}">${esc(n)}</button>`).join("")}<button type="button" class="btn btn--ghost btn--small" id="cc-turnboat">${icon("refresh")}Boat faces ${DIR_WORD[dir]}</button></div><p class="field-help">Pick a tool, then tap squares. The edge stays granite. Press Design my chart again when you're done.</p>`;
      else p.innerHTML = "";
      renderGrid();
    }
    function refreshPredict() { const b = $("#cc-predict"); if (b) b.setAttribute("aria-pressed", String(mode === "predict")); }
    function adjacent(a, b) { const [ax, ay] = a.split(",").map(Number), [bx, by] = b.split(",").map(Number); return Math.abs(ax - bx) + Math.abs(ay - by) === 1; }
    function pickCell(x, y) {
      const k = key(x, y), ch = g.rows[y][x];
      if (mode === "predict") {
        if (ch === "#") { api.say("A boat can't stop on a ledge. Pick a water square.", "warn"); return; }
        prediction = k; predicted = true; mode = null; refreshPredict(); $("#cc-modepanel").innerHTML = "";
        api.log("lab_predict", { x, y });
        api.say("Got it. Now press Run and see if you're right.", "info");
      } else if (mode === "plan") {
        if (plan.length && plan[plan.length - 1] === k) plan.pop();
        else if (ch === "#") { api.say("That's a granite ledge. Plot through open water.", "warn"); return; }
        else if (!adjacent(plan.length ? plan[plan.length - 1] : key(g.start[0], g.start[1]), k)) { api.say("Plot one square at a time: pick a square next to the last one.", "warn"); return; }
        else plan.push(k);
        api.say("");
      } else if (mode === "design") {
        if (x === 0 || y === 0 || x === g.w - 1 || y === g.h - 1) { api.say("The edge of the chart stays granite.", "warn"); return; }
        const rows = grids[w].map((r) => [...r]);
        if (tool === "S" || tool === "G") rows.forEach((r) => r.forEach((c, i) => { if (c === tool) r[i] = "."; }));
        rows[y][x] = tool;
        grids[w] = rows.map((r) => r.join(""));
        g = H.parseGrid(grids[w]);
        if (g.start && g.goal) st = H.startState(g, dir);
        custom = true; passed.clear();
      }
      renderGrid();
      const again = el.querySelector(`.cc-cell[data-x="${x}"][data-y="${y}"]`);
      if (again && again.tagName === "BUTTON") { el.querySelectorAll("button.cc-cell").forEach((c) => (c.tabIndex = -1)); again.tabIndex = 0; again.focus(); }
    }
    /* Leaving the designer: the chart must be valid, reachable, and have a trap. true = it's ready to sail. */
    function finishDesign() {
      const bad = H.validateGrid(grids[w]);
      if (bad.length) { api.say(bad[0], "warn"); return false; }
      const r = SE.levelDesigner ? SE.levelDesigner.route(grids[w]) : { ok: true };
      if (!r.ok) { api.say(String(r.why).replace(/Wharf tool/g, "Mooring tool").replace(/wharf/g, "mooring"), "warn"); return false; }
      if (!grids[w].join("").includes("*")) { api.say("Add at least one trap buoy so the voyage has a job to do.", "warn"); return false; }
      passed.clear(); markTabs();
      api.log("lab_design", { grid: grids[w] });
      resetWorld();
      api.say(`Your chart works: the best route is ${r.moves} moves. Now program your boat to sail it.`, "good");
      return true;
    }

    /* ───────── Events ───────── */
    $("#cc-run").addEventListener("click", () => { if (running) { stop(); return; } go(); });
    $("#cc-step").addEventListener("click", () => { if (running) stop(); if (finished || (st && st.error)) resetWorld(); stepOnce(); });
    $("#cc-reset").addEventListener("click", () => { testingAll = false; resetWorld(); api.say(""); });
    $("#cc-speed").addEventListener("change", (e) => { speed = Number(e.target.value); });
    const all = $("#cc-all");
    if (all) all.addEventListener("click", () => { testingAll = true; passed.clear(); markTabs(); switchWorld(0); go(); });
    el.querySelectorAll(".cc-tab").forEach((t) => t.addEventListener("click", () => { testingAll = false; switchWorld(Number(t.dataset.world)); }));
    const tabs = el.querySelector(".cc-tabs");
    if (tabs) tabs.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = (w + (e.key === "ArrowRight" ? 1 : grids.length - 1)) % grids.length;
      switchWorld(n); document.getElementById(`cc-tab-${n}`).focus();
    });
    ["plan", "predict", "design"].forEach((k) => { const b = $(`#cc-${k}`); if (b) b.addEventListener("click", () => setMode(k)); });
    $("#cc-pybtn").addEventListener("click", () => showPy($("#cc-py").hidden));
    $("#cc-copy").addEventListener("click", () => {
      const text = SE.minipy.toPython(ed.program, ed.fn, L.fnName || "My Move", pyOpts(L));
      const done = () => api.say("Copied your Python.", "good");
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => api.say("Your browser didn't allow copying. Select the code and copy it instead.", "warn"));
    });
    $("#cc-help").addEventListener("click", () => {
      help = !help; setHelp(help);
      $("#cc").classList.toggle("cc--help", help);
      $("#cc-help").setAttribute("aria-pressed", String(help));
      api.say(help ? "Extra help is on: bigger blocks, and clues when you're stuck." : "Extra help is off.", "info");
    });
    const demoBtn = $("#cc-demo");
    if (demoBtn) demoBtn.addEventListener("click", () => {
      const p = SE.minipy.parse(L.reference, pyOpts(L));
      demo = true; predicted = true;
      ed.set(H.clone(p.main), H.clone(p.fn));
      passed.clear(); markTabs(); resetWorld(); renderPy();
      api.say("Demo: the reference solution is loaded. Press Step to walk through it with the class. (Students don't see this button.)", "info");
    });
    $("#cc-modepanel").addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.id === "cc-plan-clear") { plan = []; planBroke = null; renderGrid(); }
      else if (t.dataset.tool) { tool = t.dataset.tool; el.querySelectorAll("[data-tool]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tool === tool))); }
      else if (t.id === "cc-turnboat") { dir = H.RIGHT[dir]; t.innerHTML = `${icon("refresh")}Boat faces ${DIR_WORD[dir]}`; custom = true; resetWorld(); }
    });
    $("#cc-gridwrap").addEventListener("click", (e) => {
      const c = e.target.closest("button.cc-cell");
      if (c && !running) pickCell(Number(c.dataset.x), Number(c.dataset.y));
    });
    $("#cc-gridwrap").addEventListener("keydown", (e) => {   // arrow keys move between squares while picking
      const c = e.target.closest("button.cc-cell");
      const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
      if (!c || !d) return;
      e.preventDefault();
      const n = el.querySelector(`button.cc-cell[data-x="${Number(c.dataset.x) + d[0]}"][data-y="${Number(c.dataset.y) + d[1]}"]`);
      if (n) { c.tabIndex = -1; n.tabIndex = 0; n.focus(); }
    });

    resetWorld();
    renderPy();
    const startMode = mode; mode = null;
    if (startMode) setMode(startMode);
    if (L.starter) api.say("This program was written by another captain. Press Step to watch it one block at a time.", "info");
    const best = bestFor(api, idx);
    if (best) api.say(`Your best so far: ${best} blocks.${L.par ? ` Par is ${L.par}.` : ""}`, "info");
    return () => { testingAll = false; stop(); };
  }

  /* The fewest blocks in this student's wins on a level (from the activity log). */
  function bestFor(api, idx) {
    if (!api.user || api.user.role !== "student") return null;
    const wins = SE.store.eventsFor(api.user.id).filter((e) => e.type === "lab_level_completed" && e.data.labId === "captain-code" && e.data.level === idx && e.data.result && !e.data.result.custom);
    return wins.length ? Math.min(...wins.map((e) => e.data.result.blocks || Infinity)) : null;
  }

  /* ───────── Landing ───────── */
  function landing(el, api) {
    const boat = boatFor(api.user);
    el.innerHTML = `
      <div class="cc-land">
        <div class="cc-land__hero">
          <div class="cc-land__boat">${boatSvg(boat, "cc-land__svg")}</div>
          <div>
            <p class="cc-land__rule"><strong>Your boat only goes where your code tells it.</strong></p>
            <p>You're the captain of a Maine lobster boat. Write programs with code blocks to steer through Casco Bay, haul lobster traps, dodge granite ledges, and find your mooring in thick fog.</p>
            <p>Each challenge teaches you a smarter way to code. There's a catch: as your skills grow, you get fewer blocks to use. Can you become a master captain?</p>
            <div class="cc-land__go">
              <a class="btn btn--launch" href="#/lab/captain-code/1" id="cc-start">${icon("rocket")}Start in Casco Bay</a>
              <button type="button" class="btn btn--ghost" id="cc-land-help" aria-pressed="${helpOn()}">${icon("bulb")}Extra help</button>
            </div>
          </div>
        </div>
        <ul class="cc-land__regions">${REGIONS.map((r, i) => `<li><a href="#/lab/captain-code/${r.from + 1}"><strong>${esc(r.title)}</strong><span>${r.to - r.from + 1} levels${i === 0 ? " · the workshop" : " · for early finishers"}</span><span class="muted">${esc(r.blurb)}</span></a></li>`).join("")}</ul>
      </div>`;
    el.querySelector("#cc-land-help").addEventListener("click", (e) => {
      const on = !helpOn(); setHelp(on); e.currentTarget.setAttribute("aria-pressed", String(on));
    });
  }

  const GOALS = {
    "Sequence": ["Give the boat exact steps, in order.", "Every program is a list of steps. Change the order and you change what happens."],
    "Planning": ["Plan a route before you code it, and do actions at the right moment.", "Programmers plan first. It's faster than fixing a program that went the wrong way."],
    "Debugging": ["Find the first step that goes wrong by stepping through, then fix it.", "Every programmer writes bugs. Good ones investigate instead of guessing."],
    "Precision": ["Track which way the boat faces before every turn.", "Computers do exactly what you say, so the details matter."],
    "Loops": ["Use a Repeat block to sail a pattern with fewer blocks.", "Loops let short programs do big jobs, and they're easier to fix."],
    "Nested loops": ["Put a loop inside a loop to repeat a pattern of patterns.", "Nested loops draw grids, sweep rows of seats, and check every square on a game board."],
    "If / else": ["Let the boat decide what to do from what it senses.", "Programs make choices all day, like a phone dimming its screen in the dark."],
    "Loops + if / else": ["Combine a loop and decisions so one program works on more than one map.", "Real programs are tested on many cases, not just the one you tried."],
    "Variables": ["Use a variable that changes while the program runs.", "Scores, timers, and distances are variables. They let one program handle many situations."],
    "Functions": ["Define your own block once and call it again and again.", "Naming a chunk of code keeps big programs short and easy to fix."],
    "Create": ["Plan, build, test, debug, and improve a voyage of your own.", "Making something new is what programming is for."]
  };
  SE.labs.goals(LEVELS, LEVELS.map((l) => GOALS[l.concept] || GOALS[l.concept.split(":")[0]] || null));
  SE.labs.register({
    id: "captain-code",
    area: "coding",
    title: "Captain Code",
    tagline: "Program a lobster boat along the Maine coast. Your boat only goes where your code tells it: 10 workshop levels in Casco Bay, plus 24 more Down East.",
    levels: LEVELS,
    chapters: REGIONS,
    mount,
    landing
  });
  SE.captain = { LEVELS, REGIONS, feedback, marks, labeler };
})();
