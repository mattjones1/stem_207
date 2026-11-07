/*
 * Pattern Machine Lab: Train the Machine (lab id "pattern-machine"). A 90-minute workshop, grades 2–8,
 * STEM Coliseum AI workshop 1. Students act as AI trainers: Observe → Predict → Label → Train → Test →
 * Investigate → Improve → Decide.
 *
 * The machine is the k-nearest-neighbors model in ml-kit.js (SE.mlKit). Every number on screen comes from it:
 * predictions, the examples it compared, accuracy, coverage, and the charts. The datasets are in
 * pattern-machine-data.js (SE.pmData); their lessons are checked by tests/tools/test_pattern_machine.js.
 *
 * Privacy: everything is made up. Student work (training sets, notebook, report) stays on this device
 * (localStorage stem207.pm.<studentId>, or sessionStorage for guests). The log gets numbers and ids only.
 * Pure rules for tests: SE.patternMachine (judgeUse, scoreUses, PASS, USES, REASONS, DECISIONS, check).
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const M = SE.mlKit, D = SE.pmData, X = SE.pmExplain, K_ = SE.pmKnow;
  const { pct, tag, b, chips, card, paint, delegate } = SE.pmUI;
  const LAB = "pattern-machine";
  const JOURNEY = ["Be the machine", "Training set", "Train", "Accuracy", "Bias", "Confidence", "Decide", "Report"];
  const TRAIT_KEYS = M.KEYS;
  const fgLine = (...ids) => `<p class="pm-fgline">${icon("bulb")}<span>Field Guide:</span> ${ids.map(K_.contextButton).join(" ")}</p>`;

  /* ───────── Saving (this device only) and modes ───────── */
  function storeFor(user) {
    const student = user && user.role === "student";
    const key = `stem207.pm.${student ? user.id : "guest"}`;
    let s = null;
    try { s = student ? window.localStorage : window.sessionStorage; } catch (e) { s = null; }
    return {
      load() { try { return JSON.parse((s && s.getItem(key)) || "{}") || {}; } catch (e) { return {}; } },
      save(v) { try { if (s) s.setItem(key, JSON.stringify(v)); } catch (e) { /* storage full or off */ } }
    };
  }
  const MODES = { explorer: "Explorer", investigator: "Investigator", researcher: "Researcher" };
  const MODE_NOTE = { explorer: "Fewer cards and shorter steps", investigator: "The full workshop", researcher: "Extra controls and deeper data" };
  function getMode() { try { const m = localStorage.getItem("stem207.pm.mode"); return MODES[m] ? m : "investigator"; } catch (e) { return "investigator"; } }
  function setMode(m) { try { localStorage.setItem("stem207.pm.mode", m); } catch (e) { /* ignore */ } }

  /* ───────── Small pieces (the shared ones are in pm-ui.js) ───────── */
  const traitCells = (t) => TRAIT_KEYS.map((k) => `<td>${esc(M.traitText(k, t[k]))}</td>`).join("");
  function table(set, o = {}) {
    return `<div class="pm-tablewrap"><table class="pm-table"><caption>${esc(o.caption || "Examples")}</caption>
      <thead><tr><th scope="col">#</th>${TRAIT_KEYS.map((k) => `<th scope="col">${esc(M.TRAIT_NAME[k])}</th>`).join("")}${o.noLabel ? "" : `<th scope="col">Label</th>`}${o.extraHead ? `<th scope="col">${esc(o.extraHead)}</th>` : ""}</tr></thead>
      <tbody>${set.map((e, i) => `<tr><th scope="row">${i + 1}</th>${traitCells(e.traits)}${o.noLabel ? "" : `<td>${e.label ? esc(e.label) : "–"}</td>`}${o.extra ? `<td>${o.extra(e)}</td>` : ""}</tr>`).join("")}</tbody></table></div>`;
  }
  /* The real reasoning behind one prediction: the K neighbors, their votes, and trait-by-trait matches. */
  function why(p, x, o = {}) {
    if (!p) return `<p class="muted">The machine has no examples yet, so it can't predict anything.</p>`;
    const n = p.used, g = p.votes.Glim || 0, nn = p.votes.Norp || 0;
    const parts = [];
    if (g) parts.push(`${g} ${g === 1 ? "was a Glim" : "were Glims"}`);
    if (nn) parts.push(`${nn} ${nn === 1 ? "was a Norp" : "were Norps"}`);
    return `<div class="pm-why">
      <p class="pm-why__say">It compared this creature with its ${n} closest example${n > 1 ? "s" : ""}. ${parts.join(" and ")}, so it predicted <strong>${esc(p.label)}</strong>.</p>
      <p class="pm-why__conf"><span class="pm-meter" aria-hidden="true"><span style="width:${Math.round(p.agree * 100)}%"></span></span><span><strong>Model confidence score: ${pct(p.agree)}</strong> (${p.votes[p.label]} of ${n} nearby examples agree). It's the model's own number, not a promise.</span></p>
      ${p.tieAtEdge ? `<p class="pm-why__tie">${icon("alert")}Some other examples were just as close. The machine used the ones it learned first.</p>` : ""}
      <div class="pm-tablewrap"><table class="pm-table pm-table--why"><caption>The ${n} closest examples (its vote, and how it's different)</caption>
        <thead><tr><th scope="col">Example</th><th scope="col">Vote</th><th scope="col">Traits different</th></tr></thead>
        <tbody>${p.neighbors.map((nb) => `<tr><th scope="row">${M.creature(nb.ex.traits, 40)}</th><td>${tag(nb.ex.label)}</td><td><strong>${nb.distance}</strong>${nb.diffs.length ? `: ${nb.diffs.map((k) => `<span class="pm-diff">${esc(M.TRAIT_NAME[k].toLowerCase())} (${esc(M.traitText(k, nb.ex.traits[k]))})</span>`).join(", ")}` : `: <span class="pm-same">${icon("check")}an exact match</span>`}</td></tr>`).join("")}</tbody></table></div>
      <p class="pm-why__note muted">The machine doesn't understand creatures the way you do. It counts how many traits are different, then lets the closest examples vote.</p>
    </div>`;
  }
  /* A line chart from real results. series: [{ name, values: [0..1 | null], dash }], x: labels. */
  function chart(series, x, o = {}) {
    const w = 460, h = 210, L = 40, R = 96, T = 12, B = 36;
    const px = (i) => L + (x.length > 1 ? (i / (x.length - 1)) * (w - L - R) : (w - L - R) / 2);
    const py = (v) => T + (1 - v) * (h - T - B);
    const lines = series.map((s, si) => {
      const pts = s.values.map((v, i) => (v == null ? null : [px(i), py(v), v, i])).filter(Boolean);
      if (!pts.length) return "";
      const last = pts[pts.length - 1];
      const mark = (p) => si % 2 ? `<rect x="${p[0] - 4.5}" y="${p[1] - 4.5}" width="9" height="9" class="pm-ch__mk pm-ch__mk--${si}"><title>${esc(s.name)}, ${esc(x[p[3]])}: ${pct(p[2])}</title></rect>`
        : `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" class="pm-ch__mk pm-ch__mk--${si}"><title>${esc(s.name)}, ${esc(x[p[3]])}: ${pct(p[2])}</title></circle>`;
      return `<polyline points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}" class="pm-ch__line pm-ch__line--${si} ${s.dash ? "is-dash" : ""}"/>${pts.map(mark).join("")}
        <text x="${last[0] + 8}" y="${last[1] + 4 + (si ? 10 : -4)}" class="pm-ch__lab">${esc(s.short || s.name)} ${pct(last[2])}</text>`;
    }).join("");
    const summary = series.map((s) => `${s.name}: ${s.values.map((v, i) => (v == null ? null : `${x[i]} ${pct(v)}`)).filter(Boolean).join(", ") || "not run yet"}`).join(". ");
    return `<figure class="pm-chart">
      ${series.length > 1 ? `<ul class="pm-legend">${series.map((s, si) => `<li><span class="pm-legend__k pm-legend__k--${si} ${si % 2 ? "is-sq" : ""}" aria-hidden="true"></span>${esc(s.name)}</li>`).join("")}</ul>` : ""}
      <svg viewBox="0 0 ${w} ${h}" class="pm-ch" role="img" aria-label="${esc((o.title || "Chart") + ". " + summary)}">
        ${[0, 0.25, 0.5, 0.75, 1].map((v) => `<line x1="${L}" x2="${w - R + 8}" y1="${py(v)}" y2="${py(v)}" class="pm-ch__grid"/><text x="${L - 6}" y="${py(v) + 4}" text-anchor="end" class="pm-ch__axis">${v * 100}%</text>`).join("")}
        ${x.map((t, i) => `<text x="${px(i)}" y="${h - B + 16}" text-anchor="middle" class="pm-ch__axis">${esc(t)}</text>`).join("")}
        <text x="${(L + w - R) / 2}" y="${h - 4}" text-anchor="middle" class="pm-ch__axis">${esc(o.xLabel || "")}</text>
        ${lines}
      </svg>
      <details class="pm-numbers" data-k="numbers:${esc(o.title || "")}"><summary>Show the numbers</summary>
        <table class="pm-table"><caption>${esc(o.title || "Chart")}</caption><thead><tr><th scope="col">${esc(o.xLabel || "Step")}</th>${series.map((s) => `<th scope="col">${esc(s.name)}</th>`).join("")}</tr></thead>
        <tbody>${x.map((t, i) => `<tr><th scope="row">${esc(t)}</th>${series.map((s) => `<td>${pct(s.values[i])}</td>`).join("")}</tr>`).join("")}</tbody></table>
      </details>
    </figure>`;
  }
  /* Glim/Norp counts for each value of a trait, as text bars. */
  function crossTab(set, trait, values) {
    const d = M.distribution(set).byTrait[trait];
    const vals = values || M.TRAITS[trait];
    return `<div class="pm-tablewrap"><table class="pm-table pm-table--tab"><caption>${esc(M.TRAIT_NAME[trait])} and label</caption><thead><tr><th scope="col">${esc(M.TRAIT_NAME[trait])}</th><th scope="col">${tag("Glim")}</th><th scope="col">${tag("Norp")}</th></tr></thead>
      <tbody>${vals.map((v) => `<tr><th scope="row">${esc(M.traitText(trait, v))}</th><td>${bar(d[v].Glim || 0, set.length)}</td><td>${bar(d[v].Norp || 0, set.length)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  const bar = (n, of) => `<span class="pm-bar"><span class="pm-bar__fill" style="width:${of ? Math.round((n / of) * 100) : 0}%"></span><b>${n}</b></span>`;


  /* ───────── The frame around every stage: progress, mode, and the AI Research Notebook ───────── */
  function frame(el, api, idx, S, st) {
    const done = SE.labs.progressFor(api.user, LAB);
    const mode = getMode();
    el.innerHTML = `<div class="pm pm--${mode}">
      <div class="pm-top">
        <nav class="pm-journey" aria-label="Workshop progress"><ol>${JOURNEY.map((j, i) => `<li class="${i === idx ? "is-here" : ""} ${done.has(i) ? "is-done" : ""}"><a href="#/lab/${LAB}/${i + 1}" ${i === idx ? 'aria-current="step"' : ""}>${done.has(i) ? icon("check") : `<b>${i + 1}</b>`}<span>${j}</span>${done.has(i) ? '<span class="visually-hidden"> (done)</span>' : ""}</a></li>`).join("")}</ol></nav>
        <div class="pm-tools">
          <label class="pm-mode">Mode <select class="input input--small" id="pm-mode">${Object.entries(MODES).map(([k, v]) => `<option value="${k}" ${k === mode ? "selected" : ""}>${v}: ${MODE_NOTE[k]}</option>`).join("")}</select></label>
          <button type="button" class="btn btn--ghost btn--small" id="pm-fg-btn" aria-expanded="false" aria-controls="pm-fg">${icon("bulb")}Field Guide</button>
          <button type="button" class="btn btn--ghost btn--small" id="pm-nb-btn" aria-expanded="false" aria-controls="pm-nb">${icon("list")}Notebook <span class="pm-count">${(S.notebook || []).length}</span></button>
        </div>
      </div>
      <section class="pm-nb pm-fg" id="pm-fg" hidden aria-label="AI Field Guide"></section>
      <section class="pm-nb" id="pm-nb" hidden aria-label="AI Research Notebook"></section>
      <div class="pm-body" id="pm-body"></div>
    </div>`;
    const body = el.querySelector(".lab-body") || document.querySelector(".lab-body");
    if (body) body.classList.add("lab-body--wide");
    el.querySelector("#pm-mode").addEventListener("change", (e) => { setMode(e.target.value); SE.route(true); });
    const nbBtn = el.querySelector("#pm-nb-btn"), nb = el.querySelector("#pm-nb");
    const draw = () => paint(nb, notebookHtml(S));
    nbBtn.addEventListener("click", () => { nb.hidden = !nb.hidden; nbBtn.setAttribute("aria-expanded", String(!nb.hidden)); if (!nb.hidden) draw(); });
    nb.addEventListener("click", (e) => {
      const c = e.target.closest("[data-nbc]");
      if (!c) return;
      const entry = S.notebook.find((n) => n.key === c.dataset.key);
      if (entry) { entry.noticed = c.dataset.nbc; st.save(S); draw(); }
    });
    nb.addEventListener("change", (e) => {
      const t = e.target.closest("[data-nbt]");
      if (!t) return;
      const entry = S.notebook.find((n) => n.key === t.dataset.nbt);
      if (entry) { entry.text = t.value.slice(0, 280); st.save(S); }
    });
    // The AI Field Guide: a panel like the notebook. Context buttons ([data-fg]) anywhere in the stage open a card.
    const fgBtn = el.querySelector("#pm-fg-btn"), fgBox = el.querySelector("#pm-fg");
    const guide = K_.mount(fgBox, S, () => st.save(S), { stage: idx, mode, log: (t, d) => api.log(t, d) });
    const showGuide = (on) => { fgBox.hidden = !on; fgBtn.setAttribute("aria-expanded", String(on)); if (on) guide.render(); };
    fgBtn.addEventListener("click", () => showGuide(fgBox.hidden));
    el.addEventListener("click", (e) => {
      const q = e.target.closest("[data-fg]");
      if (!q || !el.contains(q)) return;
      guide.open(q.dataset.fg); showGuide(true);
      fgBox.scrollIntoView({ block: "nearest" });
      const h = fgBox.querySelector("#pm-fg-h"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    });
    return {
      body: el.querySelector("#pm-body"),
      mode,
      /* Add (or update) an automatic notebook entry with real numbers. */
      note(key, title, facts) {
        S.notebook = S.notebook || [];
        const old = S.notebook.find((n) => n.key === key);
        const entry = Object.assign(old || { key, stage: idx + 1, noticed: "", text: "" }, { title, facts, at: Date.now() });
        if (!old) S.notebook.push(entry);
        st.save(S);
        el.querySelector(".pm-count").textContent = S.notebook.length;
        if (!nb.hidden) draw();
      }
    };
  }
  const NOTICED = [["expected", "It did what I predicted"], ["surprised", "It surprised me"], ["unsure", "I'm not sure why yet"]];
  function notebookHtml(S) {
    const list = S.notebook || [];
    return `<h3>${icon("list")}AI Research Notebook</h3>
      <p class="muted">The lab writes down your experiments here, with the real results. Add what you noticed. Your notes stay on this device.</p>
      ${list.length ? `<ol class="pm-nb__list">${list.map((n) => `<li><p><strong>Stage ${n.stage}: ${esc(n.title)}</strong></p>
        <dl class="pm-facts">${n.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        <div class="pm-chips" role="group" aria-label="What I noticed">${NOTICED.map(([id, t]) => `<button type="button" class="pm-chip" data-nbc="${id}" data-key="${esc(n.key)}" data-k="nb:${esc(n.key)}:${id}" aria-pressed="${n.noticed === id}">${t}</button>`).join("")}</div>
        <label class="pm-field">What I learned (optional) <input class="input input--small" maxlength="280" data-nbt="${esc(n.key)}" value="${esc(n.text || "")}"></label></li>`).join("")}</ol>` : `<p>No experiments yet. Run one and it will show up here.</p>`}`;
  }

  /* ───────── Stage 1: Be the Machine ───────── */
  function mountMachine(el, api) {
    const st = storeFor(api.user), S = st.load(); const F = frame(el, api, 0, S, st);
    const s = (S.s1 = Object.assign({ guess: "", traits: [], revealed: false, firstRule: "", shown: 0, finalRule: "", whyFirst: "", game: null, solved: 0, check: "" }, S.s1 || {}));
    const allB = D.B.start.concat(D.B.breakers);
    const ruleFits = (id, n) => { const r = D.B_RULES.find((x) => x[0] === id); return allB.slice(0, n).every((e) => r[2](e.traits) === (e.label === "Glim")); };
    const save = () => st.save(S);
    function newGame(partner) {
      const rule = partner ? null : D.GAME_RULES[Math.floor(Math.random() * D.GAME_RULES.length)].id;
      const order = SE.shuffle(D.POOL.map((c) => c.id), String(Math.random()));
      s.game = { rule, order, shown: 2, guess: "", partner: !!partner, hidden: false, wrong: 0 };
      save();
    }
    function gameExamples() {
      const r = D.GAME_RULES.find((x) => x.id === s.game.rule);
      const pool = s.game.order.map((id) => D.POOL.find((c) => c.id === id)).map((c) => ({ id: c.id, traits: c.traits, label: r.test(c.traits) ? "Glim" : "Norp" }));
      // Start with one of each so the first two examples aren't both the same kind.
      const firstG = pool.find((e) => e.label === "Glim"), firstN = pool.find((e) => e.label === "Norp");
      return [firstG, firstN].concat(pool.filter((e) => e !== firstG && e !== firstN));
    }
    function render() {
      const ex = F.mode === "explorer";
      const traitsOn = s.traits;
      const shownB = 4 + s.shown;
      const game = s.game;
      paint(F.body, `
        <section class="lab-panel pm-sec">
          <h3><span class="pm-step">1</span>Find the rule</h3>
          ${fgLine("A", "C")}
          <p>A scientist sorted these creatures into <strong>Glims</strong> and <strong>Norps</strong>. Study them. What makes a Glim?</p>
          <div class="pm-row">${D.A.start.map((e) => card(e, { label: e.label })).join("")}<span class="pm-arrow" aria-hidden="true">→</span>${card(D.A.next, { cls: "is-new", body: s.revealed ? tag(D.A.next.label) : `<span class="pm-tag">?</span>` })}</div>
          <div class="pm-q">
            <p><strong>A new creature</strong> (dashed box). Is it a Glim or a Norp?</p>
            <div class="seg" role="group" aria-label="Your prediction">${["Glim", "Norp"].map((l) => b("guess", l, l, "", `aria-pressed="${s.guess === l}" ${s.revealed ? "disabled" : ""}`)).join("")}</div>
            <p>Which traits helped you decide? Choose one or more.</p>
            ${chips("trait", TRAIT_KEYS.map((k) => [k, M.TRAIT_NAME[k]]), traitsOn, true)}
            ${s.revealed ? `<p class="pm-result ${s.guess === D.A.next.label ? "is-good" : "is-warn"}">${icon(s.guess === D.A.next.label ? "check" : "alert")}It's a <strong>${D.A.next.label}</strong>. The scientist's rule: ${esc(D.A.ruleText)} ${traitsOn.includes("horns") ? "You looked at horns too." : `You looked at ${traitsOn.map((k) => M.TRAIT_NAME[k].toLowerCase()).join(" and ")}. Look at the horns on every Glim.`}</p>`
              : b("reveal", "a", `${icon("eye")}Reveal the answer`, "btn btn--primary", s.guess && traitsOn.length ? "" : "disabled")}
          </div>
        </section>
        ${s.revealed ? `<section class="lab-panel pm-sec">
          <h3><span class="pm-step">2</span>The tricky example</h3>
          <p>Here's a new set. ${ex ? "Pick a rule that fits them." : "Pick the rule you think separates Glims from Norps."}</p>
          <div class="pm-row">${allB.slice(0, shownB).map((e, i) => card(e, { label: e.label, cls: i >= 4 ? "is-new" : "" })).join("")}</div>
          ${!s.firstRule ? `<p><strong>My rule:</strong></p>${chips("first", D.B_RULES.map(([id, t]) => [id, t]), s.firstRule)}`
            : `<p class="pm-result">${icon("flag")}Your first rule: <strong>${esc(D.B_RULES.find((r) => r[0] === s.firstRule)[1])}</strong>. ${ruleFits(s.firstRule, 4) ? "It fits the first four." : "Check it: it doesn't fit all four."}</p>
              ${s.shown < 2 ? b("more", "b", `${icon("plus")}A new example arrives`, "btn btn--primary") : ""}
              ${s.shown >= 1 && !ruleFits(s.firstRule, shownB) ? `<p class="pm-result is-warn">${icon("alert")}A new example breaks “${esc(D.B_RULES.find((r) => r[0] === s.firstRule)[1])}”.</p>` : ""}
              ${s.shown >= 2 ? `<p><strong>Pick a rule that fits all six:</strong></p>${chips("final", D.B_RULES.map(([id, t]) => [id, t]), s.finalRule)}
                ${s.finalRule ? (ruleFits(s.finalRule, 6) ? `<p class="pm-result is-good">${icon("check")}That rule fits every example.</p>` : `<p class="pm-result is-warn">${icon("alert")}Check each card. One of them breaks that rule.</p>`) : ""}
                ${s.finalRule && ruleFits(s.finalRule, 6) ? `<p><strong>Why did the color rule seem right at first?</strong></p>${chips("whyfirst", [["happened", "The first examples just happened to fit it"], ["easy", "Color was the easiest thing to see"], ["both", "Both"]], s.whyFirst)}` : ""}` : ""}`}
        </section>` : ""}
        ${s.whyFirst ? `<section class="lab-panel pm-sec">
          <h3><span class="pm-step">3</span>The rule game</h3>
          <p>${ex ? "Find the secret rule. Ask for examples one at a time." : "A secret rule sorts the creatures. See examples one at a time, and guess the rule using as few examples as you can."}</p>
          ${!game ? `<div class="pm-row">${b("game", "solo", `${icon("rocket")}Play on my own`, "btn btn--primary")}${b("game", "partner", `${icon("users")}Play with a partner`)}</div>`
            : game.partner && !game.rule ? `<p><strong>Partner A:</strong> pick a secret rule while Partner B looks away. The rule hides as soon as you pick it.</p>${chips("prule", D.GAME_RULES.map((r) => [r.id, r.text]), "")}`
            : `${(() => { const list = gameExamples().slice(0, game.shown); return `<div class="pm-row">${list.map((e) => card(e, { label: e.label, size: 56 })).join("")}</div>`; })()}
              <div class="pm-row">${b("gmore", "x", `${icon("plus")}Show another example`, "btn btn--ghost btn--small", game.shown >= 12 || game.done ? "disabled" : "")}<span class="muted">${game.shown} examples shown</span></div>
              ${game.done ? `<p class="pm-result is-good">${icon("check")}Solved with ${game.shown} examples! The rule: ${esc(D.GAME_RULES.find((r) => r.id === game.rule).text)}.</p>${b("game", game.partner ? "partner" : "solo", `${icon("refresh")}Play again`)}`
                : `<p><strong>Guess the rule:</strong></p>${chips("gguess", D.GAME_RULES.map((r) => [r.id, r.text]), game.guess)}`}`}
        </section>` : ""}
        ${s.solved ? `<section class="lab-panel pm-sec">
          <h3>${icon("target")}Checkpoint</h3>
          <p>What did the tricky example show you?</p>
          ${chips("check", [["many", "Several rules can fit a few examples. A new example can show which one is wrong."], ["prove", "A few examples always prove a rule."], ["machine", "Machines learn exactly the way people do."]], s.check)}
          ${s.check && s.check !== "many" ? `<p class="pm-result is-warn">${icon("alert")}${s.check === "prove" ? "Think about the color rule. It fit the first four examples, then broke." : "This was a game to feel what learning from examples is like. Machines don't think the way people do."}</p>` : ""}
        </section>` : ""}`);
    }
    function finish() {
      if (s.check !== "many" || !s.solved || !s.revealed || !ruleFits(s.finalRule, 6)) return;
      F.note("s1", "Be the machine", [["First rule", D.B_RULES.find((r) => r[0] === s.firstRule)[1]], ["Rule that fit all six", D.B_RULES.find((r) => r[0] === s.finalRule)[1]], ["Rule game solved", `${s.solved} time${s.solved > 1 ? "s" : ""}`]]);
      api.say("You found patterns in examples, and changed your rule when a new example broke it. That's the idea behind machine learning.", "good");
      api.win({ firstRule: s.firstRule, solved: s.solved });
    }
    delegate(el, {
      guess: (l) => { s.guess = l; save(); render(); },
      trait: (k) => { if (s.revealed) return; s.traits = s.traits.includes(k) ? s.traits.filter((x) => x !== k) : s.traits.concat(k); save(); render(); },
      reveal: () => { s.revealed = true; save(); render(); api.say(s.guess === D.A.next.label ? "Right! You found the pattern." : "Not this time. Compare its horns with the Glims' horns.", s.guess === D.A.next.label ? "good" : "info"); },
      first: (id) => { s.firstRule = id; save(); render(); },
      more: () => { s.shown = Math.min(2, s.shown + 1); save(); render(); api.say(ruleFits(s.firstRule, 4 + s.shown) ? "Your rule still fits. Keep watching." : "This example breaks your rule. What else could the rule be?", "info"); },
      final: (id) => { s.finalRule = id; save(); render(); },
      whyfirst: (id) => { s.whyFirst = id; save(); render(); },
      game: (kind) => { newGame(kind === "partner"); render(); },
      prule: (id) => { s.game.rule = id; save(); render(); api.say("Rule hidden. Partner B: look at the examples and guess the rule.", "info"); },
      gmore: () => { s.game.shown++; save(); render(); },
      gguess: (id) => {
        const g = s.game; g.guess = id;
        const list = gameExamples().slice(0, g.shown);
        const r = D.GAME_RULES.find((x) => x.id === id);
        if (id === g.rule) { g.done = true; s.solved++; api.log("lab_test_run", { game: g.shown }); api.say(`Solved with ${g.shown} examples.`, "good"); }
        else {
          const bad = list.find((e) => r.test(e.traits) !== (e.label === "Glim"));
          api.say(bad ? `“${r.text}” doesn't fit one of the examples: the ${M.describe(bad.traits)} is a ${bad.label}.` : `“${r.text}” fits every example so far, but it isn't the secret rule. Show another example to find out why.`, "warn");
        }
        save(); render(); finish();
      },
      check: (id) => { s.check = id; save(); render(); finish(); }
    });
    render();
  }

  /* ───────── Stage 2: Build the Training Set ───────── */
  const s2Defaults = () => ({ rule: "", labels: [], fixes: 0, hyp: "", reason: "", view: "cards", picking: false });
  function trainingFromS2(S) { return (S.s2 && S.s2.labels || []).map(([id, label]) => { const c = D.POOL.find((p) => p.id === id); return c && { id, traits: c.traits, label }; }).filter(Boolean); }
  function mountTrainingSet(el, api) {
    const st = storeFor(api.user), S = st.load(); const F = frame(el, api, 1, S, st);
    const s = (S.s2 = Object.assign(s2Defaults(), S.s2 || {}));
    const ex = F.mode === "explorer";
    const rules = ex ? D.SECRET_RULES.slice(0, 3) : D.SECRET_RULES;
    const pool = ex ? D.POOL.slice(0, 16) : D.POOL;
    const need = ex ? 6 : 8;
    const save = () => st.save(S);
    const rule = () => D.SECRET_RULES.find((r) => r.id === s.rule);
    const labelOf = (id) => (s.labels.find((x) => x[0] === id) || [])[1];
    const breaks = (id) => { const l = labelOf(id), r = rule(); const c = D.POOL.find((p) => p.id === id); return l && r && (r.test(c.traits) ? "Glim" : "Norp") !== l; };
    function render() {
      const r = rule();
      const set = trainingFromS2(S);
      const g = set.filter((e) => e.label === "Glim").length, n = set.length - g;
      const flagged = s.labels.filter(([id]) => breaks(id)).length;
      const missing = r ? r.traits.flatMap((t) => M.TRAITS[t].filter((v) => !set.some((e) => e.traits[t] === v)).map((v) => M.traitText(t, v))) : [];
      paint(F.body, !r || s.picking ? `
        <section class="lab-panel pm-sec">
          <h3><span class="pm-step">1</span>Invent the secret rule</h3>
          <p>You decide what makes a Glim. The machine will <strong>never</strong> see your rule. It only gets the examples you label.</p>
          ${fgLine("B")}
          ${chips("rule", rules.map((x) => [x.id, ex ? x.simple : x.text]), s.rule)}
          ${s.picking && s.labels.length ? `<p class="muted pm-small">Picking a different rule starts a new training set. Picking the same rule keeps your labels.</p>` : ""}
        </section>` : `
        <div class="pm-split">
          <section class="lab-panel pm-sec">
            <div class="pm-head"><h3><span class="pm-step">2</span>Label creatures for the training set</h3>
              <div class="seg" role="group" aria-label="View">${b("view", "cards", "Cards", "", `aria-pressed="${s.view === "cards"}"`)}${b("view", "table", "Table", "", `aria-pressed="${s.view === "table"}"`)}</div></div>
            <p class="pm-secret">${icon("lock")}<span>Your secret rule: <strong>${esc(ex ? r.simple : r.text)}</strong> ${b("change", "x", "Change", "btn btn--ghost btn--small pm-link")}</span></p>
            <p class="muted">Label a creature to add it to the training set. Label at least ${need}, with some of each kind. ${K_.contextButton("B")}</p>
            ${s.view === "cards" ? `<div class="pm-row pm-row--pool">${pool.map((c) => { const l = labelOf(c.id); return card(c, { size: 56, cls: `${l ? "is-in" : ""} ${breaks(c.id) ? "is-flag" : ""}`, body: `<span class="seg seg--tiny" role="group" aria-label="Label for creature ${D.POOL.indexOf(c) + 1}">${["Glim", "Norp"].map((x) => b("label", `${c.id}|${x}`, x, "", `aria-pressed="${l === x}"`)).join("")}</span>${l ? b("remove", c.id, `${icon("trash")}<span class="visually-hidden">Remove from training set</span>`, "pm-x") : ""}${breaks(c.id) ? `<span class="pm-flag">${icon("alert")}Check this label</span>` : ""}` }); }).join("")}</div>`
              : table(pool.map((c) => ({ ...c, label: labelOf(c.id) })), { caption: "Creatures to label", extraHead: "Label it", extra: (c) => `<span class="seg seg--tiny" role="group" aria-label="Label for creature ${D.POOL.indexOf(c) + 1}">${["Glim", "Norp"].map((x) => b("label", `${c.id}|${x}`, x, "", `aria-pressed="${c.label === x}"`)).join("")}</span>${breaks(c.id) ? ` <span class="pm-flag">${icon("alert")}Check this label</span>` : ""}` })}
          </section>
          <section class="lab-panel pm-sec pm-stats" aria-live="polite">
            <h3>${icon("chart")}Your training set</h3>
            <p class="pm-big"><strong>${set.length}</strong> examples · ${tag("Glim")} ${g} · ${tag("Norp")} ${n}</p>
            ${bar(g, Math.max(1, set.length))}
            ${flagged ? `<p class="pm-result is-warn">${icon("alert")}${flagged} label${flagged > 1 ? "s" : ""} break${flagged > 1 ? "" : "s"} your own rule. The machine learns whatever you label, mistakes too.</p>` : ""}
            ${set.length ? r.traits.map((t) => crossTab(set, t)).join("") : ""}
            ${set.length && missing.length ? `<p class="pm-result">${icon("search")}Not in your training set yet: ${missing.map(esc).join(", ")}.</p>` : ""}
            ${s.fixes ? `<p class="muted">Labels you corrected: ${s.fixes}</p>` : ""}
            <p class="muted">Equal numbers of Glims and Norps is one thing to check. Covering different kinds of creatures matters too.</p>
          </section>
        </div>
        <section class="lab-panel pm-sec">
          <h3><span class="pm-step">3</span>Make a prediction</h3>
          <p>What do you think would happen if the machine trained on <strong>lots of Glims and only a few Norps</strong>?</p>
          ${chips("hyp", [["moreglim", "It would guess Glim more often"], ["same", "It wouldn't change anything"], ["unsure", "I'm not sure. I'd test it"]], s.hyp)}
          <p>Why did you choose the examples you did?</p>
          ${chips("reason", [["both", "I included both kinds"], ["variety", "I picked creatures that look different from each other"], ["ruletraits", "I included every kind of the trait in my rule"], ["balance", "I kept the numbers of Glims and Norps close"]], s.reason)}
          ${b("check", "x", `${icon("check")}Check my training set`, "btn btn--primary")}
        </section>`);
    }
    function check() {
      const set = trainingFromS2(S), g = set.filter((e) => e.label === "Glim").length;
      const flagged = s.labels.filter(([id]) => breaks(id)).length;
      if (set.length < need) return api.say(`Your training set has ${set.length} examples. Label at least ${need}.`, "warn");
      if (!g || g === set.length) return api.say(`Every example is a ${set[0].label}. The machine needs examples of both kinds to tell them apart.`, "warn");
      if (flagged) return api.say(`${flagged} label${flagged > 1 ? "s" : ""} break${flagged > 1 ? "" : "s"} your rule. Look for “Check this label” and fix ${flagged > 1 ? "them" : "it"}.`, "warn");
      if (!s.hyp || !s.reason) return api.say("Answer the two questions under “Make a prediction.”", "warn");
      F.note("s2", "My training set", [["Secret rule", rule().text], ["Examples", String(set.length)], ["Glims / Norps", `${g} / ${set.length - g}`], ["Labels corrected", String(s.fixes)]]);
      api.log("lab_test_run", { examples: set.length, glims: g, rule: s.rule });
      api.say(`Your training set is ready: ${set.length} examples, ${g} Glims and ${set.length - g} Norps.`, "good");
      api.win({ rule: s.rule, examples: set.length, glims: g, fixes: s.fixes });
    }
    delegate(el, {
      rule: (id) => { if (id !== s.rule) { s.rule = id; s.labels = []; s.fixes = 0; } s.picking = false; save(); render(); },
      change: () => { s.picking = true; save(); render(); },
      view: (v) => { s.view = v; save(); render(); },
      label: (v) => {
        const [id, l] = v.split("|");
        const was = breaks(id);
        const i = s.labels.findIndex((x) => x[0] === id);
        if (i >= 0) s.labels[i][1] = l; else if (s.labels.length < M.MAX_TRAIN) s.labels.push([id, l]);
        if (was && !breaks(id)) s.fixes++;
        save(); render();
      },
      remove: (id) => { s.labels = s.labels.filter((x) => x[0] !== id); save(); render(); },
      hyp: (id) => { s.hyp = id; save(); render(); },
      reason: (id) => { s.reason = id; save(); render(); },
      check
    });
    render();
  }

  /* ───────── Stage 3: Train and Inspect ─────────
     The training edits, the trained model, and K are saved (s3.train / s3.model as [id, label] pairs), so
     changes survive leaving the stage. Older saves without s3.train start from the stage 2 set, as before.
     Required: test 3 creatures, step through Inside the Machine once, run Change One Thing once, and change a
     training example so a prediction flips (then name it). */
  function mountInspect(el, api) {
    const st = storeFor(api.user), S = st.load(); const F = frame(el, api, 2, S, st);
    const rule = D.SECRET_RULES.find((r) => r.id === (S.s2 && S.s2.rule)) || D.SECRET_RULES[0];
    const fromS2 = trainingFromS2(S);
    const sample = fromS2.length < 4 || new Set(fromS2.map((e) => e.label)).size < 2;
    const base = sample ? D.labelWith(rule, D.POOL.slice(0, 10)) : fromS2;
    const s = (S.s3 = Object.assign({ whys: [], flip: null, found: false, edits: 0, train: null, model: null, K: 3, ivDone: false, cfDone: false }, S.s3 || {}));
    s.whys = s.whys || [];
    const pairs = (list) => list.map((e) => [e.id, e.label]);
    const resolve = (p) => (p || []).map(([id, label]) => { const c = D.POOL.find((x) => x.id === id); return c && { id, traits: c.traits, label }; }).filter(Boolean);
    if (!Array.isArray(s.train) || !s.train.length) { s.train = pairs(base); st.save(S); }
    let train = resolve(s.train);
    const tests = D.labelWith(rule, D.TESTPOOL.slice(0, F.mode === "explorer" ? 8 : 12));
    let K = [1, 3, 5].includes(s.K) ? s.K : 3;
    let trained = s.model && s.model.length ? resolve(s.model) : null;
    let dirty = !trained || JSON.stringify(s.model) !== JSON.stringify(s.train);
    let sel = null, current = null, last = {}, pending = [], chosen = null, iv = {}, cf = {};
    const save = () => { s.train = pairs(train); s.K = K; st.save(S); };
    const sameAsBase = () => JSON.stringify(pairs(train)) === JSON.stringify(pairs(base));
    function doTrain() {
      const before = last;
      trained = train.map((e) => ({ id: e.id, traits: e.traits, label: e.label }));
      s.model = pairs(trained);
      dirty = false;
      last = {};
      Object.keys(before).forEach((id) => {
        const t = tests.find((x) => x.id === id), p = M.knn(trained, t.traits, { K });
        last[id] = { label: p.label, near: p.neighbors.map((n) => n.ex.id) };
        if (before[id].label !== p.label && pending.length && !s.flip) s.flip = { test: id, from: before[id].label, to: p.label, edits: pending.slice(), near: before[id].near };
      });
      pending = [];
      save();
      api.log("lab_test_run", { examples: trained.length, k: K });
    }
    const tasks = () => [
      ["Test 3 new creatures", s.whys.length >= 3],
      ["Step through Inside the Machine", !!s.ivDone],
      ["Change One Thing about a creature", !!s.cfDone],
      ["Change a training example so a prediction flips, then find it", !!s.found]
    ];
    function render() {
      const x = current && tests.find((t) => t.id === current);
      const p = x && trained ? M.knn(trained, x.traits, { K }) : null;
      const flipT = s.flip && tests.find((t) => t.id === s.flip.test);
      const T = tasks();
      paint(F.body, `
        ${sample ? `<p class="pm-result">${icon("alert")}You haven't built a training set in stage 2 yet, so this uses a sample one (rule: ${esc(rule.text)}).</p>` : ""}
        <div class="pm-bench pm-bench--two">
          <section class="lab-panel pm-sec" aria-labelledby="pm-tr-h">
            <h3 id="pm-tr-h">${icon("box")}Training examples <span class="muted">(${train.length})</span></h3>
            <div class="pm-row pm-row--mini">${train.map((e) => `<button type="button" class="pm-mini ${sel === e.id ? "is-sel" : ""}" data-act="sel" data-id="${e.id}" data-k="sel:${e.id}" aria-pressed="${sel === e.id}" aria-label="${esc(M.describe(e.traits))}, labeled ${e.label}">${M.creature(e.traits, 40, " ")}${tag(e.label)}</button>`).join("")}</div>
            ${sel ? `<div class="pm-row">${b("relabel", sel, `${icon("refresh")}Change label`)}${b("drop", sel, `${icon("trash")}Remove`)}</div>` : `<p class="muted pm-small">Tap an example to change its label or remove it. Your changes are saved.</p>`}
            <div class="pm-row">${b("train", "x", `${icon("ai")}${trained ? "Update the model" : "Train the model"}`, `btn ${dirty ? "btn--primary" : "btn--ghost"}`)}${F.mode === "researcher" ? `<label class="pm-field pm-field--inline">Neighbors (K) <select class="input input--small" id="pm-k">${[1, 3, 5].map((k) => `<option ${k === K ? "selected" : ""}>${k}</option>`).join("")}</select></label>` : ""}</div>
            <p class="muted pm-small">${trained ? (dirty ? "You changed the examples. Update the model to use them." : "Training this kind of machine means storing your examples so it can compare new creatures with them.") : "Press Train: the machine stores your examples."} ${K_.contextButton("D")}</p>
            ${!sameAsBase() ? `<p class="pm-small">${b("reseed", "x", `${icon("refresh")}Start again from my ${sample ? "sample" : "stage 2"} set`, "btn btn--ghost btn--small pm-link")}</p>` : ""}
          </section>
          <section class="lab-panel pm-sec" aria-labelledby="pm-te-h">
            <h3 id="pm-te-h">${icon("search")}New creatures</h3>
            <p class="muted pm-small">The machine has never seen these.</p>
            <div class="pm-row pm-row--mini">${tests.map((t, i) => `<button type="button" class="pm-mini ${current === t.id ? "is-sel" : ""}" data-act="pick" data-id="${t.id}" data-k="pick:${t.id}" aria-pressed="${current === t.id}" aria-label="New creature ${i + 1}: ${esc(M.describe(t.traits))}${last[t.id] ? `, machine said ${last[t.id].label}` : ""}">${M.creature(t.traits, 40, " ")}${last[t.id] ? tag(last[t.id].label) : `<span class="pm-tag">?</span>`}</button>`).join("")}</div>
            ${x ? `<div class="pm-test">${M.creature(x.traits, 72)}<div>${p ? `<p class="pm-big">The machine predicts ${tag(p.label)}</p>${b("goiv", "x", `${icon("search")}Step inside the machine`, "btn btn--primary btn--small")}` : `<p>${trained ? "" : "Train the model first."}</p>`}</div></div>` : `<p>Pick a new creature to test.</p>`}
          </section>
        </div>
        ${x && p ? `<div class="pm-split pm-split--iv">
          <div class="lab-panel pm-sec pm-evidence">${X.insideHtml(Object.assign({}, iv, { train: trained, x, truth: x.label, K }))}</div>
          <div class="lab-panel pm-sec">${X.cfHtml(Object.assign({}, cf, { train: trained, x, K }))}</div>
        </div>` : ""}
        <section class="lab-panel pm-sec">
          <h3>${icon("target")}Checkpoint</h3>
          <ol class="pm-tasks">${T.map(([t, done], i) => `<li class="${done ? "is-done" : ""}">${done ? icon("check") : `<b>${i + 1}</b>`}<span>${esc(t)}${i === 0 ? ` (${Math.min(3, s.whys.length)} of 3)` : ""}</span>${done ? '<span class="visually-hidden"> (done)</span>' : ""}</li>`).join("")}</ol>
          <p class="muted pm-small">For the last one: change the label of an example (or remove one), then update the model. Did a prediction change?</p>
          ${s.flip && flipT ? `<div class="pm-flipbox"><p class="pm-result is-good">${icon("refresh")}Your change flipped a prediction: this creature went from ${tag(s.flip.from)} to ${tag(s.flip.to)}.</p>
            <div class="pm-row">${card(flipT, { size: 64 })}<p>Which training example caused the change?</p></div>
            <div class="pm-row">${uniq(s.flip.edits.concat(s.flip.near)).map((id) => { const e = D.POOL.find((c) => c.id === id); return e ? `<button type="button" class="pm-mini ${chosen === id ? "is-sel" : ""}" data-act="cause" data-id="${id}" data-k="cause:${id}" aria-pressed="${chosen === id}" aria-label="${esc(M.describe(e.traits))}">${M.creature(e.traits, 40, " ")}</button>` : ""; }).join("")}</div>
            ${s.found ? `<p class="pm-result is-good">${icon("check")}Yes. That example was one of the closest ones, so changing it changed the vote.</p>` : ""}</div>` : ""}
          <p class="muted pm-small">This lab shows one kind of machine learning: comparing with examples. Other AI systems, like chatbots, work in different ways.</p>
        </section>`);
      const kSel = el.querySelector("#pm-k");
      if (kSel) kSel.addEventListener("change", (e) => { K = Number(e.target.value); dirty = true; save(); render(); api.say(`The machine will now use the ${K} closest example${K > 1 ? "s" : ""}. Update the model.`, "info"); });
    }
    const uniq = (a) => [...new Set(a)];
    function finish() {
      if (tasks().every((t) => t[1])) {
        F.note("s3", "Train and inspect", [["Training examples", String(train.length)], ["Creatures I inspected", String(s.whys.length)], ["One Thing I changed", s.cfLast || "–"], ["Prediction that flipped", `${s.flip.from} → ${s.flip.to}`]]);
        api.win({ inspected: s.whys.length, edits: s.edits, iv: 1, cf: 1 });
      }
    }
    const handlers = {
      sel: (id) => { sel = sel === id ? null : id; render(); },
      goiv: () => { const p = el.querySelector(".pm-iv"); if (p) { p.scrollIntoView({ block: "start" }); const h = p.querySelector("h4"); h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } },
      relabel: (id) => { const e = train.find((t) => t.id === id); e.label = e.label === "Glim" ? "Norp" : "Glim"; pending.push(id); s.edits++; dirty = true; save(); render(); api.say(`You changed that example to ${e.label}. Update the model to use it.`, "info"); },
      drop: (id) => { if (train.length <= 2) return api.say("Keep at least 2 examples.", "warn"); train = train.filter((t) => t.id !== id); pending.push(id); s.edits++; sel = null; dirty = true; save(); render(); },
      reseed: () => { train = base.map((e) => ({ ...e })); sel = null; dirty = true; save(); render(); api.say("Your training set is back to how it started. Update the model to use it.", "info"); },
      train: () => {
        doTrain(); render();
        if (s.flip && !s.found) api.say("A prediction changed! Which example caused it?", "good");
        else api.say(`The model stored ${trained.length} examples. Test a new creature.`, "info");
      },
      pick: (id) => {
        current = id; iv = { step: 1, reached: 1 }; cf = {};
        if (!trained) { render(); return api.say("Train the model first, then test.", "info"); }
        const t = tests.find((x) => x.id === id), p = M.knn(trained, t.traits, { K });
        last[id] = Object.assign(last[id] || {}, { label: p.label, near: p.neighbors.map((n) => n.ex.id) });
        if (!s.whys.includes(id)) { s.whys.push(id); save(); }
        render(); finish();
      },
      cause: (id) => {
        chosen = id;
        if (s.flip.edits.includes(id)) { s.found = true; save(); render(); api.say("You found it. One training example can change what the machine predicts.", "good"); finish(); }
        else { render(); api.say("That example didn't change. Which one did you edit?", "warn"); }
      }
    };
    ["iv-step", "iv-feat", "iv-guess", "iv-reveal", "iv-reset"].forEach((a) => {
      handlers[a] = (id) => {
        X.act(iv, a, id);
        if (iv.done && !s.ivDone) { s.ivDone = true; save(); api.say("You followed the whole decision: features, distances, nearest neighbors, and the vote.", "good"); }
        render(); finish();
      };
    });
    ["cf-trait", "cf-value", "cf-run", "cf-reset"].forEach((a) => {
      handlers[a] = (id) => {
        const x = tests.find((t) => t.id === current);
        Object.assign(cf, { train: trained, x, K });
        X.cfAct(cf, a, id);
        if (a === "cf-run" && cf.result) {
          const r = cf.result;
          s.cfDone = true; s.cfLast = `${M.TRAIT_NAME[r.trait]}: ${M.traitText(r.trait, r.from)} → ${M.traitText(r.trait, r.to)} (${r.changed ? "prediction changed" : "no change"})`; save();
          api.log("lab_test_run", { cf: r.trait, changed: r.changed ? 1 : 0 });
          api.say(r.changed ? `Changing ${M.TRAIT_NAME[r.trait].toLowerCase()} flipped the prediction to ${r.after.label}.` : `Changing ${M.TRAIT_NAME[r.trait].toLowerCase()} didn't change the prediction. Try another trait.`, "info");
        }
        render(); finish();
      };
    });
    delegate(el, handlers);
    render();
  }

  /* ───────── Stage 4: The Accuracy Experiment ───────── */
  function curveFor(kind, steps) {
    const pool = kind === "same" ? D.CD.same : D.CD.variety;
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const tr = D.CD.base.concat(pool.slice(0, i * D.CD.batch));
      out.push({ test: M.evaluate(tr, D.CD.test).overall, train: tr.filter((e) => M.knn(tr, e.traits).label === e.label).length / tr.length });
    }
    return out;
  }
  function mountAccuracy(el, api) {
    const st = storeFor(api.user), S = st.load(); const F = frame(el, api, 3, S, st);
    const s = (S.s4 = Object.assign({ pred: "", steps: { same: -1, variety: -1 }, showTrain: false, explain: "", down: "", q20: "" }, S.s4 || {}));
    const save = () => st.save(S);
    const B = 3;
    function render() {
      const cs = s.steps.same >= 0 ? curveFor("same", s.steps.same) : [], cv = s.steps.variety >= 0 ? curveFor("variety", s.steps.variety) : [];
      const x = [0, 1, 2, 3].map((i) => String(D.CD.base.length + i * D.CD.batch));
      const series = [{ name: "More of the same: test", short: "Same", values: x.map((_, i) => (cs[i] ? cs[i].test : null)) }, { name: "More variety: test", short: "Variety", values: x.map((_, i) => (cv[i] ? cv[i].test : null)), dash: true }];
      if (s.showTrain) series.push({ name: "More of the same: training", short: "Same (training)", values: x.map((_, i) => (cs[i] ? cs[i].train : null)) }, { name: "More variety: training", short: "Variety (training)", values: x.map((_, i) => (cv[i] ? cv[i].train : null)), dash: true });
      const both = s.steps.same === B && s.steps.variety === B;
      const run = (kind, title, pool) => {
        const n = s.steps[kind];
        return `<section class="lab-panel pm-sec pm-run">
          <h3>${kind === "same" ? "A" : "B"}. ${title}</h3>
          <p class="muted pm-small">${kind === "same" ? "Add creatures that look a lot like the ones the machine already has." : "Add creatures with combinations it hasn't seen."}</p>
          ${n < 0 ? b("start", kind, `${icon("rocket")}Start from the baseline`, "btn btn--primary", s.pred ? "" : "disabled")
            : `<div class="pm-row pm-row--mini">${D.CD.base.map((e) => card(e, { size: 40, label: e.label, cls: "pm-card--mini" })).join("")}${pool.slice(0, n * D.CD.batch).map((e) => card(e, { size: 40, label: e.label, cls: "pm-card--mini is-new" })).join("")}</div>
              <p class="pm-big">${D.CD.base.length + n * D.CD.batch} examples · test accuracy <strong>${pct((kind === "same" ? cs : cv)[n].test)}</strong></p>
              <div class="pm-row">${n < B ? b("add", kind, `${icon("plus")}Add the next 3 examples`, "btn btn--primary") : `<span class="pm-ok">${icon("check")}Run finished</span>`}${b("reset", kind, `${icon("refresh")}Back to the baseline`)}</div>`}
        </section>`;
      };
      const fs = cs[B] && cv[B];
      paint(F.body, `
        <section class="lab-panel pm-sec">
          <h3><span class="pm-step">1</span>Predict</h3>
          <p>Both runs start with the same 4 examples, and both take the same 16-creature test the machine never trains on. Which will help more?</p>
          ${fgLine("E")}
          ${chips("pred", [["same", "9 more of the same"], ["variety", "9 different ones"], ["tie", "About the same"]], s.pred)}
          <details class="pm-vocab" data-k="vocab"><summary>Words to know</summary><dl>
            <div><dt>Training examples</dt><dd>The labeled examples the model learns from.</dd></div>
            <div><dt>Test examples</dt><dd>New examples used to check the model. It never trains on them.</dd></div>
            <div><dt>Accuracy</dt><dd>How many test predictions the machine got right.</dd></div>
            <div><dt>Generalization</dt><dd>How well a model works on examples it didn't train on.</dd></div></dl></details>
        </section>
        <div class="pm-split pm-split--runs">${run("same", "More of the same", D.CD.same)}${run("variety", "More variety", D.CD.variety)}</div>
        <section class="lab-panel pm-sec">
          <div class="pm-head"><h3>${icon("chart")}Test accuracy as examples are added</h3>
            <label class="pm-check"><input type="checkbox" id="pm-train-acc" ${s.showTrain ? "checked" : ""}> Also show accuracy on its own training examples</label></div>
          ${chart(series, x, { title: "Accuracy on the 16 test creatures", xLabel: "Training examples" })}
          ${s.showTrain ? `<p class="pm-result">${icon("alert")}On its own training examples the machine scores high, because it has seen them. That's not proof it works on new creatures. Only the test set shows that.</p>` : ""}
        </section>
        ${both ? `<section class="lab-panel pm-sec">
          <h3><span class="pm-step">3</span>What does your evidence show?</h3>
          <p>How did the two runs end?</p>
          ${chips("explain", [["variety", "More variety ended higher"], ["same", "More of the same ended higher"], ["tie", "They ended the same"]], s.explain)}
          <p>When you added examples, did test accuracy ever go <strong>down</strong>?</p>
          ${chips("down", [["yes", "Yes, at least once"], ["no", "No, never"]], s.down)}
          <p>Would you rather give a machine 20 nearly identical examples, or 10 carefully chosen different ones?</p>
          ${chips("q20", [["20", "20 nearly identical"], ["10", "10 different ones"], ["depends", "It depends on which examples, so I'd test it"]], s.q20)}
          ${b("done", "x", `${icon("check")}Record my findings`, "btn btn--primary")}
          ${fs ? `<p class="muted pm-small">Your result: more of the same ${pct(cs[B].test)}, more variety ${pct(cv[B].test)}.</p>` : ""}
        </section>` : ""}`);
      const cb = el.querySelector("#pm-train-acc");
      if (cb) cb.addEventListener("change", (e) => { s.showTrain = e.target.checked; save(); render(); });
    }
    function done() {
      const cs = curveFor("same", B), cv = curveFor("variety", B);
      const end = cv[B].test > cs[B].test ? "variety" : cv[B].test < cs[B].test ? "same" : "tie";
      const wentDown = [cs, cv].some((c) => c.some((v, i) => i && v.test < c[i - 1].test - 1e-9));
      if (s.explain !== end) return api.say(`Check the chart again: more of the same ended at ${pct(cs[B].test)}, and more variety at ${pct(cv[B].test)}.`, "warn");
      if ((s.down === "yes") !== wentDown) return api.say("Follow each line on the chart from left to right. Does either one ever step down?", "warn");
      if (!s.q20) return api.say("Answer the last question too.", "warn");
      F.note("s4", "The accuracy experiment", [["My prediction", { same: "More of the same", variety: "More variety", tie: "About the same" }[s.pred]], ["More of the same", cs.map((v) => pct(v.test)).join(" → ")], ["More variety", cv.map((v) => pct(v.test)).join(" → ")], ["Test creatures", String(D.CD.test.length)]]);
      api.log("lab_test_run", { same: Math.round(cs[B].test * 100), variety: Math.round(cv[B].test * 100) });
      api.say(s.q20 === "depends" ? "Good thinking: it depends on the examples, and your test shows which ones helped." : s.q20 === "10" ? `In your experiment, variety helped more (${pct(cv[B].test)} vs ${pct(cs[B].test)}). On a different task, test it again.` : `In your experiment, the near-copies ended at ${pct(cs[B].test)} and the varied ones at ${pct(cv[B].test)}. Would that change your answer?`, "good");
      api.win({ same: Math.round(cs[B].test * 100), variety: Math.round(cv[B].test * 100), pred: s.pred });
    }
    delegate(el, {
      pred: (id) => { s.pred = id; save(); render(); },
      start: (k) => { s.steps[k] = 0; save(); render(); },
      add: (k) => {
        const before = curveFor(k, s.steps[k])[s.steps[k]].test;
        s.steps[k] = Math.min(B, s.steps[k] + 1); save(); render();
        const now = curveFor(k, s.steps[k])[s.steps[k]].test;
        api.say(now < before ? `Accuracy dropped from ${pct(before)} to ${pct(now)} after adding examples. That can happen. Which examples changed, and what do you notice?` : now > before ? `Accuracy went from ${pct(before)} to ${pct(now)}.` : `Accuracy stayed at ${pct(now)}. These examples didn't teach the machine anything new about the test creatures.`, "info");
      },
      reset: (k) => { s.steps[k] = 0; save(); render(); api.say("Back to the same 4 starting examples. Your other run is still on the chart.", "info"); },
      explain: (id) => { s.explain = id; save(); render(); },
      down: (id) => { s.down = id; save(); render(); },
      q20: (id) => { s.q20 = id; save(); render(); },
      done
    });
    render();
  }

  /* ───────── Stage 5: Bias Detective ───────── */
  const HYPS = [["shortcut", "In the training data, the Glims were all orange and the Norps were all blue, so color became a shortcut"], ["broken", "The machine is broken"], ["few", "There weren't enough examples in total"], ["hard", "Blue creatures are harder to tell apart"]];
  function mountBias(el, api) {
    const st = storeFor(api.user), S = st.load(); const F = frame(el, api, 4, S, st);
    const s = (S.s5 = Object.assign({ tested: false, trait: "color", group: null, hyp: "", train: D.E.train.map((e) => e.id), attempts: 0, after: null, explain: "", next: "" }, S.s5 || {}));
    const save = () => st.save(S);
    const byId = (id) => D.E.train.concat(D.E.candidates).find((e) => e.id === id);
    const trainSet = () => s.train.map(byId);
    const before = M.evaluate(D.E.train, D.E.test);
    const groupStats = (res) => { const c = res.items.filter((i) => D.E.counter(i.ex)); return { n: c.length, correct: c.filter((i) => i.correct).length }; };
    const bg = groupStats(before);
    function render() {
      const res = s.after ? M.evaluate(trainSet(), D.E.test) : before;
      const groups = res.byGroup(s.trait);
      const mistakes = res.items.filter((i) => !i.correct);
      const hypOk = s.hyp === "shortcut";
      paint(F.body, `
        <section class="lab-panel pm-sec">
          <h3>${icon("search")}The case</h3>
          <p>The AI Research Crew has a problem. The machine keeps getting some creatures wrong. The real rule is simple: <strong>pointy horns make a Glim</strong>. Investigate the training data and find out what went wrong.</p>
          ${fgLine("F")}
          ${!s.tested ? b("test", "x", `${icon("flask")}Test the model`, "btn btn--primary") : ""}
        </section>
        ${s.tested ? `<div class="pm-split">
          <section class="lab-panel pm-sec">
            <h3><span class="pm-step">1</span>Test results <span class="muted">(${res.correct} of ${res.total} right, ${pct(res.overall)})</span></h3>
            <div class="pm-grid">${res.items.map((i) => `<div class="pm-res ${i.correct ? "is-right" : "is-wrong"}">${M.creature(i.ex.traits, 48)}<span>Said ${tag(i.label)}<br>Really ${tag(i.truth)}</span><b>${i.correct ? `${icon("check")}Right` : `${icon("alert")}Wrong`}</b></div>`).join("")}</div>
          </section>
          <section class="lab-panel pm-sec">
            <h3><span class="pm-step">2</span>Error log: filter by trait</h3>
            <label class="pm-field">Group the test creatures by <select class="input input--small" id="pm-trait">${TRAIT_KEYS.map((k) => `<option value="${k}" ${k === s.trait ? "selected" : ""}>${esc(M.TRAIT_NAME[k])}</option>`).join("")}</select></label>
            <div class="pm-tablewrap"><table class="pm-table"><caption>Accuracy by ${esc(M.TRAIT_NAME[s.trait].toLowerCase())}</caption><thead><tr><th scope="col">Group</th><th scope="col">Right</th><th scope="col">Accuracy</th><th scope="col"><span class="visually-hidden">Choose</span></th></tr></thead>
              <tbody>${Object.entries(groups).map(([v, g]) => `<tr><th scope="row">${esc(M.traitText(s.trait, isNaN(v) ? v : Number(v)))}</th><td>${g.correct} of ${g.n}</td><td>${pct(g.accuracy)}</td><td>${s.after ? "" : b("group", `${s.trait}|${v}`, "Problem group?", "btn btn--ghost btn--small", `aria-pressed="${!!s.group && s.group.join("|") === `${s.trait}|${v}`}"`)}</td></tr>`).join("")}</tbody></table></div>
            <p class="muted pm-small">${mistakes.length} mistakes. Overall accuracy can look OK while one group does badly.</p>
          </section>
        </div>` : ""}
        ${s.group ? `<div class="pm-split">
          <section class="lab-panel pm-sec">
            <h3><span class="pm-step">3</span>Inspect the training data</h3>
            <p class="muted pm-small">${D.E.train.length} examples. Compare each trait with the labels.</p>
            ${crossTab(D.E.train, "color", ["blue", "orange", "green"])}${crossTab(D.E.train, "horns")}
            ${F.mode !== "explorer" ? crossTab(D.E.train, "tail") : ""}
          </section>
          <section class="lab-panel pm-sec">
            <h3>Your hypothesis</h3><p>Why does the machine make these mistakes?</p>
            ${chips("hyp", HYPS, s.hyp)}
            ${s.hyp && !hypOk ? `<p class="pm-result is-warn">${icon("alert")}${s.hyp === "broken" ? "The machine did exactly what it always does: it compared with its examples. Look at what the examples have in common." : s.hyp === "few" ? "There are 14 examples. Look at which kinds of creatures are in them, not how many." : "Check the color table. Which colors were Glims in the training data?"}</p>` : ""}
          </section>
        </div>` : ""}
        ${hypOk ? `<section class="lab-panel pm-sec">
          <h3><span class="pm-step">4</span>Fix the training data</h3>
          <p>The group to watch: creatures whose color doesn't match the training pattern (blue Glims and orange Norps). The labels were right. The problem was <strong>which</strong> examples were chosen. Add or remove examples, then test again.</p>
          <div class="pm-split">
            <div><h4>Training set (${s.train.length})</h4><div class="pm-row pm-row--mini">${trainSet().map((e) => `<span class="pm-mini pm-mini--static">${M.creature(e.traits, 40)}${tag(e.label)}${b("rm", e.id, `${icon("trash")}<span class="visually-hidden">Remove</span>`, "pm-x")}</span>`).join("")}</div></div>
            <div><h4>Labeled creatures you can add</h4><div class="pm-row pm-row--mini">${D.E.candidates.filter((c) => !s.train.includes(c.id)).map((e) => `<span class="pm-mini pm-mini--static">${M.creature(e.traits, 40)}${tag(e.label)}${b("addc", e.id, `${icon("plus")}<span class="visually-hidden">Add</span>`, "pm-x pm-x--add")}</span>`).join("") || `<p class="muted">All added.</p>`}</div></div>
          </div>
          ${b("retest", "x", `${icon("flask")}Test again`, "btn btn--primary")}
          ${s.after ? `<div class="pm-ba"><table class="pm-table"><caption>Before and after (same 16 test creatures)</caption><thead><tr><th scope="col"></th><th scope="col">Before</th><th scope="col">After</th></tr></thead><tbody>
            <tr><th scope="row">Overall accuracy</th><td>${pct(before.overall)}</td><td>${pct(s.after.overall)}</td></tr>
            <tr><th scope="row">Blue Glims and orange Norps</th><td>${bg.correct} of ${bg.n}</td><td>${s.after.group} of ${bg.n}</td></tr>
            <tr><th scope="row">Mistakes</th><td>${before.total - before.correct}</td><td>${s.after.mistakes}</td></tr>
            <tr><th scope="row">Training examples</th><td>${D.E.train.length}</td><td>${s.after.n}</td></tr></tbody></table></div>` : ""}
          ${s.after && s.after.group <= bg.correct && s.attempts >= 2 ? `<div class="pm-q"><p>Your changes didn't help that group yet. That's useful evidence too. Why not?</p>
            ${chips("explain", [["wrongkind", "I added examples that weren't like the problem group"], ["removed", "I removed examples the machine needed"], ["notenough", "I didn't add enough of the missing kind"]], s.explain)}
            <p>What would you try next?</p>${chips("next", [["blueglim", "Add blue creatures with pointy horns"], ["orangenorp", "Add orange creatures without pointy horns"], ["both", "Both"]], s.next)}</div>` : ""}
        </section>
        <section class="lab-panel pm-sec pm-talk">
          <h3>${icon("users")}Talk about it</h3>
          <ul><li>What could happen if a real AI system worked better for some people than for others?</li><li>Who should be responsible for noticing and fixing the problem?</li></ul>
          <p class="muted pm-small">Made-up creature colors are a simple model. Fairness for real people is much more complicated, and it needs people to check data, test results, and think about who could be harmed.</p>
        </section>` : ""}`);
      const ts = el.querySelector("#pm-trait");
      if (ts) ts.addEventListener("change", (e) => { s.trait = e.target.value; save(); render(); });
    }
    function win(how) {
      const a = s.after;
      F.note("s5", "Bias detective", [["Before", `${pct(before.overall)} overall, ${bg.correct} of ${bg.n} in the problem group`], ["After", `${pct(a.overall)} overall, ${a.group} of ${bg.n} in the problem group`], ["Training examples", `${D.E.train.length} → ${a.n}`], ["Result", how === "improved" ? "The problem group improved" : "Didn't improve yet; I know what to try next"]]);
      api.win({ before: Math.round(before.overall * 100), after: Math.round(a.overall * 100), group: a.group, how });
    }
    delegate(el, {
      test: () => { s.tested = true; save(); render(); api.log("lab_test_run", { acc: Math.round(before.overall * 100) }); api.say(`${before.correct} of ${before.total} right. Some creatures are getting it wrong. Which ones?`, "info"); },
      group: (v) => {
        const [t, val] = v.split("|"); const g = before.byGroup(t)[val];
        if (g.n >= 3 && g.accuracy < before.overall) { s.group = [t, val]; save(); render(); api.say(`Good detective work: ${M.traitText(t, isNaN(val) ? val : Number(val))} creatures got ${g.correct} of ${g.n} right, below the overall ${pct(before.overall)}. Now look at the training data.`, "good"); }
        else api.say(g.n < 3 ? "That group is too small to tell. Try another." : `That group got ${g.correct} of ${g.n} right (${pct(g.accuracy)}), which isn't worse than overall (${pct(before.overall)}). Try another trait.`, "warn");
      },
      hyp: (id) => { s.hyp = id; save(); render(); if (id === "shortcut") api.say("That's it. Color always went with the label in the training data, so it worked like a shortcut. The machine can't tell which trait really matters.", "good"); },
      rm: (id) => { s.train = s.train.filter((x) => x !== id); save(); render(); },
      addc: (id) => { s.train.push(id); save(); render(); },
      retest: () => {
        if (s.train.length < 2) return api.say("Keep at least 2 examples.", "warn");
        const r = M.evaluate(trainSet(), D.E.test), g = groupStats(r);
        s.after = { overall: r.overall, group: g.correct, mistakes: r.total - r.correct, n: s.train.length };
        s.attempts++; save(); render();
        api.log("lab_test_run", { acc: Math.round(r.overall * 100), group: g.correct });
        if (g.correct > bg.correct) { api.say(`The problem group went from ${bg.correct} to ${g.correct} of ${bg.n} right. Your data fix worked.`, "good"); win("improved"); }
        else api.say(`The problem group is still ${g.correct} of ${bg.n}. Which kinds of creatures were missing from the training data?`, "info");
      },
      explain: (id) => { s.explain = id; save(); render(); if (s.explain && s.next) win("explained"); },
      next: (id) => { s.next = id; save(); render(); if (s.explain && s.next) win("explained"); }
    });
    render();
  }

  /* ───────── Stage 6: When the Machine Doesn't Know ───────── */
  function mountConfidence(el, api) {
    const st = storeFor(api.user), S = st.load(); const F = frame(el, api, 5, S, st);
    const s = (S.s6 = Object.assign({ th: 50, tried: [], tapped: "", explain: "", scen: {}, novelty: false, purple: "" }, S.s6 || {}));
    const save = () => st.save(S);
    const K = D.F.K;
    const run = (th) => M.evaluate(D.F.train, D.F.test, { K, threshold: th, novelty: s.novelty && F.mode === "researcher" ? 3 : null });
    const same = (a, b) => JSON.stringify(run(a).items.map((i) => i.answered)) === JSON.stringify(run(b).items.map((i) => i.answered));
    function render() {
      const r = run(s.th);
      const tapped = s.tapped && r.items.find((i) => i.ex.id === s.tapped);
      const ths = [50, 60, 70, 80, 90, 100];
      const sameAs = ths.filter((t) => t !== s.th && same(t, s.th));
      paint(F.body, `
        <section class="lab-panel pm-sec">
          <h3>${icon("bulb")}Confidence is not the same as being right</h3>
          <p>This machine checks the <strong>${K}</strong> closest examples. Its <strong>model confidence score</strong> is how many of them agree: 3 of 5 is 60%, 4 of 5 is 80%, 5 of 5 is 100%. It's the model's own number, not a promise that it's right.</p>
          <p>You choose a <strong>threshold</strong>. Below it, the machine says: <em>“I'm not sure. Ask a human to check.”</em></p>
          ${fgLine("G")}
          <div class="range"><label for="pm-th">Minimum confidence to answer <b>${s.th}%</b></label><input type="range" id="pm-th" min="50" max="100" step="10" value="${s.th}" aria-valuetext="${s.th} percent"></div>
          ${sameAs.length ? `<p class="muted pm-small">With ${K} neighbors, only 60%, 80%, and 100% are possible, so ${s.th}% works the same as ${sameAs.map((t) => t + "%").join(" and ")}.</p>` : ""}
          ${F.mode === "researcher" ? `<label class="pm-check"><input type="checkbox" id="pm-nov" ${s.novelty ? "checked" : ""}> Also ask a human when the closest example differs in 3 or more traits (“never seen anything like it”)</label>` : ""}
          <div class="pm-tablewrap"><table class="pm-table pm-metrics"><caption>At ${s.th}%${s.novelty && F.mode === "researcher" ? ", with the never-seen check" : ""} (12 test creatures)</caption><tbody>
            <tr><th scope="row">Answered</th><td>${r.answered}</td><th scope="row">Withheld (ask a human)</th><td>${r.withheld}</td></tr>
            <tr><th scope="row">Right answers</th><td>${r.correct}</td><th scope="row">Wrong answers</th><td>${r.wrong}</td></tr>
            <tr><th scope="row">Accuracy of its answers</th><td>${pct(r.accuracy)}</td><th scope="row">Coverage (share answered)</th><td>${pct(r.coverage)}</td></tr></tbody></table></div>
          <p class="muted pm-small">Thresholds tried: ${s.tried.map((t) => t + "%").join(", ") || "none yet"}.</p>
        </section>
        <section class="lab-panel pm-sec">
          <h3><span class="pm-step">1</span>Find a confident mistake</h3>
          <p>Tap a creature where <strong>all 5</strong> nearby examples agreed, and the answer was still wrong.</p>
          <div class="pm-grid">${r.items.map((i, n) => `<button type="button" class="pm-res pm-res--btn ${i.answered ? (i.correct ? "is-right" : "is-wrong") : "is-unsure"} ${s.tapped === i.ex.id ? "is-sel" : ""}" data-act="tap" data-id="${i.ex.id}" data-k="tap:${i.ex.id}" aria-pressed="${s.tapped === i.ex.id}">
            ${M.creature(i.ex.traits, 44)}<span>${i.answered ? `Said ${tag(i.label)}` : "I'm not sure. Ask a human."}<br>Really ${tag(i.truth)}</span><span class="pm-meter" aria-hidden="true"><span style="width:${Math.round(i.agree * 100)}%"></span></span><b>${Math.round(i.agree * K)} of ${K} agree</b><b>${!i.answered ? "Withheld" : i.correct ? `${icon("check")}Right` : `${icon("alert")}Wrong`}</b></button>`).join("")}</div>
          ${tapped ? (tapped.agree === 1 && !tapped.correct ? `<p class="pm-result is-good">${icon("check")}Found one: 5 of 5 agreed, and it was still wrong. Why might that happen?</p>
            ${chips("explain", [["new", "It's a new kind of creature. Nothing like it was in the training data"], ["careless", "The machine wasn't paying attention"], ["low", "The threshold was too low"]], s.explain)}
            ${s.explain && s.explain !== "new" ? `<p class="pm-result is-warn">${icon("alert")}${s.explain === "careless" ? "The machine always does the same thing: it compares. Look at the color of the creature, and the colors in the training data." : "Even at 100%, this answer is given. Raising the threshold doesn't catch it."}</p>` : ""}
            <details class="pm-numbers" data-k="why6"><summary>Show why</summary>${why(M.knn(D.F.train, tapped.ex.traits, { K }), tapped.ex.traits)}</details>`
            : `<p class="pm-result is-warn">${icon("alert")}${tapped.correct ? "That one was right." : `Only ${Math.round(tapped.agree * K)} of ${K} agreed on that one.`} Look for a wrong answer where all 5 agreed.</p>`) : ""}
        </section>
        ${s.explain === "new" ? `<section class="lab-panel pm-sec">
          <h3><span class="pm-step">2</span>Choose a threshold for the job</h3>
          <p>There isn't one right threshold. It depends on what a mistake costs.</p>
          ${D.F.scenarios.map((sc) => { const v = s.scen[sc.id] || {}; return `<div class="pm-scen"><p><strong>${esc(sc.text)}</strong></p>
            <div class="seg" role="group" aria-label="Threshold for: ${esc(sc.text)}">${[50, 60, 80, 100].map((t) => b("sth", `${sc.id}|${t}`, `${t}%`, "", `aria-pressed="${v.th === t}"`)).join("")}</div>
            ${v.th ? `<p class="muted pm-small">At ${v.th}%: answers ${pct(run(v.th).coverage)} of creatures, ${run(v.th).wrong} wrong.</p>` : ""}
            ${chips("swhy", [[`${sc.id}|cover`, "Answering more creatures matters more here"], [`${sc.id}|safe`, "Avoiding wrong answers matters more here"]], v.why ? `${sc.id}|${v.why}` : "")}</div>`; }).join("")}
          <p>Even at 100%, the purple creatures are answered wrong. What else would help?</p>
          ${chips("purple", [["data", "Add purple creatures to the training data"], ["human", "Have a person check any new kind of creature"], ["both", "Both"]], s.purple)}
          ${b("done", "x", `${icon("check")}Record my thresholds`, "btn btn--primary")}
        </section>` : ""}`);
      el.querySelector("#pm-th").addEventListener("input", (e) => {
        s.th = Number(e.target.value);
        if (!s.tried.includes(s.th)) s.tried.push(s.th);
        save(); render(); el.querySelector("#pm-th").focus();
        const x = run(s.th);
        api.say(`At ${s.th}%, it answers ${x.answered} of 12 with ${x.wrong} wrong. ${s.th === 100 ? "Did it get more accurate, or just answer fewer?" : ""}`, "info");
      });
      const nv = el.querySelector("#pm-nov");
      if (nv) nv.addEventListener("change", (e) => { s.novelty = e.target.checked; save(); render(); });
    }
    function done() {
      const g = s.scen.game || {}, bt = s.scen.bite || {};
      if (s.tried.length < 3) return api.say(`Try at least 3 different thresholds first (you've tried ${s.tried.length}).`, "warn");
      if (!g.th || !bt.th || !g.why || !bt.why || !s.purple) return api.say("Choose a threshold and a reason for both jobs, and answer the last question.", "warn");
      if (bt.th < g.th) return api.say(`You set ${bt.th}% for the pet shop and ${g.th}% for the game. A bite is worse than losing a point. Is that what you meant?`, "warn");
      if (bt.why !== "safe") return api.say("For the pet shop, which matters more: answering lots of creatures, or avoiding a bite?", "warn");
      const rg = run(g.th), rb = run(bt.th);
      F.note("s6", "When the machine doesn't know", [["Thresholds tried", s.tried.sort((a, b2) => a - b2).map((t) => t + "%").join(", ")], ["Game threshold", `${g.th}%: ${pct(rg.coverage)} answered, ${rg.wrong} wrong`], ["Pet shop threshold", `${bt.th}%: ${pct(rb.coverage)} answered, ${rb.wrong} wrong`], ["Confident mistake", "A purple creature: a kind the training data never had"]]);
      api.log("lab_test_run", { game: g.th, bite: bt.th });
      S.s6.chosen = bt.th; save();
      api.say("A threshold trades how much the machine answers for how often it's wrong. People decide that trade, and new kinds of cases still need a person.", "good");
      api.win({ game: g.th, bite: bt.th, tried: s.tried.length });
    }
    delegate(el, {
      tap: (id) => { s.tapped = id; save(); render(); },
      explain: (id) => { s.explain = id; save(); render(); },
      sth: (v) => { const [id, t] = v.split("|"); s.scen[id] = Object.assign(s.scen[id] || {}, { th: Number(t) }); save(); render(); },
      swhy: (v) => { const [id, w] = v.split("|"); s.scen[id] = Object.assign(s.scen[id] || {}, { why: w }); save(); render(); },
      purple: (id) => { s.purple = id; save(); render(); },
      done
    });
    if (!s.tried.includes(s.th)) s.tried.push(s.th);
    render();
  }

  /* ───────── Stage 7: The Human Decision Room ───────── */
  const USES = D.SCENARIOS, REASONS = D.REASONS, DECISIONS = D.DECISIONS, PASS = D.PASS;
  /* Pure check for one case: { ok, kind: "rule" | "reason" | "ok", discuss } */
  function judgeUse(i, decision, reason) {
    const u = USES[i];
    if (!DECISIONS[decision]) return { ok: false, kind: "missing" };
    if (u.floor && u.floor.includes(decision)) return { ok: false, kind: "rule" };
    if (!u.fits.includes(reason)) return { ok: false, kind: "reason" };
    return { ok: true, kind: "ok", discuss: !u.floor };
  }
  /* Passing: 7 of 10 sound decisions. picks: { caseIndex: { d, r } } */
  function scoreUses(picks) {
    const results = USES.map((_, i) => (picks[i] && picks[i].d && picks[i].r ? judgeUse(i, picks[i].d, picks[i].r) : { ok: false, kind: "missing" }));
    const score = results.filter((r) => r.ok).length;
    return { score, total: USES.length, pass: score >= PASS, results };
  }
  function mountDecide(el, api) {
    const st = storeFor(api.user), S = st.load(); const F = frame(el, api, 6, S, st);
    const s = (S.s7 = Object.assign({ picks: {}, score: null, scored: false }, S.s7 || {}));
    const save = () => st.save(S);
    const order = SE.shuffle(USES.map((_, i) => i), "decide");
    const short = { help: "AI can help", review: "AI helps, a person reviews", not: "AI shouldn't decide" };
    function render() {
      const res = s.scored ? scoreUses(s.picks) : null;
      const n = USES.filter((_, i) => s.picks[i] && s.picks[i].d && s.picks[i].r).length;
      paint(F.body, `
        <section class="lab-panel pm-sec">
          <h3>${icon("users")}Should we use AI for this?</h3>
          <p>You've seen how a machine learns, and how it goes wrong. Now decide. For each idea, choose what you think and your best reason.</p>
          ${fgLine("H")}
          <details class="pm-vocab" data-k="vocab"><summary>Questions to ask yourself</summary><ul>
            <li>What patterns would the AI need to find?</li><li>What training examples might be missing?</li><li>Who could be affected by a mistake? Would it cause serious harm?</li>
            <li>Could the model be unfair to some people?</li><li>Who should check the result? Should the machine be allowed to say “I'm not sure”?</li></ul></details>
          <p class="resp-pass">${icon("flag")}<span>When all ${USES.length} have a choice and a reason, score your decisions. <strong>${PASS} of ${USES.length} passes.</strong> Some cases have a firm rule; others are judgment calls where a good reason matters most.</span></p>
        </section>
        <ol class="oi-list pm-cases">${order.map((i) => { const u = USES[i], p = s.picks[i] || {}, r = res && res.results[i]; return `<li data-row="${i}"><p>${esc(u.text)}</p>
          <div class="seg seg--wrap" role="group" aria-label="Your choice for: ${esc(u.text)}">${Object.keys(DECISIONS).map((k) => b("d", `${i}|${k}`, esc(short[k]), "", `aria-pressed="${p.d === k}" title="${esc(DECISIONS[k])}"`)).join("")}</div>
          <label class="oi-reason">Why? <select class="input input--small" data-r="${i}"><option value="">Choose a reason…</option>${Object.keys(REASONS).map((k) => `<option value="${k}" ${p.r === k ? "selected" : ""}>${esc(REASONS[k])}</option>`).join("")}</select></label>
          ${F.mode !== "explorer" ? `<label class="pm-field">Who could be affected? (optional) <select class="input input--small" data-a="${i}"><option value="">Choose…</option>${Object.entries(D.AFFECTS).map(([k, v]) => `<option value="${k}" ${p.a === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>` : ""}
          ${F.mode === "researcher" ? `<label class="pm-field">In your own words, for your teacher (optional) <input class="input input--small" maxlength="200" data-t="${i}" value="${esc(p.t || "")}"></label>` : ""}
          ${r ? `<p class="oi-why ${r.ok ? "is-right" : "is-wrong"}">${r.kind === "rule" ? `Look again: ${esc(u.rule)}` : r.kind === "reason" ? `Look again: “${esc(REASONS[p.r])}” doesn't really fit this case. Think about who could be affected, and how.` : r.kind === "missing" ? "Choose a decision and a reason." : `Your choice and reason hold up.${r.discuss ? " People disagree on this one, so talk it over with your class." : ""}${u.view ? ` One view: ${esc(u.view)}` : ""}`}</p>` : ""}</li>`; }).join("")}</ol>
        <div class="resp-score">${b("score", "x", `${icon("check")}Score my decisions`, "btn btn--primary", n < USES.length ? "disabled" : "")}<span class="muted">${n} of ${USES.length} ready</span></div>
        <p class="muted pm-small">Written answers stay on this device and aren't scored by the computer. Your teacher can read them in your printed report.</p>`);
    }
    delegate(el, {
      d: (v) => { const [i, k] = v.split("|"); s.picks[i] = Object.assign(s.picks[i] || {}, { d: k }); s.scored = false; save(); render(); },
      score: () => {
        const res = scoreUses(s.picks);
        s.scored = true; s.score = res.score; save(); render();
        api.log("lab_test_run", { score: res.score });
        if (res.pass) {
          F.note("s7", "The Human Decision Room", [["Sound decisions", `${res.score} of ${res.total}`], ["Judgment calls to discuss", String(res.results.filter((r) => r.ok && r.discuss).length)]]);
          api.say(`You scored ${res.score} of ${res.total}. That's a pass!${res.score < res.total ? " Read the “Look again” notes to see what you'd change." : ""}`, "good");
          api.win({ score: res.score, choices: USES.map((_, k) => `${k}:${s.picks[k].d}:${s.picks[k].r}`) }, { title: `You passed: ${res.score} of ${res.total}!` });
        } else api.say(`You scored ${res.score} of ${res.total}. You need ${PASS} to pass. Read each “Look again” note, change those answers, and score again.`, "warn");
      }
    });
    el.addEventListener("change", (e) => {
      const r = e.target.closest("[data-r]"), a = e.target.closest("[data-a]");
      if (r) { s.picks[r.dataset.r] = Object.assign(s.picks[r.dataset.r] || {}, { r: r.value }); s.scored = false; save(); render(); }
      if (a) { s.picks[a.dataset.a] = Object.assign(s.picks[a.dataset.a] || {}, { a: a.value }); save(); }
      const t = e.target.closest("[data-t]");
      if (t) { s.picks[t.dataset.t] = Object.assign(s.picks[t.dataset.t] || {}, { t: t.value.slice(0, 200) }); save(); }
    });
    render();
  }

  /* ───────── Stage 8: The Responsible AI Challenge ───────── */
  const START_G = D.G.pool.slice(0, 4).concat(D.G.pool.slice(12, 16)).map((e) => e.id);
  const Q = {
    q2: ["What kinds of examples did I use?", [["both", "Both Glims and Norps"], ["antennae", "Different numbers of antennae"], ["tails", "Long and short tails"], ["other", "Different colors, bodies, and horns"]], true],
    q4: ["What did I change?", [["addmissing", "I added kinds of creatures that were missing"], ["remove", "I removed examples that were misleading"], ["both", "Both"]]],
    q6: ["What could still go wrong?", [["newkind", "A new kind of creature it has never seen"], ["shortcut", "It could still use a shortcut trait"], ["confident", "It could be wrong and still sound sure"]], true],
    q7: ["When should a person check the result?", [["low", "When its confidence is below my threshold"], ["costly", "When a mistake would cause harm"], ["new", "When a creature is unlike its examples"], ["always", "Always, for important decisions"]], true]
  };
  function mountChallenge(el, api) {
    const st = storeFor(api.user), S = st.load(); const F = frame(el, api, 7, S, st);
    const s = (S.s8 = Object.assign({ train: START_G.slice(), first: null, latest: null, changes: 0, changesTested: 0, investigated: "", th: null, ans: {}, txt: "", finished: false, K: 3 }, S.s8 || {}));
    const save = () => st.save(S);
    let K = s.K, view = null, iv8 = {};
    const byId = (id) => D.G.pool.find((e) => e.id === id);
    const set = () => s.train.map(byId);
    const evalNow = (th) => M.evaluate(set(), D.G.test, { K, threshold: th || 0 });
    const tasks = () => {
      const a = s.ans;
      return [
        ["Build: a training set with both kinds and at least 8 examples", s.train.length >= 8 && new Set(set().map((e) => e.label)).size === 2],
        ["Train and test on 20 new creatures", !!s.first],
        ["Investigate one prediction", !!s.investigated],
        ["Improve the data and test again", !!s.latest && s.changesTested > 0],
        ["Set a threshold", s.th != null],
        ["Explain your model", ["q2", "q4", "q6", "q7"].every((k) => (Array.isArray(a[k]) ? a[k].length : a[k]))]
      ];
    };
    function render() {
      const res = s.first ? evalNow() : null;
      const wrong = res ? res.items.filter((i) => !i.correct) : [];
      const shaky = res ? res.items.slice().sort((a, b2) => a.agree - b2.agree)[0] : null;
      const inspect = view && res && res.items.find((i) => i.ex.id === view);
      const g = set().filter((e) => e.label === "Glim").length;
      const T = tasks();
      paint(F.body, `
        <section class="lab-panel pm-sec">
          <h3>${icon("flag")}The final challenge</h3>
          <p>Your team wants to use a machine to sort a new set of creatures. Before you approve it, prove you understand how it works, where it makes mistakes, and when a person should check its answer. A teammate labeled these creatures and started a training set.</p>
          <ol class="pm-tasks">${T.map(([t, ok], i) => `<li class="${ok ? "is-done" : ""}">${ok ? icon("check") : `<b>${i + 1}</b>`}<span>${esc(t)}</span>${ok ? '<span class="visually-hidden"> (done)</span>' : ""}</li>`).join("")}</ol>
        </section>
        <div class="pm-bench">
          <section class="lab-panel pm-sec">
            <h3>${icon("box")}Training set <span class="muted">(${s.train.length}: ${g} Glims, ${s.train.length - g} Norps)</span></h3>
            <div class="pm-row pm-row--mini">${set().map((e) => `<span class="pm-mini pm-mini--static">${M.creature(e.traits, 40)}${tag(e.label)}${b("rm", e.id, `${icon("trash")}<span class="visually-hidden">Remove</span>`, "pm-x")}</span>`).join("")}</div>
          </section>
          <section class="lab-panel pm-sec">
            <h3>${icon("flask")}Test</h3>
            <div class="pm-row">${b("test", "x", `${icon("ai")}${s.first ? "Train and test again" : "Train and test"}`, "btn btn--primary")}${F.mode === "researcher" ? `<label class="pm-field pm-field--inline">Neighbors (K) <select class="input input--small" id="pm-k8">${[1, 3, 5].map((k) => `<option ${k === K ? "selected" : ""}>${k}</option>`).join("")}</select></label>` : ""}</div>
            ${s.first ? `<p class="pm-big">First test: <strong>${pct(s.first.acc)}</strong>${s.latest ? ` · Latest: <strong>${pct(s.latest.acc)}</strong>` : ""}</p>
              <p class="muted pm-small">${wrong.length ? `${wrong.length} mistake${wrong.length > 1 ? "s" : ""}. Tap one to inspect it.` : "No mistakes on this test. Inspect the shakiest prediction instead."}</p>
              <div class="pm-row pm-row--mini">${(wrong.length ? wrong : [shaky]).map((i) => `<button type="button" class="pm-mini ${view === i.ex.id ? "is-sel" : ""}" data-act="inspect" data-id="${i.ex.id}" data-k="inspect:${i.ex.id}" aria-pressed="${view === i.ex.id}" aria-label="${esc(M.describe(i.ex.traits))}: said ${i.label}, really ${i.truth}">${M.creature(i.ex.traits, 40, " ")}${tag(i.label)}</button>`).join("")}</div>` : `<p class="muted">Train and test to see how it does on 20 creatures it has never seen.</p>`}
          </section>
          <section class="lab-panel pm-sec pm-evidence">
            <h3>${icon("bulb")}Evidence</h3>
            ${inspect ? `<p>Said ${tag(inspect.label)}, really ${tag(inspect.truth)}.</p>${X.insideHtml(Object.assign({}, iv8, { train: set(), x: inspect.ex, truth: inspect.truth, K }))}` : `<p class="muted">Inspect a prediction to see the examples behind it.</p>`}
          </section>
        </div>
        <section class="lab-panel pm-sec">
          <details class="pm-numbers" data-k="gpool" ${s.first ? "" : "open"}><summary>Labeled creatures you can add (${D.G.pool.length - s.train.length})</summary>
            <div class="pm-row pm-row--mini">${D.G.pool.filter((e) => !s.train.includes(e.id)).map((e) => `<span class="pm-mini pm-mini--static">${M.creature(e.traits, 40)}${tag(e.label)}${b("add", e.id, `${icon("plus")}<span class="visually-hidden">Add</span>`, "pm-x pm-x--add")}</span>`).join("")}</div></details>
          ${F.mode !== "explorer" ? `<div class="pm-tabs2">${crossTab(set(), "antennae")}${crossTab(set(), "tail")}</div>` : ""}
        </section>
        ${s.first ? `<section class="lab-panel pm-sec">
          <h3><span class="pm-step">5</span>Set a threshold</h3>
          <p>Below this confidence, your machine says “I'm not sure. Ask a human to check.”</p>
          <div class="seg" role="group" aria-label="Threshold">${[50, 67, 100].map((t) => b("th", String(t), `${t}%`, "", `aria-pressed="${s.th === t}"`)).join("")}</div>
          ${s.th != null ? (() => { const r = evalNow(s.th); return `<p class="muted pm-small">At ${s.th}%: answers ${r.answered} of ${r.total} (${pct(r.coverage)}), ${r.wrong} wrong, ${pct(r.accuracy)} of its answers right.</p>`; })() : ""}
        </section>
        <section class="lab-panel pm-sec">
          <h3><span class="pm-step">6</span>Explain your model</h3>
          ${Object.entries(Q).map(([k, [q, opts, multi]]) => `<p><strong>${esc(q)}</strong>${multi ? " Choose any that apply." : ""}</p>${chips(k, opts, s.ans[k] || (multi ? [] : ""), !!multi)}`).join("")}
          <label class="pm-field">One important lesson I learned (optional) <input class="input" maxlength="200" id="pm-lesson" value="${esc(s.txt || "")}"></label>
          ${b("finish", "x", `${icon("star")}Make my AI Model Report`, "btn btn--primary", T.every((t) => t[1]) ? "" : "disabled")}
        </section>` : ""}
        ${s.finished ? reportHtml(S, api) + certPanel(S, api, certReady(api, false)) : ""}`);
      const k8 = el.querySelector("#pm-k8");
      if (k8) k8.addEventListener("change", (e) => { K = s.K = Number(e.target.value); save(); api.say(`Now using ${K} neighbors. Train and test again to see the change.`, "info"); });
      const ls = el.querySelector("#pm-lesson");
      if (ls) ls.addEventListener("change", (e) => { s.txt = e.target.value.slice(0, 200); save(); });
      wireReport(el, S, api);
    }
    delegate(el, {
      rm: (id) => { s.train = s.train.filter((x) => x !== id); if (s.first) s.changes++; save(); render(); },
      add: (id) => { if (s.train.length >= M.MAX_TRAIN) return; s.train.push(id); if (s.first) s.changes++; save(); render(); },
      test: () => {
        if (s.train.length < 2 || new Set(set().map((e) => e.label)).size < 2) return api.say("The training set needs examples of both Glims and Norps.", "warn");
        const r = evalNow(); const snap = { acc: r.overall, n: s.train.length, wrong: r.total - r.correct };
        if (!s.first) { s.first = snap; s.changes = 0; } else { s.latest = snap; s.changesTested = s.changes; }
        save(); render(); api.log("lab_test_run", { acc: Math.round(r.overall * 100), n: s.train.length });
        api.say(s.latest ? (s.latest.acc > s.first.acc ? `Accuracy went from ${pct(s.first.acc)} to ${pct(s.latest.acc)}.` : s.latest.acc < s.first.acc ? `Accuracy went down, from ${pct(s.first.acc)} to ${pct(s.latest.acc)}. What changed?` : `Accuracy stayed at ${pct(s.latest.acc)}.`) : `${pct(r.overall)} on 20 new creatures. Now find a mistake and inspect it.`, "info");
      },
      inspect: (id) => { view = id; iv8 = { step: 1, reached: 1 }; s.investigated = id; save(); render(); },
      ...Object.fromEntries(["iv-step", "iv-feat", "iv-guess", "iv-reveal", "iv-reset"].map((a) => [a, (id) => { X.act(iv8, a, id); render(); }])),
      th: (t) => { s.th = Number(t); save(); render(); },
      q2: (id) => { s.ans.q2 = toggle(s.ans.q2, id); save(); render(); },
      q4: (id) => { s.ans.q4 = id; save(); render(); },
      q6: (id) => { s.ans.q6 = toggle(s.ans.q6, id); save(); render(); },
      q7: (id) => { s.ans.q7 = toggle(s.ans.q7, id); save(); render(); },
      finish: () => {
        if (!tasks().every((t) => t[1])) return;
        s.finished = true; save();
        const eligible = certReady(api);
        api.log("lab_test_run", { report: 1 });
        render();
        api.win({ first: Math.round(s.first.acc * 100), latest: Math.round(s.latest.acc * 100), n: s.train.length, th: s.th }, { title: "Responsible AI Challenge: complete!", extra: certPanel(S, api, eligible) });
        wireReport(document, S, api);
      }
    });
    render();
  }
  const toggle = (a, id) => { a = a || []; return a.includes(id) ? a.filter((x) => x !== id) : a.concat(id); };

  /* Certificate: stages 3–6 done, stage 7 passed, stage 8 finished. finishing8 counts this stage as done. */
  function certReady(api, finishing8 = true) {
    const done = SE.labs.progressFor(api.user, LAB);
    const need = [[2, "Train and inspect"], [3, "The accuracy experiment"], [4, "Bias detective"], [5, "When the machine doesn't know"], [6, "The Human Decision Room (7 of 10)"]];
    const missing = need.filter(([i]) => !done.has(i));
    if (!finishing8 && !done.has(7)) missing.push([7, "The final challenge"]);
    return { ok: !missing.length, missing };
  }
  const SKILLS = ["Built and labeled a training set", "Tested a real model on new examples", "Found and fixed biased data", "Chose when a person should check", "Judged when AI should be used"];
  function certInfo(api) {
    const u = api.user && api.user.role === "student" ? api.user : null;
    return { award: "Responsible AI Explorer", course: "Train the Machine: How AI Learns, and When It Gets It Wrong", detail: "A STEM Coliseum AI workshop at STEM 207", skills: SKILLS, name: u ? u.displayName : "", className: u && u.cls ? u.cls.name : "", at: Date.now() };
  }
  function certPanel(S, api, ready) {
    return `<div class="cert-cele"><span class="cert-cele__badge" aria-hidden="true">${icon("star")}</span><div>
      <p class="cert-cele__k">Responsible AI Explorer</p>
      ${ready.ok ? `<p>You trained a real model, tested it, caught its mistakes, and decided when people should check it.</p>${SE.certificate.button(certInfo(api), "See my certificate")}`
        : `<p>Your report is ready. To earn the certificate, finish: ${ready.missing.map(([i, t]) => `<a href="#/lab/${LAB}/${i + 1}">${esc(t)}</a>`).join(", ")}.</p>`}
      <button type="button" class="btn btn--ghost" data-pm-print>${icon("print")}Print my AI Model Report</button></div></div>`;
  }
  /* My AI Model Report: only real results from this student's work. */
  function reportHtml(S, api) {
    const s = S.s8, a = s.ans;
    const set = s.train.map((id) => D.G.pool.find((e) => e.id === id));
    const g = set.filter((e) => e.label === "Glim").length;
    const cover = (t) => M.TRAITS[t].filter((v) => set.some((e) => e.traits[t] === v)).map((v) => M.traitText(t, v)).join(", ");
    const inv = D.G.test.find((e) => e.id === s.investigated);
    const pick = (k) => { const opts = Q[k][1]; const v = a[k]; return (Array.isArray(v) ? v : [v]).map((x) => (opts.find((o) => o[0] === x) || [])[1]).filter(Boolean).join("; "); };
    const delta = s.latest.acc > s.first.acc ? `Improved from ${pct(s.first.acc)} to ${pct(s.latest.acc)}.` : s.latest.acc < s.first.acc ? `Went down from ${pct(s.first.acc)} to ${pct(s.latest.acc)}. Next I'd look at which examples I changed.` : `Stayed at ${pct(s.latest.acc)}. Next I'd add different kinds of examples.`;
    const nb = (key) => (S.notebook || []).find((n) => n.key === key);
    const thRes = M.evaluate(set, D.G.test, { threshold: s.th, K: s.K || 3 });
    return `<section class="pm-report" id="pm-report" aria-labelledby="pm-report-h">
      <header><p class="pm-report__k">STEM 207 · STEM Coliseum AI workshop</p><h3 id="pm-report-h">My AI Model Report</h3>
        <p>${api.user && api.user.role === "student" ? esc(api.user.displayName) : "Name: ____________________"} · ${new Date().toLocaleDateString()}</p></header>
      <dl class="pm-facts pm-facts--report">
        <div><dt>Model purpose</dt><dd>Sort made-up creatures into Glims and Norps by comparing them with labeled examples (k-nearest neighbors).</dd></div>
        <div><dt>Training examples</dt><dd>${set.length} (${g} Glims, ${set.length - g} Norps)</dd></div>
        <div><dt>Feature coverage</dt><dd>Antennae: ${esc(cover("antennae"))}. Tails: ${esc(cover("tail"))}.</dd></div>
        <div><dt>Test accuracy</dt><dd>${pct(s.latest.acc)} on 20 creatures it never trained on</dd></div>
        <div><dt>A mistake I investigated</dt><dd>${inv ? esc(M.describe(inv.traits)) : "–"}</dd></div>
        <div><dt>What I changed</dt><dd>${esc(pick("q4"))} (${s.changes} change${s.changes === 1 ? "" : "s"})</dd></div>
        <div><dt>Before and after</dt><dd>${esc(delta)}</dd></div>
        <div><dt>Confidence threshold</dt><dd>${s.th}%: answers ${pct(thRes.coverage)} of new creatures; below that, it asks a person</dd></div>
        <div><dt>Examples I used</dt><dd>${esc(pick("q2"))}</dd></div>
        <div><dt>What could still go wrong</dt><dd>${esc(pick("q6"))}</dd></div>
        <div><dt>When a person should check</dt><dd>${esc(pick("q7"))}</dd></div>
        ${s.txt ? `<div><dt>An important lesson</dt><dd>${esc(s.txt)}</dd></div>` : ""}
      </dl>
      ${["s4", "s5", "s6"].map(nb).filter(Boolean).length ? `<h4>From my research notebook</h4><ul class="pm-report__nb">${["s4", "s5", "s6"].map(nb).filter(Boolean).map((n) => `<li><strong>${esc(n.title)}:</strong> ${n.facts.map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(". ")}${n.text ? `. I learned: ${esc(n.text)}` : ""}</li>`).join("")}</ul>` : ""}
      ${S.s7 && S.s7.score != null ? `<p><strong>Human Decision Room:</strong> ${S.s7.score} of 10 sound decisions.</p>` : ""}
      <p class="pm-report__note">These numbers were measured by a real model on made-up creatures. A model's score is a model output, not a guarantee. <strong>Keep the humanity in technology.</strong></p>
      <div class="pm-report__actions"><button type="button" class="btn btn--ghost" data-pm-print>${icon("print")}Print my report</button></div>
    </section>`;
  }
  function wireReport(root, S, api) {
    root.querySelectorAll("[data-pm-print]").forEach((p) => {
      if (p.dataset.wired) return; p.dataset.wired = "1";
      p.addEventListener("click", () => {
        if (!document.getElementById("pm-report")) return api.say("Make your report first.", "info");
        document.body.classList.add("pm-printing"); window.print(); setTimeout(() => document.body.classList.remove("pm-printing"), 500);
      });
    });
  }

  /* ───────── Landing ───────── */
  function landing(el, ctx) {
    const mode = getMode();
    const sample = D.A.start;
    el.innerHTML = `<div class="pm-land">
      <div class="pm-land__hero">
        <div class="pm-land__cr" aria-hidden="true">${sample.map((e) => M.creature(e.traits, 76, " ")).join("")}</div>
        <div>
          <p class="pm-land__rule"><strong>A machine can find patterns. People decide whether those patterns are useful, fair, and trustworthy.</strong></p>
          <p>Welcome to the STEM 207 AI Research Crew. You'll train a real machine-learning model to sort made-up creatures called Glims and Norps. Then you'll test it, catch its mistakes, and decide when people should check its answers.</p>
          <p class="pm-land__path">${["Observe", "Predict", "Label", "Train", "Test", "Investigate", "Improve", "Decide"].map((w) => `<span>${w}</span>`).join(`<span aria-hidden="true">→</span>`)}</p>
          <fieldset class="pm-land__mode"><legend>Choose how to explore (you can change it any time)</legend>
            ${Object.entries(MODES).map(([k, v]) => `<label><input type="radio" name="pm-mode" value="${k}" ${k === mode ? "checked" : ""}> <strong>${v}</strong> <span class="muted">${MODE_NOTE[k]}</span></label>`).join("")}</fieldset>
          <div class="pm-land__go"><a class="btn btn--launch" href="#/lab/${LAB}/1">${icon("rocket")}Start the workshop</a></div>
          <p class="muted pm-small">You'll make: an AI Research Notebook, a printable AI Model Report, and a Responsible AI Explorer certificate. Everything here is made up. No cameras, no accounts, and your work stays on this device.</p>
        </div>
      </div></div>`;
    el.querySelectorAll('[name="pm-mode"]').forEach((r) => r.addEventListener("change", (e) => setMode(e.target.value)));
  }

  /* ───────── Levels ───────── */
  const LEVELS = [
    { title: "Be the Machine", concept: "Learning from examples",
      learn: "How examples reveal a pattern, and how a new example can show that a pattern was wrong.",
      why: "Machine learning starts with examples. If the examples are incomplete, the pattern found in them can be wrong.",
      goal: "Predict a new creature, find a rule that fits every example, and solve one round of the rule game.",
      steps: ["Study the labeled creatures and predict the new one.", "Pick a rule. Watch what new examples do to it.", "Play the rule game."],
      hints: ["Look at one trait at a time. Which trait is the same on every Glim?", "Test your rule on every card, including the new ones.", "The color rule fits the first four cards. Look at the blue Norp. What's different about its horns?"],
      learned: "Several rules can fit a few examples. New examples show which rule really works. Machines learn from examples too, but they don't think the way people do." },
    { title: "Build the Training Set", concept: "Examples and labels",
      learn: "How people choose the examples and labels a machine learns from.",
      why: "Whoever picks and labels the training examples shapes what the machine learns, mistakes included.",
      goal: "Choose a secret rule, then label at least 8 creatures (6 in Explorer) to build a training set with both kinds.",
      steps: ["Pick a secret rule. The machine never sees it.", "Label creatures to add them to the training set.", "Check the counts and missing kinds. Answer the two questions."],
      hints: ["Label creatures of both kinds, Glims and Norps.", "Look at “Not in your training set yet.” Add some of those.", "If a card says “Check this label,” compare it with your rule and change the label."],
      learned: "The training set is the machine's whole world. People choose which examples go in and what they're labeled. Balance matters, and so does covering different kinds of creatures." },
    { title: "Train and Inspect", concept: "How the model predicts",
      learn: "How a k-nearest-neighbors model compares a new creature with its closest examples and lets them vote.",
      why: "When you can see the evidence behind an AI's answer, you can check it, and fix it.",
      goal: "Train the model, test 3 new creatures and look at why, then change one example so a prediction changes.",
      steps: ["Press Train. Pick a new creature to test.", "Read the machine's reasoning: its closest examples and their votes.", "Change or remove one example, update, and find what changed."],
      hints: ["Look at the closest examples for one test creature. Those are the ones that vote.", "Pick one of those closest examples and change its label.", "Press Update the model, then tap the example you changed."],
      learned: "This machine doesn't understand creatures. It counts different traits and lets the closest examples vote. Change an example, and you can change the answer." },
    { title: "The Accuracy Experiment", concept: "Data quality and generalization",
      learn: "Why more examples aren't always better examples, and how to test a model fairly.",
      why: "AI teams test on examples the model never trained on. That's how they know it works on new cases.",
      goal: "Predict, run both experiments on the same test set, and explain what your evidence shows.",
      steps: ["Predict which run will help more.", "Run More of the same, then More variety.", "Compare the lines on the chart and record your findings."],
      hints: ["Both runs use the same 16 test creatures, so the chart is a fair comparison.", "Follow each line from left to right. Does it ever go down?", "Turn on training accuracy. Why is it so high?"],
      learned: "Adding examples can help, do nothing, or even hurt. Variety in the examples usually helps more than copies, and only a separate test set shows how a model works on new creatures." },
    { title: "Bias Detective", concept: "Bias in data",
      learn: "How a lopsided training set teaches a machine the wrong pattern, and how to fix it with better data.",
      why: "AI that works well for most cases can still fail one group again and again. Finding that takes checking groups, not just the overall score.",
      goal: "Find the group the model gets wrong, explain why, fix the training data, and show the change with evidence.",
      steps: ["Test the model and read the error log.", "Group the results by a trait. Find the problem group.", "Inspect the training data, pick a hypothesis, then fix the data and test again."],
      hints: ["Group the results by color. Which colors do worst?", "In the training data, which colors were Glims, and which were Norps?", "Add blue creatures with pointy horns and orange ones without them, then test again."],
      learned: "The labels were right, but the examples were lopsided, so color became a shortcut. Good overall accuracy can hide a group that fails. Fixing it means fixing the data and testing again." },
    { title: "When the Machine Doesn't Know", concept: "Confidence and uncertainty",
      learn: "What a model confidence score means, and how a threshold trades answering more against being wrong less.",
      why: "AI is used where mistakes matter. A system that hands unsure cases to a person can be safer than one that always answers.",
      goal: "Try 3 thresholds, find a confident mistake, and choose a threshold for two different jobs.",
      steps: ["Slide the threshold and watch the counts.", "Find a wrong answer where all 5 nearby examples agreed.", "Choose a threshold for the game and for the pet shop."],
      hints: ["Raising the threshold makes the machine answer fewer creatures. Does it always get more accurate?", "Look at the purple creatures. Were any purple ones in the training data?", "For the pet shop, which is worse: a bite, or asking a person more often?"],
      learned: "A confidence score is the model's own number. It can be high and still wrong, especially for something new. A threshold helps, but people decide what mistakes cost, and new kinds of cases still need a person." },
    { title: "The Human Decision Room", concept: "Responsible use",
      learn: "How to decide whether AI should help, help with a person reviewing, or not make a decision at all.",
      why: "Whether AI is useful depends not just on what it can predict, but on what happens when it makes a mistake.",
      goal: "For 10 situations, choose a decision and your best reason. Score 7 of 10 to pass.",
      hints: ["For each case, ask: how bad would a mistake be, and who could be harmed?", "Some cases have a firm rule: a person must decide when a mistake could seriously hurt someone. Others are judgment calls.", "A good reason fits the case. Ask: is it about time saved, harm, fairness, privacy, or missing examples?"],
      learned: "Deciding whether to use AI means weighing harm, fairness, privacy, and missing data. Some lines are firm; for the rest, explain your reason and listen to others." },
    { title: "The Responsible AI Challenge", concept: "Build, test, explain, decide",
      learn: "How to build, test, investigate, improve, and explain a model before anyone uses it.",
      why: "Before an AI is used, someone has to prove how it works, where it fails, and when a person should check it. That someone can be you.",
      goal: "Complete all 6 tasks, then make your AI Model Report.",
      steps: ["Improve the training set, then train and test.", "Inspect a mistake, change the data, and test again.", "Set a threshold, explain your model, and make your report."],
      hints: ["Look at the antennae and tail tables. Which kinds are missing?", "Inspect a mistake. Which of its closest examples misled it?", "Add creatures like the one it got wrong, then test again."],
      learned: "You trained a real model, measured it on new data, found a mistake, improved the data, and decided when a person should check. That's what responsible AI work looks like." }
  ];

  SE.labs.register({
    id: LAB,
    area: "ai",
    title: "Train the Machine",
    tagline: "Pattern Machine Lab: train a real machine-learning model, test it, catch it learning the wrong lesson, and decide when people should check it.",
    levels: LEVELS,
    chapters: [
      { title: "Learn like a machine", short: "Learn", from: 0, to: 1, blurb: "Find patterns in examples, then build a training set of your own." },
      { title: "Train and test", short: "Train", from: 2, to: 3, blurb: "Train a real model, see why it predicts what it does, and test it fairly." },
      { title: "When it goes wrong", short: "Wrong", from: 4, to: 5, blurb: "Catch biased data and confident mistakes." },
      { title: "People decide", short: "Decide", from: 6, to: 7, blurb: "Decide when AI should be used, then audit a model and report on it." }
    ],
    mount(el, idx, api) {
      return [mountMachine, mountTrainingSet, mountInspect, mountAccuracy, mountBias, mountConfidence, mountDecide, mountChallenge][idx](el, api);
    },
    landing
  });
  SE.patternMachine = { judgeUse, scoreUses, PASS, USES, REASONS, DECISIONS, LEVELS, curveFor, certReady, SKILLS };
})();
