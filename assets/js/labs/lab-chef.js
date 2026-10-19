/*
 * STEM 207 — Robot Chef lab (coding, pathway Stage 1).
 * The on-screen version of Bug Hunt: Fix the Sandwich Algorithm. A robot chef follows a
 * sandwich algorithm exactly as written. Students find the first bug, fix the order, add
 * missing steps, rewrite unclear steps, and finally write the whole algorithm.
 * Everything uses buttons (Up, Down, Add, Remove), never dragging.
 *
 * Pure rules for tests: SE.robotChef.run(stepIds) → { ok, trace, bug }
 *   bug: { index, kind: "unclear" | "order" | "missing" | "end", need }
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const NEED = {
    bagOpen: "the bread bag open", slices: "two slices of bread out", jarOpen: "the jar open",
    knife: "a knife in its hand", loaded: "spread on the knife", spread: "spread on a slice", sandwich: "a finished sandwich"
  };
  const STEPS = {
    "open-bag": { text: "Open the bread bag.", gives: "bagOpen" },
    "take-slices": { text: "Take out two slices of bread.", needs: ["bagOpen"], gives: "slices",
      fail: { bagOpen: "The robot tugs at the closed bag. It can't reach the bread." } },
    "open-jar": { text: "Open the jar of spread.", gives: "jarOpen" },
    "pick-knife": { text: "Pick up the knife.", gives: "knife" },
    "scoop": { text: "Scoop some spread onto the knife.", needs: ["knife", "jarOpen"], gives: "loaded",
      fail: { knife: "The robot scoops with its bare metal hand. Yuck!", jarOpen: "Clink! The robot taps the knife on the closed lid." } },
    "spread": { text: "Spread it on one slice of bread.", needs: ["slices", "loaded"], gives: "spread",
      fail: { slices: "There's no slice out. The robot spreads the counter.", loaded: "The knife is empty. The robot spreads air on the bread." } },
    "top": { text: "Put the other slice on top.", needs: ["slices", "spread"], gives: "sandwich",
      fail: { slices: "There's no other slice to put on top.", spread: "The robot stacks two plain slices. Where's the spread?" } },
    "eat": { text: "Eat the sandwich.", needs: ["sandwich"], gives: "eaten",
      fail: { sandwich: "There's no sandwich yet. The robot takes a big bite of the bread bag!" } },
    "wash": { text: "Wash your hands.", extra: true },
    "vague-spread": { text: "Put the spread on the bread.", unclear: "The robot sets the whole jar of spread on top of the bread. That IS the spread on the bread, exactly as written!" },
    "vague-together": { text: "Put the bread together.", unclear: "The robot squishes all the bread into one big ball. Which bread? Put together how?" },
    "vague-make": { text: "Make the sandwich.", unclear: "Make it how? The robot doesn't know the steps, so it just stands there, waiting." },
    "vague-lots": { text: "Put lots of spread on the bread.", unclear: "The robot dumps the whole jar onto the bread bag. “Lots” and “on the bread” still don't say how." },
    "vague-spread2": { text: "Spread the bread.", unclear: "The robot rubs the bread bag across the counter. Spread it with what? Which bread?" },
    "vague-squish": { text: "Squish the bread.", unclear: "The robot squishes the slices flat as pancakes. That isn't a sandwich." },
    "vague-careful": { text: "Put the bread together carefully.", unclear: "The robot carefully hugs the bread bag. Careful isn't the same as clear!" }
  };

  /* Run a program (array of step ids). Stops at the first bug. */
  function run(ids) {
    const st = {};
    const trace = [];
    for (let i = 0; i < ids.length; i++) {
      const s = STEPS[ids[i]];
      if (!s) return { ok: false, trace, bug: { index: i, kind: "unclear" } };
      if (s.unclear) {
        trace.push({ id: ids[i], ok: false, msg: s.unclear });
        return { ok: false, trace, bug: { index: i, kind: "unclear" } };
      }
      const miss = (s.needs || []).find((n) => !st[n]);
      if (miss) {
        const later = ids.slice(i + 1).some((id) => STEPS[id] && STEPS[id].gives === miss);
        trace.push({ id: ids[i], ok: false, msg: s.fail[miss] });
        return { ok: false, trace, bug: { index: i, kind: later ? "order" : "missing", need: miss } };
      }
      if (s.gives) st[s.gives] = true;
      trace.push({ id: ids[i], ok: true, state: { ...st } });
    }
    if (!st.eaten) return { ok: false, trace, bug: { index: ids.length, kind: "end" } };
    return { ok: true, trace, bug: null };
  }

  /* What the student sees after a run: names their own step, hints at the kind of fix. */
  function explain(ids, res) {
    if (res.ok) return "The robot made the sandwich and ate it. Your algorithm works!";
    const b = res.bug;
    if (b.kind === "end") return ids.length ? "The program ended, but nobody ate a sandwich. Is something missing at the end?" : "The program is empty. Add some steps first.";
    const n = b.index + 1, text = STEPS[ids[b.index]].text, said = res.trace[res.trace.length - 1].msg;
    if (b.kind === "unclear") return `Bug at step ${n}: “${text}” ${said} This step is unclear. Rewrite it so there's nothing to guess.`;
    if (b.kind === "order") return `Bug at step ${n}: ${said} “${text}” needs ${NEED[b.need]}, and the step that does that comes later. Is something in the wrong order?`;
    return `Bug at step ${n}: ${said} “${text}” needs ${NEED[b.need]}, but no step does that. Is a step missing?`;
  }

  /* ───────── Kitchen picture ───────── */
  function scene(st, mood) {
    const s = st || {};
    const face = mood === "bug" ? '<path d="M44 52 q8 -6 16 0" fill="none" stroke="#1d1647" stroke-width="3"/>' : mood === "done" ? '<path d="M42 48 q10 10 20 0" fill="none" stroke="#1d1647" stroke-width="3"/>' : '<path d="M44 50 h16" stroke="#1d1647" stroke-width="3"/>';
    const bits = [];
    if (s.bagOpen) bits.push("bag open"); if (s.slices) bits.push("two slices out"); if (s.jarOpen) bits.push("jar open");
    if (s.knife) bits.push("knife in hand"); if (s.spread) bits.push("spread on a slice"); if (s.sandwich) bits.push("sandwich made"); if (s.eaten) bits.push("sandwich eaten");
    const label = `Robot chef's kitchen: ${bits.length ? bits.join(", ") : "nothing done yet"}.${mood === "bug" ? " The robot is confused." : ""}`;
    return `<svg viewBox="0 0 420 170" class="rc-scene" role="img" aria-label="${esc(label)}">
      <rect x="0" y="128" width="420" height="42" class="rc-counter"/>
      <g transform="translate(16 40)"><rect x="12" y="0" width="80" height="62" rx="14" class="rc-bot"/><circle cx="38" cy="28" r="6" class="rc-eye"/><circle cx="66" cy="28" r="6" class="rc-eye"/><g transform="translate(0 -4)">${face}</g>
        <rect x="26" y="62" width="52" height="30" rx="8" class="rc-bot"/><path d="M52 0 V-14" class="rc-ant"/><circle cx="52" cy="-16" r="5" class="rc-light ${mood === "bug" ? "is-bug" : ""}"/>
        ${s.knife ? `<g transform="translate(84 66) rotate(-30)"><rect x="0" y="-3" width="34" height="6" rx="2" class="rc-knife"/>${s.loaded ? '<rect x="14" y="-6" width="18" height="6" rx="3" class="rc-spread"/>' : ""}</g>` : ""}</g>
      <g transform="translate(150 70)">${s.bagOpen ? '<path d="M0 58 V14 l8 -12 h44 l8 12 V58 Z" class="rc-bag"/><path d="M8 2 l-10 -12 M52 2 l10 -12" class="rc-ant"/>' : '<path d="M0 58 V10 q30 -16 60 0 V58 Z" class="rc-bag"/><rect x="22" y="0" width="16" height="8" rx="3" class="rc-tie"/>'}<text x="30" y="40" text-anchor="middle" class="rc-t">BREAD</text></g>
      <g transform="translate(232 78)"><rect x="0" y="12" width="44" height="40" rx="8" class="rc-jar"/>${s.jarOpen ? '<rect x="48" y="44" width="34" height="8" rx="3" class="rc-lid"/>' : '<rect x="-2" y="4" width="48" height="10" rx="3" class="rc-lid"/>'}</g>
      <g transform="translate(316 104)"><ellipse cx="44" cy="24" rx="48" ry="9" class="rc-plate"/>
        ${s.eaten ? '<text x="44" y="12" text-anchor="middle" class="rc-t">crumbs!</text>' : s.sandwich ? '<rect x="14" y="0" width="60" height="10" rx="4" class="rc-slice"/><rect x="14" y="10" width="60" height="4" class="rc-spread"/><rect x="14" y="14" width="60" height="9" rx="4" class="rc-slice"/>' : s.slices ? `<rect x="2" y="12" width="38" height="10" rx="4" class="rc-slice"/>${s.spread ? '<rect x="4" y="9" width="34" height="4" rx="2" class="rc-spread"/>' : ""}<rect x="48" y="12" width="38" height="10" rx="4" class="rc-slice"/>` : ""}</g>
    </svg>`;
  }

  const KINDS = { missing: "A missing step", order: "A step in the wrong order", unclear: "An unclear step" };
  const BUGGY = ["vague-spread", "vague-together", "open-bag", "eat"];
  const LEVELS = [
    { title: "Run the robot", concept: "Algorithms",
      learn: "That a computer follows every step exactly as it's written, even when the step is wrong.",
      why: "Computers can't guess what you meant. Seeing a robot follow buggy steps shows why programmers have to be so exact.",
      goal: "Run the class's sandwich algorithm. Then find the step where the robot first went wrong, and name the kind of bug.",
      steps: ["Press Run and watch the robot.", "Choose the step where it first went wrong.", "Choose the kind of bug."],
      hints: ["The robot stops at the first bug. Look at which step is marked.", "Could the robot do that step another way that's still “correct”? Then the step isn't clear enough."],
      learned: "A bug is a step that makes the program do the wrong thing. The robot did exactly what step 1 said. The problem was that step 1 didn't say enough." },
    { title: "Fix the order", concept: "Sequence",
      learn: "How the order of steps changes what a program does.",
      why: "The same steps in a different order can fail completely. Programmers check that each step has what it needs from the steps before it.",
      goal: "Use Up and Down to fix the order, then run it until the robot makes and eats the sandwich.",
      hints: ["Run it and read which step failed. What did that step need to be done first?", "Move the step that does the needed job above the step that failed."],
      learned: "Every step depends on the steps before it. Putting them in the right order is called sequencing." },
    { title: "Add the missing steps", concept: "Missing steps",
      learn: "How to find steps that a program needs but doesn't have.",
      why: "People skip steps that feel obvious, like opening a jar. Computers can't skip anything, so programmers write every step down.",
      goal: "Add steps from the step bank, move them into place, and run until the robot finishes.",
      hints: ["Run it. The robot tells you what it needed but didn't have.", "After you add a step, it goes at the end. Move it up to just before the step that needed it."],
      learned: "A missing step is a common bug. Running the program and reading where it stops shows you exactly what's missing." },
    { title: "Make it precise", concept: "Precise steps",
      learn: "How to rewrite an unclear step so there's nothing left to guess.",
      why: "Unclear instructions cause bugs in code and in real life. Clear, exact steps work every time, for anyone.",
      goal: "Rewrite each unclear step, then run until the robot makes and eats the sandwich.",
      hints: ["Press Rewrite on an unclear step and look at the choices. Which one says exactly what to do, one action at a time?", "A precise rewrite may turn one step into several smaller steps."],
      learned: "Precise steps say exactly what to do and what to use. Breaking a big step into small ones is how programmers make instructions clear." },
    { title: "Challenge: write it yourself", concept: "Challenge",
      learn: "How to write a whole algorithm from start to finish, then test and fix it.",
      why: "This is what programmers do every day: write the steps, run them, and fix the bugs until it works.",
      goal: "Build the whole sandwich algorithm from the step bank. Watch out: some steps in the bank are unclear.",
      hints: ["Start with what has to happen first: you can't use what's still in the bag or the jar.", "Skip any step that leaves the robot guessing, like “Make the sandwich.”"],
      learned: "You wrote, tested, and debugged a complete algorithm. That's the same cycle every program goes through." }
  ];
  const START = [BUGGY,
    ["take-slices", "open-bag", "open-jar", "pick-knife", "spread", "scoop", "top", "eat"],
    ["open-bag", "take-slices", "scoop", "spread", "top", "eat"],
    ["open-bag", "take-slices", "vague-spread", "vague-together", "eat"],
    []];
  const BANK = [null, null, ["open-jar", "pick-knife", "wash"], null,
    ["open-bag", "take-slices", "open-jar", "pick-knife", "scoop", "spread", "top", "eat", "vague-spread", "vague-make", "wash"]];
  const SPREAD_OPTS = [["vague-lots"], ["open-jar", "pick-knife", "scoop", "spread"], ["vague-spread2"]];
  const TOGETHER_OPTS = [["vague-careful"], ["top"], ["vague-squish"]];
  const REWRITE = {
    "vague-spread": SPREAD_OPTS, "vague-lots": SPREAD_OPTS, "vague-spread2": SPREAD_OPTS,
    "vague-together": TOGETHER_OPTS, "vague-careful": TOGETHER_OPTS, "vague-squish": TOGETHER_OPTS
  };

  function mount(el, idx, api) {
    let prog = START[idx].slice();
    let timer = null, running = false;
    const editable = idx > 0;
    const bank = BANK[idx] ? SE.shuffle(BANK[idx].slice(), `rc-bank-${idx}`) : null;
    let found = { step: false, kind: false }, lastRun = null;
    const delay = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 120 : 550;

    el.innerHTML = `
      <div class="lab-panel rc-top">
        <div id="rc-scene">${scene({}, "")}</div>
        <p class="lab-sim rc-note">${icon("alert")}<span>The robot chef follows each step <strong>exactly</strong> as written. Nothing more.</span></p>
      </div>
      <div class="rc-grid">
        <div class="lab-panel">
          <h3>The algorithm <span class="muted" id="rc-n"></span></h3>
          <ol class="rc-prog" id="rc-prog"></ol>
          <div class="rc-run"><button type="button" class="btn btn--launch" id="rc-run">${icon("rocket")}Run</button></div>
        </div>
        ${bank ? `<div class="lab-panel"><h3>Step bank</h3><p class="muted">Add puts the step at the end. Then move it into place.</p><ul class="rc-bank" id="rc-bank"></ul></div>` : ""}
        ${idx === 0 ? `<div class="lab-panel" id="rc-q" hidden>
          <h3>Where did the robot first go wrong?</h3>
          <div class="choice-grid" id="rc-q-step">${BUGGY.map((id, i) => `<button type="button" class="choice" data-qstep="${i}">Step ${i + 1}: ${esc(STEPS[id].text)}</button>`).join("")}</div>
          <h3 class="rc-q2">What kind of bug is it?</h3>
          <div class="choice-grid" id="rc-q-kind">${Object.entries(KINDS).map(([k, v]) => `<button type="button" class="choice" data-qkind="${k}">${v}</button>`).join("")}</div>
        </div>` : ""}
      </div>`;

    const progEl = el.querySelector("#rc-prog");
    function render(active = -1, bugAt = -1) {
      el.querySelector("#rc-n").textContent = `${prog.length} step${prog.length === 1 ? "" : "s"}`;
      progEl.innerHTML = prog.length ? prog.map((id, i) => {
        const s = STEPS[id];
        return `<li class="rc-row ${i === active ? "is-active" : ""} ${i === bugAt ? "is-bug" : ""} ${i < active || (bugAt > i) ? "is-done" : ""}" data-row="${i}">
          <span class="rc-row__n">${i + 1}</span><span class="rc-row__t">${esc(s.text)}${i === bugAt ? ' <b class="rc-flag">Bug!</b>' : ""}</span>
          ${editable ? `<span class="rc-row__tools">
            ${idx === 3 && REWRITE[id] ? `<button type="button" class="btn btn--ghost btn--small" data-rewrite="${i}" aria-expanded="false">Rewrite</button>` : ""}
            <button type="button" class="rc-ico" data-up="${i}" ${i === 0 ? "disabled" : ""} aria-label="Move step ${i + 1} up">▲</button>
            <button type="button" class="rc-ico" data-down="${i}" ${i === prog.length - 1 ? "disabled" : ""} aria-label="Move step ${i + 1} down">▼</button>
            ${bank ? `<button type="button" class="rc-ico" data-del="${i}" aria-label="Remove step ${i + 1}">✕</button>` : ""}
          </span>` : ""}
          ${idx === 3 && REWRITE[id] ? `<div class="rc-rewrite" id="rw-${i}" hidden>${REWRITE[id].map((opt, k) => `<button type="button" class="choice" data-pick="${i}:${k}">${opt.map((x) => esc(STEPS[x].text)).join(" ")}</button>`).join("")}</div>` : ""}
        </li>`;
      }).join("") : `<li class="rc-empty muted">No steps yet. Add steps from the bank.</li>`;
      if (bank) el.querySelector("#rc-bank").innerHTML = bank.map((id) => `<li><span>${esc(STEPS[id].text)}</span><button type="button" class="btn btn--ghost btn--small" data-add="${id}" ${running ? "disabled" : ""}>${icon("plus")}Add</button></li>`).join("");
      el.querySelector("#rc-run").disabled = running;
      el.querySelectorAll(".rc-row__tools button").forEach((b) => { if (running) b.disabled = true; });
    }
    function stop() { if (timer) clearTimeout(timer); timer = null; running = false; }

    function go() {
      stop();
      const res = run(prog);
      lastRun = res;
      api.log("lab_test_run", { steps: prog.length, ok: res.ok, bug: res.bug && res.bug.kind });
      running = true;
      let i = 0;
      const tick = () => {
        if (i < res.trace.length) {
          const t = res.trace[i];
          const prevState = i ? (res.trace[i - 1].state || {}) : {};
          el.querySelector("#rc-scene").innerHTML = scene(t.ok ? t.state : prevState, t.ok ? "" : "bug");
          render(i, t.ok ? -1 : i);
          api.say(t.ok ? `Step ${i + 1}: ${STEPS[t.id].text}` : explain(prog, res), t.ok ? "info" : "warn");
          i++;
          if (t.ok) { timer = setTimeout(tick, delay); return; }
        }
        running = false;
        if (res.ok) {
          el.querySelector("#rc-scene").innerHTML = scene(res.trace[res.trace.length - 1].state, "done");
          render();
          api.say(explain(prog, res), "good");
          if (idx > 0) api.win({ steps: prog.slice() });
        } else {
          if (res.bug.kind === "end") { render(); api.say(explain(prog, res), "warn"); }
          else render(-1, res.bug.index);
          if (idx === 0) el.querySelector("#rc-q").hidden = false;
        }
        el.querySelector("#rc-run").disabled = false;
      };
      tick();
    }

    el.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t || t.disabled) return;
      if (t.id === "rc-run") return go();
      if (running) return;
      const mv = (from, to) => { const [x] = prog.splice(from, 1); prog.splice(to, 0, x); render(); const b = progEl.querySelector(`[data-row="${to}"] [data-${to < from ? "up" : "down"}="${to}"]`) || progEl.querySelector(`[data-row="${to}"] button`); if (b) b.focus(); };
      if (t.dataset.up) return mv(Number(t.dataset.up), Number(t.dataset.up) - 1);
      if (t.dataset.down) return mv(Number(t.dataset.down), Number(t.dataset.down) + 1);
      if (t.dataset.del) { prog.splice(Number(t.dataset.del), 1); render(); return el.querySelector("#rc-run").focus(); }
      if (t.dataset.add) { prog.push(t.dataset.add); render(); api.say(`Added “${STEPS[t.dataset.add].text}” as step ${prog.length}.`, "info"); return; }
      if (t.dataset.rewrite) { const box = el.querySelector(`#rw-${t.dataset.rewrite}`); box.hidden = !box.hidden; t.setAttribute("aria-expanded", String(!box.hidden)); return; }
      if (t.dataset.pick) {
        const [row, k] = t.dataset.pick.split(":").map(Number);
        const opt = REWRITE[prog[row]][k];
        prog.splice(row, 1, ...opt);
        render();
        api.say(`Step ${row + 1} now says: ${opt.map((x) => STEPS[x].text).join(" ")} Run it to test.`, "info");
        return;
      }
      if (t.dataset.qstep !== undefined && lastRun) {
        const right = Number(t.dataset.qstep) === lastRun.bug.index;
        t.classList.add(right ? "is-right" : "is-wrong");
        found.step = found.step || right;
        api.say(right ? "Yes. That's where the robot first went wrong. Now, what kind of bug is it?" : "Not that one. Look at the algorithm: find the first step marked “Bug!”", right ? "good" : "warn");
      }
      if (t.dataset.qkind && lastRun) {
        const right = t.dataset.qkind === lastRun.bug.kind;
        t.classList.add(right ? "is-right" : "is-wrong");
        found.kind = found.kind || right;
        if (!right) api.say(t.dataset.qkind === "missing" ? "Is a step really missing before step 1? Or does step 1 leave the robot guessing?" : "Would moving step 1 fix it? Even in a new spot, it still doesn't say how.", "warn");
      }
      if (idx === 0 && found.step && found.kind) api.win({ bug: "unclear" });
    });
    render();
    return stop;
  }

  SE.labs.register({
    id: "robot-chef",
    area: "coding",
    title: "Robot Chef",
    tagline: "A robot chef follows your sandwich algorithm exactly as written. Find the bugs, fix them, and get it fed.",
    levels: LEVELS,
    mount
  });
  SE.robotChef = { run, explain, STEPS, START, REWRITE };
})();
