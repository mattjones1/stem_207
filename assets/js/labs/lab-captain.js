/*
 * Captain Code — Program a Lobster Boat Along the Maine Coast (lab id "captain-code").
 * The flagship coding workshop: 90 minutes, grades 2–8. Casco Bay (10 levels) is the workshop; Penobscot Bay
 * and Down East (12 each) are for students who finish early. Levels live in captain-levels.js.
 *
 * Built on Harbor Code's engine (harbor-engine.js: run, check, sail, fog sight) and block editor
 * (harbor-editor.js, with Undo/Redo and rich loops here). What Captain Code adds on top:
 *   a lesson before each new idea (learn first, then try), guess where the boat stops (any level, required
 *   first on predict levels), plot your course with the jobs on the route and the plan in words (the run
 *   shows where it left the plan), real fog (only the squares around the boat are drawn), channels (one
 *   program must pass every map), block budgets that still let a working route run and then ask for a smarter
 *   one, three marks per level (Made it, Par, Compass), feedback that names the student's own numbers, Python
 *   side by side (on by default), Level 10's lettered legs and step-by-step chart designer, a Voyage Card,
 *   and a certificate.
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
  const ARROW = { N: "↑", E: "→", S: "↓", W: "←" };
  const pyOpts = (L) => ({ varName: L.varName, goal: "mooring" });
  const PY_KEY = "stem207.captain.py";   // Python shows beside the blocks unless the student hides it (this session)
  const pyOn = () => { try { return sessionStorage.getItem(PY_KEY) !== "0"; } catch (e) { return true; } };
  const setPy = (on) => { try { sessionStorage.setItem(PY_KEY, on ? "1" : "0"); } catch (e) { /* private mode */ } };

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
  /* Toolbox words: a number the student sets shows as "…" ("Repeat … times"), not "#". */
  const paletteLabeler = (L) => (type) => {
    const v = L.varName || "steps";
    if (type === "repeat") return "Repeat … times";
    if (type === "setVar") return `Set ${v} to …`;
    if (type === "changeVar") return `Change ${v} by …`;
    return labeler(L)(type);
  };
  /* The block counter: the budget when there is one ("too many" in words, not only color), else par. */
  const countText = (L) => (n) => L.budget
    ? `${n} / ${L.budget} blocks${n > L.budget ? " · too many" : ""}`
    : `${n} blocks${L.par ? ` · par ${L.par}` : ""}`;

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
  /* What each mark checked on this level, in words ("Compass: exact guess"). */
  const markWhat = (L) => ({
    par: L.par ? `${L.par} blocks or fewer` : "",
    compass: L.predict ? "exact guess" : L.stretch && L.stretch.blocks ? `${L.stretch.blocks} blocks or fewer` : L.stretch ? "first run" : ""
  });
  const markRow = (m, what = {}) => `<ul class="cc-marks" aria-label="Your marks">${MARKS.filter((x) => m[x.k] !== null && m[x.k] !== undefined).map((x) =>
    `<li class="cc-mark ${m[x.k] ? "is-on" : ""}">${icon(x.glyph)}<span>${x.label}${what[x.k] ? `: ${esc(what[x.k])}` : ""}${m[x.k] ? "" : " (not yet)"}</span></li>`).join("")}</ul>`;
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
    const boat = boatFor(api.user);
    const reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const py = pyOn();
    let grids = L.grids.map((g) => g.slice());
    let dir = L.dir;
    let w = 0, g = H.parseGrid(grids[0]);
    let gen = null, st = null, timer = null, running = false, finished = false, speed = reduce ? 140 : 380;
    let seen = new Set(), passed = new Set(), testingAll = false;
    let mode = L.plan ? "plan" : null;     // null | "plan" | "predict" | "design"
    let plan = [], planBroke = null, prediction = null, predicted = !L.predict, predictedRight = false;
    const planActs = new Map();   // plan square -> "haul" | "set": the jobs the student plans to do there
    let failedRuns = 0, lastTurn = false, custom = false, tool = "#", stepsTaken = 0, blocksRun = 0, stepTold = false;
    const canGuess = !L.fog;   // Guess where it stops is on every level the student can see (required first where L.predict)
    const worldName = (i) => (L.worlds ? L.worlds[i] : `Map ${i + 1}`);
    // Level 10: the trap letters (L.legs) belong to the given chart, not to one the student designs.
    const legsOn = () => !!L.legs && !custom;
    const legAt = (k) => (legsOn() ? L.legs.find((l) => l.at === k) : null);
    let partOneWon = false;
    const designOpen = () => !L.legs || partOneWon || SE.labs.progressFor(api.user, "captain-code").has(idx);

    const starter = L.starter ? H.clone(SE.minipy.parse(L.starter, pyOpts(L)).main) : [];
    const bad = grids.map(H.validateGrid).flat();
    if (bad.length) { el.innerHTML = `<p class="lab-feedback is-warn">This level's map has a problem: ${esc(bad[0])}</p>`; return () => {}; }

    el.innerHTML = `
      <div class="cc ${py ? "cc--py" : ""}" id="cc">
        ${L.lesson ? `<section class="cc-lesson" id="cc-lesson" hidden aria-labelledby="cc-lesson-h"></section>` : ""}
        ${(L.par && L.par !== L.budget) || compassText(L) ? `<div class="cc__bar">
          <div class="cc__goalchips">
            ${L.par && L.par !== L.budget ? `<span class="var-chip" id="cc-par">Par <b>${L.par}</b>: an expert's block count</span>` : ""}
            ${compassText(L) ? `<span class="cc-compass">${icon("compass")}${esc(compassText(L))}</span>` : ""}
          </div>
        </div>` : ""}
        <div class="cc__panes">
          <section class="cc__py" id="cc-py" ${py ? "" : "hidden"} aria-labelledby="cc-py-title">
            <div class="cc__pyhead"><h3 id="cc-py-title">${icon("code")}Your code in Python</h3>
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
          ${L.design ? `<section class="cc__design" id="cc-designpanel" hidden aria-label="Design my chart"></section>` : ""}
          <div class="cc__chart">
            ${grids.length > 1 ? `<div class="cc-tabs" role="tablist" aria-label="Channels">${grids.map((_, i) => `<button type="button" role="tab" class="cc-tab" id="cc-tab-${i}" data-world="${i}" aria-selected="${i === 0}"><span>${esc(worldName(i))}</span><b class="cc-tab__ok" data-ok="${i}"></b></button>`).join("")}</div>` : ""}
            <div class="cc__gridwrap" id="cc-gridwrap"></div>
            <div class="cc__readout rover__readout">
              <span id="cc-status">Ready</span>
              <span id="cc-chips"></span>
            </div>
            <div class="cc__controls rover__controls">
              <button type="button" class="btn btn--launch" id="cc-run">${icon("rocket")}Run</button>
              <button type="button" class="btn btn--ghost" id="cc-step" title="Run just the next block, so you can watch closely">${icon("arrowRight")}Step (1 block)</button>
              <button type="button" class="btn btn--ghost" id="cc-reset">${icon("refresh")}Reset</button>
              ${grids.length > 1 ? `<button type="button" class="btn btn--ghost" id="cc-all">${icon("check")}Test ${grids.length === 2 ? "both" : "all"} ${L.worlds && /tide/i.test(L.worlds[0]) ? "tides" : "channels"}</button>` : ""}
            </div>
            <div class="cc__modepanel" id="cc-modepanel" aria-live="polite"></div>
            <div class="cc-planwords" id="cc-planwords" hidden></div>
            <div class="cc__modes" role="group" aria-labelledby="cc-tools-title">
              <span class="cc__modes-title" id="cc-tools-title">Captain's tools</span>
              ${L.fog ? "" : `<button type="button" class="btn btn--ghost btn--small" id="cc-plan" aria-pressed="false">${icon("map")}Plot your course</button>`}
              ${canGuess ? `<button type="button" class="btn btn--ghost btn--small" id="cc-predict" aria-pressed="false">${icon("target")}Guess where it stops</button>` : ""}
              <button type="button" class="btn btn--ghost btn--small" id="cc-pybtn" aria-pressed="${py}" aria-controls="cc-py">${icon("code")}Python</button>
              ${L.design ? `<button type="button" class="btn btn--ghost btn--small" id="cc-design" aria-pressed="false">${icon("palette")}Design my chart</button>` : ""}
              <span class="cc-speed" role="group" aria-label="Speed" id="cc-speed"><span aria-hidden="true">Speed</span>${[["700", "Slow"], ["380", "Normal"], ["140", "Fast"]].map(([v, t]) => `<button type="button" class="cc-speed__b" data-speed="${v}" aria-pressed="${Number(v) === speed}">${t}</button>`).join("")}</span>
            </div>
          </div>
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    // Feedback sits right under the chart's status line, so it's on the first screen next to the boat.
    const fb = document.getElementById("lab-feedback");
    if (fb) $(".cc__readout").after(fb);
    const ed = H.editor($("#cc-code"), {
      blocks: L.blocks, labelOf, paletteLabel: paletteLabeler(L), countText: countText(L), usesFn: L.usesFn, fnName: L.fnName || "My Move", maxBlocks: L.budget, par: L.par,
      starter, countFn: true, undo: true, python: false, varName: L.varName, goal: "mooring", loops: true, say: (t, k) => api.say(t, k),
      isBusy: () => running,
      onEdit: () => { passed.clear(); markTabs(); resetWorld(); api.say(""); renderPy(); }
    });
    $("#cc-code").appendChild($("#cc-planwords"));   // the plan in words sits right under the program it guides

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
      const leg = legAt(k);
      if (ch === "*") return { cls: got ? "is-got" : "", html: (got ? "" : `<span class="cc-buoy">${icon("buoy")}</span>`) + (leg ? `<b class="cc-leg ${got ? "is-done" : ""}" aria-hidden="true">${leg.name}</b>` : ""), say: got ? `open water (trap ${leg ? leg.name + " " : ""}hauled)` : leg ? `trap ${leg.name}, ${leg.where}` : "a trap buoy" };
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
      const heading = planHeadings();
      const cells = g.rows.map((r, y) => [...r].map((_, x) => {
        const c = cellInfo(x, y), k = key(x, y);
        const n = planAt.get(k), act = planActs.get(k);
        const arrow = n ? ARROW[heading[n - 1]] : "";
        const extra = `${n ? `<b class="cc-plan ${act ? "cc-plan--act" : ""}" aria-hidden="true">${act ? (act === "haul" ? "H" : "S") : arrow}</b>` : ""}${prediction === k ? `<span class="cc-guess" aria-hidden="true">${icon("target")}</span>` : ""}`;
        const cls = `cc-cell ${c.cls} ${planBroke === k ? "is-off" : ""}`;
        const say = `Row ${y}, column ${x}: ${c.say}${n ? `, plan step ${n}, heading ${DIR_WORD[heading[n - 1]]}` : ""}${act ? `, plan to ${act === "haul" ? "haul the trap" : "set a trap"} here` : ""}${prediction === k ? ", your guess" : ""}`;
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
      if (legsOn()) v.push(`<span class="cc-legs" aria-label="Traps hauled">${L.legs.map((l) => `<span class="cc-legs__i ${st.got.has(l.at) ? "is-done" : ""}">${st.got.has(l.at) ? icon("check") : ""}${l.name}<span class="visually-hidden">${st.got.has(l.at) ? " hauled" : " not hauled yet"}</span></span>`).join("")}</span>`);
      else if (g.gems.length) v.push(`<span class="var-chip">hauled <b>${st.got.size}</b>/${g.gems.length}</span>`);
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
      gen = null; finished = false; planBroke = null; stepsTaken = 0; blocksRun = 0; lastTurn = false;
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
      if (!predicted) {
        if (mode !== "predict") setMode("predict");
        api.say("Before you run it: tap the square where you think the boat will stop. Then press Run.", "info");
        return false;
      }
      st = H.startState(g, dir);
      gen = H.run(ed.program, st, { g, fn: ed.fn, depth: 0, carry: !!L.carry, loopTicks: true });
      api.log("lab_test_run", { blocks: ed.count(), world: w });
      return true;
    }
    function stepOnce() {
      if (!gen && !begin()) { stop(); return false; }
      const r = gen.next();
      if (r.done) { finish(); return false; }
      const b = r.value;
      blocksRun++;
      ed.highlight(b); pyActive(b.id, b.lap);
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
      setStatus(`Step ${blocksRun}: ${b.lap ? `${labelOf(b.type).replace(/ times$/, "")}, lap ${b.lap} of ${b.of}` : b.checking ? `checking ${labelOf(b.type)}${b.answer === undefined ? "" : b.answer ? " (yes)" : " (no)"}` : labelOf(b.type)}`);
      return true;
    }
    function finish() {
      stop();
      finished = true; runLabel();
      const res = H.check(L, st, g);
      const count = ed.count();
      const ctx = { g, st, program: ed.program, fn: ed.fn, count, lastTurn };
      let note = "";
      if (prediction) {
        const [px, py] = prediction.split(",").map(Number);
        predictedRight = px === st.x && py === st.y;
        const off = Math.abs(px - st.x) + Math.abs(py - st.y);
        note = predictedRight ? " You predicted exactly where it stopped!" : ` It stopped ${plural(off, "square", "squares")} from your guess. Your guess is the ring on the chart.`;
        prediction = null; refreshPredict();
      }
      if (!planBroke && plan.length && res.reason !== "crash") {
        // The route matched; did the program do the jobs the plan marks?
        const missed = [...planActs].find(([k, a]) => plan.includes(k) && !(a === "haul" ? st.got : st.dropped).has(k));
        if (missed) { planBroke = missed[0]; refreshCells(); note += ` Your plan ${missed[1] === "haul" ? "hauls a trap" : "sets a trap"} on the red square, but your program didn't.`; }
      } else if (planBroke) note += " The red square is where the boat left your plan.";
      if (!res.ok) {
        failedRuns++; testingAll = false;
        if (res.reason === "crash") {
          const [dx, dy] = H.DIRS[st.dir];
          const c = el.querySelector(`.cc-cell[data-x="${st.x + dx}"][data-y="${st.y + dy}"]`);
          if (c) c.classList.add("is-crash");
          api.log("lab_bug", { kind: "crash" });
        }
        setStatus({ crash: "Bump!", loop: "Going in circles", short: "Stopped", traps: "Traps missing", marks: "Marks missed", calls: "Use your block" }[res.reason] || "Try again");
        if (legsOn()) {   // name the legs: what works, and which trap is next
          const doneLegs = L.legs.filter((l) => st.got.has(l.at)), next = L.legs.filter((l) => !st.got.has(l.at));
          note += doneLegs.length
            ? ` Legs done: ${doneLegs.map((l) => l.name).join(", ")}. Keep those blocks!${next.length ? ` The bug is in the leg after trap ${doneLegs[doneLegs.length - 1].name}.` : " Now get home to the mooring."}`
            : " Start with leg 1: get to your first trap and haul it.";
        }
        api.say(feedback(L, res, ctx) + note + (failedRuns >= 2 ? " Need a clue? Press Hint under your goal." : ""), "warn");
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
      const after = `<div class="cc-win">${markRow(m, markWhat(L))}</div>`;
      let extra = "";
      if (L.design) extra += voyageCard(python, count, m);
      if (L.legs && !custom && !partOneWon) {
        partOneWon = true;
        extra += `<section class="cc-part2" aria-labelledby="cc-part2-title"><h3 id="cc-part2-title">${icon("palette")}Part 2: design your own voyage</h3>
          <p>You sailed the Captain's Challenge. Now make a chart nobody has sailed before: place your boat, the mooring, 2 to 4 traps, and some ledges. Then program your boat to sail it.</p>
          <button type="button" class="btn btn--primary" id="cc-part2-go">${icon("palette")}Design my chart</button></section>`;
      }
      const r = REGIONS.findIndex((x) => idx === x.to);
      if (r >= 0 && regionDone(REGIONS[r])) extra += graduation(r);
      api.win(result, { extra, after });
      wireWinPanel(python);
    }
    function voyageCard(python, count, m) {
      const mini = grids[0].map((row) => `<div class="cc-mini__row">${[...row].map((ch) => `<i class="cc-mini__c cc-mini--${{ "#": "l", S: "s", G: "g", "*": "t", o: "o", x: "x" }[ch] || "w"}"></i>`).join("")}</div>`).join("");
      return `<section class="cc-card" id="cc-card" aria-labelledby="cc-card-title">
        <h3 id="cc-card-title">${icon("map")}My Voyage Card</h3>
        <p class="cc-card__who">${esc(api.user && api.user.displayName ? `Captain ${api.user.displayName}` : "Captain ____________")}${boat.name ? ` · the ${esc(boat.name)}` : ""}</p>
        <div class="cc-card__body"><div class="cc-mini" role="img" aria-label="${custom ? "The chart you designed" : "The Casco Bay chart"}">${mini}</div>
          <pre class="cc-py__code">${esc(python)}</pre></div>
        <p>${custom ? "A chart I designed myself." : "The Captain's Challenge chart."} ${count} blocks.</p>${markRow(m, markWhat(L))}
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
      const p2 = document.getElementById("cc-part2-go");
      if (p2) p2.addEventListener("click", () => { $("#cc").scrollIntoView({ block: "start" }); if (mode !== "design") setMode("design"); const t = el.querySelector('[data-tool="S"]'); if (t) t.focus({ preventScroll: true }); });
      const py = document.getElementById("cc-grad-py");
      if (py) py.addEventListener("click", () => { showPy(true); $("#cc-py").scrollIntoView({ block: "nearest" }); });
    }

    /* ───────── Python view ───────── */
    function renderPy() {
      const lines = ed.program.length || ed.fn.length ? SE.minipy.toPythonLines(ed.program, ed.fn, L.fnName || "My Move", pyOpts(L)) : [{ text: "# Add blocks to see them in Python.", id: null }];
      $("#cc-py-code").innerHTML = lines.map((l) => `<span class="cc-py__line" ${l.id ? `data-pyid="${l.id}"` : ""}>${highlightPy(l.text) || " "}</span>`).join("\n");
      $("#cc-py-notes").innerHTML = pyNotes(lines).map((t) => `<li>${t}</li>`).join("");
    }
    /* Light up the running line. A loop's line also shows its counter (i = 0, 1, 2…, as Python counts laps). */
    function pyActive(id, lap) {
      el.querySelectorAll(".cc-py__line.is-active").forEach((n) => n.classList.remove("is-active"));
      if (!id) { el.querySelectorAll(".cc-py__lap").forEach((n) => n.remove()); return; }
      const n = el.querySelector(`.cc-py__line[data-pyid="${id}"]`);
      if (!n) return;
      n.classList.add("is-active");
      if (lap) {
        let tag = n.querySelector(".cc-py__lap");
        if (!tag) { tag = document.createElement("span"); tag.className = "cc-py__lap"; n.appendChild(tag); }
        tag.textContent = /^\s*for /.test(n.textContent) ? `  i = ${lap - 1}` : `  lap ${lap}`;
      }
    }
    function showPy(on) {
      $("#cc-py").hidden = !on;
      $("#cc").classList.toggle("cc--py", on);
      $("#cc-pybtn").setAttribute("aria-pressed", String(on));
      setPy(on);
      if (on) { renderPy(); api.log("lab_python_view", {}); }
    }

    /* ───────── Lesson: learn first, then try (L.lesson, from captain-levels.js) ─────────
       The first time a level opens, its lesson shows in place of the workspace. "Lesson" in the brief opens it again. */
    const lessonKey = `stem207.captain.lesson.${L.id}.${api.user && api.user.id ? api.user.id : "preview"}`;
    const lessonSeen = () => { try { return localStorage.getItem(lessonKey) === "1"; } catch (e) { return false; } };
    let lesson = null;   // { i, right: Set of cards answered right, ex: the worked example's run }
    function openLesson(i = 0) {
      if (!L.lesson) return;
      stop();
      if (!lesson) { lesson = { i: 0, right: new Set(), ex: null }; api.log("lab_lesson_viewed", { lesson: L.id }); }
      lesson.i = i; lesson.ex = null;
      $("#cc").classList.add("cc--lesson");
      const box = $("#cc-lesson");
      box.hidden = false;
      const c = L.lesson.cards[i], last = i === L.lesson.cards.length - 1;
      const gated = c.check && !lesson.right.has(i);
      box.innerHTML = `
        <p class="cc-lesson__top"><span class="eyebrow">${icon("bulb")}Learn it first · ${esc(L.lesson.title)}</span><span class="cc-lesson__n">Card ${i + 1} of ${L.lesson.cards.length}</span></p>
        <h3 id="cc-lesson-h" tabindex="-1">${esc(c.h)}</h3>
        ${(c.say || []).map((t) => `<p>${esc(t)}</p>`).join("")}
        ${c.show ? `<div class="cc-lesson__blocks" aria-label="Blocks">${c.show.map((t) => { const depth = (t.match(/^ */)[0].length) / 2; return `<p class="cc-lesson__blk" style="--d:${depth}">${esc(t.trim())}</p>`; }).join("")}</div>` : ""}
        ${c.example ? lessonExample(c.example) : ""}
        ${c.check ? `<fieldset class="cc-lesson__check"><legend>${esc(c.check.q)}</legend>
          <div class="cc-lesson__opts">${c.check.options.map(([t], k) => `<button type="button" class="btn btn--ghost" data-opt="${k}" aria-pressed="${lesson.right.has(i) && c.check.options[k][1]}">${esc(t)}</button>`).join("")}</div>
          <p class="cc-lesson__why" id="cc-lesson-why" role="status">${lesson.right.has(i) ? esc(c.check.options.find((o) => o[1])[2]) : ""}</p></fieldset>` : ""}
        <div class="cc-lesson__nav">
          ${i > 0 ? `<button type="button" class="btn btn--ghost" id="cc-lesson-back">${icon("arrowLeft")}Back</button>` : ""}
          ${last
            ? `<button type="button" class="btn btn--launch" id="cc-lesson-done" ${gated ? "disabled" : ""}>${icon("rocket")}Start coding</button>`
            : `<button type="button" class="btn btn--primary" id="cc-lesson-next" ${gated ? "disabled" : ""}>Next${icon("arrowRight")}</button>`}
          ${gated ? `<span class="cc-lesson__gate">Answer the question to go on.</span>` : ""}
          ${lessonSeen() ? `<button type="button" class="linkish" id="cc-lesson-skip">Back to the level</button>` : ""}
        </div>`;
      if (c.example) resetExample();
      const h = $("#cc-lesson-h");
      if (h) h.focus({ preventScroll: true });
    }
    function closeLesson() {
      try { localStorage.setItem(lessonKey, "1"); } catch (e) { /* private mode: it shows again next time */ }
      $("#cc").classList.remove("cc--lesson");
      $("#cc-lesson").hidden = true;
      lesson = null;
      renderGrid();
      const first = $(".palette .blk--btn");
      if (first) first.focus({ preventScroll: true });
      api.say(`Now try it: ${L.goal}`, "info");
    }
    /* The worked example: a tiny real chart and its program, stepped through with the real engine. */
    function exLines(list, depth, out) {
      list.forEach((b) => {
        out.push(`<li class="cc-ex__line" data-exid="${b.id}" style="--d:${depth}">${esc(exLabel(b))}</li>`);
        if (b.body) exLines(b.body, depth + 1, out);
        if (b.else) { out.push(`<li class="cc-ex__line cc-ex__else" style="--d:${depth}">else</li>`); exLines(b.else, depth + 1, out); }
      });
      return out;
    }
    let exLabel = (b) => b.type;
    function lessonExample(e) {
      return `<div class="cc-ex">
          <div class="cc-ex__chart" id="cc-ex-chart"></div>
          <div class="cc-ex__side">
            <ol class="cc-ex__code" id="cc-ex-code" aria-label="The example program"></ol>
            <p class="cc-ex__status" id="cc-ex-status" role="status">Press Step to run the first block.</p>
            <div class="cc-ex__btns"><button type="button" class="btn btn--primary" id="cc-ex-step">${icon("arrowRight")}Step (1 block)</button><button type="button" class="btn btn--ghost" id="cc-ex-reset">${icon("refresh")}Start over</button></div>
            ${e.tip ? `<p class="cc-ex__tip">${icon("bulb", 'class="inline-icon"')}${esc(e.tip)}</p>` : ""}
          </div>
        </div>`;
    }
    function resetExample() {
      const e = L.lesson.cards[lesson.i].example;
      const parsed = SE.minipy.parse(e.src, { varName: e.varName, goal: "mooring" });
      const p = { main: H.clone(parsed.main), fn: H.clone(parsed.fn) };   // clone gives each block an id to light up
      const eg = H.parseGrid(e.grid), est = H.startState(eg, e.dir);
      const lab = labeler({ fnName: e.fnName, varName: e.varName });
      exLabel = (b) => lab(b.type) + (H.BLOCKS[b.type].count ? ` ${b.n}` : "") + (b.type === "repeat" ? " times" : "");
      lesson.ex = { g: eg, st: est, gen: H.run(p.main, est, { g: eg, fn: p.fn, depth: 0, loopTicks: true }), done: false, varName: e.varName };
      $("#cc-ex-code").innerHTML = (p.fn.length ? [`<li class="cc-ex__line cc-ex__fn" style="--d:0">${esc(e.fnName || "My Move")} =</li>`, ...exLines(p.fn, 1, []), `<li class="cc-ex__line cc-ex__fn" style="--d:0">Main program:</li>`] : []).concat(exLines(p.main, p.fn.length ? 1 : 0, [])).join("");
      $("#cc-ex-status").textContent = "Press Step to run the first block.";
      $("#cc-ex-step").disabled = false;
      drawExample();
    }
    function drawExample() {
      const { g: eg, st: est } = lesson.ex;
      const cells = eg.rows.map((r, y) => [...r].map((ch, x) => {
        const k = key(x, y);
        const cls = ch === "#" ? "cc-cell--ledge" : ch === "G" ? "cc-cell--mooring" : ch === "S" ? "cc-cell--dock" : ch === "*" && est.got.has(k) ? "is-got" : "";
        const html = ch === "G" ? `<span class="cc-moor" aria-hidden="true"><i></i></span>` : ch === "*" && !est.got.has(k) ? `<span class="cc-buoy">${icon("buoy")}</span>` : "";
        return `<div class="cc-cell ${cls}">${html}</div>`;
      }).join("")).join("");
      $("#cc-ex-chart").innerHTML = `<div class="cc__grid" style="--cols:${eg.w};--rows:${eg.h}" role="img" aria-label="A small example chart. The boat is at row ${est.y}, column ${est.x}, facing ${DIR_WORD[est.dir]}.">${cells}<div class="cc-boat" style="width:calc(100% / ${eg.w});height:calc(100% / ${eg.h});transform:translate(${est.x * 100}%, ${est.y * 100}%)">${boatSvg(boat)}</div></div>
        ${lesson.ex.varName ? `<span class="var-chip">${esc(lesson.ex.varName)} = <b>${est.vars.steps}</b></span>` : ""}`;
      const svg = $("#cc-ex-chart .cc-boat > svg");
      if (svg) svg.style.transform = `rotate(${H.ROT[est.dir]}deg)`;
    }
    function stepExample() {
      const ex = lesson.ex;
      if (!ex || ex.done) return;
      const r = ex.gen.next();
      el.querySelectorAll(".cc-ex__line.is-active").forEach((n) => n.classList.remove("is-active"));
      if (r.done || ex.st.error) {
        ex.done = true; $("#cc-ex-step").disabled = true;
        $("#cc-ex-status").textContent = ex.st.error ? "The boat stopped. Press Start over to watch again." : "Made it to the mooring! Press Start over to watch it again.";
        $("#cc-ex-reset").focus();
        return;
      }
      const b = r.value;
      const line = el.querySelector(`.cc-ex__line[data-exid="${b.id}"]`);
      if (line) line.classList.add("is-active");
      const word = exLabel(b).replace(/ \d+ times$/, "");
      $("#cc-ex-status").textContent = b.lap ? `${word}: lap ${b.lap} of ${b.of}.`
        : b.answer !== undefined ? `${word}? ${b.answer ? "Yes, so the if part runs." : "No, so the else part runs."}`
        : b.type === "call" ? `${word}: running the steps inside it.` : `${word}.`;
      drawExample();
    }
    function lessonClick(e) {
      const t = e.target.closest("button");
      if (!t || !lesson) return;
      const c = L.lesson.cards[lesson.i];
      if (t.id === "cc-lesson-next") openLesson(lesson.i + 1);
      else if (t.id === "cc-lesson-back") openLesson(lesson.i - 1);
      else if (t.id === "cc-lesson-done" || t.id === "cc-lesson-skip") closeLesson();
      else if (t.id === "cc-ex-step") stepExample();
      else if (t.id === "cc-ex-reset") { resetExample(); $("#cc-ex-step").focus(); }
      else if (t.dataset.opt && c.check) {
        const [, right, why] = c.check.options[Number(t.dataset.opt)];
        el.querySelectorAll("[data-opt]").forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
        api.log("lab_lesson_check", { lesson: L.id, card: lesson.i, right: !!right });
        if (right) {
          lesson.right.add(lesson.i);
          const go = $("#cc-lesson-next") || $("#cc-lesson-done");
          if (go) go.disabled = false;
          const gate = el.querySelector(".cc-lesson__gate");
          if (gate) gate.remove();
        }
        const w = $("#cc-lesson-why");
        w.className = `cc-lesson__why ${right ? "is-good" : "is-warn"}`;
        w.textContent = why;
      }
    }

    /* ───────── Plan, predict, design ───────── */
    function setMode(m) {
      if (m === "design" && mode !== "design" && !designOpen()) {
        api.say("Finish Part 1 first: haul traps A, B, C, and D, and reach your mooring. Then you can design your own chart.", "info");
        return;
      }
      if (mode === "design" && m === "design" && !finishDesign()) return;   // a chart that breaks the rules stays open
      mode = mode === m ? null : m;
      if (mode === "design") stop();
      // While designing, the four steps take the program's place beside the chart, and Run waits until Done.
      $("#cc").classList.toggle("cc--designing", mode === "design");
      const dp = $("#cc-designpanel");
      if (dp) { dp.hidden = mode !== "design"; dp.innerHTML = mode === "design" ? designPanel() : ""; }
      ["plan", "predict", "design"].forEach((k) => { const b = $(`#cc-${k}`); if (b) b.setAttribute("aria-pressed", String(mode === k)); });
      const p = $("#cc-modepanel");
      if (mode === "plan") p.innerHTML = `<p>${icon("map", 'class="inline-icon"')}Tap the squares your boat will sail through, in order, starting next to the boat.${g.gems.length || g.spots.length ? " Then tap a trap on your route to plan a job there: haul it, or set a trap on a dashed circle." : ""}</p>
        <div class="cc-plantools"><button type="button" class="linkish" id="cc-plan-back">${icon("arrowLeft")}Take back the last square</button><button type="button" class="linkish" id="cc-plan-clear">${icon("trash")}Clear my plan</button></div>`;
      else if (mode === "predict") p.innerHTML = `<p>${icon("target", 'class="inline-icon"')}Read your program. Tap the square where you think the boat will stop.</p>`;
      else p.innerHTML = "";
      renderGrid();
      if (mode === "design") { solvable(); $("#cc-gridwrap").scrollIntoView({ block: "nearest" }); }
    }
    /* The plan's heading on each planned square (the way the boat sails into it). */
    function planHeadings() {
      let [px, py] = g.start;
      return plan.map((k) => {
        const [x, y] = k.split(",").map(Number);
        const d = x > px ? "E" : x < px ? "W" : y > py ? "S" : "N";
        px = x; py = y;
        return d;
      });
    }
    /* The plan in words: "Forward 2 · Turn right · Forward 1 · Haul…", worked out from the boat's starting
       direction. It's a plan for the student to code from, never blocks. */
    function planWords() {
      const out = [];
      let cur = dir, run = 0;
      const flush = () => { if (run) { out.push(`Forward ${run}`); run = 0; } };
      planHeadings().forEach((d, i) => {
        if (d !== cur) {
          flush();
          if (H.RIGHT[cur] === d) out.push("Turn right");
          else if (H.LEFT[cur] === d) out.push("Turn left");
          else out.push("Turn right", "Turn right");
          cur = d;
        }
        run++;
        const act = planActs.get(plan[i]);
        if (act) { flush(); out.push(act === "haul" ? "Haul trap" : "Set trap"); }
      });
      flush();
      return out;
    }
    function renderPlanWords() {
      const box = $("#cc-planwords");
      if (!box) return;
      const words = planWords();
      box.hidden = !words.length;
      const home = plan.length && g.goal && plan[plan.length - 1] === key(g.goal[0], g.goal[1]);
      const jobs = g.gems.length + g.spots.length, planned = [...planActs.keys()].filter((k) => plan.includes(k)).length;
      box.innerHTML = words.length ? `<p class="cc-planwords__t">${icon("map", 'class="inline-icon"')}My plan in words</p>
        <ol class="cc-planwords__list">${words.map((w) => `<li>${esc(w)}</li>`).join("")}</ol>
        <p class="cc-planwords__note">${home ? "Your plan reaches the mooring." : "Keep plotting until you reach the mooring."}${jobs ? ` Jobs planned: ${planned} of ${jobs}.` : ""} Now build blocks that follow it.</p>
        ${SE.speech.button("plan", "Listen")}` : "";
      const rb = box.querySelector('[data-read="plan"]');
      if (rb) rb.addEventListener("click", () => SE.speech.read(rb, [{ text: `My plan. ${words.join(". ")}.`, el: box.querySelector(".cc-planwords__list") }]));
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
        const job = ch === "*" ? "haul" : ch === "o" ? "set" : null;
        if (plan.includes(k) && job) {   // a trap on the route: tap to plan the job there, tap again to take it off
          if (planActs.has(k)) planActs.delete(k); else planActs.set(k, job);
          api.say(planActs.has(k) ? `Planned: ${job === "haul" ? "haul the trap" : "set a trap"} on this square.` : "Job taken off this square.", "info");
        }
        else if (plan.length && plan[plan.length - 1] === k) { planActs.delete(plan.pop()); api.say(""); }
        else if (ch === "#") { api.say("That's a granite ledge. Plot through open water.", "warn"); return; }
        else if (!adjacent(plan.length ? plan[plan.length - 1] : key(g.start[0], g.start[1]), k)) { api.say("Plot one square at a time: pick a square next to the last one.", "warn"); return; }
        else { plan.push(k); api.say(job ? `There's a ${job === "haul" ? "trap buoy" : "dashed circle"} here. Tap it again to plan a job on it.` : ""); }
        renderPlanWords();
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
      if (mode === "design") solvable();
      const again = el.querySelector(`.cc-cell[data-x="${x}"][data-y="${y}"]`);
      if (again && again.tagName === "BUTTON") { el.querySelectorAll("button.cc-cell").forEach((c) => (c.tabIndex = -1)); again.tabIndex = 0; again.focus(); }
    }
    /* Leaving the designer: the chart must be valid, reachable, and have a trap. true = it's ready to sail. */
    /* Level 10's designer, step by step, with a live check that the chart can be sailed. */
    const DESIGN_STEPS = [
      { n: 1, t: "Place your boat", tools: [["S", "Boat start"]], turn: true },
      { n: 2, t: "Place the mooring", tools: [["G", "Mooring"]] },
      { n: 3, t: "Add 2 to 4 trap buoys", tools: [["*", "Trap buoy"]] },
      { n: 4, t: "Add ledges to make it tricky", tools: [["#", "Ledge"], [".", "Water"]] }
    ];
    function designPanel() {
      return `<h3 id="cc-design-title">${icon("palette")}Design my chart</h3>
        <ol class="cc-dsteps">${DESIGN_STEPS.map((s) => `<li><span class="cc-dsteps__n" aria-hidden="true">${s.n}</span><span class="cc-dsteps__t">${esc(s.t)}</span>
          <span class="cc-tools" role="group" aria-label="${esc(s.t)}">${s.tools.map(([t, n]) => `<button type="button" class="btn btn--ghost btn--small" data-tool="${t}" aria-pressed="${tool === t}">${esc(n)}</button>`).join("")}${s.turn ? `<button type="button" class="btn btn--ghost btn--small" id="cc-turnboat">${icon("refresh")}Boat faces ${DIR_WORD[dir]}</button>` : ""}</span></li>`).join("")}</ol>
        <div class="cc-dcheck"><p class="cc-solvable" id="cc-solvable" role="status"></p><button type="button" class="btn btn--primary btn--small" id="cc-design-done">${icon("check")}Done: test my chart</button></div>
        <p class="field-help">Pick a tool, then tap squares. The edge stays granite.</p>`;
    }
    /* Can this chart be sailed? Updated after every square the student paints. */
    function solvable() {
      const out = $("#cc-solvable");
      if (!out) return;
      const bad = H.validateGrid(grids[w]);
      const traps = (grids[w].join("").match(/\*/g) || []).length;
      const r = !bad.length && SE.levelDesigner ? SE.levelDesigner.route(grids[w]) : { ok: !bad.length, why: bad[0] };
      const why = bad.length ? bad[0] : !r.ok ? String(r.why).replace(/Wharf tool/g, "Mooring tool").replace(/wharf/g, "mooring") : traps < 2 ? "Add at least 2 trap buoys, so the voyage has jobs to do." : traps > 4 ? "That's a lot of traps. Keep it to 4 or fewer." : "";
      out.className = `cc-solvable ${why ? "is-no" : "is-yes"}`;
      out.innerHTML = why ? `${icon("alert")}<span><strong>Not ready yet.</strong> ${esc(why)}</span>` : `${icon("check")}<span><strong>Sailable!</strong> The best route is ${r.moves} moves. Press Done to sail it.</span>`;
    }
    function finishDesign() {
      const bad = H.validateGrid(grids[w]);
      if (bad.length) { api.say(bad[0], "warn"); return false; }
      const r = SE.levelDesigner ? SE.levelDesigner.route(grids[w]) : { ok: true };
      if (!r.ok) { api.say(String(r.why).replace(/Wharf tool/g, "Mooring tool").replace(/wharf/g, "mooring"), "warn"); return false; }
      const traps = (grids[w].join("").match(/\*/g) || []).length;
      if (traps < 2) { api.say("Add at least 2 trap buoys, so the voyage has jobs to do.", "warn"); return false; }
      if (traps > 4) { api.say("That's a lot of traps. Keep it to 4 or fewer.", "warn"); return false; }
      passed.clear(); markTabs();
      api.log("lab_design", { grid: grids[w] });
      resetWorld();
      api.say(`Your chart works: the best route is ${r.moves} moves. Now program your boat to sail it.`, "good");
      return true;
    }

    /* ───────── Events ───────── */
    $("#cc-run").addEventListener("click", () => { if (running) { stop(); return; } go(); });
    $("#cc-step").addEventListener("click", () => {
      if (running) stop();
      if (finished || (st && st.error)) resetWorld();
      const first = !gen;
      if (stepOnce() && first && !stepTold) { stepTold = true; api.say("Step runs one block at a time, so you can watch closely. Press it again for the next block.", "info"); }
    });
    $("#cc-reset").addEventListener("click", () => { testingAll = false; resetWorld(); api.say(""); });
    $("#cc-speed").addEventListener("click", (e) => {
      const b = e.target.closest("[data-speed]");
      if (!b) return;
      speed = Number(b.dataset.speed);
      el.querySelectorAll("[data-speed]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (running) { clearInterval(timer); timer = setInterval(() => { if (!stepOnce()) stop(); }, speed); }
    });
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
      const no = () => api.say("Your browser didn't allow copying. Select the code and copy it instead.", "warn");
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, no); else no();
    });
    const panelClick = (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.id === "cc-plan-clear") { plan = []; planActs.clear(); planBroke = null; renderGrid(); renderPlanWords(); }
      else if (t.id === "cc-plan-back") { if (plan.length) planActs.delete(plan.pop()); planBroke = null; renderGrid(); renderPlanWords(); }
      else if (t.id === "cc-design-done") setMode("design");
      else if (t.dataset.tool) { tool = t.dataset.tool; el.querySelectorAll("[data-tool]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tool === tool))); }
      else if (t.id === "cc-turnboat") { dir = H.RIGHT[dir]; t.innerHTML = `${icon("refresh")}Boat faces ${DIR_WORD[dir]}`; custom = true; resetWorld(); solvable(); }
    };
    $("#cc-modepanel").addEventListener("click", panelClick);
    if ($("#cc-designpanel")) $("#cc-designpanel").addEventListener("click", panelClick);
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

    if (L.lesson) {
      $("#cc-lesson").addEventListener("click", lessonClick);
      // "Lesson" in the brief, beside Listen and Hint, opens the lesson again.
      const tools = document.querySelector(".lab-brief__tools");
      if (tools) {
        tools.insertAdjacentHTML("beforeend", `<button type="button" class="btn btn--ghost btn--small" id="cc-lesson-open">${icon("bulb")}Lesson</button>`);
        document.getElementById("cc-lesson-open").addEventListener("click", () => openLesson(0));
      }
    }
    resetWorld();
    renderPy();
    const startMode = mode; mode = null;
    if (startMode) setMode(startMode);
    if (L.predict && !startMode) {
      // Predict levels say so up front: with a program to read (a starter), the chart is ready for a guess now.
      if (L.starter) setMode("predict");
      else $("#cc-modepanel").innerHTML = `<p>${icon("target", 'class="inline-icon"')}On this level: build your program, then guess where the boat stops before you run it.</p>`;
    }
    if (L.starter) api.say("This program was written by another captain. Read it, tap where you think the boat will stop, then press Step to watch it one block at a time.", "info");
    const best = bestFor(api, idx);
    if (best) api.say(`Your best so far: ${best} blocks.${L.par ? ` Par is ${L.par}.` : ""}`, "info");
    if (L.lesson && !lessonSeen()) openLesson(0);
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
            </div>
          </div>
        </div>
        <ul class="cc-land__regions">${REGIONS.map((r, i) => `<li><a href="#/lab/captain-code/${r.from + 1}"><strong>${esc(r.title)}</strong><span>${r.to - r.from + 1} levels${i === 0 ? " · the workshop" : " · for early finishers"}</span><span class="muted">${esc(r.blurb)}</span></a></li>`).join("")}</ul>
      </div>`;
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
    tagline: "Program a lobster boat along the Maine coast. Your boat only goes where your code tells it: 10 workshop levels in Casco Bay, plus 24 more along the coast.",
    briefFirst: true,
    compactTools: true,
    levels: LEVELS,
    chapters: REGIONS,
    mount,
    landing
  });
  SE.captain = { LEVELS, REGIONS, feedback, marks, labeler };
})();
