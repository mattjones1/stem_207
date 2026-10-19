/*
 * Robot Dance Party — Coding (beginner, grades 2–8)
 *
 * Students build a numbered program from five dance moves, reorder or remove
 * steps with buttons (no dragging), and run it to watch a robot dance. The four
 * levels follow a 10-minute lesson:
 *   1. Predict and run a three-step example.
 *   2. Swap two steps and run it again.
 *   3. Make a dance with at least five steps.
 *   4. Challenge: jump, spin, then pose, finishing with the pose.
 * Every check reads the program the robot actually ran to the end, never a "Done" button.
 *
 * SE.dance.check(level, program) is exposed so the rules can be tested on their own.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const COLS = 5;          // dance floor squares
  const START = 2;         // the robot starts in the middle square
  const MAX = 12;          // longest program
  const STEP_MS = 850;     // time for each step

  const MOVES = {
    left: { label: "Move left", short: "Left", say: "moves left" },
    right: { label: "Move right", short: "Right", say: "moves right" },
    jump: { label: "Jump", short: "Jump", say: "jumps" },
    spin: { label: "Spin", short: "Spin", say: "spins" },
    pose: { label: "Strike a pose", short: "Pose", say: "strikes a pose" }
  };
  const ORDER = ["left", "right", "jump", "spin", "pose"];
  const EXAMPLE = ["right", "jump", "spin"];

  /* Small glyphs so each move has a shape as well as a color. */
  const GLYPH = {
    left: '<path d="M15 5 L8 12 L15 19" /><path d="M8 12 H21" />',
    right: '<path d="M9 5 L16 12 L9 19" /><path d="M3 12 H16" />',
    jump: '<path d="M12 20 V6" /><path d="M6 11 L12 5 L18 11" /><path d="M5 22 H19" />',
    spin: '<path d="M20 12 A8 8 0 1 1 16.5 5.4" /><path d="M17 1.5 V6 H12.5" />',
    pose: '<path d="M12 2.5 L14.6 8.6 L21 9.2 L16.2 13.4 L17.6 19.8 L12 16.4 L6.4 19.8 L7.8 13.4 L3 9.2 L9.4 8.6 Z" />'
  };
  const glyph = (m) => `<svg class="dp-glyph" viewBox="0 0 24 24" aria-hidden="true">${GLYPH[m]}</svg>`;
  const names = (prog) => prog.map((m) => MOVES[m].label).join(", ");

  /* ───────── Level rules (pure, so they can be tested) ───────── */
  const sameMoves = (a, b) => a.length === b.length && a.slice().sort().join() === b.slice().sort().join();

  function check(level, prog, ctx = {}) {
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
    // Level 3: the challenge. Jump, then spin, then pose, and the pose comes last.
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
      learned: "You turned words into an exact sequence. Computers follow your instructions in the order you give them, so the order you choose is the dance you get." }
  ];

  /* ───────── The robot ───────── */
  const robotSvg = () => `
    <svg class="dp-robot__svg" viewBox="0 0 120 150" aria-hidden="true">
      <line x1="60" y1="8" x2="60" y2="24" stroke="#302568" stroke-width="4" stroke-linecap="round"/>
      <circle class="dp-antenna" cx="60" cy="8" r="6" fill="#8cc832" stroke="#302568" stroke-width="3"/>
      <rect x="22" y="22" width="76" height="48" rx="14" fill="#f4f2ea" stroke="#302568" stroke-width="4"/>
      <rect x="32" y="31" width="56" height="30" rx="9" fill="#302568"/>
      <g class="dp-eyes"><circle cx="48" cy="44" r="5" fill="#b9e27f"/><circle cx="72" cy="44" r="5" fill="#b9e27f"/></g>
      <path class="dp-mouth" d="M50 52 Q60 58 70 52" stroke="#b9e27f" stroke-width="3" fill="none" stroke-linecap="round"/>
      <rect x="30" y="68" width="60" height="46" rx="10" fill="#8cc832" stroke="#302568" stroke-width="4"/>
      <rect x="44" y="78" width="32" height="18" rx="4" fill="#302568"/>
      <circle cx="52" cy="87" r="3" fill="#f2c14e"/><circle cx="60" cy="87" r="3" fill="#e9603f"/><circle cx="68" cy="87" r="3" fill="#b9e27f"/>
      <g class="dp-arm dp-arm--l"><path d="M30 70 L12 92" stroke="#302568" stroke-width="9" stroke-linecap="round"/><circle cx="12" cy="92" r="7" fill="#8cc832" stroke="#302568" stroke-width="3"/></g>
      <g class="dp-arm dp-arm--r"><path d="M90 70 L108 92" stroke="#302568" stroke-width="9" stroke-linecap="round"/><circle cx="108" cy="92" r="7" fill="#8cc832" stroke="#302568" stroke-width="3"/></g>
      <rect x="40" y="114" width="12" height="22" rx="4" fill="#302568"/><rect x="68" y="114" width="12" height="22" rx="4" fill="#302568"/>
      <rect x="34" y="134" width="22" height="10" rx="5" fill="#302568"/><rect x="64" y="134" width="22" height="10" rx="5" fill="#302568"/>
    </svg>`;

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const starter = idx <= 1 ? EXAMPLE.slice() : [];
    const st = {
      prog: starter.slice(),
      x: START,
      running: false,
      runToken: 0,
      active: -1,
      predict: { first: null, last: null },
      lastRun: null,   // the last program that ran to the end
      won: false
    };

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
            <div class="dp-moves" role="group" aria-labelledby="dp-pal-title">
              ${ORDER.map((m) => `<button type="button" class="dp-move dp-move--${m}" data-add="${m}">${glyph(m)}<span>${esc(MOVES[m].label)}</span></button>`).join("")}
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
          <p class="dp-rule">${icon("bulb")}<span>Computers follow your instructions in the order you give them.</span></p>
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    const robot = $("#dp-robot"), body = robot.querySelector(".dp-robot__body");
    const now = $("#dp-now"), caption = $("#dp-caption");

    /* ── Program list ── */
    function renderList(focus) {
      const list = $("#dp-list");
      $("#dp-count").textContent = `${st.prog.length} of ${MAX} steps`;
      if (!st.prog.length) {
        list.innerHTML = `<li class="dp-empty">No steps yet. Press a move button to add one.</li>`;
      } else {
        list.innerHTML = st.prog.map((m, i) => {
          const n = i + 1, nm = MOVES[m].label;
          return `<li class="dp-step dp-step--${m} ${st.active === i ? "is-active" : ""}" ${st.active === i ? 'aria-current="step"' : ""} data-i="${i}">
            <span class="dp-step__n" aria-hidden="true">${n}</span>
            <span class="dp-step__name">${glyph(m)}<span><span class="visually-hidden">Step ${n}: </span>${esc(nm)}</span>${st.active === i ? '<span class="dp-step__now">Now</span>' : ""}</span>
            <span class="dp-step__tools">
              <button type="button" class="dp-icon-btn" data-op="up" data-i="${i}" aria-label="Move step ${n}, ${esc(nm)}, up" ${i === 0 ? "disabled" : ""}>▲</button>
              <button type="button" class="dp-icon-btn" data-op="down" data-i="${i}" aria-label="Move step ${n}, ${esc(nm)}, down" ${i === st.prog.length - 1 ? "disabled" : ""}>▼</button>
              <button type="button" class="dp-icon-btn dp-icon-btn--x" data-op="remove" data-i="${i}" aria-label="Remove step ${n}, ${esc(nm)}">✕</button>
            </span>
          </li>`;
        }).join("");
      }
      lock(st.running);
      if (focus) {
        const t = $(focus);
        if (t && !t.disabled) t.focus();
        else if (t) { const other = t.closest("li").querySelector("[data-op]:not([disabled])"); (other || $("#dp-run")).focus(); }
      }
    }

    /* While the robot dances, editing is paused (Reset robot still works). */
    function lock(on) {
      el.querySelectorAll("[data-add], [data-op], [data-predict], #dp-clear, #dp-example, #dp-run").forEach((b) => {
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
      st.active = -1;
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
      let note = "";
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
      await wait(reduce ? Math.round(STEP_MS * 0.8) : STEP_MS);
      if (token !== st.runToken) return null;
      return note;
    }

    async function run() {
      if (st.running) return;  // one run at a time
      if (!st.prog.length) { api.say("Add at least one move first, then press Run.", "warn"); return; }
      if (idx === 0 && (!st.predict.first || !st.predict.last)) { api.say("Make both predictions first, then press Run.", "warn"); $("#dp-predict .dp-pick").focus(); return; }
      const prog = st.prog.slice();
      const token = ++st.runToken;
      st.running = true;
      api.log("lab_test_run", { program: prog });
      api.say("");
      clearPose();
      place(START, true);
      void robot.offsetWidth;
      const ran = [];
      for (let i = 0; i < prog.length; i++) {
        st.active = i;
        renderList();
        now.textContent = `Step ${i + 1} of ${prog.length}: the robot ${MOVES[prog[i]].say}.`;
        const note = await act(prog[i], token);
        if (note === null) return;      // Reset robot stopped this run
        ran.push(prog[i]);
      }
      if (token !== st.runToken) return;
      st.running = false;
      st.active = -1;
      caption.className = "dp-caption";
      renderList();
      finished(ran);
    }

    /* ── Checking: uses the sequence the robot actually performed ── */
    function finished(ran) {
      st.lastRun = ran.slice();
      now.textContent = `Done! The robot ran ${ran.length} step${ran.length === 1 ? "" : "s"}: ${names(ran)}.`;
      if (st.won) { api.say("Nice! Try another order, or go on to the next level.", "good"); return; }
      const res = check(idx, ran);
      if (idx === 0) {
        const p = st.predict, first = ran[0], last = ran[ran.length - 1];
        const r1 = p.first === first ? `You predicted ${MOVES[p.first].label} first. Correct!` : `You predicted ${MOVES[p.first].label} first, but step 1 was ${MOVES[first].label}.`;
        const r2 = p.last === last ? `You predicted ${MOVES[p.last].label} last. Correct!` : `You predicted ${MOVES[p.last].label} last, but the final step was ${MOVES[last].label}.`;
        api.say(`${r1} ${r2}`, p.first === first && p.last === last ? "good" : "info");
        win(ran);
        return;
      }
      if (!res.ok) { api.say(res.msg, "warn"); return; }
      if (idx === 1) {
        api.say(`Different order, different dance! Before, the robot started with ${MOVES[EXAMPLE[0]].label} and ended with ${MOVES[EXAMPLE[2]].label}. This time it started with ${MOVES[ran[0]].label} and ended with ${MOVES[ran[ran.length - 1]].label}.`, "good");
      } else if (idx === 2) {
        const kinds = new Set(ran).size;
        api.say(`What a dance! ${ran.length} steps using ${kinds} different move${kinds === 1 ? "" : "s"}.${kinds < 3 ? " Next time, try mixing in more kinds of moves." : ""}`, "good");
      } else {
        api.say(res.exact ? "Challenge complete! Jump, spin, pose: exactly right." : "Challenge complete! Your robot jumped, then spun, and finished with a pose. You added extra moves too, and the order still works.", "good");
      }
      win(ran);
    }
    function win(ran) { st.won = true; api.win({ program: ran }); }

    /* ── Events ── */
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b || !el.contains(b)) return;
      if (b.id === "dp-reset") { resetRobot(); return; }
      if (busy(b)) { api.say("Wait for the robot to finish, or press Reset robot to stop it.", "info"); return; }
      if (b.id === "dp-run") { run(); return; }
      if (b.dataset.add) {
        if (st.prog.length >= MAX) { api.say(`Programs can have up to ${MAX} steps. Remove one to add another.`, "warn"); return; }
        st.prog.push(b.dataset.add);
        renderList();
        now.textContent = `Added ${MOVES[b.dataset.add].label} as step ${st.prog.length}.`;
        return;
      }
      if (b.dataset.op) {
        const i = Number(b.dataset.i), m = st.prog[i];
        if (b.dataset.op === "remove") {
          st.prog.splice(i, 1);
          renderList(st.prog.length ? `[data-op="remove"][data-i="${Math.min(i, st.prog.length - 1)}"]` : null);
          if (!st.prog.length) $("[data-add]").focus();
          now.textContent = `Removed ${MOVES[m].label}. The program has ${st.prog.length} step${st.prog.length === 1 ? "" : "s"}.`;
          return;
        }
        const j = b.dataset.op === "up" ? i - 1 : i + 1;
        if (j < 0 || j >= st.prog.length) return;
        [st.prog[i], st.prog[j]] = [st.prog[j], st.prog[i]];
        renderList(`[data-op="${b.dataset.op}"][data-i="${j}"]`);
        now.textContent = `Moved ${MOVES[m].label} to step ${j + 1}. ${MOVES[st.prog[i]].label} is now step ${i + 1}.`;
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
        renderList();
        $("[data-add]").focus();
        now.textContent = "Program cleared. Press a move button to add a step.";
        return;
      }
      if (b.id === "dp-example") {
        st.prog = starter.slice();
        renderList();
        now.textContent = `Back to the starting program: ${names(starter)}.`;
      }
    });

    renderList();
    const saved = api.saved();
    if (saved && saved.program && idx >= 2) { st.prog = saved.program.slice(0, MAX); renderList(); api.say("Here's the dance you finished last time. Change it and run it again!", "info"); }
    return () => { st.runToken++; };
  }

  SE.labs.goals(LEVELS, [["How a program runs one step at a time, in order.", "Guessing what code will do before you run it is how programmers catch mistakes early."], ["How changing the order of steps changes what happens.", "In code, order matters. The same steps in a different order can make a totally different result."], ["How to write your own program from steps you choose.", "Programmers turn ideas into steps. Your dance is a program made from your own idea."], ["How to build a program that matches a goal exactly.", "Real programs have to do exactly what someone needs. Checking your work against the goal is a big part of coding."]]);
  SE.labs.register({
    id: "dance-party",
    area: "coding",
    title: "Robot Dance Party",
    tagline: "Put dance moves in order and watch a robot follow your program, step by step.",
    levels: LEVELS,
    mount
  });
  SE.dance = { check, MOVES, EXAMPLE, LEVELS };
})();
