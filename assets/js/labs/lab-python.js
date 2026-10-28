/*
 * Harbor Python Lab — Coding & Computer Science (planning/CODING_PLAN.md, the Python ramp)
 * The same lobster boat as Harbor Code, steered with real Python (a small subset, SE.minipy) instead of
 * blocks. Four chapters climb from reading code to writing it, the way the research says beginners learn:
 *   1 Read it     predict where the boat stops (PRIMM: predict, then run)
 *   2 In order    Parsons puzzles: tap lines into order and indent them (no dragging)
 *   3 Fix it      find and fix the bug, then run it
 *   4 Write it    type your own program
 * Uses SE.harbor (parseGrid, run) from lab-coding.js and SE.minipy from minipy.js. Pure rules for tests:
 * SE.harborPython.check(levelIndex, source) and .predictEnd(levelIndex).
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const CORRIDOR = ["########", "#S....G#", "########"];
  const LEVELS = [
    // ── Read it
    { kind: "read", title: "Predict the stop", concept: "Reading code",
      goal: "Read the Python. Where will the boat stop: A, B, or C? Choose, then press Run.",
      grid: CORRIDOR, dir: "E",
      marks: { A: [3, 1], B: [4, 1], C: [6, 1] }, answer: "B",
      code: "for i in range(3):\n    move()",
      hints: ["range(3) means the loop runs 3 times.", "Each time through the loop, the boat moves one square. Count 3 squares from the start."],
      learned: "Python runs the indented lines inside a for loop once for each number in range(). range(3) means 3 times." },
    { kind: "read", title: "Follow the turns", concept: "Reading code",
      goal: "This program turns. Where will the boat stop?",
      grid: ["#######", "#S..###", "###.###", "###G###", "#######"], dir: "E",
      marks: { A: [3, 2], B: [3, 3], C: [2, 1] }, answer: "B",
      code: "move()\nmove()\nturn_right()\nmove()\nmove()",
      hints: ["Python runs one line at a time, from the top.", "turn_right() turns the boat, from facing east to facing south. Then it moves down."],
      learned: "Python runs lines in order, top to bottom, just like a sequence of blocks. Tracing each line by hand is how programmers predict what code will do." },
    { kind: "read", title: "A loop with a turn", concept: "Reading code",
      goal: "The loop has three lines inside it. Where will the boat stop?",
      grid: ["#####", "#G..#", "###.#", "#S..#", "#####"], dir: "E",
      marks: { A: [3, 1], B: [1, 1], C: [3, 3] }, answer: "A",
      code: "for i in range(2):\n    move()\n    move()\n    turn_left()",
      hints: ["All three indented lines repeat, twice.", "After the second turn_left(), the boat faces west, but the loop is over, so it doesn't move again."],
      learned: "Everything indented under a for line repeats together. The program can stop before the wharf. Predicting first is how you catch that." },
    // ── In order (Parsons)
    { kind: "parsons", title: "Put it in order", concept: "Sequence",
      goal: "Tap the lines into the right order to reach the wharf, then press Run.",
      grid: ["#######", "#S..###", "###.###", "###G###", "#######"], dir: "E",
      lines: ["move()", "turn_right()", "move()", "move()", "move()"],
      hints: ["Go east first, then turn.", "Two moves, turn_right(), then two more moves."],
      learned: "The same lines in a different order make a different program. Order matters in Python, just like with blocks." },
    { kind: "parsons", title: "Indent the loop", concept: "Loops and indenting",
      goal: "Put the lines in order, and indent the lines that belong inside each loop.",
      grid: ["######", "#S...#", "####.#", "####G#", "######"], dir: "E",
      lines: ["for i in range(3):", "move()", "turn_right()", "for i in range(2):", "move()"],
      hints: ["Use the Indent button on a line to put it inside the loop above it.", "Loop of 3 moves, turn right, then a loop of 2 moves. Only the move() lines are indented."],
      learned: "In Python, indenting a line (4 spaces) puts it inside the loop above it. That's how Python knows which lines repeat." },
    { kind: "parsons", title: "Check for buoys", concept: "Conditionals",
      goal: "Order and indent the lines so the boat hauls both traps and reaches the wharf.",
      grid: ["########", "#S*.*.G#", "########"], dir: "E", needGems: true,
      lines: ["for i in range(5):", "move()", "if at_buoy():", "haul()"],
      hints: ["The if goes inside the loop, so the boat checks after every move.", "haul() is indented twice: inside the if, which is inside the loop."],
      learned: "An if inside a loop checks again on every pass. Two levels of indenting show the if is inside the loop and haul() is inside the if." },
    // ── Fix it
    { kind: "fix", title: "One short", concept: "Debugging",
      goal: "This program stops one square too soon. Fix it so the boat reaches the wharf.",
      grid: CORRIDOR, dir: "E",
      code: "for i in range(4):\n    move()",
      hints: ["Count the squares from the start to the wharf.", "The loop needs to run 5 times."],
      learned: "Being off by one is the most common bug in programming, for professionals too. Counting carefully, or testing, catches it." },
    { kind: "fix", title: "The missing colon", concept: "Debugging",
      goal: "Python can't read this program. Read the error, fix it, and get the boat to the wharf.",
      grid: ["#####", "#G..#", "###.#", "#S..#", "#####"], dir: "E",
      code: "for i in range(2)\n    move()\n    move()\n    turn_left()\nmove()\nmove()",
      hints: ["Read the error message. Which line does it name?", "A for line ends with a colon (:)."],
      learned: "Error messages tell you the line and the problem. Reading them carefully is the fastest way to fix code." },
    { kind: "fix", title: "Out of line", concept: "Debugging",
      goal: "The boat should haul both traps. Something about the indenting is wrong. Fix it.",
      grid: ["########", "#S*.*.G#", "########"], dir: "E", needGems: true,
      code: "for i in range(5):\n    move()\n    if at_buoy():\n    haul()",
      hints: ["What should happen when the boat is at a buoy?", "haul() belongs inside the if, so indent it 4 more spaces."],
      learned: "In Python, indenting changes what a program means. A line that isn't indented under an if isn't part of it." },
    // ── Write it
    { kind: "write", title: "Your first loop", concept: "Writing loops",
      goal: "Write a program in 3 lines or fewer that gets the boat to the wharf.",
      grid: ["############", "#S........G#", "############"], dir: "E", maxLines: 3, mustUse: ["for"],
      starter: "# Write your program here\n",
      hints: ["Count the squares to the wharf: 9.", "for i in range(9): then, indented, move()"],
      learned: "You wrote a Python loop from scratch. A loop does in 2 lines what would take 9 lines of move()." },
    { kind: "write", title: "Follow the coast", concept: "Writing loops and ifs",
      goal: "Write one program that steers around every ledge until the boat is home. Use while and if.",
      grid: ["#######", "#S....#", "#####.#", "#..G#.#", "#.###.#", "#.....#", "#######"], dir: "E", maxLines: 5, mustUse: ["while", "if"],
      starter: "while not at_wharf():\n    ",
      hints: ["Inside the loop, check: is there a ledge ahead?", "if ledge_ahead(): turn_right()  else: move()"],
      learned: "A while loop with an if inside can handle a whole route without counting squares. It's how real robots follow walls and coastlines." },
    { kind: "write", title: "Name it, use it", concept: "Writing functions",
      goal: "Make your own function with def for one zig of the channel, then use it to reach the wharf.",
      grid: ["#########", "#########", "#######G#", "######..#", "###....##", "##..#####", "#S.######", "#########"], dir: "E", mustUse: ["def"],
      starter: "def zig():\n    \n\n",
      hints: ["One zig is: move(), turn_left(), move(), turn_right().", "Then the main program: zig(), zig(), move(), move(), zig(), zig()."],
      learned: "def gives a group of lines a name. Breaking a problem into named parts is how big programs, and big projects, stay manageable." },
  ];
  const CHAPTERS = [
    { title: "Read it", short: "Read", from: 0, to: 2, blurb: "Read Python and predict what the boat will do." },
    { title: "Put it in order", short: "Order", from: 3, to: 5, blurb: "Tap the lines into order and indent them." },
    { title: "Fix it", short: "Fix", from: 6, to: 8, blurb: "Find and fix the bug." },
    { title: "Write it", short: "Write", from: 9, to: 11, blurb: "Type your own Python." },
  ];
  SE.labs.goals(LEVELS, LEVELS.map((L) => ({
    "Reading code": ["Read Python code and predict what it will do before running it.", "Programmers read far more code than they write. Predicting first is how you understand code, and catch bugs before they happen."],
    "Sequence": ["Put Python lines in the right order.", "Order is the first thing that makes a program right or wrong."],
    "Loops and indenting": ["Use indenting to put lines inside a loop.", "Indenting is how Python shows which lines belong together."],
    "Conditionals": ["Put an if inside a loop with the right indenting.", "Programs make decisions with if. Where it sits changes how often it checks."],
    "Debugging": ["Find a bug from an error message or a wrong result, and fix it.", "Every programmer debugs every day. Reading errors and testing fixes is a core job skill."],
    "Writing loops": ["Write a for loop from scratch.", "Loops turn long, repetitive programs into short ones."],
    "Writing loops and ifs": ["Combine while and if to handle a route without counting.", "Real robots and boats react to what they sense instead of following fixed steps."],
    "Writing functions": ["Write and call your own function with def.", "Functions let you build big programs from small, named, reusable parts."],
  })[L.concept]));

  /* ───────── Rules (pure, for tests) ───────── */
  function sail(L, main, fn) {
    const g = SE.harbor.parseGrid(L.grid);
    const st = { x: g.start[0], y: g.start[1], dir: L.dir, ops: 0, gems: new Set(g.gems), spots: new Set(g.spots), got: new Set(), dropped: new Set(), vars: {}, error: null, done: false };
    const ctx = { g, fn: fn || [], depth: 0, carry: !!L.carry };
    const path = [];
    for (const b of SE.harbor.run(main, st, ctx)) path.push({ x: st.x, y: st.y, dir: st.dir, got: [...st.got] });
    return { g, st, path, home: st.x === g.goal[0] && st.y === g.goal[1] };
  }
  const codeLines = (src) => String(src || "").split(/\r?\n/).filter((l) => l.replace(/#.*$/, "").trim());
  /* Check a program for a level: { ok, errors, reason, run }. */
  function check(idx, src) {
    const L = LEVELS[idx];
    const p = SE.minipy.parse(src);
    if (p.errors.length) return { ok: false, errors: p.errors, reason: p.errors[0].message };
    const r = sail(L, p.main, p.fn);
    const fail = (reason) => ({ ok: false, errors: [], reason, run: r });
    if (r.st.error === "crash") return fail("The boat hit a ledge. Find the line where it went the wrong way.");
    if (r.st.error === "loop") return fail("The program never finished, so it was stopped. Does the loop ever end?");
    if (r.st.error === "nogem") return fail("haul() ran where there's no trap. Only haul at a buoy.");
    if (r.st.error) return fail("Something went wrong on the way. Step through it line by line.");
    if (!r.home) return fail("The boat stopped before the wharf. Count the squares, then check your loop numbers.");
    if (L.needGems && r.st.got.size < r.g.gems.length) return fail(`The boat hauled ${r.st.got.size} of ${r.g.gems.length} traps.`);
    if (L.maxLines && codeLines(src).length > L.maxLines) return fail(`It works, but it's ${codeLines(src).length} lines. Make it ${L.maxLines} or fewer with a loop.`);
    const need = (L.mustUse || []).filter((w) => !new RegExp(`^\\s*${w}\\b`, "m").test(src));
    if (need.length) return fail(`It works, but this level is practice with ${need.join(" and ")}. Use ${need.length > 1 ? "them" : "it"} in your program.`);
    return { ok: true, errors: [], reason: "", run: r };
  }
  /* Where a read-level program ends: the mark letter. */
  function predictEnd(idx) {
    const L = LEVELS[idx];
    const p = SE.minipy.parse(L.code);
    const r = sail(L, p.main, p.fn);
    return Object.keys(L.marks).find((k) => L.marks[k][0] === r.st.x && L.marks[k][1] === r.st.y) || null;
  }

  /* ───────── Drawing ───────── */
  const CELL = 40, ROT = { N: -90, E: 0, S: 90, W: 180 };
  function board(L, boat, marks) {
    const g = SE.harbor.parseGrid(L.grid);
    const cells = [];
    g.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const X = x * CELL, Y = y * CELL;
      cells.push(`<rect x="${X}" y="${Y}" width="${CELL}" height="${CELL}" class="${ch === "#" ? "py-ledge" : "py-water"}"/>`);
      if (ch === "G") cells.push(`<rect x="${X + 6}" y="${Y + 6}" width="${CELL - 12}" height="${CELL - 12}" rx="3" class="py-wharf"/><text x="${X + CELL / 2}" y="${Y + CELL / 2 + 5}" class="py-label">W</text>`);
      if (ch === "*" && !(boat.got || []).includes(`${x},${y}`)) cells.push(`<circle cx="${X + CELL / 2}" cy="${Y + CELL / 2}" r="9" class="py-buoy"/>`);
    }));
    Object.entries(marks || {}).forEach(([k, [x, y]]) => cells.push(`<g class="py-mark"><circle cx="${x * CELL + CELL - 10}" cy="${y * CELL + 10}" r="9"/><text x="${x * CELL + CELL - 10}" y="${y * CELL + 14}">${k}</text></g>`));
    const bx = boat.x * CELL + CELL / 2, by = boat.y * CELL + CELL / 2;
    cells.push(`<g class="py-boat" transform="translate(${bx} ${by}) rotate(${ROT[boat.dir]})"><path d="M-13 -9 H6 Q15 -6 17 0 Q15 6 6 9 H-13 Z"/><rect x="-5" y="-5" width="8" height="10" rx="1.5" class="py-cabin"/></g>`);
    return `<svg viewBox="0 0 ${g.w * CELL} ${g.h * CELL}" class="py-board" role="img" aria-label="Harbor map. The boat is at column ${boat.x}, row ${boat.y}, facing ${({ N: "north", E: "east", S: "south", W: "west" })[boat.dir]}.">${cells.join("")}</svg>`;
  }
  const numbered = (src) => `<ol class="py-code">${String(src).split("\n").map((l) => `<li><code>${esc(l) || " "}</code></li>`).join("")}</ol>`;

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const g = SE.harbor.parseGrid(L.grid);
    const start = { x: g.start[0], y: g.start[1], dir: L.dir, got: [] };
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = null, pick = null;
    // Parsons state: placed lines [{ text, indent }] and the bank (indexes not yet placed).
    let placed = [], bank = L.lines ? shuffle(L.lines.map((t, i) => i)) : [];
    function shuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor((Math.sin(i * 9301 + idx * 49297) * 0.5 + 0.5) * (i + 1)) % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; }

    const source = () => L.kind === "parsons" ? placed.map((p) => "    ".repeat(p.indent) + p.text).join("\n")
      : L.kind === "read" ? L.code : (el.querySelector("#py-src") || {}).value || "";

    function render(boat = start) {
      el.innerHTML = `
        <div class="py">
          <div class="py-stage">${board(L, boat, L.kind === "read" ? L.marks : null)}</div>
          <div class="py-panel">
            ${L.kind === "read" ? `
              <h3 class="py-h">The program</h3>${numbered(L.code)}
              <fieldset class="py-choices"><legend>Where will the boat stop?</legend>
                ${Object.keys(L.marks).map((k) => `<button type="button" class="btn btn--ghost py-choice" data-pick="${k}" aria-pressed="${pick === k}">${k}</button>`).join("")}
              </fieldset>` : ""}
            ${L.kind === "parsons" ? `
              <h3 class="py-h">Lines to use</h3>
              <ul class="py-bank">${bank.map((i) => `<li><button type="button" class="btn btn--ghost btn--small py-add" data-add="${i}"><code>${esc(L.lines[i])}</code><span class="visually-hidden"> (add to the program)</span></button></li>`).join("") || `<li class="muted small">All lines are in your program.</li>`}</ul>
              <h3 class="py-h">Your program</h3>
              <ol class="py-placed">${placed.map((p, i) => `<li><code style="padding-left:${p.indent * 2}ch">${esc(p.text)}</code>
                <span class="py-tools">
                  <button type="button" class="btn btn--ghost btn--small" data-indent="${i}" aria-label="Indent line ${i + 1}">${icon("arrowRight")}</button>
                  <button type="button" class="btn btn--ghost btn--small" data-outdent="${i}" aria-label="Outdent line ${i + 1}" ${p.indent ? "" : "disabled"}>${icon("arrowLeft")}</button>
                  <button type="button" class="btn btn--ghost btn--small" data-remove="${i}" aria-label="Take line ${i + 1} out">${icon("trash")}</button>
                </span></li>`).join("") || `<li class="muted small">Tap a line above to add it here.</li>`}</ol>` : ""}
            ${L.kind === "fix" || L.kind === "write" ? `
              <label class="py-h" for="py-src">${L.kind === "fix" ? "Fix this program" : "Write your program"}</label>
              <textarea id="py-src" class="py-editor" rows="8" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="py-help"></textarea>
              <p class="field-help" id="py-help">Indent with 4 spaces, or use the buttons. Tab moves to the next control.</p>
              <div class="py-edit-tools">
                <button type="button" class="btn btn--ghost btn--small" id="py-indent">${icon("arrowRight")}Indent line</button>
                <button type="button" class="btn btn--ghost btn--small" id="py-outdent">${icon("arrowLeft")}Outdent line</button>
                <button type="button" class="btn btn--ghost btn--small" id="py-reset">${icon("refresh")}Start over</button>
              </div>` : ""}
            <ul class="py-errors" id="py-errors" aria-live="polite"></ul>
            <button type="button" class="btn btn--launch" id="py-run">${icon("arrowRight")}Run</button>
          </div>
        </div>`;
      bind();
    }
    function bind() {
      el.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => { pick = b.dataset.pick; el.querySelectorAll("[data-pick]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); }));
      el.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => { const i = Number(b.dataset.add); bank = bank.filter((x) => x !== i); placed.push({ text: L.lines[i], indent: 0, from: i }); render(); focusLast(); }));
      el.querySelectorAll("[data-indent]").forEach((b) => b.addEventListener("click", () => { const p = placed[Number(b.dataset.indent)]; p.indent = Math.min(3, p.indent + 1); render(); el.querySelector(`[data-indent="${b.dataset.indent}"]`).focus(); }));
      el.querySelectorAll("[data-outdent]").forEach((b) => b.addEventListener("click", () => { const p = placed[Number(b.dataset.outdent)]; p.indent = Math.max(0, p.indent - 1); render(); el.querySelector(`[data-indent="${b.dataset.outdent}"]`).focus(); }));
      el.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => { const p = placed.splice(Number(b.dataset.remove), 1)[0]; bank.push(p.from); render(); }));
      const ta = el.querySelector("#py-src");
      if (ta) {
        if (!ta.value) ta.value = L.kind === "fix" ? L.code : (L.starter || "");
        const shift = (dir) => {
          const v = ta.value, s = ta.selectionStart, ls = v.lastIndexOf("\n", s - 1) + 1;
          if (dir > 0) { ta.value = v.slice(0, ls) + "    " + v.slice(ls); ta.selectionStart = ta.selectionEnd = s + 4; }
          else { const n = (v.slice(ls).match(/^ {1,4}/) || [""])[0].length; ta.value = v.slice(0, ls) + v.slice(ls + n); ta.selectionStart = ta.selectionEnd = Math.max(ls, s - n); }
          ta.focus();
        };
        el.querySelector("#py-indent").addEventListener("click", () => shift(1));
        el.querySelector("#py-outdent").addEventListener("click", () => shift(-1));
        el.querySelector("#py-reset").addEventListener("click", () => { ta.value = L.kind === "fix" ? L.code : (L.starter || ""); ta.focus(); });
      }
      el.querySelector("#py-run").addEventListener("click", runIt);
    }
    function focusLast() { const b = el.querySelectorAll("[data-indent]"); if (b.length) b[b.length - 1].focus(); else { const a = el.querySelector("[data-add]"); if (a) a.focus(); } }

    function animate(path, done) {
      clearTimeout(timer);
      const stage = el.querySelector(".py-stage");
      if (reduce || !path.length) { if (path.length) stage.innerHTML = board(L, path[path.length - 1], L.kind === "read" ? L.marks : null); done(); return; }
      let i = 0;
      const step = () => {
        stage.innerHTML = board(L, path[i], L.kind === "read" ? L.marks : null);
        if (++i < path.length) timer = setTimeout(step, 260); else done();
      };
      step();
    }
    function showErrors(errors) {
      const list = el.querySelector("#py-errors");
      list.innerHTML = errors.map((e) => `<li>${icon("alert")}<span>${esc(e.message)}</span></li>`).join("");
    }
    function runIt() {
      const src = source();
      api.log("lab_test_run", { kind: L.kind });
      showErrors([]);
      if (L.kind === "read") {
        if (!pick) { api.say("Choose A, B, or C first. Predict, then run.", "warn"); return; }
        const p = SE.minipy.parse(L.code);
        const r = sail(L, p.main, p.fn);
        const end = predictEnd(idx);
        animate(r.path, () => {
          if (pick === end) api.win({ predicted: pick });
          else api.say(`You predicted ${pick}, but the boat stopped at ${end}. Read the code again, one line at a time, and follow the boat with your finger.`, "warn");
        });
        return;
      }
      if (L.kind === "parsons" && placed.length < L.lines.length) { api.say(`Use all ${L.lines.length} lines. ${L.lines.length - placed.length} still to place.`, "warn"); return; }
      const res = check(idx, src);
      if (res.errors.length) { showErrors(res.errors); api.say(res.reason, "warn"); return; }
      animate(res.run ? res.run.path : [], () => {
        if (res.ok) api.win({ lines: codeLines(src).length });
        else api.say(res.reason, "warn");
      });
    }

    render();
    return () => clearTimeout(timer);
  }

  SE.labs.register({
    id: "harbor-python",
    area: "coding",
    title: "Harbor Python Lab",
    tagline: "Steer the lobster boat with real Python: read it, put it in order, fix it, then write your own.",
    levels: LEVELS,
    chapters: CHAPTERS,
    mount
  });
  SE.harborPython = { LEVELS, check, predictEnd };
})();
