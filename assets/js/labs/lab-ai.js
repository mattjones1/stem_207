/*
 * Pattern Machine Lab — Artificial Intelligence
 * Students find patterns, train a real (tiny) machine-learning model with
 * examples, see how the number and variety of examples change its accuracy,
 * uncover bias, set a confidence threshold, and judge responsible uses of AI.
 *
 * The "machine" is a k-nearest-neighbors classifier: it labels a new creature
 * by looking at the 3 most similar examples it was trained on. Students can see
 * which examples it used, so the prediction is never a mystery.
 * No personal data, cameras, or accounts are involved.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  /* ───────── Creatures ───────── */
  const COLORS = { blue: "#3f7fc9", orange: "#ec7a2f", green: "#4f9a5a", purple: "#8a5cb8" };
  const C = (color, shape, size, eyes, pattern) => ({ color, shape, size, eyes, pattern });
  function describe(k) { return `${k.size} ${k.color} ${k.shape} creature with ${k.eyes} eye${k.eyes > 1 ? "s" : ""}${k.pattern !== "plain" ? ` and ${k.pattern}` : ""}`; }

  let uid = 0;
  function creature(k, size = 84) {
    const id = `cr${++uid}`;
    const s = k.size === "big" ? 1 : 0.74;
    const r = 30 * s;
    const fill = COLORS[k.color];
    let body;
    if (k.shape === "spiky") {
      const pts = [];
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; const rr = i % 2 ? r * 0.78 : r * 1.12; pts.push(`${(50 + Math.cos(a) * rr).toFixed(1)},${(52 + Math.sin(a) * rr).toFixed(1)}`); }
      body = `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="#0d1d36" stroke-width="2.2" stroke-linejoin="round"/>`;
    } else {
      body = `<circle cx="50" cy="52" r="${r}" fill="${fill}" stroke="#0d1d36" stroke-width="2.2"/>`;
    }
    let pattern = "";
    if (k.pattern === "spots") pattern = [[-10, -8], [9, 6], [-4, 12], [12, -10]].map(([dx, dy]) => `<circle cx="${50 + dx * s}" cy="${52 + dy * s}" r="${4 * s}" fill="rgba(255,255,255,.45)"/>`).join("");
    if (k.pattern === "stripes") pattern = `<g clip-path="url(#${id})">${[-14, -4, 6, 16].map((dy) => `<rect x="10" y="${52 + dy * s}" width="80" height="${4 * s}" fill="rgba(13,29,54,.28)"/>`).join("")}</g>`;
    const ex = { 1: [0], 2: [-9, 9], 3: [-12, 0, 12] }[k.eyes];
    const eyes = ex.map((dx) => `<circle cx="${50 + dx * s}" cy="${44 - (k.eyes === 3 && dx === 0 ? 6 : 0) * s}" r="${6 * s}" fill="#fff" stroke="#0d1d36" stroke-width="1.6"/><circle cx="${50 + dx * s + 1}" cy="${45 - (k.eyes === 3 && dx === 0 ? 6 : 0) * s}" r="${2.6 * s}" fill="#0d1d36"/>`).join("");
    const feet = `<rect x="${38 - 4 * s}" y="${52 + r - 4}" width="${10 * s}" height="${8 * s}" rx="3" fill="#0d1d36"/><rect x="${56}" y="${52 + r - 4}" width="${10 * s}" height="${8 * s}" rx="3" fill="#0d1d36"/>`;
    return `<svg class="creature" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${esc(describe(k))}">
      <defs><clipPath id="${id}">${k.shape === "spiky" ? body.replace(/fill="[^"]+" stroke="[^"]+" stroke-width="[^"]+" stroke-linejoin="round"/, "") : `<circle cx="50" cy="52" r="${r}"/>`}</clipPath></defs>
      ${feet}${body}${pattern}${eyes}
      <path d="M${44} ${60 + 2 * s} q6 ${5 * s} 12 0" fill="none" stroke="#0d1d36" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }

  /* Feature vector for the machine. Every feature counts the same. */
  const vec = (k) => [
    k.color === "blue" ? 1 : 0, k.color === "orange" ? 1 : 0, k.color === "green" ? 1 : 0, k.color === "purple" ? 1 : 0,
    k.shape === "spiky" ? 1.4 : 0, k.size === "big" ? 1 : 0, (k.eyes - 1) / 2,
    k.pattern === "spots" ? 1 : 0, k.pattern === "stripes" ? 1 : 0
  ];
  const dist = (a, b) => { const va = vec(a), vb = vec(b); return Math.sqrt(va.reduce((s, x, i) => s + (x - vb[i]) ** 2, 0)); };
  function predict(train, k, K = 3) {
    if (!train.length) return null;
    const near = train.map((t) => ({ t, d: dist(t.k, k) })).sort((a, b) => a.d - b.d).slice(0, Math.min(K, train.length));
    const votes = {};
    near.forEach((n) => { votes[n.t.label] = (votes[n.t.label] || 0) + 1 / (0.35 + n.d); });
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    const [label, v] = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
    // Confidence drops when even the closest examples aren't very similar (something new).
    const familiarity = Math.exp(-0.75 * near[0].d);
    return { label, share: v / total, conf: Math.max(0.05, (v / total) * familiarity), near };
  }

  function all() {
    const out = [];
    ["blue", "orange", "green"].forEach((color) => ["round", "spiky"].forEach((shape) => ["small", "big"].forEach((size) =>
      [1, 2, 3].forEach((eyes) => ["plain", "spots", "stripes"].forEach((pattern) => out.push(C(color, shape, size, eyes, pattern)))))));
    return out;
  }
  const pickSet = (seed, n, filter = () => true) => SE.shuffle(all().filter(filter), seed).slice(0, n);

  const nearHtml = (p) => `<span class="near">${p.near.map((n) => `<span class="near__one" title="${esc(n.t.label)}">${creature(n.t.k, 30)}<b>${esc(n.t.label)}</b></span>`).join("")}</span>`;
  // By default show how strongly the 3 nearest examples agree; the confidence level also accounts for how unfamiliar a creature is.
  const confBar = (p, key = "share") => `<span class="conf-bar" aria-label="${Math.round(p[key] * 100)}% sure"><span style="width:${Math.round(p[key] * 100)}%"></span></span><span class="conf-num">${Math.round(p[key] * 100)}% sure</span>`;

  /* ───────── Level 1: be the pattern finder ───────── */
  function mountFinder(el, api) {
    const rule = (k) => (k.shape === "spiky" ? "Zog" : "Blip");
    const train = [C("blue", "spiky", "big", 2, "plain"), C("orange", "round", "small", 1, "spots"), C("green", "spiky", "small", 3, "stripes"),
      C("blue", "round", "big", 2, "stripes"), C("orange", "spiky", "big", 1, "plain"), C("green", "round", "small", 3, "plain")];
    const test = [C("orange", "spiky", "small", 2, "spots"), C("blue", "round", "small", 3, "plain"), C("green", "spiky", "big", 1, "stripes"), C("green", "round", "big", 2, "spots")];
    const answers = {};
    let ruleOk = false;
    el.innerHTML = `
      <div class="lab-panel">
        <h3>Training examples</h3>
        <p class="muted">A scientist labeled these creatures. Look for the pattern.</p>
        <div class="cr-row">${train.map((k) => `<figure class="cr-card cr-card--${rule(k).toLowerCase()}">${creature(k)}<figcaption>${rule(k)}</figcaption></figure>`).join("")}</div>
      </div>
      <div class="lab-panel">
        <h3>New creatures: predict each label</h3>
        <div class="cr-row">${test.map((k, i) => `<figure class="cr-card" data-t="${i}">${creature(k)}<figcaption class="seg"><button type="button" data-p="Zog" data-i="${i}">Zog</button><button type="button" data-p="Blip" data-i="${i}">Blip</button></figcaption></figure>`).join("")}</div>
      </div>
      <div class="lab-panel" id="rule-q" hidden>
        <h3>What rule were you using?</h3>
        <div class="choice-grid">${["Zogs are blue", "Zogs are spiky", "Zogs are big", "Zogs have 2 eyes"].map((t, i) => `<button type="button" class="choice" data-rule="${i}">${t}</button>`).join("")}</div>
      </div>`;
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-p]");
      if (b) {
        const i = Number(b.dataset.i);
        const right = rule(test[i]) === b.dataset.p;
        b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        b.closest(".cr-card").classList.toggle("is-right", right);
        b.closest(".cr-card").classList.toggle("is-wrong", !right);
        answers[i] = right;
        const n = Object.values(answers).filter(Boolean).length;
        if (n === test.length) { el.querySelector("#rule-q").hidden = false; api.say("All four right! Now name the rule you found.", "good"); }
        else api.say(right ? `${n} of 4 right so far.` : "Look at the training examples again. What do all the Zogs have in common that Blips don't?", right ? "info" : "warn");
      }
      const r = e.target.closest("[data-rule]");
      if (r) {
        if (r.dataset.rule === "1") { r.classList.add("is-right"); ruleOk = true; api.win({ rule: "spiky" }); }
        else { r.classList.add("is-wrong"); api.say("Check that rule against every example. Is there a Zog that breaks it?", "warn"); }
      }
    });
  }

  /* ───────── Level 2: train the machine with your own rule ───────── */
  function mountTrain(el, api) {
    const pool = pickSet("train-pool", 12);
    const test = pickSet("train-test", 6, (k) => !pool.some((p) => dist(p, k) === 0));
    const labels = {};
    const reviews = {};
    let trained = false;
    el.innerHTML = `
      <div class="lab-panel">
        <h3>1. Make up a secret rule, then label these examples</h3>
        <p class="muted">Decide what makes a creature <strong>Friendly</strong> or <strong>Grumpy</strong>. It's your rule, like “spotted ones are friendly.” Label at least 8 creatures.</p>
        <div class="cr-row" id="pool">${pool.map((k, i) => `<figure class="cr-card" data-c="${i}">${creature(k)}<figcaption class="seg"><button type="button" data-l="Friendly" data-i="${i}">Friendly</button><button type="button" data-l="Grumpy" data-i="${i}">Grumpy</button></figcaption></figure>`).join("")}</div>
        <div class="lab-row"><button type="button" class="btn btn--primary" id="train-btn" disabled>${icon("ai")}Train the machine</button><span class="muted" id="train-count">0 labeled</span></div>
      </div>
      <div class="lab-panel" id="test-panel" hidden>
        <h3>2. Test it on creatures it has never seen</h3>
        <p class="muted">For each prediction, does the machine agree with your secret rule? The small pictures show the 3 training examples it compared against.</p>
        <div id="tests"></div>
        <p class="lab-score" id="score"></p>
      </div>`;
    const update = () => {
      const n = Object.keys(labels).length;
      const both = new Set(Object.values(labels)).size === 2;
      el.querySelector("#train-count").textContent = `${n} labeled${n >= 8 && !both ? " · label some of each kind" : ""}`;
      el.querySelector("#train-btn").disabled = n < 8 || !both;
    };
    function showTests() {
      const train = Object.entries(labels).map(([i, label]) => ({ k: pool[i], label }));
      el.querySelector("#test-panel").hidden = false;
      el.querySelector("#tests").innerHTML = test.map((k, i) => {
        const p = predict(train, k);
        return `<div class="pred" data-r="${i}">${creature(k, 64)}<div class="pred__main"><strong>Machine says: ${esc(p.label)}</strong>${confBar(p)}<span class="pred__why">Compared with: ${nearHtml(p)}</span></div>
          <div class="seg" role="group" aria-label="Does it match your rule?"><button type="button" data-rv="yes" data-i="${i}">${icon("check")}Right</button><button type="button" data-rv="no" data-i="${i}">Wrong</button></div></div>`;
      }).join("");
      api.log("lab_trained", { examples: train.length });
    }
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-l]");
      if (b) {
        labels[b.dataset.i] = b.dataset.l;
        b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        update();
        if (trained) showTests();
      }
      if (e.target.closest("#train-btn")) { trained = true; showTests(); api.say("Trained! Check its predictions against your rule.", "info"); }
      const rv = e.target.closest("[data-rv]");
      if (rv) {
        reviews[rv.dataset.i] = rv.dataset.rv;
        rv.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === rv)));
        const n = Object.keys(reviews).length;
        const right = Object.values(reviews).filter((v) => v === "yes").length;
        el.querySelector("#score").textContent = `${right} of ${n} checked predictions match your rule${n === test.length ? ` (${Math.round((right / n) * 100)}% accuracy)` : ""}.`;
        if (n === test.length) {
          api.say(right >= 5 ? "Your machine learned your rule well!" : "Some predictions missed. Try labeling more examples, or more varied ones, and train again.", right >= 5 ? "good" : "info");
          api.win({ accuracy: right / n, examples: Object.keys(labels).length });
        }
      }
    });
    update();
  }

  /* ───────── Level 3: how many examples? ───────── */
  function mountHowMany(el, api) {
    const rule = (k) => (k.color === "orange" ? "Glim" : "Norp");
    const pool = pickSet("hm-pool", 14);
    const test = pickSet("hm-test", 12, (k) => !pool.some((p) => dist(p, k) === 0));
    const train = [];
    const history = [];
    el.innerHTML = `
      <div class="lab-panel">
        <h3>The machine needs to learn: what makes a Glim?</h3>
        <p class="muted">Add labeled examples one at a time. After each one, the machine is tested on 12 creatures it has never seen. Get it to 90% or better.</p>
        <div class="cr-row" id="hm-pool"></div>
      </div>
      <div class="hm-split">
        <div class="lab-panel"><h3>Accuracy as you add examples</h3><div id="hm-chart"></div></div>
        <div class="lab-panel"><h3>Training set <span class="muted" id="hm-n">0 examples</span></h3><div class="cr-row cr-row--small" id="hm-train"></div></div>
      </div>`;
    function accuracy() {
      if (!train.length) return 0;
      return test.filter((k) => predict(train, k).label === rule(k)).length / test.length;
    }
    function chart() {
      const w = 420, h = 180, pad = 32;
      const n = Math.max(6, history.length);
      const px = (i) => pad + (i / Math.max(1, n - 1)) * (w - pad - 12);
      const py = (v) => h - pad + 4 - v * (h - pad - 16);
      const pts = history.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
      el.querySelector("#hm-chart").innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="mini-chart" role="img" aria-label="Accuracy after each example: ${history.map((v) => Math.round(v * 100) + "%").join(", ") || "no examples yet"}">
          ${[0, 0.5, 0.9, 1].map((v) => `<line x1="${pad}" x2="${w - 8}" y1="${py(v)}" y2="${py(v)}" class="${v === 0.9 ? "goal-line" : "grid-line"}"/><text x="${pad - 6}" y="${py(v) + 4}" text-anchor="end" class="axis-label">${Math.round(v * 100)}%</text>`).join("")}
          <text x="${w - 8}" y="${py(0.9) - 5}" text-anchor="end" class="goal-label">goal 90%</text>
          ${history.length ? `<polyline points="${pts}" class="line"/>${history.map((v, i) => `<circle cx="${px(i)}" cy="${py(v)}" r="${i === history.length - 1 ? 5 : 3.5}" class="dot ${i === history.length - 1 ? "dot--last" : ""}"/>`).join("")}` : ""}
          <text x="${(w + pad) / 2}" y="${h - 4}" text-anchor="middle" class="axis-label">number of training examples</text>
        </svg>`;
    }
    function render() {
      el.querySelector("#hm-pool").innerHTML = pool.map((k, i) => train.some((t) => t.i === i) ? "" : `<figure class="cr-card">${creature(k, 64)}<figcaption><b class="tag tag--${rule(k).toLowerCase()}">${rule(k)}</b><button type="button" class="btn btn--ghost btn--small" data-add="${i}">${icon("plus")}Add</button></figcaption></figure>`).join("");
      el.querySelector("#hm-train").innerHTML = train.map((t) => `<figure class="cr-card cr-card--mini">${creature(t.k, 40)}<figcaption>${t.label}</figcaption></figure>`).join("") || `<p class="muted">Empty</p>`;
      el.querySelector("#hm-n").textContent = `${train.length} examples`;
      chart();
    }
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-add]");
      if (!b) return;
      const i = Number(b.dataset.add);
      train.push({ i, k: pool[i], label: rule(pool[i]) });
      const acc = accuracy();
      history.push(acc);
      render();
      if (acc >= 0.9) { api.say(`${Math.round(acc * 100)}% accurate with ${train.length} examples!`, "good"); api.win({ examples: train.length, accuracy: acc }); }
      else api.say(`Accuracy: ${Math.round(acc * 100)}%. ${train.length < 3 ? "With so few examples, the machine is mostly guessing." : "Try adding examples that are different from the ones it already has."}`, "info");
    });
    render();
  }

  /* ───────── Level 4: biased training data ───────── */
  function mountBias(el, api) {
    const rule = (k) => (k.shape === "spiky" ? "Don't pet" : "Safe to pet");
    // Biased starter set: every safe one is blue, every spiky one is orange
    const start = [C("blue", "round", "big", 2, "plain"), C("blue", "round", "small", 1, "spots"), C("blue", "round", "big", 3, "stripes"), C("blue", "round", "small", 2, "plain"),
      C("orange", "spiky", "big", 2, "plain"), C("orange", "spiky", "small", 1, "spots"), C("orange", "spiky", "big", 3, "stripes"), C("orange", "spiky", "small", 2, "plain")].map((k) => ({ k, label: rule(k) }));
    const test = [C("orange", "round", "big", 2, "plain"), C("orange", "round", "small", 1, "stripes"), C("blue", "spiky", "small", 2, "spots"), C("blue", "spiky", "big", 1, "plain"), C("blue", "round", "small", 3, "spots"), C("orange", "spiky", "big", 1, "stripes")];
    const extra = [C("orange", "round", "small", 2, "plain"), C("orange", "round", "big", 3, "spots"), C("blue", "spiky", "big", 2, "stripes"), C("blue", "spiky", "small", 3, "plain"), C("green", "round", "big", 1, "plain"), C("green", "spiky", "small", 2, "spots")];
    let train = start.slice();
    const flagged = new Set();
    let phase = "find";
    el.innerHTML = `
      <div class="lab-panel">
        <h3>The training data</h3>
        <p class="muted">The real rule is simple: <strong>spiky creatures are not safe to pet</strong>. Here's what the machine was trained on. Notice anything?</p>
        <div class="cr-row cr-row--small" id="b-train"></div>
      </div>
      <div class="lab-panel">
        <h3 id="b-title">Step 1: Tap every prediction the machine got wrong</h3>
        <div id="b-tests"></div>
      </div>
      <div class="lab-panel" id="b-fix" hidden>
        <h3>Step 2: Fix the training data</h3>
        <p class="muted">Add examples that teach the machine what really matters. Get every test prediction right.</p>
        <div class="cr-row" id="b-extra"></div>
      </div>`;
    function render() {
      el.querySelector("#b-train").innerHTML = train.map((t) => `<figure class="cr-card cr-card--mini">${creature(t.k, 40)}<figcaption>${esc(t.label)}</figcaption></figure>`).join("");
      el.querySelector("#b-tests").innerHTML = `<div class="pred-grid">${test.map((k, i) => {
        const p = predict(train, k);
        const wrong = p.label !== rule(k);
        return `<button type="button" class="pred pred--btn ${flagged.has(i) ? "is-flagged" : ""} ${phase === "fix" ? (wrong ? "is-wrong" : "is-right") : ""}" data-f="${i}" ${phase === "fix" ? "disabled" : ""} aria-pressed="${flagged.has(i)}">
          ${creature(k, 56)}<span class="pred__main"><strong>${esc(p.label)}</strong>${confBar(p)}</span>${phase === "fix" ? `<span class="pred__mark">${wrong ? "Wrong" : "Right"}</span>` : ""}</button>`;
      }).join("")}</div>${phase === "find" ? `<button type="button" class="btn btn--primary" id="b-check">${icon("check")}Check my answer</button>` : ""}`;
      if (phase === "fix") el.querySelector("#b-extra").innerHTML = extra.map((k, i) => train.includes(extra[i]._t) ? "" : `<figure class="cr-card">${creature(k, 64)}<figcaption><b class="tag">${esc(rule(k))}</b><button type="button" class="btn btn--ghost btn--small" data-x="${i}">${icon("plus")}Add</button></figcaption></figure>`).join("");
    }
    el.addEventListener("click", (e) => {
      const f = e.target.closest("[data-f]");
      if (f && phase === "find") { const i = Number(f.dataset.f); flagged.has(i) ? flagged.delete(i) : flagged.add(i); render(); return; }
      if (e.target.closest("#b-check")) {
        const wrongs = test.map((k, i) => (predict(train, k).label !== rule(k) ? i : -1)).filter((i) => i >= 0);
        const ok = wrongs.length === flagged.size && wrongs.every((i) => flagged.has(i));
        if (ok) {
          phase = "fix";
          el.querySelector("#b-title").textContent = "The machine's mistakes";
          el.querySelector("#b-fix").hidden = false;
          api.say("Exactly. In the training data, every safe creature was blue and every spiky one was orange, so the machine learned to look at color. That's bias in the data.", "good");
          render();
        } else api.say("Not quite. Check each prediction against the real rule: spiky = don't pet, round = safe.", "warn");
        return;
      }
      const x = e.target.closest("[data-x]");
      if (x) {
        const k = extra[Number(x.dataset.x)];
        const t = { k, label: rule(k) };
        k._t = t;
        train = train.concat(t);
        render();
        const wrong = test.filter((tk) => predict(train, tk).label !== rule(tk)).length;
        if (!wrong) { api.say("Every prediction is right now. Varied examples taught the machine that shape matters, not color.", "good"); api.win({ added: train.length - start.length }); }
        else api.say(`${wrong} still wrong. Which kinds of creatures were missing from the original data?`, "info");
      }
    });
    render();
  }

  /* ───────── Level 5: confidence and "I'm not sure" ───────── */
  function mountConfidence(el, api) {
    // Known species: spiky ones sink. Purple creatures are a new species that behaves the opposite way.
    const rule = (k) => ((k.shape === "spiky") !== (k.color === "purple") ? "Sinker" : "Floater");
    const known = (k) => k.color === "blue" || k.color === "orange";
    const train = pickSet("cf-a", 18, known).map((k) => ({ k, label: rule(k) }));
    const purple = pickSet("cf-purple", 4, (k) => k.color === "green").map((k) => ({ ...k, color: "purple" }));
    const test = SE.shuffle(pickSet("cf-test", 8, (k) => known(k) && !train.some((t) => dist(t.k, k) === 0)).concat(purple), "cf-mix");
    const preds = test.map((k) => ({ k, p: predict(train, k), truth: rule(k) }));
    let threshold = 20;
    el.innerHTML = `
      <div class="lab-panel">
        <h3>A machine should know when it doesn't know</h3>
        <p class="muted">This machine was trained only on blue and orange creatures: spiky ones sink, round ones float. Now some <strong>purple</strong> creatures show up. They're a new species, and nobody told the machine they behave differently. Set a confidence threshold: below it, the machine says <strong>“Not sure, ask a person.”</strong></p>
        <div class="range"><label for="cf-th">Confidence threshold <b id="cf-val">20%</b></label><input type="range" id="cf-th" min="20" max="90" step="5" value="20"></div>
        <p class="lab-score" id="cf-sum"></p>
        <p class="muted">Goal: no wrong answers given with confidence, while still answering at least half of the creatures.</p>
      </div>
      <div class="pred-grid" id="cf-grid"></div>`;
    function render() {
      let wrong = 0, right = 0, unsure = 0;
      el.querySelector("#cf-grid").innerHTML = preds.map(({ k, p, truth }) => {
        const sure = p.conf * 100 >= threshold;
        const ok = p.label === truth;
        if (!sure) unsure++; else if (ok) right++; else wrong++;
        return `<div class="pred ${!sure ? "is-unsure" : ok ? "is-right" : "is-wrong"}">${creature(k, 56)}<span class="pred__main"><strong>${sure ? esc(p.label) : "Not sure: ask a person"}</strong>${confBar(p, "conf")}</span><span class="pred__mark">${!sure ? "Asked a human" : ok ? "Right" : "Wrong"}</span></div>`;
      }).join("");
      el.querySelector("#cf-sum").innerHTML = `<b>${right}</b> right · <b>${wrong}</b> wrong · <b>${unsure}</b> “not sure”`;
      return { wrong, right, unsure };
    }
    el.querySelector("#cf-th").addEventListener("input", (e) => {
      threshold = Number(e.target.value);
      el.querySelector("#cf-val").textContent = `${threshold}%`;
      const r = render();
      if (r.wrong === 0 && r.right >= preds.length / 2) { api.say(`At ${threshold}%, the machine is never confidently wrong and still answers ${r.right} of ${preds.length}.`, "good"); api.win({ threshold }); }
      else if (r.wrong === 0) api.say("No wrong answers, but now it's unsure about almost everything. A tool that never answers isn't useful either. Find a balance.", "info");
      else api.say(`${r.wrong} confident mistakes. Raise the threshold.`, "info");
    });
    render();
  }

  /* ───────── Level 6: responsible use ───────── */
  const USES = [
    ["Counting puffins in photos from a Maine seabird island", "good", "Low risk, and it saves scientists hours. If it miscounts, a person can spot-check the photos, and no one is harmed."],
    ["Sorting Maine wild blueberries from leaves and stems on a conveyor belt", "good", "Low risk. A mistake means one leaf slips through, and machines like this help farms work faster."],
    ["Suggesting a library book you might like", "good", "Helpful and low risk. You still choose what to read."],
        ["Spotting something worrying on an X-ray", "human", "It can help doctors find things faster, but a doctor must check, because a mistake could hurt someone."],
    ["Grading a student's science report", "human", "A teacher should review it. AI can miss creative thinking or be unfair to some kinds of writing."],
    ["Choosing which people get a job interview", "human", "AI trained on past choices can copy past unfairness. People need to check the results."],
    ["Writing a whole essay and turning it in as your own", "not", "That's not your work. Using AI to brainstorm can be OK if your teacher allows it, but passing off its writing as yours isn't honest."],
    ["Asking kids to type their home address into a chatbot", "not", "Never share personal information like your address with an AI tool."],
    ["Guessing someone's mood from a photo to put them in a group", "not", "Faces don't reliably show feelings, and it's not fair or private to sort people this way."]
  ];
  function mountResponsible(el, api) {
    const order = SE.shuffle(USES.map((_, i) => i), "resp");
    const answered = {};
    const BIN = { good: "Good use", human: "OK if a person checks", not: "Not OK" };
    el.innerHTML = `
      <div class="lab-panel">
        <h3>Should we use AI for this?</h3>
        <p class="muted">For each idea, choose: a good use, OK only if a person checks the AI's work, or not OK.</p>
        <ol class="oi-list">${order.map((i) => `
          <li data-row="${i}"><p>${esc(USES[i][0])}</p>
            <div class="seg" role="group" aria-label="Your choice">${Object.entries(BIN).map(([k, v]) => `<button type="button" data-u="${k}" data-i="${i}">${v}</button>`).join("")}</div>
            <p class="oi-why" hidden></p></li>`).join("")}</ol>
      </div>`;
    el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-u]");
      if (!b) return;
      const i = Number(b.dataset.i);
      const row = el.querySelector(`[data-row="${i}"]`);
      const right = USES[i][1] === b.dataset.u;
      row.querySelectorAll("[data-u]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const why = row.querySelector(".oi-why");
      why.hidden = false;
      why.className = `oi-why ${right ? "is-right" : "is-wrong"}`;
      why.textContent = `${right ? "Agreed." : `Many people would say “${BIN[USES[i][1]]}.”`} ${USES[i][2]}`;
      answered[i] = right;
      const n = Object.values(answered).filter(Boolean).length;
      if (n === USES.length) { api.say("You thought through every case. The bigger the possible harm, the more a human needs to be in charge.", "good"); api.win({ correct: n }); }
      else api.say(`${n} of ${USES.length} match. Think about: how bad is a mistake, and who could be harmed?`, "info");
    });
  }

  const LEVELS = [
    { title: "Be the pattern finder", concept: "Patterns",
      goal: "Study the labeled examples, predict 4 new creatures, then name the rule.",
      hint: "Compare the Zogs to each other. Ignore color for a second. What shape are they?",
      learned: "Finding a pattern in labeled examples and using it to label new things is exactly what machine learning does, just much faster and with many more examples." },
    { title: "Train the machine", concept: "Training examples",
      goal: "Invent a secret rule, label at least 8 creatures, train the machine, and check 6 of its predictions.",
      steps: ["Pick a rule, like “striped ones are friendly.”", "Label creatures using your rule.", "Train, then mark each prediction right or wrong."],
      hint: "Keep your rule simple and stick to it. Label some creatures of each kind so the machine sees both.",
      learned: "The machine never knew your rule. It only had your examples. It labels new creatures by finding the most similar examples it was trained on." },
    { title: "How many examples?", concept: "More data",
      goal: "Add labeled examples until the machine is at least 90% accurate.",
      hint: "Watch the chart. Examples that are different from the ones the machine already has usually help the most.",
      learned: "With only a few examples, AI mostly guesses. More, and more varied, examples usually make it more accurate, which is why real AI uses huge amounts of data." },
    { title: "Spot the bias", concept: "Bias in data",
      goal: "Find the machine's wrong predictions, then fix the training data so every prediction is right.",
      hint: "In the training data, color and shape always go together. The machine can't tell which one matters. Add examples where they don't go together.",
      learned: "If training data is lopsided, AI learns the wrong lesson. This is called bias. Fixing it means checking the data, not just the machine." },
    { title: "Know when you don't know", concept: "Confidence and limits",
      goal: "Set a confidence threshold so the machine is never confidently wrong, but still answers at least half.",
      hint: "Slide slowly and watch the counts. Which creatures does the machine get wrong? Are they like anything it saw in training? Look at their confidence.",
      learned: "AI always produces an answer, even when it shouldn't. Good AI tools show how confident they are and hand hard cases to a person." },
    { title: "Use AI responsibly", concept: "Responsible use",
      goal: "Decide whether AI should be used in 9 situations.",
      hint: "Ask two questions: How bad would a mistake be? Does it involve someone's private information?",
      learned: "Whether to use AI depends on the stakes. Low-risk uses are fine; high-stakes decisions need a human in charge; some uses aren't fair, honest, or private." }
  ];

  SE.labs.register({
    id: "pattern-machine",
    area: "ai",
    title: "Pattern Machine Lab",
    tagline: "Teach a real machine-learning model with examples, then find out where it goes wrong and why.",
    levels: LEVELS,
    mount(el, idx, api) {
      return [mountFinder, mountTrain, mountHowMany, mountBias, mountConfidence, mountResponsible][idx](el, api);
    }
  });
  SE.creatureArt = creature;
  SE._ai = { predict, pickSet, dist, all };
})();
