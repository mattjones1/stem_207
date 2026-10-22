/*
 * Robot Dance Party — Coding (beginner, grades 2–8)
 *
 * Students build a numbered program from five dance moves, reorder or remove
 * steps with buttons (no dragging), and run it to watch a robot dance.
 * Dance basics (a 10-minute lesson):
 *   1. Predict and run a three-step example.
 *   2. Swap two steps and run it again.
 *   3. Make a dance with at least five steps.
 *   4. Challenge: jump, spin, then pose, finishing with the pose.
 * Go deeper (grades 4–6): a Repeat block (2–4 times, up to 4 moves inside).
 *   5. Repeat it: rebuild a target dance using a repeat.
 *   6. Fix the bug: a program that almost matches the target.
 *   7. Fewest blocks: the same 12-move dance in 5 blocks or fewer.
 *   8. Choreographer: 12+ moves in 6 blocks or fewer, then take it to Scratch.
 * Every check reads the program the robot actually ran to the end, never a "Done" button.
 *
 * A program is a list of blocks: a move ("jump"), or a repeat ({ repeat: 3, body: ["jump", "spin"] }).
 * SE.dance.check(level, program), expand(program), and blocks(program) are exposed for tests.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const COLS = 5;          // dance floor squares
  const START = 2;         // the robot starts in the middle square
  const MAX = 12;          // most blocks in a program
  const MAX_MOVES = 24;    // most moves the robot dances in one run
  const BODY_MAX = 4;      // most moves inside one repeat
  const REP_MIN = 2, REP_MAX = 4;
  const STEP_MS = 850;     // time for each step
  const DEEP = 4;          // first Go deeper level (index)

  const MOVES = {
    left: { label: "Move left", short: "Left", say: "moves left" },
    right: { label: "Move right", short: "Right", say: "moves right" },
    jump: { label: "Jump", short: "Jump", say: "jumps" },
    spin: { label: "Spin", short: "Spin", say: "spins" },
    pose: { label: "Strike a pose", short: "Pose", say: "strikes a pose" }
  };
  const ORDER = ["left", "right", "jump", "spin", "pose"];
  const EXAMPLE = ["right", "jump", "spin"];

  /* Go deeper targets and starters. */
  const T5 = ["jump", "spin", "jump", "spin", "jump", "spin", "pose"];
  const T6 = ["right", "spin", "spin", "spin", "left", "pose"];
  const BUGGY = ["right", { repeat: 2, body: ["spin"] }, "pose", "left"];
  const T7 = ["left", "jump", "right", "spin", "left", "jump", "right", "spin", "left", "jump", "right", "spin"];
  const TARGET = { 4: T5, 5: T6, 6: T7 };
  const STARTER = { 0: EXAMPLE, 1: EXAMPLE, 5: BUGGY, 6: T7 };

  /* Small glyphs so each move has a shape as well as a color. */
  const GLYPH = {
    left: '<path d="M15 5 L8 12 L15 19" /><path d="M8 12 H21" />',
    right: '<path d="M9 5 L16 12 L9 19" /><path d="M3 12 H16" />',
    jump: '<path d="M12 20 V6" /><path d="M6 11 L12 5 L18 11" /><path d="M5 22 H19" />',
    spin: '<path d="M20 12 A8 8 0 1 1 16.5 5.4" /><path d="M17 1.5 V6 H12.5" />',
    pose: '<path d="M12 2.5 L14.6 8.6 L21 9.2 L16.2 13.4 L17.6 19.8 L12 16.4 L6.4 19.8 L7.8 13.4 L3 9.2 L9.4 8.6 Z" />',
    repeat: '<path d="M4 12 A8 8 0 0 1 18 6.5" /><path d="M18.5 2 V7 H13.5" /><path d="M20 12 A8 8 0 0 1 6 17.5" /><path d="M5.5 22 V17 H10.5" />'
  };
  const glyph = (m) => `<svg class="dp-glyph" viewBox="0 0 24 24" aria-hidden="true">${GLYPH[m]}</svg>`;
  const names = (prog) => prog.map((m) => MOVES[m].label).join(", ");

  /* ───────── Level rules (pure, so they can be tested) ───────── */
  const isRep = (b) => !!b && typeof b === "object";
  const clone = (prog) => (prog || []).map((b) => (isRep(b) ? { repeat: b.repeat, body: b.body.slice() } : b));
  /* The moves a program makes, in order (repeats unrolled). */
  const expand = (prog) => prog.flatMap((b) => (isRep(b) ? Array.from({ length: b.repeat }, () => b.body).flat() : [b]));
  /* Blocks, counted like Scratch: each move is one block, a repeat is one block plus the moves inside it. */
  const blocks = (prog) => prog.reduce((n, b) => n + (isRep(b) ? 1 + b.body.length : 1), 0);
  const sameMoves = (a, b) => a.length === b.length && a.slice().sort().join() === b.slice().sort().join();
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  function matchTarget(moves, want) {
    for (let i = 0; i < Math.max(moves.length, want.length); i++) {
      if (moves[i] === want[i]) continue;
      if (i >= moves.length) return { ok: false, msg: `Your robot stopped after ${plural(moves.length, "move", "moves")}. The target dance has ${want.length}. Move ${i + 1} should be ${MOVES[want[i]].label}.` };
      if (i >= want.length) return { ok: false, msg: `Your robot made ${moves.length} moves, but the target dance has only ${want.length}. Move ${i + 1} (${MOVES[moves[i]].label}) is extra.` };
      return { ok: false, msg: `Move ${i + 1} should be ${MOVES[want[i]].label}, but your robot did ${MOVES[moves[i]].label}.` };
    }
    return { ok: true };
  }

  function check(level, prog, ctx = {}) {
    if (level >= DEEP) {
      if (!prog.length) return { ok: false, msg: "Add some blocks first, then press Run." };
      const empty = prog.findIndex((b) => isRep(b) && !b.body.length);
      if (empty >= 0) return { ok: false, msg: `The Repeat at step ${empty + 1} is empty. Add a move inside it, or remove it.` };
      const moves = expand(prog), n = blocks(prog);
      if (TARGET[level]) {
        const m = matchTarget(moves, TARGET[level]);
        if (!m.ok) return m;
        if (level === 4 && !prog.some(isRep)) return { ok: false, msg: `Your dance matches the target! Now make it shorter: use a Repeat block. You used ${n} blocks.` };
        if (level === 6 && n > 5) return { ok: false, msg: `Same dance, nice! But you used ${n} blocks. Can you get it to 5 or fewer?` };
        return { ok: true, blocks: n };
      }
      // Level 8: your own dance.
      if (moves.length < 12) return { ok: false, msg: `Your dance has ${plural(moves.length, "move", "moves")}. Make it at least 12.` };
      if (n > 6) return { ok: false, msg: `Your dance has ${moves.length} moves, but it uses ${n} blocks. Use repeats to get it to 6 blocks or fewer.` };
      return { ok: true, blocks: n, moves: moves.length };
    }
    if (level === 0) {
      if (!prog.length) return { ok: false, msg: "The program is empty. Press Reset level to get the example back." };
      return { ok: true };
    }
    if (level === 1) {
      if (!sameMoves(prog, EXAMPLE)) return { ok: false, msg: "Keep the same three instructions: Move right, Jump, and Spin. Only change their order." };
      if (prog.join() === EXAMPLE.join()) return { ok: false, msg: "That's still the original order. Use the up or down buttons to swap two instructions, then run it again." };
      return { ok: true };
    }
    if (level === 2) {
      if (prog.length < 5) return { ok: false, msg: `Your dance has ${prog.length} instruction${prog.length === 1 ? "" : "s"}. Add ${5 - prog.length} more to make it at least five.` };
      return { ok: true };
    }
    // Level 4: the challenge. Jump, then spin, then pose, and the pose comes last.
    if (!prog.length) return { ok: false, msg: "Add some instructions first, then press Run." };
    const j = prog.indexOf("jump");
    const sAfter = j < 0 ? -1 : prog.indexOf("spin", j + 1);
    const last = prog[prog.length - 1];
    if (j < 0 && !prog.includes("spin")) return { ok: false, msg: "The robot never jumps or spins. Which two moves does the challenge ask for before the pose?" };
    if (j < 0) return { ok: false, msg: "The robot spins, but it never jumps. Add a Jump. Where should it go?" };
    if (!prog.includes("spin")) return { ok: false, msg: "The robot jumps, but it never spins. Add a Spin. Should it come before or after the jump?" };
    if (sAfter < 0) return { ok: false, msg: "The robot spins before it jumps. The challenge says jump, then spin. Try swapping them." };
    if (!prog.includes("pose")) return { ok: false, msg: "Nice jump and spin! But the robot never strikes a pose. How should the dance end?" };
    if (last !== "pose") return { ok: false, msg: `So close! The robot's last move was ${MOVES[last].label}. The dance must finish with the pose.` };
    if (prog.lastIndexOf("pose") < sAfter) return { ok: false, msg: "The pose needs to come after the spin." };
    return { ok: true, exact: prog.join() === "jump,spin,pose" };
  }

  const LEVELS = [
    { title: "Predict, then run", concept: "Sequence",
      goal: "Read the 3-step program. Predict what the robot will do first and last, then press Run.",
      steps: ["Read the numbered program.", "Pick your two predictions.", "Press Run and watch each step light up."],
      hints: ["Programs run from the top down. Step 1 happens first.", "The first move is step 1 and the last move is step 3. Find those two in the list."],
      learned: "Computers follow your instructions in the order you give them. Step 1 runs first, then step 2, then step 3." },
    { title: "Swap two steps", concept: "Order matters",
      goal: "Swap two instructions with the up and down buttons, then run it again. What changed?",
      steps: ["Pick an instruction.", "Press its up or down button to move it.", "Press Run and compare."],
      hints: ["Each step has ▲ and ▼ buttons. Moving one step up swaps it with the step above.", "Try moving Spin to the top. Now the robot spins before it does anything else."],
      learned: "The same instructions in a different order make a different dance. Changing the order changes the result." },
    { title: "Your dance", concept: "Create",
      goal: "Make a dance with at least five instructions, then run it.",
      steps: ["Press move buttons to add steps.", "Fix the order with ▲ and ▼.", "Run it. Change it. Run it again."],
      hints: ["Every move button adds a step to the end of your program.", "Try a pattern, like Move left, Jump, Move right, Jump, Strike a pose."],
      learned: "You planned a sequence and tested it. Real programmers build, run, and change their programs again and again." },
    { title: "Challenge: jump, spin, pose", concept: "Challenge",
      goal: "Make the robot jump, spin, and then pose. It must finish with the pose.",
      steps: ["Build the program on your own.", "Press Run. The robot checks your dance when it finishes."],
      hints: ["Read the challenge one word at a time. The first move it names should be the first step in your program.", "Your program needs a Jump at the top and a Strike a pose at the very end. What goes in between?"],
      learned: "You turned words into an exact sequence. Computers follow your instructions in the order you give them, so the order you choose is the dance you get." },
    { title: "Repeat it", concept: "Loops",
      goal: "Make the robot do the target dance. Use a Repeat block for the part that happens again and again.",
      steps: ["Look at the target dance. Find the moves that repeat.", "Press Repeat, then add moves inside it. Use − and + to set how many times.", "Add any moves that come after the repeat, then press Run."],
      hints: ["Jump, Spin happens three times in a row, then the robot poses.", "Make Repeat 3 times with Jump and Spin inside. Then press Done adding and add Strike a pose after it."],
      learned: "A loop (a Repeat block) runs the moves inside it again and again. One Repeat can replace many copies of the same steps." },
    { title: "Fix the bug", concept: "Debugging",
      goal: "This program is supposed to make the target dance, but it has bugs. Run it, find what's different, and fix it.",
      steps: ["Run the program and watch closely.", "Compare each move to the target dance. Where does it first go wrong?", "Fix that spot, then run it again. There may be more than one bug."],
      hints: ["Count the spins in the target dance. How many times does your repeat run?", "Use − and + on the Repeat to change the count, and ▲ ▼ to fix the order at the end."],
      learned: "Debugging means finding the first place a program goes wrong, fixing it, and testing again. Programmers almost never get it right the first time." },
    { title: "Fewest blocks", concept: "Efficiency",
      goal: "This program makes the right dance the long way, with 12 blocks. Make the same dance with 5 blocks or fewer.",
      steps: ["Run it once to see the dance.", "Find the group of moves that repeats.", "Clear the program and rebuild it with a Repeat. Watch your block count."],
      hints: ["Left, Jump, Right, Spin happens three times.", "A Repeat 3 times with four moves inside is 5 blocks: 1 for the Repeat and 4 inside it."],
      learned: "Loops make programs shorter and easier to change. If the dance had to happen 10 times, you'd only change one number." },
    { title: "Choreographer", concept: "Create with loops",
      goal: "Design your own dance with at least 12 moves, using 6 blocks or fewer.",
      steps: ["Plan a pattern you can repeat.", "Build it with Repeat blocks.", "Run it, then take your idea to Scratch."],
      hints: ["One Repeat 4 times with 3 moves inside already makes 12 moves.", "Watch the count under Your program: it shows blocks and moves."],
      learned: "You designed a long dance with a short program. That's how real programmers think: find the pattern, then loop it." }
  ];
  const CHAPTERS = [
    { title: "Dance basics", short: "Basics", from: 0, to: 3, blurb: "Put moves in order and watch the robot follow your program." },
    { title: "Go deeper: loops and debugging", short: "Go deeper", from: 4, to: 7, blurb: "For grades 4–6, or anyone ready for more. Use Repeat blocks, fix buggy code, and make programs shorter." }
  ];

  /* ───────── The robot ───────── */
  const robotSvg = () => `
    <svg class="dp-robot__svg" viewBox="0 0 120 150" aria-hidden="true">
      <line x1="60" y1="8" x2="60" y2="24" stroke="#012d2b" stroke-width="4" stroke-linecap="round"/>
      <circle class="dp-antenna" cx="60" cy="8" r="6" fill="#94c93d" stroke="#012d2b" stroke-width="3"/>
      <rect x="22" y="22" width="76" height="48" rx="14" fill="#f4f2ea" stroke="#012d2b" stroke-width="4"/>
      <rect x="32" y="31" width="56" height="30" rx="9" fill="#012d2b"/>
      <g class="dp-eyes"><circle cx="48" cy="44" r="5" fill="#b9e27f"/><circle cx="72" cy="44" r="5" fill="#b9e27f"/></g>
      <path class="dp-mouth" d="M50 52 Q60 58 70 52" stroke="#b9e27f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="30" y="68" width="60" height="46" rx="10" fill="#94c93d" stroke="#012d2b" stroke-width="4"/>
      <rect x="44" y="78" width="32" height="18" rx="4" fill="#012d2b"/>
      <circle cx="52" cy="87" r="3" fill="#f2c14e"/><circle cx="60" cy="87" r="3" fill="#e9603f"/><circle cx="68" cy="87" r="3" fill="#b9e27f"/>
      <g class="dp-arm dp-arm--l"><path d="M30 70 L12 92" stroke="#012d2b" stroke-width="9" stroke-linecap="round"/><circle cx="12" cy="92" r="7" fill="#94c93d" stroke="#012d2b" stroke-width="3"/></g>
      <g class="dp-arm dp-arm--r"><path d="M90 70 L108 92" stroke="#012d2b" stroke-width="9" stroke-linecap="round"/><circle cx="108" cy="92" r="7" fill="#94c93d" stroke="#012d2b" stroke-width="3"/></g>
      <rect x="40" y="114" width="12" height="22" rx="4" fill="#012d2b"/><rect x="68" y="114" width="12" height="22" rx="4" fill="#012d2b"/>
      <rect x="34" y="134" width="22" height="10" rx="5" fill="#012d2b"/><rect x="64" y="134" width="22" height="10" rx="5" fill="#012d2b"/>
    </svg>`;

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const deep = idx >= DEEP;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const starter = clone(STARTER[idx]);
    const target = TARGET[idx] || null;
    const st = {
      prog: clone(starter),
      into: null,      // index of the Repeat that new moves go into (Go deeper levels)
      x: START,
      running: false,
      runToken: 0,
      active: null,    // { i, j } while running: block i, move j inside a repeat
      predict: { first: null, last: null },
      lastRun: null,   // the last program that ran to the end
      won: false
    };
    const stepMs = deep ? 620 : STEP_MS;

    el.innerHTML = `
      <div class="dp">
        <div class="dp-stage-wrap">
          <div class="dp-stage" id="dp-stage" role="img" aria-label="Dance floor with a robot">
            <div class="dp-lights" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
            <div class="dp-floor" aria-hidden="true">${Array.from({ length: COLS }, (_, i) => `<span class="dp-tile ${i === START ? "is-start" : ""}"></span>`).join("")}</div>
            <div class="dp-robot" id="dp-robot" style="--x:${START}"><div class="dp-robot__body">${robotSvg()}</div><span class="dp-sparkles" aria-hidden="true">${"<i></i>".repeat(5)}</span></div>
            <p class="dp-caption" id="dp-caption" aria-hidden="true"></p>
          </div>
          <p class="dp-now" id="dp-now" role="status" aria-live="polite">The robot is ready in the middle of the dance floor.</p>
          <div class="dp-run">
            <button type="button" class="btn btn--launch dp-big" id="dp-run">${icon("rocket")}Run</button>
            <button type="button" class="btn btn--ghost dp-big" id="dp-reset">${icon("refresh")}Reset robot</button>
          </div>
          ${target ? `
          <div class="dp-target">
            <h3 id="dp-target-title">Target dance <span class="dp-count">${target.length} moves</span></h3>
            <ol class="dp-target__list" aria-labelledby="dp-target-title">${target.map((m, i) => `<li class="dp-target__move dp-step--${m}"><span class="dp-step__n" aria-hidden="true">${i + 1}</span>${glyph(m)}<span>${esc(MOVES[m].short)}</span></li>`).join("")}</ol>
          </div>` : ""}
        </div>

        <div class="dp-code">
          ${idx === 0 ? `
          <fieldset class="dp-predict" id="dp-predict">
            <legend>Predict before you run</legend>
            ${["first", "last"].map((k) => `
              <div class="dp-predict__q"><span class="dp-predict__label">What will the robot do <strong>${k}</strong>?</span>
                <div class="dp-predict__opts" role="group" aria-label="Prediction: what the robot does ${k}">${ORDER.map((m) => `<button type="button" class="dp-pick" data-predict="${k}" data-move="${m}" aria-pressed="false">${glyph(m)}${esc(MOVES[m].short)}</button>`).join("")}</div>
              </div>`).join("")}
          </fieldset>` : ""}

          <div class="dp-palette">
            <h3 id="dp-pal-title">Add a move</h3>
            ${deep ? `<p class="dp-into" id="dp-into" aria-live="polite"></p>` : ""}
            <div class="dp-moves" role="group" aria-labelledby="dp-pal-title">
              ${ORDER.map((m) => `<button type="button" class="dp-move dp-move--${m}" data-add="${m}">${glyph(m)}<span>${esc(MOVES[m].label)}</span></button>`).join("")}
              ${deep ? `<button type="button" class="dp-move dp-move--repeat" id="dp-addrep">${glyph("repeat")}<span>Repeat</span></button>` : ""}
            </div>
          </div>

          <div class="dp-program">
            <div class="dp-program__head"><h3 id="dp-prog-title">Your program</h3><span class="dp-count" id="dp-count"></span></div>
            <ol class="dp-list" id="dp-list" aria-labelledby="dp-prog-title"></ol>
            <div class="dp-program__tools">
              <button type="button" class="btn btn--ghost btn--small" id="dp-clear">${icon("trash")}Clear program</button>
              ${starter.length ? `<button type="button" class="btn btn--ghost btn--small" id="dp-example">${icon("refresh")}Reset level</button>` : ""}
            </div>
          </div>
          <p class="dp-rule">${icon("bulb")}<span>${deep ? "A Repeat runs the moves inside it again and again, in order." : "Computers follow your instructions in the order you give them."}</span></p>
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    const robot = $("#dp-robot"), body = robot.querySelector(".dp-robot__body");
    const now = $("#dp-now"), caption = $("#dp-caption");

    /* ── Program list ── */
    function moveItem(m, i, j, rep) {
      const nm = MOVES[m].label, act = st.active && st.active.i === i && st.active.j === j;
      const where = rep ? `move ${j + 1} in the repeat at step ${i + 1}` : `step ${i + 1}`;
      const len = rep ? rep.body.length : st.prog.length;
      const k = rep ? j : i;
      const ops = rep ? ["iup", "idown", "iremove"] : ["up", "down", "remove"];
      return `<li class="dp-step dp-step--${m} ${act ? "is-active" : ""}" ${act ? 'aria-current="step"' : ""} data-i="${i}"${rep ? ` data-j="${j}"` : ""}>
        <span class="dp-step__n" aria-hidden="true">${rep ? `${i + 1}.${j + 1}` : i + 1}</span>
        <span class="dp-step__name">${glyph(m)}<span><span class="visually-hidden">${rep ? `Inside the repeat, move ${j + 1}` : `Step ${i + 1}`}: </span>${esc(nm)}</span>${act ? '<span class="dp-step__now">Now</span>' : ""}</span>
        <span class="dp-step__tools">
          <button type="button" class="dp-icon-btn" data-op="${ops[0]}" data-i="${i}" data-j="${j}" aria-label="Move ${where}, ${esc(nm)}, up" ${k === 0 ? "disabled" : ""}>▲</button>
          <button type="button" class="dp-icon-btn" data-op="${ops[1]}" data-i="${i}" data-j="${j}" aria-label="Move ${where}, ${esc(nm)}, down" ${k === len - 1 ? "disabled" : ""}>▼</button>
          <button type="button" class="dp-icon-btn dp-icon-btn--x" data-op="${ops[2]}" data-i="${i}" data-j="${j}" aria-label="Remove ${where}, ${esc(nm)}">✕</button>
        </span>
      </li>`;
    }
    function repeatItem(b, i) {
      const act = st.active && st.active.i === i;
      const into = st.into === i;
      return `<li class="dp-step dp-step--repeat ${act ? "is-active" : ""} ${into ? "is-into" : ""}" ${act ? 'aria-current="step"' : ""} data-i="${i}">
        <div class="dp-rep">
          <div class="dp-rep__head">
            <span class="dp-step__n" aria-hidden="true">${i + 1}</span>
            <span class="dp-rep__label">${glyph("repeat")}<span class="visually-hidden">Step ${i + 1}: </span>Repeat</span>
            <span class="dp-rep__count">
              <button type="button" class="dp-icon-btn" data-op="less" data-i="${i}" aria-label="Repeat fewer times" ${b.repeat <= REP_MIN ? "disabled" : ""}>−</button>
              <b class="dp-rep__n">${b.repeat}</b><span>times</span>
              <button type="button" class="dp-icon-btn" data-op="more" data-i="${i}" aria-label="Repeat more times" ${b.repeat >= REP_MAX ? "disabled" : ""}>+</button>
            </span>
            ${act && st.active.k ? `<span class="dp-step__now">Time ${st.active.k} of ${b.repeat}</span>` : ""}
            <span class="dp-step__tools">
              <button type="button" class="dp-icon-btn" data-op="up" data-i="${i}" aria-label="Move step ${i + 1}, Repeat, up" ${i === 0 ? "disabled" : ""}>▲</button>
              <button type="button" class="dp-icon-btn" data-op="down" data-i="${i}" aria-label="Move step ${i + 1}, Repeat, down" ${i === st.prog.length - 1 ? "disabled" : ""}>▼</button>
              <button type="button" class="dp-icon-btn dp-icon-btn--x" data-op="remove" data-i="${i}" aria-label="Remove step ${i + 1}, Repeat ${b.repeat} times">✕</button>
            </span>
          </div>
          <ol class="dp-rep__body" aria-label="Moves inside the repeat at step ${i + 1}">
            ${b.body.length ? b.body.map((m, j) => moveItem(m, i, j, b)).join("") : `<li class="dp-empty">Empty. Add moves here.</li>`}
          </ol>
          <button type="button" class="btn btn--small ${into ? "btn--primary" : "btn--ghost"} dp-rep__into" data-op="into" data-i="${i}" aria-pressed="${into}">${into ? "Adding moves here · Done adding" : "Add moves inside"}</button>
        </div>
      </li>`;
    }
    function renderList(focus) {
      const list = $("#dp-list");
      if (st.into !== null && !isRep(st.prog[st.into])) st.into = null;
      $("#dp-count").textContent = deep ? `${plural(blocks(st.prog), "block", "blocks")} · ${plural(expand(st.prog).length, "move", "moves")}` : `${st.prog.length} of ${MAX} steps`;
      if (!st.prog.length) {
        list.innerHTML = `<li class="dp-empty">No steps yet. Press a move button to add one.</li>`;
      } else {
        list.innerHTML = st.prog.map((b, i) => (isRep(b) ? repeatItem(b, i) : moveItem(b, i, -1, null))).join("");
      }
      const into = $("#dp-into");
      if (into) into.innerHTML = st.into !== null ? `${glyph("repeat")}New moves go <strong>inside the Repeat at step ${st.into + 1}</strong>.` : "New moves go at the end of your program.";
      lock(st.running);
      if (focus) {
        const t = $(focus);
        if (t && !t.disabled) t.focus();
        else if (t) { const other = t.closest("li").querySelector("[data-op]:not([disabled])"); (other || $("#dp-run")).focus(); }
      }
    }

    /* While the robot dances, editing is paused (Reset robot still works). */
    function lock(on) {
      el.querySelectorAll("[data-add], [data-op], [data-predict], #dp-addrep, #dp-clear, #dp-example, #dp-run").forEach((b) => {
        if (on) b.setAttribute("aria-disabled", "true"); else b.removeAttribute("aria-disabled");
      });
      el.querySelector(".dp").classList.toggle("is-running", on);
      $("#dp-run").innerHTML = on ? `${icon("clock")}Dancing…` : `${icon("rocket")}Run`;
    }
    const busy = (b) => b.getAttribute("aria-disabled") === "true";

    /* ── Robot ── */
    function place(x, instant) {
      st.x = x;
      robot.classList.toggle("no-anim", !!instant);
      robot.style.setProperty("--x", x);
    }
    function clearPose() { body.classList.remove("is-pose"); robot.classList.remove("is-pose"); }
    function resetRobot(msg) {
      st.runToken++;
      st.running = false;
      st.active = null;
      clearPose();
      body.className = "dp-robot__body";
      caption.textContent = "";
      place(START, true);
      renderList();
      now.textContent = msg || "The robot is back in the middle, ready to dance.";
    }
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    async function act(m, token) {
      clearPose();
      body.className = "dp-robot__body";
      void body.offsetWidth; // restart the animation
      caption.innerHTML = `${glyph(m)}${esc(MOVES[m].short)}`;
      caption.className = `dp-caption dp-caption--${m} is-on`;
      if (m === "left" || m === "right") {
        const nx = st.x + (m === "left" ? -1 : 1);
        if (nx < 0 || nx >= COLS) {
          body.classList.add("do-bump");
          now.textContent += ` It's already at the ${m} edge, so it wiggles and stays on the floor.`;
          caption.innerHTML = `${glyph(m)}Edge!`;
        } else {
          place(nx, reduce);
          body.classList.add(m === "left" ? "do-lean-l" : "do-lean-r");
        }
      } else if (m === "jump") body.classList.add("do-jump");
      else if (m === "spin") body.classList.add("do-spin");
      else { body.classList.add("is-pose"); robot.classList.add("is-pose"); }
      await wait(reduce ? Math.round(stepMs * 0.8) : stepMs);
      return token === st.runToken;
    }

    async function run() {
      if (st.running) return;  // one run at a time
      if (!st.prog.length) { api.say("Add at least one move first, then press Run.", "warn"); return; }
      if (idx === 0 && (!st.predict.first || !st.predict.last)) { api.say("Make both predictions first, then press Run.", "warn"); $("#dp-predict .dp-pick").focus(); return; }
      const empty = st.prog.findIndex((b) => isRep(b) && !b.body.length);
      if (empty >= 0) { api.say(`The Repeat at step ${empty + 1} is empty. Add a move inside it, or remove it.`, "warn"); return; }
      const total = expand(st.prog).length;
      if (total > MAX_MOVES) { api.say(`Your dance has ${total} moves. The robot can dance up to ${MAX_MOVES} in one go. Lower a repeat count or remove a move.`, "warn"); return; }
      const prog = clone(st.prog);
      const token = ++st.runToken;
      st.running = true;
      api.log("lab_test_run", { program: prog });
      api.say("");
      clearPose();
      place(START, true);
      void robot.offsetWidth;
      const ran = [];
      let n = 0;
      for (let i = 0; i < prog.length; i++) {
        const b = prog[i];
        const reps = isRep(b) ? b.repeat : 1, moves = isRep(b) ? b.body : [b];
        for (let k = 1; k <= reps; k++) {
          for (let j = 0; j < moves.length; j++) {
            n++;
            st.active = { i, j: isRep(b) ? j : -1, k: isRep(b) ? k : 0 };
            renderList();
            now.textContent = isRep(b)
              ? `Move ${n} of ${total}: Repeat ${b.repeat} times, time ${k} of ${b.repeat}. The robot ${MOVES[moves[j]].say}.`
              : deep ? `Move ${n} of ${total}: the robot ${MOVES[b].say}.` : `Step ${i + 1} of ${prog.length}: the robot ${MOVES[b].say}.`;
            if (!(await act(moves[j], token))) return;   // Reset robot stopped this run
            ran.push(moves[j]);
          }
        }
      }
      if (token !== st.runToken) return;
      st.running = false;
      st.active = null;
      caption.className = "dp-caption";
      renderList();
      finished(ran, prog);
    }

    /* ── Checking: uses the program the robot actually ran to the end ── */
    function finished(ran, prog) {
      st.lastRun = ran.slice();
      now.textContent = deep ? `Done! The robot made ${plural(ran.length, "move", "moves")} from ${plural(blocks(prog), "block", "blocks")}.` : `Done! The robot ran ${ran.length} step${ran.length === 1 ? "" : "s"}: ${names(ran)}.`;
      if (st.won) { api.say("Nice! Try another way, or go on to the next level.", "good"); return; }
      const res = check(idx, deep ? prog : ran);
      if (idx === 0) {
        const p = st.predict, first = ran[0], last = ran[ran.length - 1];
        const r1 = p.first === first ? `You predicted ${MOVES[p.first].label} first. Correct!` : `You predicted ${MOVES[p.first].label} first, but step 1 was ${MOVES[first].label}.`;
        const r2 = p.last === last ? `You predicted ${MOVES[p.last].label} last. Correct!` : `You predicted ${MOVES[p.last].label} last, but the final step was ${MOVES[last].label}.`;
        api.say(`${r1} ${r2}`, p.first === first && p.last === last ? "good" : "info");
        win(ran, prog);
        return;
      }
      if (!res.ok) { api.say(res.msg, "warn"); return; }
      if (idx === 1) {
        api.say(`Different order, different dance! Before, the robot started with ${MOVES[EXAMPLE[0]].label} and ended with ${MOVES[EXAMPLE[2]].label}. This time it started with ${MOVES[ran[0]].label} and ended with ${MOVES[ran[ran.length - 1]].label}.`, "good");
      } else if (idx === 2) {
        const kinds = new Set(ran).size;
        api.say(`What a dance! ${ran.length} steps using ${kinds} different move${kinds === 1 ? "" : "s"}.${kinds < 3 ? " Next time, try mixing in more kinds of moves." : ""}`, "good");
      } else if (idx === 3) {
        api.say(res.exact ? "Challenge complete! Jump, spin, pose: exactly right." : "Challenge complete! Your robot jumped, then spun, and finished with a pose. You added extra moves too, and the order still works.", "good");
      } else if (idx === 4) {
        api.say(`It matches! ${ran.length} moves from only ${plural(res.blocks, "block", "blocks")}. Without the repeat it would take ${ran.length}.`, "good");
      } else if (idx === 5) {
        api.say("Bug fixed! Your program makes the target dance now.", "good");
      } else if (idx === 6) {
        api.say(`Same 12-move dance in ${plural(res.blocks, "block", "blocks")}${res.blocks < 12 ? `, down from 12` : ""}.`, "good");
      } else {
        api.say(`What a routine: ${res.moves} moves from ${plural(res.blocks, "block", "blocks")}.`, "good");
      }
      win(ran, prog);
    }
    function win(ran, prog) {
      st.won = true;
      const data = deep ? { program: ran, blocks: clone(prog) } : { program: ran };
      if (idx === LEVELS.length - 1) {
        api.win(data, { title: "Choreographer! Take it to Scratch", extra: `
          <div class="dp-handoff">
            <p>${icon("rocket")}<span>Real programmers use loops in Scratch too. In <strong>Loop Dance Choreographers</strong>, you'll get a long dance in Scratch and shorten it with repeat blocks, just like you did here.</span></p>
            <div class="dp-handoff__btns">
              <a class="btn btn--primary" href="#/activity/loop-dance">${icon("arrowRight")}Open Loop Dance Choreographers</a>
              <a class="btn btn--ghost" href="assets/starters/dance-crew.sb3" download>${icon("box")}Download the Dance Crew starter</a>
            </div>
          </div>` });
        return;
      }
      api.win(data);
    }

    /* ── Events ── */
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || !el.contains(b)) return;
      if (b.id === "dp-reset") { resetRobot(); return; }
      if (busy(b)) { api.say("Wait for the robot to finish, or press Reset robot to stop it.", "info"); return; }
      if (b.id === "dp-run") { run(); return; }
      if (b.id === "dp-addrep") {
        if (blocks(st.prog) >= MAX) { api.say(`Programs can have up to ${MAX} blocks. Remove one to add another.`, "warn"); return; }
        st.prog.push({ repeat: 2, body: [] });
        st.into = st.prog.length - 1;
        renderList(`[data-op="into"][data-i="${st.into}"]`);
        now.textContent = `Added Repeat 2 times as step ${st.prog.length}. New moves go inside it.`;
        return;
      }
      if (b.dataset.add) {
        const m = b.dataset.add;
        if (blocks(st.prog) >= MAX) { api.say(`Programs can have up to ${MAX} blocks. Remove one to add another.`, "warn"); return; }
        if (st.into !== null) {
          const r = st.prog[st.into];
          if (r.body.length >= BODY_MAX) { api.say(`A Repeat can hold up to ${BODY_MAX} moves. Press Done adding to add moves after it.`, "warn"); return; }
          r.body.push(m);
          renderList();
          now.textContent = `Added ${MOVES[m].label} inside the Repeat at step ${st.into + 1}. It has ${plural(r.body.length, "move", "moves")}.`;
          return;
        }
        st.prog.push(m);
        renderList();
        now.textContent = `Added ${MOVES[m].label} as step ${st.prog.length}.`;
        return;
      }
      if (b.dataset.op) {
        const op = b.dataset.op, i = Number(b.dataset.i), j = Number(b.dataset.j);
        const blk = st.prog[i];
        if (op === "into") {
          st.into = st.into === i ? null : i;
          renderList(`[data-op="into"][data-i="${i}"]`);
          now.textContent = st.into === null ? "Done adding. New moves go at the end of your program." : `New moves go inside the Repeat at step ${i + 1}.`;
          return;
        }
        if (op === "less" || op === "more") {
          blk.repeat = Math.max(REP_MIN, Math.min(REP_MAX, blk.repeat + (op === "more" ? 1 : -1)));
          renderList(`[data-op="${op}"][data-i="${i}"]`);
          now.textContent = `The Repeat at step ${i + 1} now runs ${blk.repeat} times.`;
          return;
        }
        if (op === "iremove" || op === "iup" || op === "idown") {
          const m = blk.body[j];
          if (op === "iremove") {
            blk.body.splice(j, 1);
            renderList(blk.body.length ? `[data-op="iremove"][data-i="${i}"][data-j="${Math.min(j, blk.body.length - 1)}"]` : `[data-op="into"][data-i="${i}"]`);
            now.textContent = `Removed ${MOVES[m].label} from the Repeat at step ${i + 1}.`;
            return;
          }
          const k = op === "iup" ? j - 1 : j + 1;
          if (k < 0 || k >= blk.body.length) return;
          [blk.body[j], blk.body[k]] = [blk.body[k], blk.body[j]];
          renderList(`[data-op="${op}"][data-i="${i}"][data-j="${k}"]`);
          now.textContent = `Moved ${MOVES[m].label} to move ${k + 1} inside the Repeat.`;
          return;
        }
        const label = isRep(blk) ? `Repeat ${blk.repeat} times` : MOVES[blk].label;
        if (op === "remove") {
          st.prog.splice(i, 1);
          if (st.into !== null) st.into = st.into === i ? null : st.into > i ? st.into - 1 : st.into;
          renderList(st.prog.length ? `[data-op="remove"][data-i="${Math.min(i, st.prog.length - 1)}"]` : null);
          if (!st.prog.length) $("[data-add]").focus();
          now.textContent = `Removed ${label}. The program has ${st.prog.length} step${st.prog.length === 1 ? "" : "s"}.`;
          return;
        }
        const k = op === "up" ? i - 1 : i + 1;
        if (k < 0 || k >= st.prog.length) return;
        [st.prog[i], st.prog[k]] = [st.prog[k], st.prog[i]];
        if (st.into === i) st.into = k; else if (st.into === k) st.into = i;
        renderList(`[data-op="${op}"][data-i="${k}"]`);
        const other = st.prog[i];
        now.textContent = `Moved ${label} to step ${k + 1}. ${isRep(other) ? `Repeat ${other.repeat} times` : MOVES[other].label} is now step ${i + 1}.`;
        return;
      }
      if (b.dataset.predict) {
        const k = b.dataset.predict;
        st.predict[k] = b.dataset.move;
        el.querySelectorAll(`[data-predict="${k}"]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        return;
      }
      if (b.id === "dp-clear") {
        st.prog = [];
        st.into = null;
        renderList();
        $("[data-add]").focus();
        now.textContent = "Program cleared. Press a move button to add a step.";
        return;
      }
      if (b.id === "dp-example") {
        st.prog = clone(starter);
        st.into = null;
        renderList();
        now.textContent = deep ? "Back to the starting program." : `Back to the starting program: ${names(starter)}.`;
      }
    });

    renderList();
    const saved = api.saved();
    if (saved && idx >= 2) {
      const restore = deep ? saved.blocks : saved.program;
      if (restore && restore.length) { st.prog = clone(restore).slice(0, MAX); renderList(); api.say("Here's the dance you finished last time. Change it and run it again!", "info"); }
    }
    return () => { st.runToken++; };
  }

  SE.labs.goals(LEVELS, [
    ["How a program runs one step at a time, in order.", "Guessing what code will do before you run it is how programmers catch mistakes early."],
    ["How changing the order of steps changes what happens.", "In code, order matters. The same steps in a different order can make a totally different result."],
    ["How to write your own program from steps you choose.", "Programmers turn ideas into steps. Your dance is a program made from your own idea."],
    ["How to build a program that matches a goal exactly.", "Real programs have to do exactly what someone needs. Checking your work against the goal is a big part of coding."],
    ["How a loop repeats the moves inside it.", "Loops are in almost every program: games repeat frames, apps repeat checks, robots repeat jobs."],
    ["How to find the first place a program goes wrong, and fix it.", "Every programmer debugs. Comparing what happened to what should happen is the fastest way to find a bug."],
    ["How loops make a program shorter without changing what it does.", "Shorter programs are easier to read and fix. Change one number, and the whole pattern changes."],
    ["How to design a long pattern with a short program.", "Spotting patterns and looping them is a big step toward thinking like a programmer."]
  ]);
  SE.labs.register({
    id: "dance-party",
    area: "coding",
    title: "Robot Dance Party",
    tagline: "Put dance moves in order and watch a robot follow your program, step by step. Then go deeper with loops and debugging.",
    levels: LEVELS,
    chapters: CHAPTERS,
    mount
  });
  SE.dance = { check, expand, blocks, MOVES, EXAMPLE, LEVELS, TARGET, BUGGY, T7 };
})();
