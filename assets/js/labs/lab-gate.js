/*
 * Moon Base Gatekeeper — Coding (conditionals, grades 2–8)
 *
 * An editable IF / ELSE rule decides whether a robot visitor gets through the gate:
 *   IF visitor badge equals [Moon | Star | Planet]
 *   THEN [Open gate | Keep gate closed]
 *   ELSE [Open gate | Keep gate closed]
 * Every test runs the student's current rule through run(), so outcomes are never
 * hardcoded. Each test shows a step-by-step trace and is added to a test log.
 *
 * Levels follow the lesson: Moon visitor, Star visitor, change the rule, find and fix
 * a broken rule, then the Star-team challenge. Checks read the test log for the
 * current rule only, so editing the rule makes earlier tests stale.
 * SE.gate.{run, check} are exposed for testing.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const BADGES = ["moon", "star", "planet"];
  const BADGE = { moon: "Moon", star: "Star", planet: "Planet" };
  const ACT = { open: "Open gate", closed: "Keep gate closed" };
  const ACT_SHORT = { open: "Open", closed: "Closed" };
  const DEFAULT_RULE = { badge: "moon", then: "open", else: "closed" };
  const BROKEN_RULE = { badge: "moon", then: "open", else: "open" };
  const GOAL = { star: "open", moon: "closed", planet: "closed" };   // the Star team meeting
  const keyOf = (r) => `${r.badge}|${r.then}|${r.else}`;

  /* Badge art: each has its own shape, plus its name wherever it appears. */
  const BADGE_ART = {
    moon: '<circle cx="20" cy="20" r="17" fill="#e8e3f7" stroke="#1d1647" stroke-width="2.5"/><path d="M25 8 A12 12 0 1 0 25 32 A9.5 9.5 0 1 1 25 8 Z" fill="#c7bff0" stroke="#1d1647" stroke-width="2.5" stroke-linejoin="round"/>',
    star: '<circle cx="20" cy="20" r="17" fill="#fff4c4" stroke="#1d1647" stroke-width="2.5"/><path d="M20 7 L23.6 16 L33 16.6 L25.8 22.6 L28.2 32 L20 26.8 L11.8 32 L14.2 22.6 L7 16.6 L16.4 16 Z" fill="#f2c14e" stroke="#1d1647" stroke-width="2.2" stroke-linejoin="round"/>',
    planet: '<circle cx="20" cy="20" r="17" fill="#d4f3ee" stroke="#1d1647" stroke-width="2.5"/><circle cx="20" cy="20" r="8" fill="#3fb6a8" stroke="#1d1647" stroke-width="2.2"/><ellipse cx="20" cy="20" rx="15" ry="5" fill="none" stroke="#1d1647" stroke-width="2.2" transform="rotate(-20 20 20)"/>'
  };
  const badgeSvg = (b, size = 28, cls = "") => `<svg class="mg-badge-art ${cls}" viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true">${BADGE_ART[b]}</svg>`;
  const badgeTag = (b) => `<span class="mg-badge-tag">${badgeSvg(b, 22)}${BADGE[b]}</span>`;
  const actGlyph = (a) => a === "open"
    ? '<svg class="mg-act-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V4h6v16M14 20V4h6v16" fill="none"/><path d="M10 12H3M3 12l3-3M3 12l3 3M14 12h7M21 12l-3-3M21 12l-3 3"/></svg>'
    : '<svg class="mg-act-glyph" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" fill="none"/><path d="M12 4v16"/><rect x="9" y="10" width="6" height="5" rx="1"/></svg>';

  /* ───────── Running the rule (the only place outcomes come from) ───────── */
  function run(rule, badge) {
    const match = badge === rule.badge;
    const branch = match ? "then" : "else";
    return { badge, match, branch, action: rule[branch] };
  }

  /* ───────── Level checks (read the log for the current rule) ───────── */
  function check(level, rule, log, extra = {}) {
    // Only tests of the current program count. A version number (bumped on every edit) is used
    // when given, so editing the rule and changing it back still needs new tests.
    const cur = log.filter((t) => (extra.ver != null ? t.ver === extra.ver : t.key === keyOf(rule)));
    const isDefault = keyOf(rule) === keyOf(DEFAULT_RULE);
    if (level === 0 || level === 1) {
      const want = level === 0 ? "moon" : "star";
      if (!isDefault) return { ok: false, msg: `For this level, use the starting rule: IF badge equals Moon, THEN Open gate, ELSE Keep gate closed.` };
      return cur.some((t) => t.badge === want && t.predicted) ? { ok: true } : { ok: false, msg: "" };
    }
    if (level === 2) {
      if (rule.badge === "moon") return { ok: false, msg: "Change which badge the IF checks. Pick Star or Planet." };
      if (rule.then !== "open" || rule.else !== "closed") return { ok: false, msg: "Keep THEN as Open gate and ELSE as Keep gate closed for this level." };
      const m = cur.some((t) => t.match), n = cur.some((t) => !t.match);
      if (m && n) return { ok: true };
      if (m) return { ok: false, msg: `It works for ${BADGE[rule.badge]} visitors. Now test a visitor without a ${BADGE[rule.badge]} badge.` };
      if (n) return { ok: false, msg: `Now test a ${BADGE[rule.badge]} visitor. Does the gate open?` };
      return { ok: false, msg: "" };
    }
    if (level === 3) {
      if (!extra.bugFound) return { ok: false, msg: "" };
      if (rule.then === rule.else) return { ok: false, msg: `THEN and ELSE both say ${ACT[rule.then]}. So every visitor gets the same result. Fix one of them.` };
      if (rule.then !== "open") return { ok: false, msg: "Now the matching visitor stays out. Which action should THEN do?" };
      const m = cur.some((t) => t.match), n = cur.some((t) => !t.match);
      if (m && n) return { ok: true };
      return { ok: false, msg: m ? "Good. Now test a visitor that does NOT match. Does it stay out?" : `Now test a ${BADGE[rule.badge]} visitor too.` };
    }
    // Level 4: challenge. All three badges must be tested with the current rule, and all must be right.
    const latest = {};
    cur.forEach((t) => { latest[t.badge] = t; });
    const wrong = BADGES.filter((b) => latest[b] && latest[b].action !== GOAL[b]);
    const untested = BADGES.filter((b) => !latest[b]);
    if (!wrong.length && !untested.length) return { ok: true };
    return { ok: false, wrong, untested, latest };
  }

  /* Challenge feedback for one test, in the student's terms. */
  function challengeNote(t) {
    const b = BADGE[t.badge];
    if (t.badge === "star") return t.action === "open" ? "Your rule lets Star visitors in." : `Star visitors are stuck outside. Which branch runs for Star, and what does it do?`;
    return t.action === "closed" ? `${b} visitors stay outside. Good.` : `${b} visitors can still enter. Which branch runs for ${b}?`;
  }

  const LEVELS = [
    { title: "A Moon visitor", concept: "IF / ELSE",
      goal: "A Moon visitor arrives. Predict: open or closed? Then press Test visitor.",
      steps: ["Pick the Moon visitor.", "Make your prediction.", "Press Test visitor."],
      hints: ["The IF checks the visitor's badge. Does Moon equal Moon?", "When the check is yes, the THEN action runs."],
      learned: "A conditional checks a rule. When the check is true, the THEN action runs." },
    { title: "A Star visitor", concept: "The other branch",
      goal: "Now a Star visitor arrives. Predict, then test.",
      steps: ["Pick the Star visitor.", "Predict.", "Test."],
      hints: ["The rule checks: does the badge equal Moon? Star is not Moon.", "When the check is no, the ELSE action runs."],
      learned: "When the check is false, the ELSE action runs instead. A conditional always picks exactly one branch." },
    { title: "Change the rule", concept: "Edit the check",
      goal: "Make the gate let in Star or Planet visitors instead. Test one that should enter and one that shouldn't.",
      steps: ["Change the badge in the IF.", "Test a matching visitor.", "Test a different visitor."],
      hints: ["The badge in the IF line is the one that gets in. Change it from Moon.", "Test two visitors: one with your new badge, one without."],
      learned: "Changing what the IF checks changes who gets in. Testing a visitor that should enter and one that shouldn't proves both branches work." },
    { title: "Find the bug", concept: "Debugging",
      goal: "This rule is broken! Find a visitor that shows the bug. Then fix the rule and test it.",
      steps: ["Test visitors until one gets in that shouldn't.", "Fix the rule.", "Test a matching and a non-matching visitor."],
      hints: ["A Moon visitor gets in, and that looks fine. Try a visitor who is NOT Moon.", "Look at the ELSE line. What should happen to visitors who don't match?"],
      learned: "One passing test can hide a bug. Testing a visitor that doesn't match revealed that ELSE also opened the gate." },
    { title: "Challenge: Star team meeting", concept: "Challenge",
      goal: "Star visitors should enter. Moon and Planet visitors should stay outside. Edit the rule, then test all three.",
      steps: ["Edit the rule.", "Test Moon, Star, and Planet."],
      hints: ["Only one badge should get in. Which badge should the IF check?", "Think about what each branch should do: one action for the matching badge, the other for everyone else."],
      learned: "You wrote a rule and tested every kind of visitor. Testing all the cases, not just one, is how you know a conditional really works." }
  ];

  /* ───────── Scene ───────── */
  const visitorSvg = () => `
    <svg class="mg-bot" viewBox="0 0 100 130" aria-hidden="true">
      <rect x="22" y="14" width="56" height="44" rx="22" fill="#f4f2ea" stroke="#1d1647" stroke-width="3.5"/>
      <rect x="31" y="24" width="38" height="24" rx="12" fill="#302568"/>
      <circle cx="43" cy="36" r="4" fill="#8fd3e8"/><circle cx="57" cy="36" r="4" fill="#8fd3e8"/>
      <path d="M50 14 V4" stroke="#1d1647" stroke-width="3"/><circle cx="50" cy="4" r="4" fill="#e9603f" stroke="#1d1647" stroke-width="2"/>
      <rect x="28" y="60" width="44" height="40" rx="12" fill="#8fd3e8" stroke="#1d1647" stroke-width="3.5"/>
      <rect x="32" y="100" width="12" height="20" rx="4" fill="#302568"/><rect x="56" y="100" width="12" height="20" rx="4" fill="#302568"/>
      <path d="M28 70 L16 86" stroke="#1d1647" stroke-width="7" stroke-linecap="round"/><path d="M72 70 L82 80" stroke="#1d1647" stroke-width="7" stroke-linecap="round"/>
    </svg>`;

  function mount(el, idx, api) {
    const isChallenge = idx === 4;
    const predictRequired = idx <= 1;
    const rule = { ...(idx === 3 ? BROKEN_RULE : DEFAULT_RULE) };
    const st = { visitor: idx === 1 ? "star" : "moon", predict: null, log: [], bugFound: false, won: false, last: null, ver: 0 };

    const seg = (group, options, cur, render, label) => `
      <div class="mg-seg" role="group" aria-label="${esc(label)}">${options.map((o) => `<button type="button" class="mg-opt" data-set="${group}" data-v="${o}" aria-pressed="${cur === o}">${render(o)}</button>`).join("")}</div>`;

    el.innerHTML = `
      <div class="mg">
        <div class="mg-left">
          <div class="mg-scene" id="mg-scene" data-gate="closed" role="img" aria-label="">
            <div class="mg-sky" aria-hidden="true"></div>
            <div class="mg-earth" aria-hidden="true"></div>
            <div class="mg-ground" aria-hidden="true"></div>
            <div class="mg-base" aria-hidden="true"><div class="mg-dome"></div><div class="mg-wall"></div></div>
            <div class="mg-gate" aria-hidden="true"><div class="mg-door mg-door--l"></div><div class="mg-door mg-door--r"></div><div class="mg-sign" id="mg-sign">CLOSED</div></div>
            <div class="mg-visitor" id="mg-visitor" aria-hidden="true">${visitorSvg()}<span class="mg-held" id="mg-held"></span></div>
          </div>
          <div class="mg-panel">
            <h3 id="mg-v-title">Visitor badge</h3>
            ${seg("visitor", BADGES, st.visitor, (b) => `${badgeSvg(b, 34)}<span>${BADGE[b]}</span>`, "Visitor badge")}
            ${isChallenge ? "" : `
            <h3 id="mg-p-title">Predict: open or closed?${predictRequired ? "" : ' <small class="muted">(optional)</small>'}</h3>
            ${seg("predict", ["open", "closed"], null, (a) => `${actGlyph(a)}<span>${ACT_SHORT[a]}</span>`, "Prediction")}`}
            <button type="button" class="btn btn--launch mg-test" id="mg-test">${icon("rocket")}Test visitor</button>
          </div>
        </div>

        <div class="mg-right">
          <div class="mg-code" id="mg-code" aria-label="Your rule">
            <div class="mg-line mg-line--if" id="mg-if">
              <span class="mg-kw">IF</span><span>visitor badge equals</span>
              ${seg("badge", BADGES, rule.badge, (b) => `${badgeSvg(b, 26)}<span>${BADGE[b]}</span>`, "IF: badge to check")}
              <span class="mg-result" id="mg-res" hidden></span>
            </div>
            <div class="mg-line mg-line--branch" id="mg-then"><span class="mg-kw">THEN</span>${seg("then", ["open", "closed"], rule.then, (a) => `${actGlyph(a)}<span>${ACT[a]}</span>`, "THEN action")}<span class="mg-flag" hidden></span></div>
            <div class="mg-line mg-line--branch" id="mg-else"><span class="mg-kw">ELSE</span>${seg("else", ["open", "closed"], rule.else, (a) => `${actGlyph(a)}<span>${ACT[a]}</span>`, "ELSE action")}<span class="mg-flag" hidden></span></div>
          </div>
          <p class="mg-stale" id="mg-stale" role="status" hidden>${icon("alert")}<span>You changed the rule, so earlier tests don't count. Test again.</span></p>
          ${isChallenge ? `<ul class="mg-goals" id="mg-goals" aria-label="Meeting checklist"></ul>` : ""}
          <section class="mg-trace-box" aria-labelledby="mg-trace-t"><h3 id="mg-trace-t">What the program did</h3><ol class="mg-trace" id="mg-trace"><li class="muted">Press Test visitor to see each step.</li></ol></section>
          <section class="mg-log-box" aria-labelledby="mg-log-t">
            <h3 id="mg-log-t">Test log</h3>
            <div class="mg-log-wrap"><table class="data-table mg-log"><thead><tr><th scope="col">#</th><th scope="col">Visitor</th><th scope="col">${isChallenge ? "Meeting needs" : "Predicted"}</th><th scope="col">Actual</th><th scope="col">Rule</th></tr></thead><tbody id="mg-log"></tbody></table></div>
          </section>
        </div>
      </div>
      <p class="mg-live visually-hidden" id="mg-live" role="status" aria-live="polite"></p>`;

    const $ = (s) => el.querySelector(s);
    const scene = $("#mg-scene");

    const ruleText = (r) => `${BADGE[r.badge]} → ${ACT_SHORT[r.then]} / ${ACT_SHORT[r.else]}`;

    function paintScene() {
      const gate = st.last ? st.last.action : "closed";
      scene.dataset.gate = gate;
      scene.dataset.badge = st.visitor;
      scene.dataset.tested = st.last ? "yes" : "no";
      $("#mg-held").innerHTML = `${badgeSvg(st.visitor, 40)}<b>${BADGE[st.visitor]}</b>`;
      $("#mg-sign").textContent = gate === "open" ? "OPEN" : "CLOSED";
      scene.setAttribute("aria-label", st.last
        ? `The ${BADGE[st.last.badge]} visitor ${st.last.action === "open" ? "goes through the open gate" : "waits outside the closed gate"}.`
        : `A robot visitor with a ${BADGE[st.visitor]} badge waits at the closed gate.`);
    }
    function paintCode() {
      const cur = st.last && st.last.ver === st.ver ? st.last : null;
      const res = $("#mg-res");
      res.hidden = !cur;
      if (cur) { res.textContent = cur.match ? "✓ Yes, equal" : "✗ No, not equal"; res.className = `mg-result ${cur.match ? "is-yes" : "is-no"}`; }
      ["then", "else"].forEach((br) => {
        const line = $(`#mg-${br}`), flag = line.querySelector(".mg-flag");
        line.classList.toggle("is-taken", !!cur && cur.branch === br);
        line.classList.toggle("is-skipped", !!cur && cur.branch !== br);
        flag.hidden = !cur;
        flag.textContent = cur ? (cur.branch === br ? "▶ runs" : "skipped") : "";
      });
      $("#mg-if").classList.toggle("is-checked", !!cur);
    }
    function paintLog() {
      $("#mg-log").innerHTML = st.log.length ? st.log.map((t, i) => {
        const exp = isChallenge ? GOAL[t.badge] : t.predicted;
        const okMark = exp ? (exp === t.action ? '<span class="mg-ok">✓ same</span>' : '<span class="mg-bad">✗ different</span>') : "";
        return `<tr class="${t.ver === st.ver ? "" : "is-stale"}"><td>${i + 1}</td><td>${badgeTag(t.badge)}</td><td>${exp ? ACT_SHORT[exp] : "—"}</td><td><strong>${ACT_SHORT[t.action]}</strong> ${okMark}</td><td>${esc(ruleText(t.rule))}${t.ver === st.ver ? "" : ' <small>(old rule)</small>'}</td></tr>`;
      }).reverse().join("") : `<tr><td colspan="5" class="muted">No tests yet.</td></tr>`;
      if (isChallenge) {
        const latest = {};
        st.log.filter((t) => t.ver === st.ver).forEach((t) => { latest[t.badge] = t; });
        $("#mg-goals").innerHTML = BADGES.map((b) => {
          const t = latest[b], need = GOAL[b];
          const state = !t ? "todo" : t.action === need ? "pass" : "fail";
          const word = { todo: "not tested yet", pass: "correct", fail: "wrong" }[state];
          return `<li class="is-${state}">${badgeTag(b)}<span>should ${need === "open" ? "enter" : "stay outside"}</span><b class="mg-goal-state">${{ todo: "○", pass: "✓", fail: "✗" }[state]} ${word}</b></li>`;
        }).join("");
      }
    }
    function paint() { paintScene(); paintCode(); paintLog(); }

    function traceFor(t) {
      const r = t.rule, steps = [
        `The visitor's badge is ${badgeTag(t.badge)}.`,
        `IF checks: is ${BADGE[t.badge]} equal to ${BADGE[r.badge]}? <strong class="${t.match ? "mg-yes" : "mg-no"}">${t.match ? "Yes (true)" : "No (false)"}</strong>`,
        `So the <strong>${t.branch.toUpperCase()}</strong> branch runs: ${ACT[t.action]}. The ${t.branch === "then" ? "ELSE" : "THEN"} branch is skipped.`,
        t.action === "open" ? `The gate opens. The visitor goes in.` : `The gate stays closed. The visitor waits outside.`
      ];
      if (t.predicted) steps.push(`You predicted <strong>${ACT_SHORT[t.predicted]}</strong>. ${t.predicted === t.action ? "Correct!" : "The program did something else. Look at step 2."}`);
      $("#mg-trace").innerHTML = steps.map((s, i) => `<li class="${i === 1 ? "mg-trace__check" : i === 2 ? "mg-trace__branch" : ""}">${s}</li>`).join("");
    }

    function test() {
      if (predictRequired && !st.predict) { api.say("Make a prediction first: open or closed?", "warn"); el.querySelector('[data-set="predict"]').focus(); return; }
      const out = run(rule, st.visitor);
      const t = { ...out, rule: { ...rule }, key: keyOf(rule), ver: st.ver, predicted: isChallenge ? null : st.predict };
      st.log.push(t);
      st.last = t;
      api.log("lab_test_run", { rule: t.key, badge: t.badge, action: t.action });
      // Restart the walk animation (CSS only; nothing waits for it).
      scene.classList.remove("is-walking"); void scene.offsetWidth; scene.classList.add("is-walking");
      traceFor(t);
      paint();
      $("#mg-stale").hidden = true;
      $("#mg-live").textContent = `${BADGE[t.badge]} visitor: ${t.match ? "matches" : "does not match"} ${BADGE[t.rule.badge]}. ${t.branch.toUpperCase()} runs. Gate ${t.action === "open" ? "opens" : "stays closed"}.`;
      if (idx === 3 && !t.match && t.action === "open" && t.rule.then === "open") st.bugFound = true;
      feedback(t);
      // Clear the prediction so each test gets a fresh one.
      st.predict = null;
      el.querySelectorAll('[data-set="predict"]').forEach((b) => b.setAttribute("aria-pressed", "false"));
    }

    function feedback(t) {
      if (st.won) return;
      const r = check(idx, rule, st.log, { bugFound: st.bugFound, ver: st.ver });
      if (r.ok) {
        const msg = {
          0: `Moon equals Moon, so THEN ran and the gate opened.`,
          1: `Star is not Moon, so ELSE ran and the gate stayed closed.`,
          2: `Your rule lets ${BADGE[rule.badge]} visitors in and keeps others out. You tested both branches.`,
          3: `Bug fixed! You found it by testing a visitor that didn't match, then tested both branches.`,
          4: `All three tests pass with your current rule. The Star team can meet!`
        }[idx];
        st.won = true;
        api.say(msg, "good");
        api.win({ rule: keyOf(rule), tests: st.log.filter((x) => x.ver === st.ver).map((x) => `${x.badge}:${x.action}`) });
        return;
      }
      if (idx === 0 && t.badge !== "moon") return api.say("Good test! For this level, test a Moon visitor.", "info");
      if (idx === 1 && t.badge !== "star") return api.say("For this level, test a Star visitor.", "info");
      if (idx === 3) {
        const broken = rule.then === "open" && rule.else === "open";
        if (!st.bugFound) {
          if (!broken) return api.say("You changed the rule before showing the bug. Set ELSE back to Open gate, then test a visitor whose badge doesn't match.", "info");
          return api.say(`${BADGE[t.badge]} got in, as expected. But does one passing test prove the rule works? Try a different visitor.`, "info");
        }
        if (broken && !t.match) return api.say(`Found the bug! ${BADGE[t.badge]} is not ${BADGE[rule.badge]}, so ELSE ran. But ELSE opens the gate too. Fix the ELSE line, then test again.`, "warn");
        return api.say(r.msg, "warn");
      }
      if (idx === 4) {
        const left = r.untested.length ? ` Still to test: ${r.untested.map((b) => BADGE[b]).join(", ")}.` : "";
        return api.say(`${challengeNote(t)}${left}`, r.wrong.length ? "warn" : "info");
      }
      if (r.msg) api.say(r.msg, "warn");
    }

    /* ── Events ── */
    el.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.id === "mg-test") { test(); return; }
      const g = b.dataset.set, v = b.dataset.v;
      if (!g) return;
      el.querySelectorAll(`[data-set="${g}"]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (g === "visitor") { st.visitor = v; if (st.last) { st.last = null; scene.classList.remove("is-walking"); } paint(); return; }
      if (g === "predict") { st.predict = v; return; }
      // A rule edit: earlier tests no longer describe this program.
      if (rule[g] === v) return;
      rule[g] = v;
      st.ver++;
      const hadCurrent = st.log.length > 0;
      st.last = null;
      paint();
      if (hadCurrent) {
        $("#mg-stale").hidden = false;
        $("#mg-trace").innerHTML = `<li class="muted">The rule changed. Test again to see what it does now.</li>`;
        if (!st.won) api.say(isChallenge ? "Rule changed. Earlier results were cleared. Test all three badges again." : "", "info");
      }
      $("#mg-live").textContent = `Rule is now: IF badge equals ${BADGE[rule.badge]}, THEN ${ACT[rule.then]}, ELSE ${ACT[rule.else]}.`;
    });

    paint();
    SE.gate.state = () => ({ rule: { ...rule }, log: st.log.map((t) => ({ badge: t.badge, action: t.action, branch: t.branch, key: t.key, ver: t.ver })), ver: st.ver, bugFound: st.bugFound, won: st.won });
  }

  SE.gate = { run, check, keyOf, GOAL, BADGES, state: () => null };
  SE.labs.register({
    id: "moon-gate",
    area: "coding",
    title: "Moon Base Gatekeeper",
    tagline: "Write an IF / ELSE rule for the moon base gate, then test every kind of visitor.",
    levels: LEVELS,
    mount
  });
})();
