/*
 * Engineering & Robotics labs
 *
 * Pumpkin Launcher Lab: design, test, and iterate a catapult for a Maine fall-fair pumpkin toss. Students predict,
 *   change one variable at a time, work within a budget, and keep an
 *   engineering notebook of every trial.
 * Snowplow Robot Lab: after a nor'easter, a robot plow with two light sensors follows the road line using
 *   sense → think → act rules that students write and debug.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const G = 9.8;
  const LOADS = { light: { name: "Gourd", m: 1 }, medium: { name: "Pie pumpkin", m: 1.5 }, heavy: { name: "Big pumpkin", m: 2.2 } };

  /* ═════════════ Launcher Lab ═════════════ */
  const LAUNCH_LEVELS = [
    { title: "First launch", concept: "Test and observe",
      goal: "It's fall-fair season in Maine. Land a pumpkin on the hay bale target at 12 meters.",
      hint: "Try a launch, then look at where it landed. Too short? Pull back harder or change the angle.",
      learned: "Engineers learn by testing. Every launch gives you data, even the squashed misses.",
      targets: [12], start: { angle: 30, force: 5, load: "medium" } },
    { title: "Predict first", concept: "Prediction",
      goal: "Before each launch, predict the distance. Hit the target at 18 m with a prediction within 3 m of the result.",
      hint: "Use your notebook. If force 6 went 12 m, how far might force 7 go? Predict, then check.",
      learned: "Predicting before testing makes you think about how the design works. Comparing predictions to results is how you improve your mental model.",
      targets: [18], predict: true, start: { angle: 45, force: 4, load: "medium" } },
    { title: "One change at a time", concept: "Fair test",
      goal: "Hit the target at 15 m, changing only one setting between launches.",
      hint: "Pick one setting, like force, and change only that. When you get close, switch to fine-tuning one thing.",
      learned: "Changing one variable at a time is a fair test. If you change two things and it works, you don't know which change helped.",
      targets: [15], fair: true, start: { angle: 20, force: 4, load: "heavy" } },
    { title: "Over the wall", concept: "Design constraints",
      goal: "Clear the 4 m stack of hay bales and land on the target at 16 m.",
      hint: "A low, flat launch hits the wall. What happens to the path if you aim higher?",
      learned: "Constraints, like a stack of hay bales in the way, change which design is best. A steeper angle trades distance for height.",
      targets: [16], wall: { x: 10, h: 4 }, start: { angle: 30, force: 7, load: "medium" } },
    { title: "Budget build", concept: "Optimize",
      goal: "Hit the target at 22 m without going over the $50 budget.",
      steps: ["Each force level costs $5 (stronger springs cost more).", "Loads cost $5 (gourd), $8 (pie pumpkin), or $10 (big pumpkin)."],
      hint: "With a limited budget, make the most of every setting. Which angle sends a pumpkin the farthest? Which load is easiest to launch?",
      learned: "Real engineering has budgets. Optimizing means getting the best result from limited resources, like finding the angle that gives the most distance.",
      targets: [22], budget: 50, start: { angle: 30, force: 6, load: "heavy" } },
    { title: "Three targets", concept: "Iterate to mastery",
      goal: "Hit all three targets (8 m, 14 m, 20 m) in 8 launches or fewer.",
      hint: "Use what your notebook shows about how force and angle change distance. Plan each launch instead of guessing.",
      learned: "Iteration plus good records turns guessing into engineering. You used data from earlier trials to plan new ones.",
      targets: [8, 14, 20], maxTrials: 8, start: { angle: 45, force: 5, load: "medium" } }
  ];
  const cost = (s) => s.force * 5 + { light: 5, medium: 8, heavy: 10 }[s.load];

  function simulate(s, wall) {
    const v2 = (s.force * 25) / LOADS[s.load].m;
    const v = Math.sqrt(v2), th = (s.angle * Math.PI) / 180;
    const vx = v * Math.cos(th), vy = v * Math.sin(th), h0 = 1;
    const tFlight = (vy + Math.sqrt(vy * vy + 2 * G * h0)) / G;
    const pts = [];
    let hitWall = false, land = vx * tFlight;
    // Height of the ball at the moment it reaches the wall
    if (wall && wall.x < land) {
      const tw = wall.x / vx;
      const yw = h0 + vy * tw - 0.5 * G * tw * tw;
      if (yw < wall.h) { hitWall = true; land = wall.x; }
    }
    const tEnd = hitWall ? wall.x / vx : tFlight;
    for (let i = 0; i <= 60; i++) {
      const t = (tEnd * i) / 60;
      pts.push([vx * t, Math.max(0, h0 + vy * t - 0.5 * G * t * t)]);
    }
    return { pts, land, hitWall };
  }

  function mountLauncher(el, idx, api) {
    const L = LAUNCH_LEVELS[idx];
    const s = { ...L.start };
    const trials = [];
    const hits = new Set();
    let last = null;
    let anim = null;
    el.innerHTML = `
      <div class="launch">
        <div class="lab-panel launch__field">
          <canvas class="launch__canvas" width="900" height="380" role="img" aria-label="Side view of the pumpkin launcher and hay bale target"></canvas>
          <p class="launch__result" id="ln-result" aria-live="polite"></p>
        </div>
        <div class="launch__controls lab-panel">
          <div class="range"><label for="ln-angle">Launch angle <b id="ln-angle-v"></b></label><input type="range" id="ln-angle" min="10" max="80" step="5"></div>
          <div class="range"><label for="ln-force">Spring force <b id="ln-force-v"></b></label><input type="range" id="ln-force" min="1" max="10" step="1"></div>
          <div class="range"><span class="range__label">Load</span>
            <div class="seg" role="group" aria-label="Load">${Object.entries(LOADS).map(([k, v]) => `<button type="button" data-load="${k}">${esc(v.name)}</button>`).join("")}</div></div>
          ${L.budget ? `<p class="budget" id="ln-budget"></p>` : ""}
          ${L.predict ? `<div class="form__field"><label for="ln-pred">Your prediction (meters)</label><input id="ln-pred" class="input" type="number" min="0" max="40" step="0.5" inputmode="decimal" placeholder="How far will it go?"></div>` : ""}
          <button type="button" class="btn btn--launch btn--big" id="ln-go">${icon("rocket")}Launch</button>
        </div>
      </div>
      <div class="lab-panel">
        <h3>${icon("clipboard", 'class="inline-icon"')}Engineering notebook</h3>
        <div class="table-scroll"><table class="data-table"><thead><tr><th>Trial</th><th>Angle</th><th>Force</th><th>Load</th>${L.predict ? "<th>Predicted</th>" : ""}${L.budget ? "<th>Cost</th>" : ""}<th>Result</th><th>Target?</th></tr></thead><tbody id="ln-rows"><tr><td colspan="8" class="muted">No launches yet.</td></tr></tbody></table></div>
      </div>`;

    const canvas = el.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const MAXX = 30;
    const sx = (m) => 60 + (m / MAXX) * (canvas.width - 90);
    const sy = (m) => canvas.height - 50 - m * 14;
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#888";

    function drawScene(path, upto) {
      const W = canvas.width, Hh = canvas.height;
      ctx.clearRect(0, 0, W, Hh);
      const sky = ctx.createLinearGradient(0, 0, 0, Hh);
      sky.addColorStop(0, "#bcd8ea"); sky.addColorStop(1, "#f3ecdc");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, Hh);
      // Fall hills and a pine treeline
      ctx.fillStyle = "#c9894a"; ctx.beginPath(); ctx.moveTo(0, sy(0)); for (let px = 0; px <= W; px += 30) ctx.lineTo(px, sy(0) - 70 - Math.sin(px / 140) * 22); ctx.lineTo(W, sy(0)); ctx.fill();
      ctx.fillStyle = "#2f4a2c";
      for (let px = 0; px < W; px += 14) { const h = 24 + ((px * 37) % 23); ctx.beginPath(); ctx.moveTo(px - 8, sy(0) - 34); ctx.lineTo(px, sy(0) - 34 - h); ctx.lineTo(px + 8, sy(0) - 34); ctx.fill(); }
      ctx.fillStyle = "#8aa35a"; ctx.fillRect(0, sy(0) - 34, W, 34);
      ctx.fillStyle = "#6f8f45"; ctx.fillRect(0, sy(0), W, Hh - sy(0));
      // distance markers
      ctx.fillStyle = "#0d1d36"; ctx.font = "700 20px 'Atkinson Hyperlegible', sans-serif"; ctx.textAlign = "center";
      for (let m = 0; m <= MAXX; m += 2) {
        ctx.fillRect(sx(m) - 1, sy(0), 2, m % 10 === 0 ? 12 : 7);
        if (m % 4 === 0) ctx.fillText(`${m} m`, sx(m), sy(0) + 34);
      }
      // targets
      L.targets.forEach((t, i) => {
        const hit = hits.has(i);
        // hay bale target with a flag
        ctx.fillStyle = "#e3c15a"; ctx.fillRect(sx(t - 1), sy(0) - 14, sx(t + 1) - sx(t - 1), 14);
        ctx.strokeStyle = "#b8923a"; ctx.lineWidth = 2; ctx.strokeRect(sx(t - 1), sy(0) - 14, sx(t + 1) - sx(t - 1), 14);
        ctx.fillStyle = hit ? "#3f6b0c" : "#302568";
        ctx.fillRect(sx(t) - 1.5, sy(0) - 56, 3, 42);
        ctx.beginPath(); ctx.moveTo(sx(t) + 1.5, sy(0) - 56); ctx.lineTo(sx(t) + 26, sy(0) - 48); ctx.lineTo(sx(t) + 1.5, sy(0) - 40); ctx.fill();
        ctx.fillStyle = "#0d1d36"; ctx.fillText(hit ? "hit!" : `${t} m`, sx(t), sy(0) - 64);
      });
      // wall
      if (L.wall) {
        const wx = sx(L.wall.x), wt = sy(L.wall.h), bh = (sy(0) - wt) / 4;
        for (let k = 0; k < 4; k++) { ctx.fillStyle = k % 2 ? "#d9b54e" : "#e3c15a"; ctx.fillRect(wx - 10, wt + k * bh, 20, bh); ctx.strokeStyle = "#b8923a"; ctx.lineWidth = 1.5; ctx.strokeRect(wx - 10, wt + k * bh, 20, bh); }
        ctx.fillStyle = "#0d1d36"; ctx.fillText(`${L.wall.h} m hay bales`, wx, wt - 8);
      }
      // previous landing marks
      trials.forEach((t) => { ctx.fillStyle = "rgba(13,29,54,.35)"; ctx.beginPath(); ctx.arc(sx(t.land), sy(0), 4, 0, Math.PI * 2); ctx.fill(); });
      // launcher
      const bx = sx(0), by = sy(0);
      ctx.fillStyle = "#5b4630"; ctx.fillRect(bx - 26, by - 14, 52, 14);
      ctx.beginPath(); ctx.arc(bx - 16, by, 8, 0, Math.PI * 2); ctx.arc(bx + 16, by, 8, 0, Math.PI * 2); ctx.fill();
      const th = (s.angle * Math.PI) / 180;
      ctx.strokeStyle = "#0d1d36"; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(bx, by - 14); ctx.lineTo(bx + Math.cos(th) * 46, by - 14 - Math.sin(th) * 46); ctx.stroke();
      ctx.strokeStyle = "#ec7a2f"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(bx, by - 14); ctx.lineTo(bx + Math.cos(th) * 80, by - 14 - Math.sin(th) * 80); ctx.stroke(); ctx.setLineDash([]);
      // path
      if (path) {
        const n = Math.max(1, Math.floor(path.pts.length * upto));
        ctx.strokeStyle = "#0b7471"; ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
        ctx.beginPath(); path.pts.slice(0, n).forEach(([x, y], i) => (i ? ctx.lineTo(sx(x), sy(y)) : ctx.moveTo(sx(x), sy(y)))); ctx.stroke(); ctx.setLineDash([]);
        const [x, y] = path.pts[n - 1];
        const px = sx(Math.min(x, MAXX + 2)), py = sy(y), pr = s.load === "heavy" ? 10 : s.load === "medium" ? 8 : 6;
        ctx.fillStyle = s.load === "light" ? "#f2c14e" : "#e9822b";
        ctx.beginPath(); ctx.ellipse(px, py, pr * 1.15, pr, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#8a4a14"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(px, py, pr * .45, pr, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "#0d1d36"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px, py, pr * 1.15, pr, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = "#3f6b0c"; ctx.fillRect(px - 1.5, py - pr - 4, 3, 5);
      }
    }

    function syncControls() {
      el.querySelector("#ln-angle").value = s.angle;
      el.querySelector("#ln-force").value = s.force;
      el.querySelector("#ln-angle-v").textContent = `${s.angle}°`;
      el.querySelector("#ln-force-v").textContent = `${s.force} of 10`;
      el.querySelectorAll("[data-load]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.load === s.load)));
      if (L.budget) {
        const c = cost(s);
        const b = el.querySelector("#ln-budget");
        b.innerHTML = `Cost of this design: <b>$${c}</b> of $${L.budget}`;
        b.classList.toggle("is-over", c > L.budget);
      }
      if (!anim) drawScene(null, 0);
    }
    el.querySelector("#ln-angle").addEventListener("input", (e) => { s.angle = Number(e.target.value); syncControls(); });
    el.querySelector("#ln-force").addEventListener("input", (e) => { s.force = Number(e.target.value); syncControls(); });
    el.querySelectorAll("[data-load]").forEach((b) => b.addEventListener("click", () => { s.load = b.dataset.load; syncControls(); }));

    function changedCount(a, b) { return (a.angle !== b.angle) + (a.force !== b.force) + (a.load !== b.load); }

    el.querySelector("#ln-go").addEventListener("click", () => {
      if (anim) return;
      if (L.budget && cost(s) > L.budget) { api.say(`This design costs $${cost(s)}, which is over the $${L.budget} budget. Lower the force or choose a different load.`, "warn"); return; }
      let pred = null;
      if (L.predict) {
        pred = parseFloat(el.querySelector("#ln-pred").value);
        if (isNaN(pred)) { api.say("Type a prediction first. Make your best guess in meters.", "warn"); el.querySelector("#ln-pred").focus(); return; }
      }
      const changes = last ? changedCount(last, s) : 1;
      if (L.fair && last && changes > 1) { api.say(`You changed ${changes} settings since your last launch. For a fair test, change only one. Put the others back first.`, "warn"); return; }
      if (L.fair && last && changes === 0) { api.say("Nothing changed since the last launch, so you'd get the same result. Change one setting.", "info"); return; }
      const sim = simulate(s, L.wall);
      const t0 = performance.now();
      const dur = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 1100;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        drawScene(sim, k);
        if (k < 1) anim = requestAnimationFrame(step);
        else { anim = null; done(sim, pred); }
      };
      anim = requestAnimationFrame(step);
    });

    function done(sim, pred) {
      const land = Math.round(sim.land * 10) / 10;
      let hitIdx = -1;
      if (!sim.hitWall) L.targets.forEach((t, i) => { if (Math.abs(land - t) <= 1 && !hits.has(i)) hitIdx = i; });
      if (hitIdx >= 0) hits.add(hitIdx);
      const row = { ...s, land: sim.hitWall ? L.wall.x : land, hitWall: sim.hitWall, pred, hit: hitIdx >= 0, cost: cost(s) };
      trials.push(row);
      last = { ...s };
      api.log("lab_test_run", { angle: s.angle, force: s.force, load: s.load, land });
      el.querySelector("#ln-rows").innerHTML = trials.map((t, i) => `<tr class="${i === trials.length - 1 ? "is-new" : ""}"><td>${i + 1}</td><td>${t.angle}°</td><td>${t.force}</td><td>${esc(LOADS[t.load].name)}</td>${L.predict ? `<td>${t.pred} m</td>` : ""}${L.budget ? `<td>$${t.cost}</td>` : ""}<td>${t.hitWall ? "Hit the wall" : `${t.land} m`}</td><td>${t.hit ? "Yes" : "No"}</td></tr>`).join("");
      drawScene(sim, 1);
      const nearest = L.targets.filter((_, i) => !hits.has(i)).sort((a, b) => Math.abs(a - land) - Math.abs(b - land))[0];
      const msg = sim.hitWall ? `It smashed into the hay bales at ${L.wall.x} m. The pumpkin needs to be higher than ${L.wall.h} m when it gets there.`
        : `Landed at ${land} m${pred != null ? ` (you predicted ${pred} m, off by ${Math.abs(Math.round((land - pred) * 10) / 10)} m)` : ""}.`;
      el.querySelector("#ln-result").textContent = msg;

      const predOk = !L.predict || trials.some((t) => t.hit && t.pred != null && Math.abs(t.pred - t.land) <= 3);
      if (hits.size === L.targets.length && predOk) {
        api.say(`Target${L.targets.length > 1 ? "s" : ""} hit in ${trials.length} launch${trials.length === 1 ? "" : "es"}!`, "good");
        api.win({ trials: trials.length });
      } else if (L.maxTrials && trials.length >= L.maxTrials) {
        api.say(`That's ${L.maxTrials} launches. Look over your notebook, then press Try again to start fresh with a plan.`, "warn");
        el.querySelector("#ln-go").disabled = true;
      } else if (hitIdx >= 0 && L.predict && !predOk) {
        api.say("Hit! But your prediction was more than 3 m off. Launch again and see if you can predict it within 3 m.", "info");
        hits.delete(hitIdx);
      } else if (hitIdx >= 0) {
        api.say(`Hit the ${L.targets[hitIdx]} m target! ${L.targets.length - hits.size} to go.`, "good");
      } else if (!sim.hitWall && nearest != null) {
        api.say(land < nearest ? `${Math.round((nearest - land) * 10) / 10} m short of the target.` : `${Math.round((land - nearest) * 10) / 10} m past the target.`, "info");
      }
    }

    const ro = new ResizeObserver(() => drawScene(null, 0));
    ro.observe(canvas);
    syncControls();
    return () => { ro.disconnect(); cancelAnimationFrame(anim); };
  }

  SE.labs.register({
    id: "launcher",
    area: "engineering",
    title: "Pumpkin Launcher Lab",
    tagline: "Design and tune a catapult for a Maine fall-fair pumpkin toss. Predict, test, change one thing at a time, and keep an engineering notebook.",
    levels: LAUNCH_LEVELS,
    mount: mountLauncher
  });

  /* ═════════════ Line Follower Lab ═════════════ */
  const ACTIONS = { forward: "Go forward", left: "Turn left", right: "Turn right", keep: "Keep turning the same way", stop: "Stop" };
  const STATES = [
    ["both", "Both sensors see the line"],
    ["left", "Only the LEFT sensor sees the line"],
    ["right", "Only the RIGHT sensor sees the line"],
    ["none", "Neither sensor sees the line"]
  ];
  const TRACKS = {
    oval: (t) => [450 + 300 * Math.cos(t), 210 + 140 * Math.sin(t)],
    wavy: (t) => { const r = 1 + 0.3 * Math.sin(3 * t); return [450 + 300 * r * Math.cos(t), 210 + 150 * r * Math.sin(t)]; },
    corners: (t) => { const p = 0.18, c = Math.cos(t), s = Math.sin(t); return [450 + 320 * Math.sign(c) * Math.abs(c) ** p, 210 + 160 * Math.sign(s) * Math.abs(s) ** p]; },
    bean: (t) => [450 + 290 * Math.cos(t) + 40 * Math.cos(2 * t), 210 + 150 * Math.sin(t) - 70 * Math.sin(2 * t) * Math.cos(t) * 0.8]
  };
  const LINE_LEVELS = [
    { title: "Sense, think, act", concept: "Robot behavior", track: "oval",
      goal: "A nor'easter buried the roads. Write rules so the robot plow follows the road line for one full lap.",
      steps: ["The plow has two light sensors at the front. They can tell the dark road line from white snow.", "For each thing it can sense, choose what it should do.", "Press Run and watch it follow your rules."],
      hint: "If only the left sensor sees the line, the line is on the robot's left. Which way should it turn to get back on?",
      learned: "Robots follow a loop: sense (read sensors), think (check rules), act (move). Simple rules, repeated many times a second, create smart-looking behavior.",
      rules: { both: "forward", left: "", right: "", none: "forward" }, speed: 3 },
    { title: "Fix the robot", concept: "Debugging behavior", track: "oval",
      goal: "Another town's plow keeps driving off into the snowbanks. Find the bug in its rules and fix it.",
      hint: "Run it and watch the first moment it goes wrong. Which sensor state was it in? What did the rule tell it to do?",
      learned: "Debugging a robot is like debugging code: watch for the first wrong action, find the rule that caused it, and fix that rule.",
      rules: { both: "forward", left: "right", right: "left", none: "forward" }, speed: 3 },
    { title: "Sharp corners", concept: "Handling the unexpected", track: "corners",
      goal: "Plow a full lap of a village with sharp corners at full speed (speed 6).",
      hint: "On sharp curves, both sensors can slip off the line. What should the robot do when it sees nothing? It was just turning one way…",
      learned: "Good robots plan for the unexpected. Remembering the last turn and continuing it lets the robot recover when it loses the line.",
      rules: { both: "forward", left: "left", right: "right", none: "forward" }, speed: 6, lockSpeed: true },
    { title: "Speed trial", concept: "Trade-offs", track: "bean",
      goal: "The school buses leave soon. Clear a lap of the teardrop road in under 14 seconds.",
      hint: "Faster isn't always better: too fast and the robot overshoots the curves. Find the fastest speed that still stays on the line.",
      learned: "Engineering is full of trade-offs. Going faster saves time but makes control harder. Testing finds the best balance.",
      rules: { both: "forward", left: "left", right: "right", none: "keep" }, speed: 2, timeLimit: 14 }
  ];

  function mountLine(el, idx, api) {
    const L = LINE_LEVELS[idx];
    const rules = { ...L.rules };
    let speed = L.speed;
    const W = 900, H = 420;
    const track = TRACKS[L.track];
    const N = 400;
    const pts = Array.from({ length: N }, (_, i) => track((i / N) * Math.PI * 2));
    let raf = null, bot = null, running = false;

    el.innerHTML = `
      <div class="line">
        <div class="lab-panel line__field">
          <canvas class="line__canvas" width="${W}" height="${H}" role="img" aria-label="Top view of the robot plow and the snowy road"></canvas>
          <div class="line__readout" aria-live="polite"><span>Sensors: <b id="lf-sense">–</b></span><span>Doing: <b id="lf-act">–</b></span><span>Time: <b id="lf-time">0.0 s</b></span><span>Lap: <b id="lf-lap">0%</b></span></div>
          <div class="lab-row">
            <button type="button" class="btn btn--launch" id="lf-run">${icon("rocket")}Run</button>
            <button type="button" class="btn btn--ghost" id="lf-reset">${icon("refresh")}Reset</button>
            <div class="range range--inline"><label for="lf-speed">Speed <b id="lf-speed-v">${speed}</b></label><input type="range" id="lf-speed" min="1" max="6" step="1" value="${speed}" ${L.lockSpeed ? "disabled" : ""}></div>
          </div>
        </div>
        <div class="lab-panel line__rules">
          <h3>Robot rules</h3>
          <table class="rule-table">
            <thead><tr><th>IF the robot senses…</th><th>THEN it should…</th></tr></thead>
            <tbody>${STATES.map(([k, label]) => `<tr><th scope="row"><span class="sense-pic sense-pic--${k}" aria-hidden="true"><i></i><i></i></span>${esc(label)}</th>
              <td><label class="visually-hidden" for="rule-${k}">Action when ${esc(label)}</label><select id="rule-${k}" class="input input--small" data-rule="${k}"><option value="">Choose…</option>${Object.entries(ACTIONS).map(([a, t]) => `<option value="${a}" ${rules[k] === a ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></td></tr>`).join("")}</tbody>
          </table>
        </div>
      </div>`;

    const canvas = el.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    // Off-screen track for sensor reads
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const oc = off.getContext("2d", { willReadFrequently: true });
    oc.fillStyle = "#fff"; oc.fillRect(0, 0, W, H);
    oc.strokeStyle = "#000"; oc.lineWidth = 26; oc.lineJoin = "round";
    oc.beginPath(); pts.forEach(([x, y], i) => (i ? oc.lineTo(x, y) : oc.moveTo(x, y))); oc.closePath(); oc.stroke();
    const onLine = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return false; return oc.getImageData(x | 0, y | 0, 1, 1).data[0] < 128; };

    function reset() {
      cancelAnimationFrame(raf); running = false;
      const [x0, y0] = pts[0], [x1, y1] = pts[2];
      bot = { x: x0, y: y0, a: Math.atan2(y1 - y0, x1 - x0), t: 0, lost: 0, lastTurn: 1, progress: 0, maxIdx: 0, trail: [], done: false };
      el.querySelector("#lf-run").innerHTML = `${icon("rocket")}Run`;
      draw();
      readout("–", "–");
    }
    const sensors = () => {
      const fx = Math.cos(bot.a), fy = Math.sin(bot.a), px = -fy, py = fx;
      return { l: [bot.x + fx * 16 - px * 9, bot.y + fy * 16 - py * 9], r: [bot.x + fx * 16 + px * 9, bot.y + fy * 16 + py * 9] };
    };
    function draw() {
      ctx.fillStyle = "#f7f8fa"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#dfe6ee"; for (let k = 0; k < 160; k++) { ctx.beginPath(); ctx.arc((k * 97) % W, (k * 53) % H, 1.6 + (k % 3), 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = "#9aa3ad"; ctx.lineWidth = 64; ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
      ctx.strokeStyle = "#1d2433"; ctx.lineWidth = 26; ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.stroke();
      // start line
      const [sx, sy] = pts[0];
      ctx.fillStyle = "#ec7a2f"; ctx.fillRect(sx - 3, sy - 20, 6, 40);
      // trail
      ctx.strokeStyle = "rgba(236,122,47,.55)"; ctx.lineWidth = 2;
      ctx.beginPath(); bot.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      // robot
      ctx.save(); ctx.translate(bot.x, bot.y); ctx.rotate(bot.a);
      ctx.fillStyle = "#e9822b"; ctx.strokeStyle = "#0d1d36"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(-14, -11, 26, 22, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#302568"; ctx.fillRect(-4, -7, 9, 14);
      ctx.fillStyle = "#f2c14e"; ctx.beginPath(); ctx.moveTo(13, -16); ctx.lineTo(19, -12); ctx.lineTo(19, 12); ctx.lineTo(13, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#0d1d36"; ctx.fillRect(-10, -14, 12, 4); ctx.fillRect(-10, 10, 12, 4);
      ctx.restore();
      const se = sensors();
      [["l", se.l], ["r", se.r]].forEach(([k, [x, y]]) => {
        ctx.fillStyle = onLine(x, y) ? "#ec7a2f" : "#7fd8d3"; ctx.strokeStyle = "#0d1d36"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
    }
    function readout(sense, act) {
      el.querySelector("#lf-sense").textContent = sense;
      el.querySelector("#lf-act").textContent = act;
      el.querySelector("#lf-time").textContent = `${bot.t.toFixed(1)} s`;
      el.querySelector("#lf-lap").textContent = `${Math.min(100, Math.round((bot.maxIdx / N) * 100))}%`;
    }
    function step(dt) {
      const se = sensors();
      const l = onLine(...se.l), r = onLine(...se.r);
      const state = l && r ? "both" : l ? "left" : r ? "right" : "none";
      let act = rules[state] || "stop";
      let turn = 0;
      if (act === "left") { turn = -1; bot.lastTurn = -1; }
      if (act === "right") { turn = 1; bot.lastTurn = 1; }
      if (act === "keep") turn = bot.lastTurn;
      const v = act === "stop" ? 0 : speed * 44 * (turn ? 0.7 : 1);
      bot.a += turn * (1.6 + speed * 0.35) * dt;
      bot.x += Math.cos(bot.a) * v * dt;
      bot.y += Math.sin(bot.a) * v * dt;
      bot.t += dt;
      bot.lost = state === "none" ? bot.lost + dt : 0;
      if (bot.trail.length > 600) bot.trail.shift();
      bot.trail.push([bot.x, bot.y]);
      // progress: nearest track point near the expected next part
      let best = bot.maxIdx, bd = 1e9;
      for (let k = 0; k < 40; k++) {
        const i = (bot.maxIdx + k) % N;
        const d = (pts[i][0] - bot.x) ** 2 + (pts[i][1] - bot.y) ** 2;
        if (d < bd) { bd = d; best = bot.maxIdx + k; }
      }
      if (bd < 40 * 40) bot.maxIdx = best;
      readout({ both: "both on line", left: "left only", right: "right only", none: "nothing" }[state], ACTIONS[act] + (rules[state] ? "" : " (no rule!)"));
      return { state, act, v };
    }
    function loop(prev) {
      return (now) => {
        const dt = Math.min(0.05, (now - prev) / 1000);
        let r;
        for (let k = 0; k < 3; k++) r = step(dt / 3);
        draw();
        const out = bot.x < -20 || bot.y < -20 || bot.x > W + 20 || bot.y > H + 20;
        if (bot.maxIdx >= N - 3) return finish(true);
        if (bot.lost > 1.2 || out) return finish(false, "lost");
        if (r.v === 0) return finish(false, "stopped");
        raf = requestAnimationFrame(loop(now));
      };
    }
    function finish(ok, why) {
      running = false;
      el.querySelector("#lf-run").innerHTML = `${icon("rocket")}Run`;
      api.log("lab_test_run", { rules: { ...rules }, speed, ok, time: Math.round(bot.t * 10) / 10 });
      if (ok && L.timeLimit && bot.t > L.timeLimit) {
        api.say(`Lap complete in ${bot.t.toFixed(1)} s. That's over ${L.timeLimit} s. Can you go faster and still stay on the line?`, "info");
      } else if (ok) {
        api.say(`Full lap in ${bot.t.toFixed(1)} seconds!`, "good");
        api.win({ time: Math.round(bot.t * 10) / 10, speed, rules: { ...rules } });
      } else if (why === "stopped") {
        const missing = STATES.filter(([k]) => !rules[k]).map(([, t]) => t.toLowerCase());
        api.say(missing.length ? `The robot stopped because it had no rule for: ${missing.join("; ")}.` : "The robot stopped. Check which rule says Stop.", "warn");
      } else {
        api.say(`The robot lost the line ${Math.round((bot.maxIdx / N) * 100)}% of the way around. Watch what it sensed just before it left the track.`, "warn");
      }
    }

    el.querySelectorAll("[data-rule]").forEach((sel) => sel.addEventListener("change", () => { rules[sel.dataset.rule] = sel.value; reset(); api.say(""); }));
    el.querySelector("#lf-speed").addEventListener("input", (e) => { speed = Number(e.target.value); el.querySelector("#lf-speed-v").textContent = speed; });
    el.querySelector("#lf-run").addEventListener("click", () => {
      if (running) { cancelAnimationFrame(raf); running = false; el.querySelector("#lf-run").innerHTML = `${icon("rocket")}Run`; return; }
      if (bot.done || bot.t > 0) reset();
      running = true;
      el.querySelector("#lf-run").innerHTML = `${icon("clock")}Pause`;
      api.say("");
      raf = requestAnimationFrame(loop(performance.now()));
    });
    el.querySelector("#lf-reset").addEventListener("click", () => { reset(); api.say(""); });
    reset();
    return () => cancelAnimationFrame(raf);
  }

  SE.labs.register({
    id: "line-follower",
    area: "engineering",
    title: "Snowplow Robot Lab",
    tagline: "A Maine nor'easter just hit. Program a robot plow's sense → think → act rules so it follows the road on its own.",
    levels: LINE_LEVELS,
    mount: mountLine
  });
})();
