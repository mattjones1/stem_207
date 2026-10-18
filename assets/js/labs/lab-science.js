/*
 * Sled Hill Science — Science & Discovery (lab id "ramp-racers")
 * A virtual investigation on a model sledding hill: slide a toy sled down and measure how far it glides.
 * Students predict, repeat trials, see natural variation, control variables,
 * graph their data, and write a claim supported by evidence and reasoning.
 * Results include small random variation, like a real experiment.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const SURFACES = { carpet: { name: "Fresh powder", mu: 0.36, color: "#ffffff" }, wood: { name: "Packed snow", mu: 0.2, color: "#dbe4ec" }, tile: { name: "Ice", mu: 0.13, color: "#b6dcec" } };
  const MASSES = { light: { name: "Sled only" }, heavy: { name: "Sled + 4 washers" } };
  let noiseSeed = 0;

  function runTrial(c) {
    const r = SE.rng(`trial-${Date.now()}-${noiseSeed++}`);
    // Two random numbers give a gentle bell-shaped wobble of about ±6%
    const wobble = 1 + ((r() + r()) - 1) * 0.12;
    const massEffect = c.mass === "heavy" ? 1.02 : 1; // real sleds: mass barely matters
    return Math.round(((c.height * 0.85) / SURFACES[c.surface].mu) * wobble * massEffect);
  }

  const LEVELS = [
    { title: "Predict and test", concept: "Prediction",
      question: "Does a higher sledding hill make the sled slide farther?",
      goal: "Make a prediction, test at least 3 different hill heights, then answer the question using your data.",
      hint: "Keep the snow and the sled the same. Only change the height. Try a low, a middle, and a high hill.",
      learned: "A prediction is a testable idea. Your data showed the higher the hill, the farther the sled slid, because it was moving faster at the bottom.",
      vary: "height" },
    { title: "Same setup, different results", concept: "Variation",
      question: "If you run the exact same test again, do you get the exact same distance?",
      goal: "Run the same setup at least 4 times, then figure out the best way to report your result.",
      hint: "Don't change anything. Just press Run trial several times and compare the distances.",
      learned: "Real measurements vary a little each time. Scientists repeat trials and use the average, which is more trustworthy than any single result.",
      vary: "none", lock: ["height", "surface", "mass"] },
    { title: "Fair test: kind of snow", concept: "Controlling variables",
      question: "Which kind of snow lets the sled slide the farthest?",
      goal: "Test all 3 kinds of snow at least 2 times each, keeping height and sled the same, then answer the question.",
      hint: "Pick one height and one sled, and don't touch them. Change only the snow. The table marks any unfair trial.",
      learned: "In a fair test you change one variable (the snow) and keep the rest the same (height, sled). Then any difference must come from the variable you changed.",
      vary: "surface" },
    { title: "Does weight matter?", concept: "Testing a hunch",
      question: "Does adding washers to make the sled heavier change how far it slides?",
      goal: "Predict, then test both sleds at least 3 times each with everything else the same. Answer using your averages.",
      hint: "Compare the averages, not single trials. Is the difference bigger than the normal wobble you saw in level 2?",
      learned: "Many people predict heavier sleds go farther, but the evidence says the difference is tiny. Good scientists let the data change their minds.",
      vary: "mass" },
    { title: "Claim, evidence, reasoning", concept: "Explaining with evidence",
      question: "How does hill height affect how far the sled slides?",
      goal: "Collect data, then write a scientific explanation: pick a claim, choose evidence from your table, and choose your reasoning.",
      hint: "Your evidence should be trials where only the height changed. Pick at least 2 rows with different heights.",
      learned: "A claim, backed by evidence and connected by reasoning, is how scientists explain what they found and convince others.",
      vary: "height", cer: true }
  ];

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const c = { height: 30, surface: "wood", mass: "light" };
    const trials = [];
    let prediction = null, answered = false, anim = null;
    const lock = new Set(L.lock || []);

    el.innerHTML = `
      <div class="lab-panel ramp__q"><span class="eyebrow">Question</span><h3>${esc(L.question)}</h3>
        ${idx === 0 || idx === 3 ? `<div class="pred-q"><span class="muted">Your prediction:</span><div class="seg" role="group" aria-label="Prediction">${(idx === 0 ? ["Farther", "Shorter", "No difference"] : ["Heavier goes farther", "Heavier goes shorter", "About the same"]).map((p) => `<button type="button" data-pred="${esc(p)}">${esc(p)}</button>`).join("")}</div></div>` : ""}
      </div>
      <div class="lab-panel">
        <canvas class="ramp__canvas" width="900" height="300" role="img" aria-label="Side view: a toy sled slides down a model snow hill and a tape measure shows the distance"></canvas>
        <div class="ramp__controls">
          <div class="range"><label for="rp-h">Hill height <b id="rp-h-v"></b></label><input type="range" id="rp-h" min="10" max="50" step="5" ${lock.has("height") ? "disabled" : ""}></div>
          <div class="range"><span class="range__label">Snow</span><div class="seg" role="group" aria-label="Kind of snow">${Object.entries(SURFACES).map(([k, v]) => `<button type="button" data-surf="${k}" ${lock.has("surface") ? "disabled" : ""}>${v.name}</button>`).join("")}</div></div>
          <div class="range"><span class="range__label">Sled</span><div class="seg" role="group" aria-label="Sled">${Object.entries(MASSES).map(([k, v]) => `<button type="button" data-mass="${k}" ${lock.has("mass") ? "disabled" : ""}>${v.name}</button>`).join("")}</div></div>
          <button type="button" class="btn btn--launch btn--big" id="rp-run">${icon("rocket")}Run trial</button>
        </div>
      </div>
      <div class="ramp__data">
        <div class="lab-panel"><h3>${icon("clipboard", 'class="inline-icon"')}Data table</h3><div class="table-scroll"><table class="data-table"><thead><tr>${L.cer ? "<th>Use</th>" : ""}<th>Trial</th><th>Height</th><th>Snow</th><th>Sled</th><th>Distance</th></tr></thead><tbody id="rp-rows"><tr><td colspan="6" class="muted">No trials yet.</td></tr></tbody></table></div></div>
        <div class="lab-panel"><h3>${icon("chart", 'class="inline-icon"')}Graph</h3><div id="rp-chart"></div></div>
      </div>
      <div class="lab-panel" id="rp-answer" hidden></div>`;

    const canvas = el.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const PX = 2.2; // canvas px per cm on the floor
    function draw(rollT = null, dist = 0) {
      const W = canvas.width, H = canvas.height, floorY = 230;
      ctx.clearRect(0, 0, W, H);
      const sk = ctx.createLinearGradient(0, 0, 0, floorY); sk.addColorStop(0, "#c7dcec"); sk.addColorStop(1, "#eef3f6");
      ctx.fillStyle = sk; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#2f4a2c";
      for (let px = 170; px < W; px += 22) { const h = 30 + ((px * 31) % 26); ctx.beginPath(); ctx.moveTo(px - 11, floorY); ctx.lineTo(px, floorY - h); ctx.lineTo(px + 11, floorY); ctx.fill(); ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.moveTo(px, floorY - h); ctx.lineTo(px - 5, floorY - h + 12); ctx.lineTo(px + 5, floorY - h + 12); ctx.fill(); ctx.fillStyle = "#2f4a2c"; }
      ctx.fillStyle = SURFACES[c.surface].color; ctx.fillRect(0, floorY, W, 24);
      ctx.strokeStyle = "#9fb2c2"; ctx.lineWidth = 1; ctx.strokeRect(0.5, floorY + .5, W - 1, 23);
      ctx.fillStyle = "#0d1d36"; ctx.fillRect(0, floorY + 24, W, 3);
      // tape measure
      const x0 = 150;
      ctx.fillStyle = "#f4d35e"; ctx.fillRect(x0, floorY + 30, W - x0 - 10, 22);
      ctx.fillStyle = "#0d1d36"; ctx.font = "700 15px 'Atkinson Hyperlegible', sans-serif"; ctx.textAlign = "center";
      for (let cm = 0; x0 + cm * PX < W - 12; cm += 25) {
        ctx.fillRect(x0 + cm * PX - 1, floorY + 30, 2, cm % 50 === 0 ? 12 : 7);
        if (cm % 50 === 0) ctx.fillText(`${cm}`, x0 + cm * PX, floorY + 66);
      }
      ctx.textAlign = "left"; ctx.fillText("cm", W - 40, floorY + 66);
      // ramp
      const rh = c.height * 3.2;
      ctx.fillStyle = "#f7f9fb"; ctx.strokeStyle = "#9fb2c2"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, floorY - rh); ctx.lineTo(20, floorY - rh); ctx.quadraticCurveTo(x0 * .55, floorY - rh * .45, x0, floorY); ctx.lineTo(0, floorY); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#0d1d36"; ctx.textAlign = "left"; ctx.fillText(`${c.height} cm`, 24, floorY - rh - 8);
      // car position
      let cx, cy, ang = 0;
      if (rollT === null) { cx = 30; cy = floorY - rh + 8; ang = Math.atan2(rh, x0 - 20); }
      else if (rollT < 0.3) { const k = rollT / 0.3; cx = 30 + (x0 - 30) * k; cy = floorY - rh + 8 + (rh - 8) * k; ang = Math.atan2(rh, x0 - 20); }
      else { const k = (rollT - 0.3) / 0.7; const e = 1 - Math.pow(1 - k, 2); cx = x0 + dist * PX * e; cy = floorY; }
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
      ctx.fillStyle = "#c9302c"; ctx.fillRect(0, -14, 34, 8);
      ctx.strokeStyle = "#0d1d36"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(32, -2); ctx.quadraticCurveTo(40, -2, 38, -10); ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6, -6); ctx.lineTo(6, -2); ctx.moveTo(26, -6); ctx.lineTo(26, -2); ctx.stroke();
      if (c.mass === "heavy") { ctx.fillStyle = "#8a96a3"; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(6 + k * 7, -17, 3.5, 0, Math.PI * 2); ctx.fill(); } }
      ctx.restore();
      if (rollT !== null && rollT >= 1) {
        ctx.fillStyle = "#0b7471"; ctx.fillRect(x0 + dist * PX + 16, floorY - 40, 3, 40);
        ctx.textAlign = "center"; ctx.fillText(`${dist} cm`, x0 + dist * PX + 18, floorY - 48);
      }
    }

    function sync() {
      el.querySelector("#rp-h").value = c.height;
      el.querySelector("#rp-h-v").textContent = `${c.height} cm`;
      el.querySelectorAll("[data-surf]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.surf === c.surface)));
      el.querySelectorAll("[data-mass]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mass === c.mass)));
      if (!anim) draw();
    }
    el.querySelector("#rp-h").addEventListener("input", (e) => { c.height = Number(e.target.value); sync(); });
    el.querySelectorAll("[data-surf]").forEach((b) => b.addEventListener("click", () => { c.surface = b.dataset.surf; sync(); }));
    el.querySelectorAll("[data-mass]").forEach((b) => b.addEventListener("click", () => { c.mass = b.dataset.mass; sync(); }));
    el.querySelectorAll("[data-pred]").forEach((b) => b.addEventListener("click", () => {
      prediction = b.dataset.pred;
      el.querySelectorAll("[data-pred]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      api.log("lab_prediction", { prediction });
      api.say("Prediction recorded. Now test it.", "info");
    }));

    // A trial is "fair" for this level if everything except the tested variable matches the first trial.
    const fairKeys = { height: ["surface", "mass"], surface: ["height", "mass"], mass: ["height", "surface"], none: ["height", "surface", "mass"] }[L.vary];
    const isFair = (t) => !trials.length || fairKeys.every((k) => t[k] === trials[0][k]);
    const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

    el.querySelector("#rp-run").addEventListener("click", () => {
      if (anim) return;
      if ((idx === 0 || idx === 3) && !prediction) { api.say("Make a prediction first. What do you think will happen?", "warn"); return; }
      const dist = runTrial(c);
      const t = { ...c, dist };
      t.fair = isFair(t);
      const t0 = performance.now();
      const dur = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 1200;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur);
        draw(k, dist);
        if (k < 1) anim = requestAnimationFrame(step);
        else { anim = null; trials.push(t); api.log("lab_test_run", { ...c, dist }); render(); afterTrial(t); }
      };
      anim = requestAnimationFrame(step);
    });

    function render() {
      el.querySelector("#rp-rows").innerHTML = trials.map((t, i) => `<tr class="${i === trials.length - 1 ? "is-new" : ""}">
        ${L.cer ? `<td><input type="checkbox" data-ev="${i}" aria-label="Use trial ${i + 1} as evidence"></td>` : ""}
        <td>${i + 1}${t.fair ? "" : ` <span class="unfair" title="Not a fair comparison">unfair</span>`}</td><td>${t.height} cm</td><td>${SURFACES[t.surface].name}</td><td>${MASSES[t.mass].name}</td><td><b>${t.dist} cm</b></td></tr>`).join("") || `<tr><td colspan="6" class="muted">No trials yet.</td></tr>`;
      chart();
    }

    function chart() {
      const box = el.querySelector("#rp-chart");
      const data = trials.filter((t) => t.fair);
      if (!data.length) { box.innerHTML = `<p class="muted">Run a trial to start your graph.</p>`; return; }
      const w = 440, h = 220, pl = 46, pb = 36, pt = 14, pr = 12;
      const yMax = Math.max(100, Math.ceil(Math.max(...data.map((t) => t.dist)) / 100) * 100);
      const py = (v) => h - pb - (v / yMax) * (h - pb - pt);
      let marks = "", xAxis = "";
      if (L.vary === "height" || L.vary === "none") {
        const px = (v) => pl + ((v - 10) / 40) * (w - pl - pr);
        marks = data.map((t, i) => `<circle cx="${(px(t.height) + (data.filter((d, j) => j < i && d.height === t.height).length % 5 - 2) * 4).toFixed(1)}" cy="${py(t.dist).toFixed(1)}" r="5" class="dot"/>`).join("");
        if (L.vary === "none" && data.length > 1) { const a = avg(data.map((t) => t.dist)); marks += `<line x1="${pl}" x2="${w - pr}" y1="${py(a)}" y2="${py(a)}" class="avg-line"/><text x="${w - pr}" y="${py(a) - 6}" text-anchor="end" class="avg-label">average ${a} cm</text>`; }
        xAxis = [10, 20, 30, 40, 50].map((v) => `<text x="${px(v)}" y="${h - pb + 18}" text-anchor="middle" class="axis-label">${v}</text>`).join("") + `<text x="${(w + pl) / 2}" y="${h - 2}" text-anchor="middle" class="axis-label">hill height (cm)</text>`;
      } else {
        const groups = L.vary === "surface" ? Object.keys(SURFACES) : Object.keys(MASSES);
        const names = L.vary === "surface" ? SURFACES : MASSES;
        const bw = (w - pl - pr) / groups.length;
        groups.forEach((g, i) => {
          const vals = data.filter((t) => t[L.vary] === g).map((t) => t.dist);
          const x = pl + i * bw;
          if (vals.length) {
            const a = avg(vals);
            marks += `<rect x="${x + bw * 0.2}" y="${py(a)}" width="${bw * 0.6}" height="${h - pb - py(a)}" class="bar" rx="3"/><text x="${x + bw / 2}" y="${py(a) - 6}" text-anchor="middle" class="bar-label">${a} cm</text>`;
            marks += vals.map((v, k) => `<circle cx="${x + bw * 0.35 + (k % 4) * bw * 0.1}" cy="${py(v)}" r="3.5" class="dot dot--small"/>`).join("");
          }
          xAxis += `<text x="${x + bw / 2}" y="${h - pb + 18}" text-anchor="middle" class="axis-label">${esc(names[g].name)}</text>`;
        });
        xAxis += `<text x="${(w + pl) / 2}" y="${h - 2}" text-anchor="middle" class="axis-label">average distance (bars) and each trial (dots)</text>`;
      }
      const grid = [0, 0.5, 1].map((f) => `<line x1="${pl}" x2="${w - pr}" y1="${py(yMax * f)}" y2="${py(yMax * f)}" class="grid-line"/><text x="${pl - 6}" y="${py(yMax * f) + 4}" text-anchor="end" class="axis-label">${Math.round(yMax * f)}</text>`).join("");
      box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="mini-chart" role="img" aria-label="Graph of distance traveled for each fair trial">${grid}<line x1="${pl}" x2="${pl}" y1="${pt}" y2="${h - pb}" class="axis"/><line x1="${pl}" x2="${w - pr}" y1="${h - pb}" y2="${h - pb}" class="axis"/>${marks}${xAxis}<text x="12" y="${(h - pb) / 2}" transform="rotate(-90 12 ${(h - pb) / 2})" text-anchor="middle" class="axis-label">distance (cm)</text></svg>`;
    }

    function ask(question, options, correctIdx, onRight, whyRight, whyWrong) {
      const box = el.querySelector("#rp-answer");
      box.hidden = false;
      box.innerHTML = `<h3>${esc(question)}</h3><div class="choice-grid">${options.map((o, i) => `<button type="button" class="choice" data-ans="${i}">${esc(o)}</button>`).join("")}</div><p class="explain" id="rp-why" hidden></p>`;
      box.querySelectorAll("[data-ans]").forEach((b) => b.addEventListener("click", () => {
        const i = Number(b.dataset.ans);
        const why = box.querySelector("#rp-why");
        why.hidden = false;
        if (i === correctIdx) {
          b.classList.add("is-right");
          box.querySelectorAll("[data-ans]").forEach((x) => (x.disabled = true));
          why.textContent = whyRight;
          onRight();
        } else { b.classList.add("is-wrong"); why.textContent = whyWrong; }
      }));
    }

    function afterTrial(t) {
      const fair = trials.filter((x) => x.fair);
      if (!t.fair) api.say(`Trial ${trials.length} isn't a fair comparison: you changed more than the ${L.vary === "none" ? "nothing" : L.vary} you're testing. It won't go on the graph.`, "warn");
      else api.say(`Trial ${trials.length}: ${t.dist} cm.`, "info");
      if (answered) return;

      if (idx === 0) {
        const heights = new Set(fair.map((x) => x.height));
        if (heights.size >= 3) {
          answered = true;
          ask("What does your data show?", ["Higher hills make the sled slide farther", "Higher hills make the sled slide shorter", "Height makes no difference"], 0,
            () => api.win({ trials: trials.length, prediction }),
            `Right. ${prediction === "Farther" ? "Your prediction was supported." : "Your prediction wasn't supported, and that's fine: the evidence decides."} A higher start means the sled is going faster at the bottom.`,
            "Look at your graph again. As the dots move right (higher hill), do they go up or down?");
        }
      }
      if (idx === 1 && fair.length >= 4) {
        const vals = fair.map((x) => x.dist);
        const a = avg(vals), mn = Math.min(...vals), mx = Math.max(...vals);
        answered = true;
        ask(`Your distances ranged from ${mn} to ${mx} cm. What's the best result to report?`, [`The first trial: ${vals[0]} cm`, `The longest one: ${mx} cm`, `The average: ${a} cm`], 2,
          () => api.win({ trials: trials.length, range: mx - mn }),
          "Yes. Tiny differences (how the sled was let go, a bump in the snow) change each trial. Averaging several trials cancels out the random wobble.",
          "Picking one trial, especially the best one, can be misleading. Which number uses all of your data?");
      }
      if (idx === 2) {
        const counts = Object.keys(SURFACES).map((s) => fair.filter((x) => x.surface === s).length);
        if (counts.every((n) => n >= 2)) {
          answered = true;
          ask("Which kind of snow let the sled slide farthest?", ["Fresh powder", "Packed snow", "Ice"], 2,
            () => api.win({ trials: trials.length }),
            "Right. Ice is the smoothest, so there's the least friction slowing the sled down. Fluffy fresh powder has the most friction, which is why sled runs get faster after a few rides pack the snow down.",
            "Look at the bar graph. Which bar is tallest?");
        }
      }
      if (idx === 3) {
        const counts = Object.keys(MASSES).map((m) => fair.filter((x) => x.mass === m).length);
        if (counts.every((n) => n >= 3)) {
          answered = true;
          const al = avg(fair.filter((x) => x.mass === "light").map((x) => x.dist)), ah = avg(fair.filter((x) => x.mass === "heavy").map((x) => x.dist));
          ask(`Averages: sled only ${al} cm, with washers ${ah} cm. What can you conclude?`, ["The heavier sled goes much farther", "The heavier sled goes much shorter", "Weight made little or no difference"], 2,
            () => api.win({ trials: trials.length, prediction }),
            `Yes. A difference of ${Math.abs(al - ah)} cm is about the same size as the normal trial-to-trial wobble. ${prediction === "About the same" ? "Your prediction was supported!" : "Changing your mind because of evidence is exactly what scientists do."}`,
            "Compare the size of the difference to the wobble between repeated trials. Is it bigger?");
        }
      }
      if (idx === 4 && fair.length >= 3 && !el.querySelector("#cer")) cerBuilder();
    }

    function cerBuilder() {
      const box = el.querySelector("#rp-answer");
      box.hidden = false;
      box.innerHTML = `
        <div id="cer" class="cer">
          <h3>Write your scientific explanation</h3>
          <fieldset class="cer__part"><legend><b>Claim</b> · your answer to the question</legend>
            ${["Higher hills make the sled slide farther.", "Lower hills make the sled slide farther.", "Hill height doesn't affect distance."].map((t, i) => `<label class="check-row"><input type="radio" name="cer-claim" value="${i}"> ${esc(t)}</label>`).join("")}</fieldset>
          <div class="cer__part"><b>Evidence</b> · check at least 2 rows in your data table where only the height changed.</div>
          <fieldset class="cer__part"><legend><b>Reasoning</b> · why the evidence supports the claim</legend>
            ${["A sled that starts higher is going faster at the bottom of the hill, so it slides farther before friction stops it.", "Higher hills have better snow.", "The sled wanted to go farther."].map((t, i) => `<label class="check-row"><input type="radio" name="cer-reason" value="${i}"> ${esc(t)}</label>`).join("")}</fieldset>
          <button type="button" class="btn btn--primary" id="cer-check">${icon("check")}Check my explanation</button>
        </div>`;
      box.querySelector("#cer-check").addEventListener("click", () => {
        const claim = box.querySelector("input[name=cer-claim]:checked");
        const reason = box.querySelector("input[name=cer-reason]:checked");
        const ev = [...el.querySelectorAll("[data-ev]:checked")].map((x) => trials[Number(x.dataset.ev)]);
        if (!claim || claim.value !== "0") return api.say("Check your claim against the graph. Does it match what your data shows?", "warn");
        if (ev.length < 2) return api.say("Choose at least 2 rows from your data table as evidence.", "warn");
        if (ev.some((t) => !t.fair)) return api.say("One of your evidence rows isn't a fair comparison. Use rows where only the height changed.", "warn");
        if (new Set(ev.map((t) => t.height)).size < 2) return api.say("Your evidence rows all have the same height. Pick rows with different heights so they show the effect.", "warn");
        const sorted = ev.slice().sort((a, b) => a.height - b.height);
        if (sorted[sorted.length - 1].dist <= sorted[0].dist) return api.say("In the rows you picked, the higher hill didn't go farther. Pick rows that clearly show the pattern, or run more trials.", "warn");
        if (!reason || reason.value !== "0") return api.say("Your reasoning should explain WHY using science: what's different about a sled that starts higher?", "warn");
        const lo = sorted[0], hi = sorted[sorted.length - 1];
        api.say(`Strong explanation: at ${lo.height} cm the sled slid ${lo.dist} cm, and at ${hi.height} cm it slid ${hi.dist} cm.`, "good");
        api.win({ evidence: ev.length });
      });
    }

    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    sync();
    render();
    return () => { ro.disconnect(); cancelAnimationFrame(anim); };
  }

  SE.labs.register({
    id: "ramp-racers",
    simulation: "This hill is a computer simulation built from a simple model of sliding. Real hills, sleds, and snow can behave differently. What would you need to test this on a real hill?",
    area: "science",
    title: "Sled Hill Science",
    tagline: "It's a snow day in Maine. Run an investigation on a simulated sledding hill: predict, test, repeat, keep it fair, graph your data, and explain what you found.",
    levels: LEVELS,
    mount
  });
})();
