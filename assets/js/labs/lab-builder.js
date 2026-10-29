/*
 * Harbor Level Designer — Coding & Computer Science, Game Dev crew (planning/CODING_PLAN.md)
 * Game studios hire level designers to build levels that are fair, possible, and fun, then playtest and
 * tune them. Students edit a harbor map (tap a tool, then tap squares; no dragging), and the lab checks
 * the design with a path finder: Can the boat get home? How long is the best route? Are the traps reachable?
 *   1 No way home      fix a level nobody can finish
 *   2 Too easy         make the route longer and more interesting
 *   3 Trap run         place traps the boat can reach
 *   4 Just right       tune the difficulty into a target range
 *   5 Playtest it      design a level, then solve it yourself in Python
 *   6 Difficulty curve put three levels in order, easiest to hardest
 * Uses SE.harbor (parseGrid, run) and SE.minipy. Pure rules for tests: SE.levelDesigner.route(grid),
 * .check(levelIndex, grid, extra).
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const W = 8, H = 6;
  const TOOLS = [
    { id: "#", name: "Ledge", glyph: "▪" },
    { id: ".", name: "Water", glyph: "·" },
    { id: "*", name: "Trap buoy", glyph: "●" },
    { id: "S", name: "Boat start", glyph: "▶" },
    { id: "G", name: "Wharf", glyph: "W" },
  ];
  const box = (rows) => rows;   // rows are W wide, H tall, with a ledge border
  const LEVELS = [
    { kind: "edit", title: "No way home", concept: "Possible levels",
      goal: "Nobody can finish this level: ledges block the wharf. Change it so the boat can get home, but keep at least 5 ledges inside the harbor.",
      start: box(["########", "#S..#..#", "#...#..#", "#####..#", "#....#G#", "########"]),
      rules: { solvable: true, minLedges: 5 },
      hints: ["Find where the ledges cut the harbor in two.", "Replace one or two ledges with water to open a channel."],
      learned: "The first rule of level design: every level must be possible. Designers test their own levels before anyone else plays them." },
    { kind: "edit", title: "Too easy", concept: "Interesting levels",
      goal: "The boat sails straight home. Add ledges so the best route takes at least 10 moves.",
      start: box(["########", "#S.....#", "#......#", "#......#", "#.....G#", "########"]),
      rules: { solvable: true, minRoute: 10 },
      hints: ["Build walls that make the boat go around.", "A zigzag channel makes the route longer. Check the route length after each change."],
      learned: "A level that's too easy is boring. Designers add obstacles to make players think, without making the level impossible." },
    { kind: "edit", title: "Trap run", concept: "Goals and rewards",
      goal: "Place exactly 3 trap buoys that the boat can reach, with a best route of 14 moves or fewer.",
      start: box(["########", "#S.....#", "#.###..#", "#......#", "#.....G#", "########"]),
      rules: { solvable: true, buoys: [3, 3], maxRoute: 14 },
      hints: ["Put buoys in water squares, not on ledges.", "Buoys close to the route keep it short. Far-away buoys make it longer."],
      learned: "Collectibles give players goals along the way. Where you put them changes how long and how hard a level feels." },
    { kind: "edit", title: "Just right", concept: "Difficulty",
      goal: "Tune this level so the best route is between 12 and 16 moves and includes 2 traps.",
      start: box(["########", "#S.....#", "#......#", "#......#", "#.....G#", "########"]),
      rules: { solvable: true, buoys: [2, 2], minRoute: 12, maxRoute: 16 },
      hints: ["Add ledges to lengthen the route, or move buoys farther away.", "Check the route length after every change. Aim for the middle of the range."],
      learned: "Game designers tune difficulty with numbers: route length, number of goals, and limits. A target range keeps a level challenging but fair." },
    { kind: "playtest", title: "Playtest it", concept: "Playtesting",
      goal: "Design a level with at least 1 trap and a route of at least 8 moves. Then write Python that solves it.",
      start: box(["########", "#S.....#", "#......#", "#......#", "#.....G#", "########"]),
      rules: { solvable: true, buoys: [1, 4], minRoute: 8 },
      hints: ["Design first, then press Check design before you write code.", "Use for loops and if at_buoy(): haul() to solve your own level."],
      learned: "Designers play their own levels before anyone else does. Solving it in code proves it's possible, and shows how hard it really is." },
    { kind: "order", title: "Difficulty curve", concept: "Difficulty curves",
      goal: "A game should start easy and get harder. Put these three levels in order, from easiest to hardest.",
      choices: [
        { id: "A", grid: ["########", "#S#*...#", "#.#.##.#", "#.#.#..#", "#...#*G#", "########"] },
        { id: "B", grid: ["########", "#S.....#", "#......#", "#......#", "#.....G#", "########"] },
        { id: "C", grid: ["########", "#S..*..#", "#.####.#", "#......#", "#*....G#", "########"] },
      ],
      hints: ["Check each level's route length and number of traps.", "Fewer moves and no traps is easiest."],
      learned: "A difficulty curve starts easy and builds. Ordering levels by route length and goals is how designers plan a whole game." },
  ];
  SE.labs.goals(LEVELS, LEVELS.map((L) => ({
    "Possible levels": ["Make a level that a player can finish.", "Every game level has to be possible. Testing it is the designer's job."],
    "Interesting levels": ["Add obstacles to make a level more interesting.", "Good levels make players think without making the game impossible."],
    "Goals and rewards": ["Place goals that players can reach.", "Collectibles and goals give players reasons to explore."],
    "Difficulty": ["Tune a level's difficulty into a target range.", "Designers use numbers to make levels challenging but fair."],
    "Playtesting": ["Design a level, then prove it can be solved by solving it in code.", "Playtesting finds problems before players do."],
    "Difficulty curves": ["Order levels from easiest to hardest.", "A good game teaches players step by step, so the difficulty rises slowly."],
  })[L.concept]));

  /* ───────── Rules (pure, for tests) ───────── */
  /* The best route: fewest moves from start to wharf that visits every trap (breadth-first search over
     position and traps collected). Returns { ok, moves, buoys, reachable } or { ok: false, why }. */
  function route(grid) {
    const g = SE.harbor.parseGrid(grid);
    if (!g.start) return { ok: false, why: "There's no boat start. Place one with the Boat start tool." };
    if (!g.goal) return { ok: false, why: "There's no wharf. Place one with the Wharf tool." };
    const buoys = g.gems.map((k) => k.split(",").map(Number));
    if (buoys.length > 6) return { ok: false, why: "That's a lot of traps. Use 6 or fewer." };
    const full = (1 << buoys.length) - 1;
    const key = (x, y, m) => `${x},${y},${m}`;
    const bit = (x, y) => buoys.findIndex((b) => b[0] === x && b[1] === y);
    const startMask = bit(...g.start) >= 0 ? 1 << bit(...g.start) : 0;
    const seen = new Set([key(g.start[0], g.start[1], startMask)]);
    let frontier = [[g.start[0], g.start[1], startMask]], steps = 0, reachedHome = false;
    while (frontier.length) {
      const next = [];
      for (const [x, y, m] of frontier) {
        if (x === g.goal[0] && y === g.goal[1]) { reachedHome = true; if (m === full) return { ok: true, moves: steps, buoys: buoys.length }; }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h || g.rows[ny][nx] === "#") continue;
          const b = bit(nx, ny), nm = b >= 0 ? m | (1 << b) : m;
          const k = key(nx, ny, nm);
          if (!seen.has(k)) { seen.add(k); next.push([nx, ny, nm]); }
        }
      }
      frontier = next; steps++;
    }
    return { ok: false, why: reachedHome ? "The boat can get home, but it can't reach every trap." : "The boat can't reach the wharf. Open a channel." };
  }
  const count = (grid, ch) => grid.join("").split(ch).length - 1;
  /* Ledges inside the harbor (the border is always ledge, so it doesn't count). */
  const inner = (grid) => grid.slice(1, -1).reduce((n, r) => n + (r.slice(1, -1).split("#").length - 1), 0);
  /* Does a design meet a level's rules? { ok, reason, route }. */
  function check(idx, grid) {
    const L = LEVELS[idx], r = route(grid), rules = L.rules;
    if (count(grid, "S") !== 1) return { ok: false, reason: "A level needs exactly one boat start." };
    if (count(grid, "G") !== 1) return { ok: false, reason: "A level needs exactly one wharf." };
    if (!r.ok) return { ok: false, reason: r.why, route: r };
    const nb = count(grid, "*");
    if (rules.buoys && (nb < rules.buoys[0] || nb > rules.buoys[1])) return { ok: false, reason: rules.buoys[0] === rules.buoys[1] ? `This level needs exactly ${rules.buoys[0]} traps. You have ${nb}.` : `Use ${rules.buoys[0]} to ${rules.buoys[1]} traps. You have ${nb}.`, route: r };
    if (rules.minLedges && inner(grid) < rules.minLedges) return { ok: false, reason: `Keep at least ${rules.minLedges} ledges inside the harbor. You have ${inner(grid)}. Open a channel, don't clear the whole harbor.`, route: r };
    if (rules.minRoute && r.moves < rules.minRoute) return { ok: false, reason: `The best route is ${r.moves} moves. Make it at least ${rules.minRoute}.`, route: r };
    if (rules.maxRoute && r.moves > rules.maxRoute) return { ok: false, reason: `The best route is ${r.moves} moves. Bring it down to ${rules.maxRoute} or fewer.`, route: r };
    return { ok: true, reason: "", route: r };
  }
  /* The right order for the difficulty curve: by route length, then traps. */
  function curve(idx) {
    const L = LEVELS[idx];
    return L.choices.map((c) => ({ id: c.id, r: route(c.grid) })).sort((a, b) => a.r.moves - b.r.moves || a.r.buoys - b.r.buoys).map((c) => c.id);
  }
  /* Playtest: does a mini-Python program finish the designed level (home, every trap hauled)? */
  function solves(grid, src) {
    const p = SE.minipy.parse(src);
    if (p.errors.length) return { ok: false, reason: p.errors[0].message };
    const g = SE.harbor.parseGrid(grid);
    const st = { x: g.start[0], y: g.start[1], dir: "E", ops: 0, gems: new Set(g.gems), spots: new Set(), got: new Set(), dropped: new Set(), vars: {}, error: null, done: false };
    for (const _ of SE.harbor.run(p.main, st, { g, fn: p.fn, depth: 0 })) { /* sail */ }
    if (st.error === "crash") return { ok: false, reason: "The boat hit a ledge in your level. Trace your program on the map." };
    if (st.error) return { ok: false, reason: "Your program didn't finish. Check your loops." };
    if (!(st.x === g.goal[0] && st.y === g.goal[1])) return { ok: false, reason: "The boat stopped before the wharf." };
    if (st.got.size < g.gems.length) return { ok: false, reason: `The boat hauled ${st.got.size} of ${g.gems.length} traps.` };
    return { ok: true, reason: "" };
  }

  /* ───────── View ───────── */
  const NAME = { "#": "ledge", ".": "water", "*": "trap buoy", S: "boat start", G: "wharf" };
  const mini = (grid) => `<div class="ld-mini" aria-hidden="true">${grid.map((r) => [...r].map((ch) => `<i class="ld-c ld-c--${({ "#": "ledge", ".": "water", "*": "buoy", S: "start", G: "wharf" })[ch]}"></i>`).join("")).join("")}</div>`;

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    let grid = (L.start || []).slice(), tool = "#", order = [], draft = "";
    function set(x, y, ch) {
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) { api.say("The edge of the harbor stays ledge. Edit the squares inside.", "info"); return; }
      if (ch === "S" || ch === "G") grid = grid.map((r) => r.replace(ch, "."));   // only one start and one wharf
      grid[y] = grid[y].slice(0, x) + ch + grid[y].slice(x + 1);
    }
    function render(focus) {
      const r = L.kind === "order" ? null : route(grid);
      el.innerHTML = L.kind === "order" ? `
        <div class="ld">
          <ul class="ld-choices">${L.choices.map((c) => `<li><button type="button" class="btn btn--ghost ld-choice" data-pick="${c.id}" aria-pressed="${order.includes(c.id)}">${mini(c.grid)}<span>Level ${c.id}${order.includes(c.id) ? ` · #${order.indexOf(c.id) + 1}` : ""}</span></button></li>`).join("")}</ul>
          <p class="ld-order" aria-live="polite">Your order, easiest first: <strong>${order.join(" → ") || "tap the levels"}</strong></p>
          <div class="ld-actions"><button type="button" class="btn btn--ghost" id="ld-clear">${icon("refresh")}Start over</button><button type="button" class="btn btn--launch" id="ld-check">${icon("check")}Check order</button></div>
        </div>` : `
        <div class="ld ${L.kind === "playtest" ? "ld--play" : ""}">
          <div class="ld-tools" role="group" aria-label="Tool">${TOOLS.map((t) => `<button type="button" class="btn btn--ghost btn--small ld-tool" data-tool="${t.id}" aria-pressed="${tool === t.id}"><span class="ld-c ld-c--${({ "#": "ledge", ".": "water", "*": "buoy", S: "start", G: "wharf" })[t.id]}" aria-hidden="true"></span>${t.name}</button>`).join("")}</div>
          <div class="ld-grid" style="--cols:${W}" role="group" aria-label="Harbor map. Choose a tool, then tap a square.">
            ${grid.map((row, y) => `<div class="ld-row">${[...row].map((ch, x) => `<button type="button" class="ld-cell ld-c--${({ "#": "ledge", ".": "water", "*": "buoy", S: "start", G: "wharf" })[ch]}" data-x="${x}" data-y="${y}" aria-label="Row ${y + 1}, column ${x + 1}: ${NAME[ch]}">${ch === "S" ? "▶" : ch === "G" ? "W" : ch === "*" ? "●" : ""}</button>`).join("")}</div>`).join("")}
          </div>
          <p class="ld-stats" aria-live="polite">${r.ok ? `${icon("check")}Possible. Best route: <strong>${r.moves} moves</strong>${r.buoys ? `, ${r.buoys} trap${r.buoys > 1 ? "s" : ""}` : ""}.` : `${icon("alert")}${esc(r.why)}`} Ledges inside: ${inner(grid)}.</p>
          ${L.kind === "playtest" ? `<div class="ld-code">
            <label class="py-h" for="ld-src">Now solve your level in Python</label>
            <textarea id="ld-src" class="py-editor" rows="6" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="ld-help">${esc(draft)}</textarea>
            <p class="field-help" id="ld-help">The boat starts facing east (right). Use move(), turn_left(), turn_right(), haul(), loops, and if.</p>
            <div class="ld-actions"><button type="button" class="btn btn--ghost" id="ld-reset">${icon("refresh")}Start over</button><button type="button" class="btn btn--launch" id="ld-check">${icon("check")}Check design and run</button></div>
          </div>` : `
          <div class="ld-actions"><button type="button" class="btn btn--ghost" id="ld-reset">${icon("refresh")}Start over</button><button type="button" class="btn btn--launch" id="ld-check">${icon("check")}Check design</button></div>`}
        </div>`;
      bind();
      if (focus) { const f = el.querySelector(focus); if (f) f.focus(); }
    }
    function bind() {
      el.querySelectorAll("[data-tool]").forEach((b) => b.addEventListener("click", () => { tool = b.dataset.tool; el.querySelectorAll("[data-tool]").forEach((t) => t.setAttribute("aria-pressed", String(t === b))); }));
      el.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", () => {
        const src = el.querySelector("#ld-src"); if (src) draft = src.value;
        set(Number(b.dataset.x), Number(b.dataset.y), tool);
        render(`[data-x="${b.dataset.x}"][data-y="${b.dataset.y}"]`);
      }));
      el.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => { const id = b.dataset.pick; order = order.includes(id) ? order.filter((x) => x !== id) : order.concat(id); render(`[data-pick="${id}"]`); }));
      const reset = el.querySelector("#ld-reset"); if (reset) reset.addEventListener("click", () => { grid = L.start.slice(); draft = ""; render(); });
      const clear = el.querySelector("#ld-clear"); if (clear) clear.addEventListener("click", () => { order = []; render(); });
      el.querySelector("#ld-check").addEventListener("click", () => {
        api.log("lab_test_run", { kind: L.kind });
        if (L.kind === "order") {
          if (order.length < L.choices.length) { api.say("Put all three levels in order first.", "warn"); return; }
          const right = curve(idx);
          if (order.join() === right.join()) return api.win({ order: order.join("") });
          const routes = Object.fromEntries(L.choices.map((c) => [c.id, route(c.grid)]));
          return api.say(`Your order was ${order.join(" → ")}. Check each level: ${L.choices.map((c) => `${c.id} is ${routes[c.id].moves} moves${routes[c.id].buoys ? ` with ${routes[c.id].buoys} traps` : ""}`).join(", ")}.`, "warn");
        }
        const res = check(idx, grid);
        if (!res.ok) return api.say(res.reason, "warn");
        if (L.kind === "playtest") {
          const src = el.querySelector("#ld-src").value; draft = src;
          const pt = solves(grid, src);
          if (!pt.ok) return api.say(`Your design works. Now your code: ${pt.reason}`, "warn");
        }
        api.win({ moves: res.route.moves, design: grid.join("/") });
      });
    }
    render();
    return () => {};
  }

  SE.labs.register({
    id: "level-designer",
    area: "coding",
    title: "Harbor Level Designer",
    tagline: "Be the level designer: build harbor levels that are possible, interesting, and just hard enough, then playtest them in Python.",
    levels: LEVELS,
    mount
  });
  SE.levelDesigner = { LEVELS, route, check, curve, solves };
})();
