/*
 * Feed the Space Blob — Coding (variables, grades 2–8)
 *
 * Two editable code stacks drive a variable called "snacks":
 *   WHEN RUN STARTS        set snacks to [0]
 *   WHEN FEED IS CLICKED   change snacks by [1]
 * Start/Restart reads the student's code and makes a snapshot of it (the run).
 * Feed uses the run's amount, never the live fields, so editing code mid-run
 * does nothing until the student restarts (and the page says so).
 *
 * The "set" block can be switched off (level 3) to show what happens without a
 * known starting value: snacks keeps whatever it held after the last run.
 *
 * Checks read the run record (start value, amount, number of feeds), not the
 * total on screen. There are no timers: animation is CSS only and nothing waits on it.
 * SE.blob.check(level, run, extra) is exposed for testing.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const LIMITS = { init: [0, 100], inc: [-10, 10] };
  const DEFAULTS = { init: 0, inc: 1 };
  const CHALLENGE = { init: 2, inc: 3, feeds: 4, total: 14 };

  /* Whole numbers only, within limits. Returns { ok, value, msg }. */
  function readInt(raw, [lo, hi]) {
    const s = String(raw).trim();
    if (!/^-?\d+$/.test(s)) return { ok: false, msg: `Use a whole number from ${lo} to ${hi}.` };
    const v = Number(s);
    if (v < lo || v > hi) return { ok: false, msg: `Use a number from ${lo} to ${hi}.` };
    return { ok: true, value: v };
  }
  const sum = (run) => run.start + run.inc * run.feeds;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  /* "2 + 3 + 3 = 8" style working, from the run's real values. */
  function working(run) {
    if (!run.feeds) return `${run.start}`;
    const parts = [String(run.start)];
    for (let i = 0; i < run.feeds; i++) parts.push(run.inc < 0 ? `− ${-run.inc}` : `+ ${run.inc}`);
    return `${parts.join(" ")} = ${sum(run)}`;
  }

  /* ───────── Level rules (pure) ───────── */
  function check(level, run, extra = {}) {
    if (!run) return { ok: false, msg: "Press Start first." };
    if (level === 0) {
      if (run.feeds < 3) return { ok: false, msg: `Feed the blob ${3 - run.feeds} more time${3 - run.feeds === 1 ? "" : "s"}.` };
      if (extra.answer == null) return { ok: false, msg: "Now answer: what is stored in snacks?" };
      if (extra.answer !== run.value) return { ok: false, msg: `Not quite. Look at the snacks monitor. It shows the value stored right now.` };
      return { ok: true };
    }
    if (level === 1) {
      if (!run.resetOn || run.start !== 0) return { ok: false, msg: `This run started at ${run.start}. Keep "set snacks to" at 0 for this level, then press Restart.` };
      if (run.inc !== 2) return { ok: false, msg: `This run adds ${run.inc} each feed. Change "change snacks by" to 2, then press Restart.` };
      if (run.feeds < 3) return { ok: false, msg: `Feed ${plural(3 - run.feeds, "more time", "more times")}, then compare with your prediction.` };
      if (run.feeds > 3) return { ok: false, msg: `You fed ${run.feeds} times. Press Restart and feed exactly 3 times.` };
      return { ok: true };
    }
    if (level === 2) return extra.experiment ? { ok: true } : { ok: false, msg: "" };
    // Level 3: the challenge. Check the code and the feeds, not just the total.
    const problems = [];
    if (!run.resetOn) problems.push(`the "set snacks to" block was off, so snacks started at ${run.start} left over from before`);
    else if (run.start !== CHALLENGE.init) problems.push(`it started at ${run.start}, not ${CHALLENGE.init}`);
    if (run.inc !== CHALLENGE.inc) problems.push(`each feed added ${run.inc}, not ${CHALLENGE.inc}`);
    if (run.feeds !== CHALLENGE.feeds) problems.push(`you fed ${plural(run.feeds, "time", "times")}, not ${CHALLENGE.feeds}`);
    if (!problems.length) return { ok: true };
    const total = sum(run);
    const lead = total === CHALLENGE.total
      ? `snacks is ${total}, but the program isn't right yet:`
      : `Your run: ${working(run)}. Not quite:`;
    return { ok: false, msg: `${lead} ${problems.join("; ")}.` };
  }

  const LEVELS = [
    { title: "Feed the blob", concept: "Variables",
      goal: "Press Start. Feed the blob 3 times. Then answer: what is stored in snacks?",
      steps: ["Press Start.", "Press Feed 3 times.", "Type what snacks holds."],
      hints: ["The orange snacks monitor always shows the value stored right now.", "It started at 0 and each feed added 1. Count up: 1, 2, 3."],
      learned: "A variable stores a value. snacks remembers a number, and the Feed event changes it." },
    { title: "Change the amount", concept: "Predict",
      goal: "Change “change snacks by” to 2. Predict snacks after 3 feeds. Then test it.",
      steps: ["Set the amount to 2.", "Type your prediction.", "Press Start, then Feed 3 times."],
      hints: ["Each feed now adds 2 instead of 1. Start at 0.", "Count by twos, three times: 0 → 2 → 4 → …"],
      learned: "Changing the code changes how the value grows. Each event added the amount in your code." },
    { title: "Lost the reset?", concept: "Initialization",
      goal: "Turn off the “set snacks to” block. Restart, feed, and watch. Then turn it back on and restart.",
      steps: ["Start and feed a few times.", "Turn off “set snacks to”, then Restart.", "Feed again. Where did snacks start?", "Turn the block back on, then Restart."],
      hints: ["The switch on the “set snacks to” block turns it off. A block that's off is skipped.", "Without the set block, Restart can't reset snacks. It keeps the number from last time."],
      learned: "A program needs a known starting value. Setting a variable at the start (initializing it) makes every run begin the same way." },
    { title: "Challenge: 14 snacks", concept: "Challenge",
      goal: "Start with 2 snacks. Make each feed add 3. After 4 feeds, the blob should have 14 snacks.",
      steps: ["Change the code.", "Press Start, then Feed 4 times."],
      hints: ["Two numbers in the code need to change: where snacks starts, and how much each feed adds.", "Set snacks to 2. Change snacks by 3. Then: 2 → 5 → 8 → …"],
      learned: "You set the starting value, chose how each event changes it, and counted the events. That's how programs keep score, count lives, and track money." }
  ];

  /* ───────── The blob ───────── */
  const blobSvg = () => `
    <svg class="sb-blob__svg" viewBox="0 0 200 170" aria-hidden="true">
      <ellipse cx="100" cy="160" rx="62" ry="8" fill="#000" opacity=".25"/>
      <path class="sb-body" d="M36 150 C18 150 14 128 24 112 C16 86 34 52 66 44 C76 18 124 18 134 44 C166 52 186 84 176 112 C188 130 180 150 162 150 Z" fill="#8cc832" stroke="#1d1647" stroke-width="4"/>
      <circle cx="58" cy="118" r="7" fill="#b9e27f"/><circle cx="148" cy="96" r="5" fill="#b9e27f"/><circle cx="138" cy="132" r="4" fill="#b9e27f"/>
      <g class="sb-stalk"><path d="M100 30 Q96 10 104 2" stroke="#1d1647" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="104" cy="4" r="6" fill="#f2c14e" stroke="#1d1647" stroke-width="3"/></g>
      <g class="sb-eyes">
        <circle cx="76" cy="74" r="16" fill="#fff" stroke="#1d1647" stroke-width="3"/><circle cx="124" cy="70" r="20" fill="#fff" stroke="#1d1647" stroke-width="3"/>
        <circle class="sb-pupil" cx="80" cy="77" r="7" fill="#1d1647"/><circle class="sb-pupil" cx="129" cy="74" r="9" fill="#1d1647"/>
        <circle cx="82" cy="74" r="2.2" fill="#fff"/><circle cx="132" cy="70" r="3" fill="#fff"/>
      </g>
      <path class="sb-mouth sb-mouth--idle" d="M78 112 Q100 128 122 110" stroke="#1d1647" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g class="sb-mouth sb-mouth--open"><ellipse cx="100" cy="116" rx="22" ry="16" fill="#302568" stroke="#1d1647" stroke-width="4"/><ellipse cx="100" cy="124" rx="12" ry="6" fill="#e9603f"/></g>
      <g class="sb-cheeks"><ellipse cx="62" cy="104" rx="9" ry="5" fill="#e9603f" opacity=".35"/><ellipse cx="142" cy="100" rx="9" ry="5" fill="#e9603f" opacity=".35"/></g>
    </svg>`;
  const snackSvg = () => `<svg class="sb-snack" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 L24 15 L36 16 L27 24 L30 36 L20 30 L10 36 L13 24 L4 16 L16 15 Z" fill="#f2c14e" stroke="#1d1647" stroke-width="2.5" stroke-linejoin="round"/></svg>`;

  function mount(el, idx, api) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const showSwitch = idx >= 2;
    // Editable settings (what the code says now) vs. the current run (what was read at Start).
    const code = { init: String(DEFAULTS.init), inc: String(DEFAULTS.inc), resetOn: true };
    const mem = { snacks: 0, hasRun: false };   // the variable lives on between runs, like a real program's memory
    let run = null;
    let won = false;
    const L3 = { leftover: false, fedAfter: false, restored: false };  // level 3 experiment progress
    let prediction = null, answer = null;

    el.innerHTML = `
      <div class="sb">
        <div class="sb-space">
          <div class="sb-stage" aria-hidden="true">
            <div class="sb-stars"></div>
            <div class="sb-planet"></div>
            <div class="sb-blob" id="sb-blob">${blobSvg()}<span class="sb-fly">${snackSvg()}</span></div>
          </div>
          <div class="sb-monitor" id="sb-monitor">
            <span class="sb-monitor__name">snacks</span>
            <output class="sb-monitor__val" id="sb-val" aria-describedby="sb-run-state">0</output>
          </div>
          <p class="sb-run-state" id="sb-run-state"></p>
          <div class="sb-controls">
            <button type="button" class="btn btn--launch sb-big" id="sb-start">${icon("rocket")}<span>Start</span></button>
            <button type="button" class="btn btn--primary sb-big sb-feed" id="sb-feed" aria-disabled="true">${snackSvg()}<span>Feed</span></button>
          </div>
          <p class="sb-live" id="sb-live" role="status" aria-live="polite"></p>
          <ol class="sb-history" id="sb-history" aria-label="What happened this run"></ol>
        </div>

        <div class="sb-code">
          <h3 class="sb-code__title">Your code</h3>
          <div class="sb-stack">
            <div class="sb-hat sb-hat--start">when run starts</div>
            <div class="sb-blk sb-blk--var ${code.resetOn ? "" : "is-off"}" id="sb-set-blk">
              <label for="sb-init">set <b>snacks</b> to</label>
              <input class="sb-num" id="sb-init" type="number" inputmode="numeric" step="1" min="${LIMITS.init[0]}" max="${LIMITS.init[1]}" value="${code.init}" aria-describedby="sb-init-err">
              ${showSwitch ? `<button type="button" class="sb-switch" id="sb-reset-toggle" aria-pressed="true"><span class="sb-switch__track"><span class="sb-switch__dot"></span></span><span class="sb-switch__label">On</span><span class="visually-hidden"> (set snacks block)</span></button>` : ""}
            </div>
            <p class="sb-err" id="sb-init-err"></p>
          </div>
          <div class="sb-stack">
            <div class="sb-hat sb-hat--event">when <b>Feed</b> is clicked</div>
            <div class="sb-blk sb-blk--var">
              <label for="sb-inc">change <b>snacks</b> by</label>
              <input class="sb-num" id="sb-inc" type="number" inputmode="numeric" step="1" min="${LIMITS.inc[0]}" max="${LIMITS.inc[1]}" value="${code.inc}" aria-describedby="sb-inc-err">
            </div>
            <p class="sb-err" id="sb-inc-err"></p>
          </div>
          <p class="sb-changed" id="sb-changed" role="status" hidden>${icon("alert")}<span>You changed the code. Press <strong>Restart</strong> to use it.</span></p>
          ${idx === 0 ? `
            <div class="sb-ask" id="sb-ask" hidden>
              <label for="sb-answer"><strong>What is stored in snacks now?</strong></label>
              <div class="lab-row"><input class="sb-num sb-num--wide" id="sb-answer" type="number" inputmode="numeric" step="1"><button type="button" class="btn btn--ghost" id="sb-answer-btn">${icon("check")}Check</button></div>
            </div>` : ""}
          ${idx === 1 ? `
            <div class="sb-ask" id="sb-ask">
              <label for="sb-predict"><strong>Predict:</strong> snacks after 3 feeds?</label>
              <div class="lab-row"><input class="sb-num sb-num--wide" id="sb-predict" type="number" inputmode="numeric" step="1"><span class="muted" id="sb-predict-note">Type it before you press Start.</span></div>
            </div>` : ""}
          ${idx === 2 ? `
            <ul class="sb-checks" id="sb-checks">
              <li data-k="leftover" data-label="Restart with the set block off"></li>
              <li data-k="fedAfter" data-label="Feed again"></li>
              <li data-k="restored" data-label="Turn it back on and Restart"></li>
            </ul>` : ""}
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    const blob = $("#sb-blob"), val = $("#sb-val"), live = $("#sb-live"), hist = $("#sb-history");

    /* ── Display ── */
    function paint() {
      val.textContent = String(mem.snacks);
      $("#sb-start").querySelector("span").textContent = run ? "Restart" : "Start";
      $("#sb-feed").setAttribute("aria-disabled", String(!run));
      const scale = Math.max(0.8, Math.min(1.35, 1 + mem.snacks * 0.012));
      blob.style.setProperty("--grow", scale.toFixed(3));
      $("#sb-run-state").innerHTML = run
        ? `Running · start ${run.start} · ${run.inc < 0 ? "" : "+"}${run.inc} per feed · ${plural(run.feeds, "feed", "feeds")}`
        : "Not running. Press Start.";
      hist.innerHTML = !run ? "" : run.log.map((x) => `<li>${x}</li>`).join("");
      // Code edited since Start?
      const changed = !!run && (code.init !== String(run.codeInit) || code.inc !== String(run.inc) || code.resetOn !== run.resetOn);
      $("#sb-changed").hidden = !changed;
      $("#sb-set-blk").classList.toggle("is-off", !code.resetOn);
      if (idx === 2) el.querySelectorAll("#sb-checks li").forEach((li) => { const on = L3[li.dataset.k]; li.classList.toggle("is-done", on); li.innerHTML = `${on ? icon("check") : '<span class="sb-dot" aria-hidden="true"></span>'}<span>${esc(li.dataset.label)}</span><span class="visually-hidden">${on ? " (done)" : " (not yet)"}</span>`; });
    }
    function react(cls) {
      if (reduce) { blob.dataset.mood = cls; return; }
      blob.classList.remove("do-chomp", "do-bounce");
      void blob.offsetWidth;
      blob.classList.add(cls);
      blob.dataset.mood = cls;
    }

    /* ── Reading the code ── */
    function readField(id, key) {
      const r = readInt($(`#${id}`).value, LIMITS[key]);
      $(`#${id}-err`).textContent = r.ok ? "" : r.msg;
      $(`#${id}`).setAttribute("aria-invalid", String(!r.ok));
      return r;
    }

    function start() {
      const a = readField("sb-init", "init"), b = readField("sb-inc", "inc");
      if (!a.ok || !b.ok) { api.say("Fix the red number in your code, then press Start.", "warn"); (a.ok ? $("#sb-inc") : $("#sb-init")).focus(); return; }
      if (idx === 1 && prediction == null) { api.say("Type your prediction first.", "warn"); $("#sb-predict").focus(); return; }
      const before = mem.snacks, hadRun = mem.hasRun;
      if (code.resetOn) mem.snacks = a.value;
      mem.hasRun = true;
      run = { start: mem.snacks, codeInit: a.value, inc: b.value, resetOn: code.resetOn, feeds: 0, value: mem.snacks, log: [] };
      run.log.push(code.resetOn
        ? `<b>Start:</b> set snacks to ${a.value}`
        : `<b>Start:</b> “set snacks” is off. snacks stays ${mem.snacks}${hadRun ? " from last time" : ""}`);
      api.log("lab_test_run", { start: run.start, inc: run.inc, resetOn: run.resetOn });
      live.textContent = code.resetOn ? `Run started. snacks is set to ${mem.snacks}.` : `Run started without the set block. snacks is still ${mem.snacks}.`;
      api.say("");
      if (idx === 2) {
        if (!code.resetOn && hadRun && before !== 0) { L3.leftover = true; L3.fedAfter = false; }
        else if (!code.resetOn) api.say("snacks is 0 already, so it's hard to see. Turn the block on, feed a few times, then try again.", "info");
        if (code.resetOn && L3.leftover && L3.fedAfter) L3.restored = true;
      }
      if (idx === 1) { $("#sb-predict").disabled = true; $("#sb-predict-note").textContent = "Locked in for this run."; }
      react("do-bounce");
      paint();
      evaluate("start");
    }

    function feed() {
      if (!run) { api.say("Press Start first.", "warn"); return; }
      const old = mem.snacks;
      mem.snacks = old + run.inc;
      run.feeds++;
      run.value = mem.snacks;
      run.log.push(`<b>Feed ${run.feeds}:</b> ${old} ${run.inc < 0 ? "−" : "+"} ${Math.abs(run.inc)} = <b>${mem.snacks}</b>`);
      api.log("lab_feed", { value: mem.snacks });
      live.textContent = `Feed ${run.feeds}. snacks was ${old}, now ${mem.snacks}.`;
      if (idx === 2 && L3.leftover && !run.resetOn) L3.fedAfter = true;
      react("do-chomp");
      paint();
      evaluate("feed");
    }

    /* ── Checking (from the run record) ── */
    function evaluate(why) {
      if (won) return;
      if (idx === 0) {
        if (run && run.feeds >= 3) $("#sb-ask").hidden = false;
        if (why === "answer") {
          const r = check(0, run, { answer });
          if (r.ok) return finish(`Yes! snacks holds ${run.value}. The variable remembered every feed.`);
          api.say(r.msg, "warn");
        } else if (run && run.feeds === 3) api.say("Now answer the question below your code.", "info");
        return;
      }
      if (idx === 1) {
        if (!run || run.feeds < 3 && why === "feed") return;
        if (why === "start" && run.inc !== 2) { api.say(`Your code adds ${run.inc}. Change it to 2, then press Restart.`, "warn"); return; }
        if (why !== "feed") return;
        const r = check(1, run);
        if (!r.ok) { api.say(r.msg, "warn"); return; }
        const right = prediction === run.value;
        return finish(right ? `You predicted ${prediction}. snacks is ${run.value}. Spot on!` : `You predicted ${prediction}. snacks is ${run.value}: ${working(run)}.`);
      }
      if (idx === 2) {
        if (why === "start" && L3.leftover && !run.resetOn) api.say(`Look: snacks started at ${run.start}, not ${code.init}. The old value stayed.`, "info");
        if (L3.restored) return finish(`Back to ${run.start}! With the set block on, every run starts from a known value.`);
        if (L3.fedAfter && run && !run.resetOn) api.say(`snacks keeps growing from the old value. Now turn the block back on and press Restart.`, "info");
        return;
      }
      // Challenge: check on Feed once the count reaches 4 (and after any extra feeds).
      if (why !== "feed" || run.feeds < CHALLENGE.feeds) return;
      const r = check(3, run);
      if (r.ok) return finish(`Challenge complete! ${working(run)}.`);
      api.say(`${r.msg} Fix your code if you need to, then press Restart.`, "warn");
    }
    function finish(msg) {
      won = true;
      api.say(msg, "good");
      api.win({ start: run.start, inc: run.inc, feeds: run.feeds, value: run.value, resetOn: run.resetOn });
    }

    /* ── Events ── */
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.id === "sb-start") start();
      else if (b.id === "sb-feed") feed();
      else if (b.id === "sb-reset-toggle") {
        code.resetOn = !code.resetOn;
        b.setAttribute("aria-pressed", String(code.resetOn));
        b.querySelector(".sb-switch__label").textContent = code.resetOn ? "On" : "Off";
        live.textContent = code.resetOn ? "The set snacks block is on." : "The set snacks block is off. It will be skipped.";
        paint();
      } else if (b.id === "sb-answer-btn") {
        const r = readInt($("#sb-answer").value, [-9999, 9999]);
        if (!r.ok) { api.say("Type a whole number.", "warn"); return; }
        answer = r.value;
        evaluate("answer");
      }
    });
    el.addEventListener("input", (e) => {
      if (e.target.id === "sb-init") { code.init = e.target.value.trim(); readField("sb-init", "init"); paint(); }
      if (e.target.id === "sb-inc") { code.inc = e.target.value.trim(); readField("sb-inc", "inc"); paint(); }
      if (e.target.id === "sb-predict") { const r = readInt(e.target.value, [-9999, 9999]); prediction = r.ok ? r.value : null; }
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.id === "sb-answer") $("#sb-answer-btn").click();
    });

    paint();
    // Testing hook: lets automated tests read the run without depending on timing.
    SE.blob.state = () => ({ code: { ...code }, run: run && { ...run, log: undefined }, snacks: mem.snacks, L3: { ...L3 }, won });
  }

  SE.blob = { check, readInt, working, LEVELS, CHALLENGE, state: () => null };
  SE.labs.register({
    id: "space-blob",
    area: "coding",
    title: "Feed the Space Blob",
    tagline: "A hungry blob, a variable called snacks, and the code that changes it.",
    levels: LEVELS,
    mount
  });
})();
