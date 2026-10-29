/*
 * AI Code Review Lab — Coding & Computer Science, AI Engineer crew (planning/CODING_PLAN.md)
 * "Engineers who build with AI have to check its work." Each level shows a task, a short program an
 * "AI assistant" wrote, and the AI's confident claim that it works. Students run it, point to the line
 * with the bug, say what's wrong where asked, pick the test that proves it, and fix it.
 * SIMULATION: no AI is used. Every program and claim is written for the lesson, and says so on screen.
 * Runs on mini-Python (SE.minipy) and Harbor Code's engine (SE.harbor). Pure rules for tests:
 * SE.codeReview.check(levelIndex, answer) and .runOn(levelIndex, src, mapIndex).
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const SHORT = ["########", "#S....G#", "########"];
  const LONG = ["##########", "#S......G#", "##########"];
  const BUOYS = ["########", "#S*.*.G#", "########"];
  const ELL = ["######", "#S...#", "####.#", "####G#", "######"];
  const COAST = ["#######", "#S....#", "#####.#", "#..G#.#", "#.###.#", "#.....#", "#######"];

  const LEVELS = [
    { kind: "review", title: "One square short", concept: "Testing AI code",
      task: "Get the boat to the wharf.", maps: [SHORT], dir: "E",
      code: "for i in range(4):\n    move()", claim: "Done! This program moves the boat to the wharf.", bugLine: 1,
      goal: "Run the AI's code. Find the line with the bug, then fix it.",
      hints: ["Run it and watch where the boat stops.", "Count the squares to the wharf. How many times does the loop need to run?"],
      learned: "AI tools can sound sure and still be wrong. Running the code, not trusting the claim, is how you find out." },
    { kind: "review", title: "The wrong check", concept: "Testing AI code",
      task: "Haul both traps and reach the wharf.", maps: [BUOYS], dir: "E", needGems: true,
      code: "for i in range(5):\n    move()\n    if at_spot():\n        haul()", claim: "This hauls every trap on the way to the wharf.", bugLine: 3,
      goal: "The boat gets home, but something's missing. Find the bug and fix it.",
      hints: ["The boat reaches the wharf. Did it haul any traps?", "Traps are at buoys. Which check finds a buoy?"],
      learned: "Code can finish without errors and still do the wrong thing. Check the result against the task, not just whether it runs." },
    { kind: "review", title: "Turned around", concept: "Testing AI code",
      task: "Follow the coast all the way to the wharf.", maps: [COAST], dir: "E",
      code: "while not at_wharf():\n    if ledge_ahead():\n        turn_left()\n    else:\n        move()", claim: "This follows any coastline to the wharf.", bugLine: 3,
      goal: "Run it. The boat gets stuck. Find the line that sends it the wrong way, and fix it.",
      hints: ["Watch the first time the boat reaches a ledge. Which way should it turn to keep going?", "On this coast, the open water is always to the boat's right."],
      learned: "A one-word mistake, left instead of right, can break a whole program. Tracing the first wrong move finds it fast." },
    { kind: "review", title: "It never stops", concept: "Testing AI code",
      task: "Get the boat to the wharf.", maps: [SHORT], dir: "E",
      code: "while not at_wharf():\n    turn_right()", claim: "This keeps going until the boat is home.", bugLine: 2,
      goal: "This program never finishes. Find the line that keeps it from getting anywhere, and fix it.",
      hints: ["Inside the loop, does the boat ever move forward?", "Replace the turn with move(), so each loop gets closer to the wharf."],
      learned: "A loop that never gets closer to its goal never ends. Every loop needs something inside it that makes progress." },
    { kind: "review", title: "The comment says one thing", concept: "Reading AI code",
      task: "Do what the comment at the top says.", maps: [ELL], dir: "E",
      code: "# Go east 3 squares, turn south, go 2 squares\nfor i in range(3):\n    move()\nturn_left()\nfor i in range(2):\n    move()", claim: "The code matches the comment exactly.", bugLine: 4,
      goal: "The comment and the code don't agree. Find the line that doesn't match, and fix it.",
      hints: ["The boat faces east. Which turn makes it face south?", "Read each line and check it against the comment."],
      learned: "Comments and claims describe what code should do. Only reading and running the code tells you what it does." },
    { kind: "review", title: "Works on one map", concept: "Testing with more cases", testPick: true,
      task: "Get the boat to the wharf on any straight channel, short or long.", maps: [SHORT, LONG], dir: "E",
      code: "for i in range(5):\n    move()", claim: "Tested and working.", bugLine: 1,
      goal: "The AI tested it on one map. Pick the test that proves the bug, then fix the code so it works on both.",
      hints: ["Run it on both maps. Where does it fail?", "Use while not at_wharf(): so the boat keeps going until it's home, however long the channel is."],
      learned: "Testing one case isn't enough. Good testers pick cases that could break the code, like a longer channel." },
    { kind: "prompt", title: "A vague prompt", concept: "Writing clear prompts",
      task: "Get the boat to the wharf.", maps: [SHORT], dir: "E",
      vague: "Make the boat go right.", vagueCode: "turn_right()\nmove()",
      prompts: ["Go right a lot.", "Move the boat east 5 squares to the wharf.", "Go to the place."], answer: 1,
      goodCode: "for i in range(5):\n    move()",
      goal: "Someone asked the AI to \"Make the boat go right.\" Run its program. Then choose the prompt that would get the right program.",
      hints: ["Right could mean turn right or go east. The AI guessed turn.", "A clear prompt says the direction and how far."],
      learned: "An AI does what you ask, not what you mean. Clear prompts, with direction, amount, and goal, get better programs, just like clear instructions for Robot Chef." },
    { kind: "review", title: "Your bug report", concept: "Code review", what: true, testPick: true,
      task: "Haul both traps and reach the wharf.", maps: [SHORT, BUOYS], dir: "E", needGems: true,
      code: "for i in range(5):\n    move()\nif at_buoy():\n    haul()", claim: "Hauls the traps. Ready to ship!", bugLine: 3,
      whats: ["The if is outside the loop, so it checks only once, at the end.", "haul() is spelled wrong.", "range(5) is too short to reach the wharf."], whatAnswer: 0,
      goal: "Write a full bug report: the line, what's wrong, a test that proves it, and the fix.",
      hints: ["On the map without traps, everything looks fine. Try the other map.", "The if needs to be inside the loop so it checks after every move."],
      learned: "A bug report says where, what, how to see it, and the fix. That's how engineering teams review code, including code an AI wrote." },
  ];
  SE.labs.goals(LEVELS, LEVELS.map((L) => ({
    "Testing AI code": ["Run code an AI wrote, find the line with the bug, and fix it.", "AI tools write code fast, but they make mistakes. Checking their work is one of the most important skills for anyone who builds with AI."],
    "Reading AI code": ["Compare what code says it does with what it really does.", "Comments and claims can be wrong. Engineers trust tests and their own reading, not confidence."],
    "Testing with more cases": ["Choose a test case that proves a bug.", "Code that passes one test can still fail. Good testers look for the case that breaks it."],
    "Writing clear prompts": ["Rewrite a vague prompt so an AI gets the right program.", "AI does what you ask, not what you mean. Clear requests get better results."],
    "Code review": ["Write a bug report: the line, what's wrong, a test that shows it, and the fix.", "Reviewing code and reporting bugs clearly is everyday work on every software team."],
  })[L.concept]));

  /* ───────── Rules (pure, for tests) ───────── */
  function sail(grid, dir, src) {
    const p = SE.minipy.parse(src);
    if (p.errors.length) return { errors: p.errors };
    const g = SE.harbor.parseGrid(grid);
    const st = { x: g.start[0], y: g.start[1], dir, ops: 0, gems: new Set(g.gems), spots: new Set(g.spots), got: new Set(), dropped: new Set(), vars: {}, error: null, done: false };
    const ctx = { g, fn: p.fn, depth: 0 };
    const path = [];
    for (const _ of SE.harbor.run(p.main, st, ctx)) path.push({ x: st.x, y: st.y, dir: st.dir, got: [...st.got] });
    return { errors: [], g, st, path, home: st.x === g.goal[0] && st.y === g.goal[1], hauledAll: st.got.size === g.gems.length };
  }
  const passes = (L, r) => !r.errors.length && !r.st.error && r.home && (!L.needGems || r.hauledAll);
  const runOn = (idx, src, m = 0) => { const L = LEVELS[idx]; return sail(L.maps[m], L.dir, src); };
  /* Which test maps fail with the AI's code (the tests that prove the bug). */
  const failingMaps = (idx) => LEVELS[idx].maps.map((_, m) => m).filter((m) => !passes(LEVELS[idx], runOn(idx, LEVELS[idx].code, m)));
  /* answer: { line, what, map, prompt, src }. Returns { ok, reason }. */
  function check(idx, a) {
    const L = LEVELS[idx];
    if (L.kind === "prompt") {
      if (a.prompt == null) return { ok: false, reason: "Choose the prompt you'd give the AI." };
      if (a.prompt !== L.answer) return { ok: false, reason: `"${L.prompts[a.prompt]}" is still vague. Which prompt says the direction and how far?` };
      return { ok: true, reason: "" };
    }
    if (a.line == null) return { ok: false, reason: "Point to the line with the bug first." };
    if (a.line !== L.bugLine) return { ok: false, reason: `You chose line ${a.line}. That line isn't where it goes wrong. Run the AI's code again and watch for the first wrong move.` };
    if (L.what && a.what !== L.whatAnswer) return { ok: false, reason: "Choose what's wrong with that line. Read it again: where is it, compared with the loop?" };
    if (L.testPick && !failingMaps(idx).includes(a.map)) return { ok: false, reason: a.map == null ? "Choose the test map that proves the bug." : `Test map ${a.map + 1} passes with the AI's code, so it can't prove the bug. Try the other one.` };
    const fails = L.maps.map((_, m) => runOn(idx, a.src, m));
    const err = fails.find((r) => r.errors.length);
    if (err) return { ok: false, reason: err.errors[0].message };
    const bad = fails.findIndex((r) => !passes(L, r));
    if (bad >= 0) return { ok: false, reason: `Your fix doesn't pass test map ${bad + 1} yet. Run it and watch the boat.` };
    return { ok: true, reason: "" };
  }

  /* ───────── Drawing (shares the Harbor Python look) ───────── */
  const CELL = 40, ROT = { N: -90, E: 0, S: 90, W: 180 };
  function board(grid, boat) {
    const g = SE.harbor.parseGrid(grid);
    const c = [];
    g.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const X = x * CELL, Y = y * CELL;
      c.push(`<rect x="${X}" y="${Y}" width="${CELL}" height="${CELL}" class="${ch === "#" ? "py-ledge" : "py-water"}"/>`);
      if (ch === "G") c.push(`<rect x="${X + 6}" y="${Y + 6}" width="${CELL - 12}" height="${CELL - 12}" rx="3" class="py-wharf"/><text x="${X + CELL / 2}" y="${Y + CELL / 2 + 5}" class="py-label">W</text>`);
      if (ch === "*" && !(boat.got || []).includes(`${x},${y}`)) c.push(`<circle cx="${X + CELL / 2}" cy="${Y + CELL / 2}" r="9" class="py-buoy"/>`);
    }));
    c.push(`<g class="py-boat" transform="translate(${boat.x * CELL + CELL / 2} ${boat.y * CELL + CELL / 2}) rotate(${ROT[boat.dir]})"><path d="M-13 -9 H6 Q15 -6 17 0 Q15 6 6 9 H-13 Z"/><rect x="-5" y="-5" width="8" height="10" rx="1.5" class="py-cabin"/></g>`);
    return `<svg viewBox="0 0 ${g.w * CELL} ${g.h * CELL}" class="py-board" role="img" aria-label="Harbor map. The boat is at column ${boat.x}, row ${boat.y}.">${c.join("")}</svg>`;
  }

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ans = { line: null, what: null, map: null, prompt: null };
    let mapI = 0, timer = null;
    const startOf = (grid) => { const g = SE.harbor.parseGrid(grid); return { x: g.start[0], y: g.start[1], dir: L.dir, got: [] }; };
    const codeShown = L.kind === "prompt" ? L.vagueCode : L.code;
    const lines = codeShown.split("\n");

    el.innerHTML = `
      <div class="cr">
        <div class="cr-left">
        <div class="cr-ai">
          <p class="cr-sim">${icon("alert")}<span><strong>Simulation.</strong> No real AI here. This program and its claim were written for the lesson.</span></p>
          <p class="cr-task"><strong>Task:</strong> ${esc(L.task)}</p>
          ${L.kind === "prompt" ? `<p class="cr-prompt"><strong>Prompt to the AI:</strong> "${esc(L.vague)}"</p>` : ""}
          <p class="cr-h">${icon("code")}The AI wrote:</p>
          <ol class="py-code cr-code">${lines.map((l, i) => `<li><code>${esc(l) || " "}</code></li>`).join("")}</ol>
          ${L.claim ? `<p class="cr-claim">${icon("message")}<span>AI: "${esc(L.claim)}"</span></p>` : ""}
        </div>
        <div class="cr-review">
          ${L.kind === "prompt" ? `
            <fieldset class="cr-q"><legend>Which prompt would get the right program?</legend>
              ${L.prompts.map((p, i) => `<button type="button" class="btn btn--ghost cr-opt" data-prompt="${i}" aria-pressed="false">"${esc(p)}"</button>`).join("")}
            </fieldset>` : `
            <fieldset class="cr-q"><legend>1. Which line has the bug?</legend>
              <div class="cr-lines">${lines.map((l, i) => l.trim().startsWith("#") ? "" : `<button type="button" class="btn btn--ghost btn--small" data-line="${i + 1}" aria-pressed="false">Line ${i + 1}</button>`).join("")}</div>
            </fieldset>
            ${L.what ? `<fieldset class="cr-q"><legend>2. What's wrong with it?</legend>${L.whats.map((w, i) => `<button type="button" class="btn btn--ghost cr-opt" data-what="${i}" aria-pressed="false">${esc(w)}</button>`).join("")}</fieldset>` : ""}
            ${L.testPick ? `<fieldset class="cr-q"><legend>${L.what ? "3" : "2"}. Which test proves the bug?</legend>${L.maps.map((_, m) => `<button type="button" class="btn btn--ghost btn--small" data-pickmap="${m}" aria-pressed="false">Test map ${m + 1}</button>`).join("")}</fieldset>` : ""}
            <label class="py-h" for="cr-src">${L.what && L.testPick ? "4" : L.testPick ? "3" : "2"}. Fix it</label>
            <textarea id="cr-src" class="py-editor" rows="6" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="cr-help">${esc(L.code)}</textarea>
            <p class="field-help" id="cr-help">Change the AI's code. Indent with 4 spaces. Tab moves to the next control.</p>`}
          <ul class="py-errors" id="cr-errors" aria-live="polite"></ul>
        </div>
        </div>
        <div class="cr-test">
          ${L.maps.length > 1 ? `<div class="seg cr-maps" role="group" aria-label="Test map">${L.maps.map((_, m) => `<button type="button" class="seg__btn" data-map="${m}" aria-pressed="${m === 0}">Test map ${m + 1}</button>`).join("")}</div>` : ""}
          <div class="py-stage" id="cr-stage">${board(L.maps[0], startOf(L.maps[0]))}</div>
          <button type="button" class="btn btn--ghost" id="cr-run-ai">${icon("arrowRight")}Run the AI's code${L.maps.length > 1 ? " on this map" : ""}</button>
          <button type="button" class="btn btn--launch" id="cr-submit">${icon("check")}${L.kind === "prompt" ? "Send the prompt" : "Run my fix"}</button>
        </div>
      </div>`;

    const stage = el.querySelector("#cr-stage");
    function animate(grid, path, done) {
      clearTimeout(timer);
      if (reduce || !path.length) { stage.innerHTML = board(grid, path.length ? path[path.length - 1] : startOf(grid)); done && done(); return; }
      let i = 0;
      const step = () => { stage.innerHTML = board(grid, path[i]); if (++i < path.length) timer = setTimeout(step, 240); else done && done(); };
      step();
    }
    const press = (sel, attr, val) => el.querySelectorAll(sel).forEach((b) => b.setAttribute("aria-pressed", String(b.getAttribute(attr) === String(val))));
    el.querySelectorAll("[data-map]").forEach((b) => b.addEventListener("click", () => {
      mapI = Number(b.dataset.map); press("[data-map]", "data-map", mapI);
      stage.innerHTML = board(L.maps[mapI], startOf(L.maps[mapI]));
    }));
    el.querySelector("#cr-run-ai").addEventListener("click", () => {
      api.log("lab_test_run", { what: "ai" });
      const r = sail(L.maps[mapI], L.dir, codeShown);
      animate(L.maps[mapI], r.path || [], () => {
        const ok = r.st && passes(L, r);
        api.say(ok ? "On this map, the AI's code works." : r.st && r.st.error === "loop" ? "The AI's code never finished, so it was stopped." : r.st && r.st.error === "crash" ? "The boat hit a ledge." : r.st && !r.home ? "The boat didn't reach the wharf." : "The boat got home but didn't finish the task.", ok ? "info" : "warn");
      });
    });
    el.querySelectorAll("[data-line]").forEach((b) => b.addEventListener("click", () => { ans.line = Number(b.dataset.line); press("[data-line]", "data-line", ans.line); }));
    el.querySelectorAll("[data-what]").forEach((b) => b.addEventListener("click", () => { ans.what = Number(b.dataset.what); press("[data-what]", "data-what", ans.what); }));
    el.querySelectorAll("[data-pickmap]").forEach((b) => b.addEventListener("click", () => { ans.map = Number(b.dataset.pickmap); press("[data-pickmap]", "data-pickmap", ans.map); }));
    el.querySelectorAll("[data-prompt]").forEach((b) => b.addEventListener("click", () => { ans.prompt = Number(b.dataset.prompt); press("[data-prompt]", "data-prompt", ans.prompt); }));
    el.querySelector("#cr-submit").addEventListener("click", () => {
      const src = (el.querySelector("#cr-src") || {}).value;
      const res = check(idx, { ...ans, src });
      api.log("lab_test_run", { what: "fix", ok: res.ok });
      el.querySelector("#cr-errors").innerHTML = "";
      if (!res.ok) { api.say(res.reason, "warn"); return; }
      // Show it working: the good program for a prompt level, or the student's fix on the last test map.
      const show = L.kind === "prompt" ? sail(L.maps[0], L.dir, L.goodCode) : sail(L.maps[L.maps.length - 1], L.dir, src);
      animate(L.kind === "prompt" ? L.maps[0] : L.maps[L.maps.length - 1], show.path || [], () => api.win({ line: ans.line }));
    });
    return () => clearTimeout(timer);
  }

  SE.labs.register({
    id: "code-review",
    area: "coding",
    title: "AI Code Review Lab",
    tagline: "An AI assistant wrote the code. Is it right? Run it, find the bug, prove it, and fix it. (A simulation: no real AI is used.)",
    simulation: "The AI assistant here is pretend. Its programs and claims were written for the lesson, with bugs on purpose.",
    levels: LEVELS,
    mount
  });
  SE.codeReview = { LEVELS, check, runOn, failingMaps };
})();
