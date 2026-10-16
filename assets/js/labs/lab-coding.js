/*
 * Harbor Code Lab — Coding & Computer Science
 * Students build block programs that steer a lobster boat around a Maine harbor:
 * haul traps, dodge granite ledges, and get home to the wharf.
 * (The lab id stays "rover" so saved progress carries over.)
 * Levels climb the coding pathway: sequences → debugging → loops →
 * conditionals → variables → functions → creating independently.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  /* ───────── Block catalog ───────── */
  const BLOCKS = {
    move: { label: "Forward", kind: "motion", glyph: "arrowRight" },
    left: { label: "Turn left", kind: "motion", glyph: "refresh", flip: true },
    right: { label: "Turn right", kind: "motion", glyph: "refresh" },
    pick: { label: "Haul trap", kind: "action", glyph: "buoy" },
    repeat: { label: "Repeat", kind: "control", glyph: "refresh", container: true, count: true },
    untilGoal: { label: "Repeat until at wharf", kind: "control", glyph: "flag", container: true },
    ifGem: { label: "If at a trap", kind: "control", glyph: "question", container: true },
    ifWall: { label: "If ledge ahead", kind: "control", glyph: "question", container: true, hasElse: true },
    setVar: { label: "Set steps to", kind: "variable", glyph: "box", count: true },
    changeVar: { label: "Change steps by", kind: "variable", glyph: "plus", count: true },
    repeatVar: { label: "Repeat steps times", kind: "control", glyph: "refresh", container: true },
    call: { label: "Zig", kind: "function", glyph: "star" }
  };
  let nextId = 1;
  const make = (type, extra = {}) => {
    const b = { id: `b${nextId++}`, type, ...extra };
    if (BLOCKS[type].container) b.body = b.body || [];
    if (BLOCKS[type].hasElse) b.else = b.else || [];
    if (BLOCKS[type].count && b.n == null) b.n = type === "changeVar" ? 1 : type === "setVar" ? 1 : 2;
    return b;
  };
  const clone = (list) => list.map((b) => {
    const c = { ...b, id: `b${nextId++}` };
    if (b.body) c.body = clone(b.body);
    if (b.else) c.else = clone(b.else);
    return c;
  });
  const countBlocks = (list) => list.reduce((n, b) => n + 1 + (b.body ? countBlocks(b.body) : 0) + (b.else ? countBlocks(b.else) : 0), 0);

  /* Starter programs written in a tiny shorthand: F L R P, [n ...] for repeat. */
  function parse(src) {
    const tokens = src.match(/\[\d+|\]|F|L|R|P/g) || [];
    let i = 0;
    const read = () => {
      const out = [];
      while (i < tokens.length) {
        const t = tokens[i++];
        if (t === "]") return out;
        if (t[0] === "[") out.push(make("repeat", { n: Number(t.slice(1)), body: read() }));
        else out.push(make({ F: "move", L: "left", R: "right", P: "pick" }[t]));
      }
      return out;
    };
    return read();
  }

  /* ───────── Levels ───────── */
  const BASIC = ["move", "left", "right"];
  const LEVELS = [
    {
      title: "First steps", concept: "Sequence", stage: 1,
      goal: "Steer the boat out of the cove to the wharf.",
      steps: ["Tap Forward to add it to your program.", "Add as many as you need.", "Press Run and watch."],
      hint: "Count the squares between the boat and the wharf (the flag). That's how many Forward blocks you need.",
      learned: "A program is a sequence: a list of instructions the computer follows in order, one at a time.",
      grid: ["######", "#S..G#", "######"], dir: "E", blocks: BASIC
    },
    {
      title: "Turn the corner", concept: "Sequence", stage: 1,
      goal: "Reach the wharf. The channel turns a corner.",
      hint: "Turns don't move the boat. They only change which way it faces. Imagine you are at the wheel: which way is right?",
      learned: "Order matters. The same blocks in a different order give a different result. Turning and moving are separate steps.",
      grid: ["######", "#S..##", "###.##", "###G##", "######"], dir: "E", blocks: BASIC
    },
    {
      title: "Bug hunt", concept: "Debugging", stage: 1, debug: true,
      goal: "Another captain wrote this program, and it runs the boat onto a ledge. Find the bug and fix it so the boat reaches the wharf.",
      steps: ["Press Step to run one block at a time.", "Watch for the first block that goes wrong.", "Delete it or change it, then run again."],
      hint: "Step through slowly. The boat bumps a ledge right after the bug. Look at the turn just before the crash.",
      learned: "Debugging means finding the first step that goes wrong. Stepping through a program one block at a time is how programmers find bugs.",
      grid: ["#######", "#S.####", "##..###", "###..##", "####G##", "#######"], dir: "E", blocks: BASIC,
      starter: "F R F L F L F L F R F"
    },
    {
      title: "Loop it", concept: "Loops", stage: 3,
      goal: "Run straight down the harbor to the wharf using only 2 blocks.",
      hint: "Put a Repeat block in your program, then add Forward inside it. Use + and − to change how many times it repeats.",
      learned: "A loop repeats instructions. Instead of writing Forward 7 times, you can say Repeat 7: Forward. Shorter programs are easier to read and fix.",
      grid: ["##########", "#S......G#", "##########"], dir: "E", blocks: [...BASIC, "repeat"], maxBlocks: 2
    },
    {
      title: "Zigzag channel", concept: "Loops", stage: 3,
      goal: "Zigzag up the channel between the ledges to the wharf using 5 blocks or fewer.",
      hint: "Find the pattern for one zig: Forward, Turn left, Forward, Turn right. How many zigs are there?",
      learned: "Spotting a pattern is the key to using loops. Figure out the part that repeats, then loop it.",
      grid: ["######", "####G#", "###..#", "##..##", "#S.###", "######"], dir: "E", blocks: [...BASIC, "repeat"], maxBlocks: 5
    },
    {
      title: "Loop bug", concept: "Debugging loops", stage: 3, debug: true,
      goal: "The boat should circle around the little island to the wharf. Fix the bug.",
      hint: "One trip through the loop should be one side of the square. Which way does the path turn at each corner?",
      learned: "A bug inside a loop happens every time the loop runs. Fix it once, and every repeat is fixed.",
      grid: ["#####", "#S..#", "#.#.#", "#G..#", "#####"], dir: "E", blocks: [...BASIC, "repeat"],
      starter: "[3 F F L]"
    },
    {
      title: "Haul the traps", concept: "Actions", stage: 2,
      goal: "Haul both traps (the buoys), then tie up at the wharf.",
      hint: "Haul trap only works when the boat is right at a buoy. Move onto the buoy first.",
      learned: "Programs can do more than move. Actions like hauling a trap change the world, and they only work at the right moment.",
      grid: ["########", "#S*.*.G#", "########"], dir: "E", blocks: [...BASIC, "pick", "repeat"], needGems: true
    },
    {
      title: "Maybe a trap", concept: "Conditionals", stage: 4,
      goal: "Haul every trap on the string and reach the wharf using 4 blocks or fewer.",
      hint: "Repeat: move forward, then IF there's a trap here, haul it. The boat checks each square for you.",
      learned: "A conditional (if) lets a program make a choice. The boat checks a condition, and only acts when it's true.",
      grid: ["###########", "#S*.**.*.G#", "###########"], dir: "E", blocks: [...BASIC, "pick", "repeat", "ifGem"], maxBlocks: 4, needGems: true
    },
    {
      title: "Fog sensor", concept: "Conditionals", stage: 4,
      goal: "Thick fog rolled in, so you can only see one square ahead. Reach the mooring in the middle of the ledges using 4 blocks or fewer.",
      steps: ["Use Repeat until at wharf.", "Inside it, check: If ledge ahead → turn right. Otherwise (else) → forward."],
      hint: "Put If ledge ahead inside the Repeat until block. Put Turn right in the top part and Forward in the else part.",
      learned: "If–else picks between two actions. With a sensor and one rule, the boat found its way through ledges it had never seen. Real boats use radar and sonar the same way, and so do many robots.",
      grid: ["#######", "#S....#", "#####.#", "#..G#.#", "#.###.#", "#.....#", "#######"], dir: "E", blocks: ["move", "left", "right", "untilGoal", "ifWall"], maxBlocks: 4
    },
    {
      title: "Growing spiral", concept: "Variables", stage: 5,
      goal: "Spiral out of the harbor to the wharf using 6 blocks or fewer.",
      steps: ["Each side of the spiral is one step longer than the last: 1, 2, 3, 4.", "A variable called steps can remember a number and change it."],
      hint: "Set steps to 1. Repeat 4: { Repeat steps times: Forward. Turn right. Change steps by 1. }",
      learned: "A variable stores a value that can change while the program runs. Here, steps grew by 1 each time, so the same loop drew longer and longer sides.",
      grid: ["#######", "#G#####", "#.#####", "#.#S.##", "#.##.##", "#....##", "#######"], dir: "E",
      blocks: ["move", "left", "right", "repeat", "setVar", "repeatVar", "changeVar"], maxBlocks: 6, usesVar: true
    },
    {
      title: "Make your own block", concept: "Functions", stage: 6,
      goal: "Build a Zig block, then use it to reach the wharf with 6 blocks or fewer in your main program.",
      steps: ["In the Zig box, build one zig of the channel.", "In your main program, use Zig like any other block."],
      hint: "Zig = Forward, Turn left, Forward, Turn right. Main program: Zig, Zig, Forward, Forward, Zig, Zig.",
      learned: "A function is a named group of instructions you can reuse. Breaking a problem into named parts (decomposition) makes big programs manageable.",
      grid: ["#########", "#########", "#######G#", "######..#", "###....##", "##..#####", "#S.######", "#########"], dir: "E",
      blocks: ["move", "left", "right", "repeat", "call"], maxBlocks: 6, usesFn: true
    },
    {
      title: "Free build", concept: "Create", stage: 7,
      goal: "Haul all 4 traps and finish at the wharf. Use any blocks you like.",
      hint: "Plan your route on paper first. Look for patterns you can loop. Test small parts as you go.",
      learned: "You planned, built, tested, and debugged a program on your own, like a captain planning a day on the water. That's what programmers do every day.",
      grid: ["#########", "#S..#..*#", "#.*.#.#.#", "#...*...#", "#.#.#.#.#", "#*..#..G#", "#########"], dir: "E",
      blocks: ["move", "left", "right", "pick", "repeat", "untilGoal", "ifGem", "ifWall"], needGems: true, par: 24
    }
  ];

  const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const RIGHT = { N: "E", E: "S", S: "W", W: "N" };
  const LEFT = { N: "W", W: "S", S: "E", E: "N" };
  const ROT = { N: -90, E: 0, S: 90, W: 180 };

  function parseGrid(rows) {
    let start = null, goal = null;
    const gems = [];
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      if (ch === "S") start = [x, y];
      if (ch === "G") goal = [x, y];
      if (ch === "*") gems.push(`${x},${y}`);
    }));
    return { rows, w: rows[0].length, h: rows.length, start, goal, gems };
  }
  const isWall = (g, x, y) => x < 0 || y < 0 || x >= g.w || y >= g.h || g.rows[y][x] === "#";

  /* ───────── Interpreter (a generator, so we can step one block at a time) ───────── */
  function* run(list, st, ctx) {
    for (const b of list) {
      if (st.ops++ > 400) { st.error = "loop"; return; }
      switch (b.type) {
        case "move": {
          const [dx, dy] = DIRS[st.dir];
          const nx = st.x + dx, ny = st.y + dy;
          if (isWall(ctx.g, nx, ny)) { st.error = "crash"; yield b; return; }
          st.x = nx; st.y = ny; yield b; break;
        }
        case "left": st.dir = LEFT[st.dir]; yield b; break;
        case "right": st.dir = RIGHT[st.dir]; yield b; break;
        case "pick": {
          const k = `${st.x},${st.y}`;
          if (st.gems.has(k) && !st.got.has(k)) { st.got.add(k); yield b; }
          else { st.error = "nogem"; yield b; return; }
          break;
        }
        case "repeat":
          for (let i = 0; i < b.n; i++) { yield* run(b.body, st, ctx); if (st.error || st.done) return; }
          break;
        case "repeatVar": {
          const n = st.vars.steps || 0;
          for (let i = 0; i < n; i++) { yield* run(b.body, st, ctx); if (st.error || st.done) return; }
          break;
        }
        case "untilGoal": {
          let guard = 0;
          while (!(st.x === ctx.g.goal[0] && st.y === ctx.g.goal[1])) {
            if (guard++ > 120) { st.error = "loop"; return; }
            const before = st.ops;
            yield* run(b.body, st, ctx);
            if (st.error || st.done) return;
            if (st.ops === before) { st.error = "loop"; return; }
          }
          break;
        }
        case "ifGem": {
          const k = `${st.x},${st.y}`;
          yield { ...b, checking: true };
          if (st.gems.has(k) && !st.got.has(k)) yield* run(b.body, st, ctx);
          if (st.error) return;
          break;
        }
        case "ifWall": {
          const [dx, dy] = DIRS[st.dir];
          yield { ...b, checking: true };
          if (isWall(ctx.g, st.x + dx, st.y + dy)) yield* run(b.body, st, ctx);
          else yield* run(b.else, st, ctx);
          if (st.error) return;
          break;
        }
        case "setVar": st.vars.steps = b.n; yield b; break;
        case "changeVar": st.vars.steps = (st.vars.steps || 0) + b.n; yield b; break;
        case "call":
          if (ctx.depth > 5) { st.error = "loop"; return; }
          ctx.depth++;
          yield { ...b, checking: true };
          yield* run(ctx.fn, st, ctx);
          ctx.depth--;
          if (st.error) return;
          break;
      }
    }
  }

  /* ───────── Drawing ───────── */
  /* Top-down lobster boat, bow pointing east. */
  const ROVER = `<svg viewBox="0 0 40 40" class="rover__svg" aria-hidden="true">
      <path d="M2 30 Q-1 20 2 10" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
      <path d="M5 11 H25 Q36 13 39 20 Q36 27 25 29 H5 Q3.5 20 5 11 Z" fill="#f7f6f0" stroke="#1d1647" stroke-width="2" stroke-linejoin="round"/>
      <path d="M6 14.5 H25 Q32 16 35 20 Q32 24 25 25.5 H6" fill="none" stroke="#8cc832" stroke-width="2"/>
      <rect x="15" y="14" width="10" height="12" rx="2" fill="#302568"/>
      <rect x="22" y="15.5" width="2.5" height="9" rx="1" fill="#b9e2f5"/>
      <rect x="7" y="16" width="5" height="8" rx="1" fill="#e9603f" stroke="#1d1647" stroke-width="1"/>
    </svg>`;

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const g = parseGrid(L.grid);
    const saved = api.saved();
    let program = L.starter ? parse(L.starter) : [];
    let fn = [];
    let cursor = { owner: "root", branch: "body", index: program.length };
    let timer = null, gen = null, st = null, running = false, finished = false;
    let speed = 380;

    el.innerHTML = `
      <div class="rover">
        <div class="rover__world">
          <div class="rover__grid" style="--cols:${g.w};--rows:${g.h}" role="img" aria-label="Harbor chart: the boat starts at the left; reach the wharf${g.gems.length ? `, hauling ${g.gems.length} traps` : ""}. Dark squares are granite ledges.">
            ${g.rows.map((r, y) => [...r].map((ch, x) => `<div class="cell ${ch === "#" ? "cell--wall" : ""}" data-x="${x}" data-y="${y}">
              ${ch === "G" ? `<span class="cell__flag">${icon("flag")}</span>` : ""}${ch === "*" ? `<span class="cell__gem" data-gem="${x},${y}">${icon("buoy")}</span>` : ""}</div>`).join("")).join("")}
            <div class="rover__bot" id="rover-bot">${ROVER}</div>
          </div>
          <div class="rover__readout" aria-live="polite">
            <span id="rover-status">Ready</span>
            ${L.usesVar ? `<span class="var-chip">steps = <b id="var-steps">0</b></span>` : ""}
            ${g.gems.length ? `<span class="var-chip">traps <b id="gem-count">0</b>/${g.gems.length}</span>` : ""}
          </div>
          <div class="rover__controls">
            <button type="button" class="btn btn--launch" id="rv-run">${icon("rocket")}Run</button>
            <button type="button" class="btn btn--ghost" id="rv-step">${icon("arrowRight")}Step</button>
            <button type="button" class="btn btn--ghost" id="rv-reset">${icon("refresh")}Reset</button>
            <label class="speed"><span>Speed</span>
              <select id="rv-speed" class="input input--small"><option value="700">Slow</option><option value="380" selected>Normal</option><option value="140">Fast</option></select>
            </label>
          </div>
        </div>
        <div class="rover__code">
          <div class="palette" role="group" aria-label="Blocks you can use">
            ${L.blocks.map((t) => `<button type="button" class="blk blk--${BLOCKS[t].kind} blk--btn" data-add="${t}">${icon(BLOCKS[t].glyph, BLOCKS[t].flip ? 'style="transform:scaleX(-1)"' : "")}${esc(BLOCKS[t].label)}${BLOCKS[t].count ? " #" : ""}</button>`).join("")}
          </div>
          ${L.usesFn ? `<div class="prog prog--fn"><div class="prog__head"><strong>${icon("star", 'class="inline-icon"')}Zig =</strong><span class="muted" id="fn-count"></span></div><div id="fn-list"></div></div>` : ""}
          <div class="prog">
            <div class="prog__head"><strong>Your program</strong><span id="blk-count" class="blk-count"></span>
              <button type="button" class="linkish" id="rv-clear">${icon("trash")}Clear</button></div>
            <div id="prog-list"></div>
          </div>
          <p class="field-help">Tap a gap (the dashed line) to choose where new blocks go. Tap ✕ to remove a block.</p>
        </div>
      </div>`;

    const bot = el.querySelector("#rover-bot");
    const cellSize = () => el.querySelector(".cell").getBoundingClientRect().width;

    function place(x, y, dir, animate = true) {
      bot.style.transition = animate ? `transform ${Math.min(speed, 350)}ms ease` : "none";
      bot.style.transform = `translate(${x * 100}%, ${y * 100}%)`;
      bot.firstElementChild.style.transition = animate ? `transform ${Math.min(speed, 350)}ms ease` : "none";
      bot.firstElementChild.style.transform = `rotate(${ROT[dir]}deg)`;
    }
    bot.style.width = `calc(100% / ${g.w})`;
    bot.style.height = `calc(100% / ${g.h})`;

    function resetWorld() {
      stop();
      st = { x: g.start[0], y: g.start[1], dir: L.dir, gems: new Set(g.gems), got: new Set(), vars: { steps: 0 }, ops: 0, error: null, done: false };
      gen = null;
      finished = false;
      place(st.x, st.y, st.dir, false);
      el.querySelectorAll("[data-gem]").forEach((n) => n.classList.remove("is-got"));
      el.querySelectorAll(".blk.is-active").forEach((n) => n.classList.remove("is-active"));
      el.querySelectorAll(".cell.is-crash").forEach((n) => n.classList.remove("is-crash"));
      setStatus("Ready");
      readouts();
    }
    function readouts() {
      const v = el.querySelector("#var-steps"); if (v) v.textContent = st.vars.steps;
      const gc = el.querySelector("#gem-count"); if (gc) gc.textContent = st.got.size;
    }
    const setStatus = (t) => { el.querySelector("#rover-status").textContent = t; };

    /* ───────── Program editor ───────── */
    function listFor(owner, branch) {
      if (owner === "root") return program;
      if (owner === "fn") return fn;
      const find = (list) => {
        for (const b of list) {
          if (b.id === owner) return b[branch];
          for (const k of ["body", "else"]) if (b[k]) { const r = find(b[k]); if (r) return r; }
        }
        return null;
      };
      return find(program) || find(fn);
    }
    function renderList(list, owner, branch) {
      const slot = (i) => `<button type="button" class="slot ${cursor.owner === owner && cursor.branch === branch && cursor.index === i ? "is-cursor" : ""}" data-owner="${owner}" data-branch="${branch}" data-index="${i}" aria-label="Put new blocks here${cursor.owner === owner && cursor.branch === branch && cursor.index === i ? " (selected)" : ""}"></button>`;
      let html = `<ol class="blocks">${slot(0)}`;
      list.forEach((b, i) => {
        const def = BLOCKS[b.type];
        html += `<li class="blk blk--${def.kind}" data-bid="${b.id}">
          <div class="blk__row">
            ${icon(def.glyph, def.flip ? 'style="transform:scaleX(-1)"' : "")}
            <span class="blk__label">${esc(def.label)}</span>
            ${def.count ? `<span class="blk__count"><button type="button" data-dec="${b.id}" aria-label="Decrease">−</button><b>${b.n}</b><button type="button" data-inc="${b.id}" aria-label="Increase">+</button>${b.type === "repeat" ? "<span>times</span>" : ""}</span>` : ""}
            <button type="button" class="blk__del" data-del="${b.id}" aria-label="Remove ${esc(def.label)}">✕</button>
          </div>
          ${def.container ? `<div class="blk__body">${renderList(b.body, b.id, "body")}</div>` : ""}
          ${def.hasElse ? `<div class="blk__else"><span>else</span></div><div class="blk__body">${renderList(b.else, b.id, "else")}</div>` : ""}
        </li>${slot(i + 1)}`;
      });
      return html + "</ol>";
    }
    function renderProgram() {
      el.querySelector("#prog-list").innerHTML = program.length || cursor.owner !== "root" ? renderList(program, "root", "body") : `${renderList(program, "root", "body")}<p class="prog__empty">Tap a block above to add it here.</p>`;
      if (L.usesFn) {
        el.querySelector("#fn-list").innerHTML = renderList(fn, "fn", "body");
        el.querySelector("#fn-count").textContent = `${countBlocks(fn)} blocks`;
      }
      const n = countBlocks(program);
      const bc = el.querySelector("#blk-count");
      bc.textContent = L.maxBlocks ? `${n} / ${L.maxBlocks} blocks` : `${n} blocks${L.par ? ` · par ${L.par}` : ""}`;
      bc.classList.toggle("is-over", !!(L.maxBlocks && n > L.maxBlocks));
    }
    function findAndRemove(list, id) {
      const i = list.findIndex((b) => b.id === id);
      if (i >= 0) { list.splice(i, 1); return true; }
      return list.some((b) => (b.body && findAndRemove(b.body, id)) || (b.else && findAndRemove(b.else, id)));
    }
    function findBlock(list, id) {
      for (const b of list) {
        if (b.id === id) return b;
        for (const k of ["body", "else"]) if (b[k]) { const r = findBlock(b[k], id); if (r) return r; }
      }
      return null;
    }

    el.querySelector(".rover__code").addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t || running) return;
      if (t.dataset.add) {
        const type = t.dataset.add;
        const list = listFor(cursor.owner, cursor.branch) || program;
        const b = make(type);
        list.splice(cursor.index, 0, b);
        // After adding a container, put the cursor inside it so the next block nests.
        cursor = BLOCKS[type].container ? { owner: b.id, branch: "body", index: 0 } : { ...cursor, index: cursor.index + 1 };
      } else if (t.dataset.owner) {
        cursor = { owner: t.dataset.owner, branch: t.dataset.branch, index: Number(t.dataset.index) };
      } else if (t.dataset.del) {
        findAndRemove(program, t.dataset.del) || findAndRemove(fn, t.dataset.del);
        if (!listFor(cursor.owner, cursor.branch)) cursor = { owner: "root", branch: "body", index: program.length };
        cursor.index = Math.min(cursor.index, (listFor(cursor.owner, cursor.branch) || []).length);
      } else if (t.dataset.inc || t.dataset.dec) {
        const b = findBlock(program, t.dataset.inc || t.dataset.dec) || findBlock(fn, t.dataset.inc || t.dataset.dec);
        const min = b.type === "changeVar" ? -3 : 1;
        b.n = Math.max(min, Math.min(12, b.n + (t.dataset.inc ? 1 : -1)));
      } else if (t.id === "rv-clear") {
        program = []; fn = L.usesFn ? [] : fn; cursor = { owner: "root", branch: "body", index: 0 };
      } else return;
      resetWorld();
      renderProgram();
      api.say("");
    });

    /* ───────── Running ───────── */
    function stop() { clearInterval(timer); timer = null; running = false; el.classList.remove("is-running"); }
    function highlight(b) {
      el.querySelectorAll(".blk.is-active").forEach((n) => n.classList.remove("is-active"));
      const node = el.querySelector(`[data-bid="${b.id}"]`);
      if (node) node.classList.add("is-active");
    }
    function stepOnce() {
      if (!gen) {
        if (L.maxBlocks && countBlocks(program) > L.maxBlocks) {
          api.say(`Your program has ${countBlocks(program)} blocks, but this level allows ${L.maxBlocks}. Look for a pattern you can loop or reuse.`, "warn");
          stop(); return false;
        }
        if (!program.length) { api.say("Your program is empty. Tap a block to add it.", "warn"); stop(); return false; }
        gen = run(program, st, { g, fn, depth: 0 });
        api.log("lab_test_run", { blocks: countBlocks(program) });
      }
      const r = gen.next();
      if (!r.done) {
        highlight(r.value);
        place(st.x, st.y, st.dir);
        readouts();
        el.querySelectorAll("[data-gem]").forEach((n) => n.classList.toggle("is-got", st.got.has(n.dataset.gem)));
        if (st.error) { finish(); return false; }
        setStatus(r.value.checking ? `Checking: ${BLOCKS[r.value.type].label}` : BLOCKS[r.value.type].label);
        return true;
      }
      finish();
      return false;
    }
    function finish() {
      stop();
      finished = true;
      const atGoal = st.x === g.goal[0] && st.y === g.goal[1];
      const allGems = st.got.size === g.gems.length;
      if (st.error === "crash") {
        const [dx, dy] = DIRS[st.dir];
        const c = el.querySelector(`.cell[data-x="${st.x + dx}"][data-y="${st.y + dy}"]`);
        if (c) c.classList.add("is-crash");
        setStatus("Bump!");
        api.say("Bump! The boat hit a granite ledge. The highlighted block is where it went wrong. What should it have done instead?", "warn");
        api.log("lab_bug", { kind: "crash" });
      } else if (st.error === "nogem") {
        setStatus("No trap here");
        api.say("The boat tried to haul a trap, but there isn't a buoy on this square. Move onto a buoy first.", "warn");
      } else if (st.error === "loop") {
        setStatus("Stuck in a loop");
        api.say("The boat got stuck going in circles forever. Make sure something inside the loop moves the boat closer to the wharf.", "warn");
      } else if (atGoal && (!L.needGems || allGems)) {
        setStatus("Mission complete");
        const n = countBlocks(program);
        api.say(L.par ? `You did it in ${n} blocks${n <= L.par ? ". That's at or under par!" : `. Par is ${L.par}. Can you find a shorter program?`}` : "The boat made it home to the wharf!", "good");
        api.win({ blocks: n, program: summarize(program) });
      } else if (atGoal) {
        setStatus("Traps missing");
        api.say(`The boat reached the wharf, but it only hauled ${st.got.size} of ${g.gems.length} traps.`, "warn");
      } else {
        setStatus("Stopped");
        api.say("The program ended, but the boat isn't at the wharf yet. Add more blocks or check your turns.", "warn");
      }
    }
    const summarize = (list) => list.map((b) => b.type + (b.n != null ? b.n : "") + (b.body ? `[${summarize(b.body)}]` : "") + (b.else ? `{${summarize(b.else)}}` : "")).join(",");

    el.querySelector("#rv-run").addEventListener("click", () => {
      if (running) { stop(); return; }
      if (finished || st.error) resetWorld();
      running = true;
      el.classList.add("is-running");
      api.say("");
      if (!stepOnce()) return;
      timer = setInterval(() => { if (!stepOnce()) stop(); }, speed);
    });
    el.querySelector("#rv-step").addEventListener("click", () => {
      if (running) stop();
      if (finished || st.error) resetWorld();
      stepOnce();
    });
    el.querySelector("#rv-reset").addEventListener("click", () => { resetWorld(); api.say(""); });
    el.querySelector("#rv-speed").addEventListener("change", (e) => { speed = Number(e.target.value); });

    resetWorld();
    renderProgram();
    if (L.debug) api.say("This program was written by another captain. Run it to see what goes wrong.", "info");
    if (saved && saved.blocks) api.say(`Last time you solved this with ${saved.blocks} blocks.`, "info");
    return () => stop();
  }

  SE.labs.register({
    id: "rover",
    area: "coding",
    title: "Harbor Code Lab",
    tagline: "Program a lobster boat with code blocks: haul traps, dodge ledges, and make it home. Twelve levels from first steps to your own functions.",
    levels: LEVELS,
    mount
  });
  SE.roverLevels = LEVELS; // used by the pathway page to link stages to levels
})();
