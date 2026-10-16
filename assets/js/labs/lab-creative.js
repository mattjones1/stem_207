/*
 * Pixel Animation Studio — Creative STEM
 * Draw pixel art, see how resolution changes a picture, read and write
 * images as code (run-length encoding), and animate with frames and
 * frames per second. Finished animations are saved to the student's
 * gallery, where their teacher can see them too.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  const PAL = { ".": null, K: "#1b1f2a", W: "#ffffff", R: "#d64545", O: "#ec7a2f", Y: "#f4d35e", G: "#4f9a5a", B: "#3f7fc9", P: "#8a5cb8" };
  const PAL_NAMES = { ".": "Eraser", K: "Black", W: "White", R: "Red", O: "Orange", Y: "Yellow", G: "Green", B: "Blue", P: "Purple" };

  /* Run-length encoding: "4. 2R 10." means 4 empty, 2 red, 10 empty. */
  const encodeRow = (row) => {
    const out = [];
    let i = 0;
    while (i < row.length) {
      let j = i;
      while (j < row.length && row[j] === row[i]) j++;
      out.push(`${j - i}${row[i]}`);
      i = j;
    }
    return out.join(" ");
  };
  const encode = (grid) => grid.map((r) => encodeRow(r.join(""))).join("/");
  const decode = (code, n) => code.split("/").map((row) => {
    const cells = [];
    row.split(" ").forEach((tok) => { const m = tok.match(/^(\d+)(.)$/); if (m) for (let k = 0; k < Number(m[1]); k++) cells.push(m[2]); });
    while (cells.length < n) cells.push(".");
    return cells.slice(0, n);
  });
  const blank = (n) => Array.from({ length: n }, () => Array(n).fill("."));
  const copy = (g) => g.map((r) => r.slice());

  /* Draw a small frame as SVG (used in galleries and on the teacher's view). */
  SE.pixelSvg = (code, n, size = 64, label = "Pixel art") => {
    const g = decode(code, n);
    let rects = "";
    g.forEach((r, y) => r.forEach((c, x) => { if (PAL[c]) rects += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${PAL[c]}"/>`; }));
    return `<svg viewBox="0 0 ${n} ${n}" width="${size}" height="${size}" class="pixel-svg" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'} shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="#f4f1e6"/>${rects}</svg>`;
  };

  /* The decode target: a Maine lighthouse on the water. */
  const ROCKET = ["...KK...", "..KYYK..", "..KKKK..", "...WW...", "..RRRR..", "..WWWW..", ".RRRRRR.", "BBBBBBBB"];

  const LEVELS = [
    { title: "Every picture is pixels", concept: "Pixels", n: 8,
      goal: "Draw a picture on an 8 × 8 grid using at least 3 colors and at least 12 pixels.",
      hint: "Try something simple and blocky: a pine tree, a lobster buoy, a blueberry, or a house. Pick a color, then tap or drag on the grid.",
      learned: "Every digital picture is a grid of tiny squares called pixels. Each pixel is one color. Screens show millions of them." },
    { title: "Resolution", concept: "Resolution", n: 16,
      goal: "Draw a round shape on a 16 × 16 grid (at least 30 pixels), then answer the question about resolution.",
      hint: "Look at the three circles under the grid. More pixels in the same space means smaller pixels and smoother curves.",
      learned: "Resolution is how many pixels make up an image. Higher resolution shows more detail and smoother curves, but takes more data to store." },
    { title: "Pictures as code", concept: "Encoding", n: 8,
      goal: "Read the code and paint the picture it describes exactly. (Hint: it's something you'd see on the Maine coast.)",
      steps: ["Each row of code describes one row of the grid, left to right.", "“3.” means 3 empty pixels. “2K” means 2 black pixels."],
      hint: "Go one row at a time. For row 1, “3. 2K 3.” means: skip 3, paint 2 black, skip 3. The last row is all water.",
      learned: "Computers store images as numbers. Run-length encoding (“3 empty, 2 black”) is a real compression trick that makes files smaller when colors repeat." },
    { title: "Blink", concept: "Frames", n: 12,
      goal: "Make a 2-frame animation where something small changes, like eyes blinking. Press Play to watch it.",
      steps: ["Draw a face in frame 1.", "Press Copy frame to make frame 2.", "Change just a few pixels in frame 2.", "Press Play."],
      hint: "Animation works best when frames are almost the same. Change only a few pixels between frames.",
      learned: "Animation is a series of still pictures (frames) shown quickly. Your brain fills in the motion between small changes." },
    { title: "On the move", concept: "Frames per second", n: 12,
      goal: "Make a shape move across the grid over at least 4 frames, then try different speeds.",
      hint: "Draw a small shape in frame 1. Copy the frame, then redraw the shape 1 or 2 pixels to the right. Repeat.",
      learned: "Frames per second (fps) controls the speed. Movies use 24 fps. More frames with smaller moves make smoother motion." },
    { title: "Your animation", concept: "Create", n: 16,
      goal: "Create a looping animation with at least 4 frames and save it to your gallery.",
      hint: "Plan it first: what happens, and how does it loop back to the start? Ideas: a lighthouse beam sweeping, a lobster boat bobbing, snow falling on a pine, or a loon diving.",
      learned: "You planned, drew, timed, and saved an original animation, combining art, math, and computer science." }
  ];

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const n = L.n;
    const saved = api.saved();
    let frames = saved && saved.frames && saved.n === n ? saved.frames.map((c) => decode(c, n)) : [blank(n)];
    let cur = 0, color = "K", tool = "pencil", onion = true, fps = saved && saved.fps ? saved.fps : 6;
    let playing = null, kb = [0, 0];
    const multi = idx >= 3;

    el.innerHTML = `
      <div class="pix">
        <div class="pix__main lab-panel">
          <div class="pix__tools">
            <div class="pix__palette" role="radiogroup" aria-label="Color">
              ${Object.keys(PAL).map((k) => `<button type="button" class="swatch ${k === "." ? "swatch--erase" : ""}" role="radio" data-c="${k}" aria-label="${PAL_NAMES[k]}" title="${PAL_NAMES[k]}" style="${PAL[k] ? `--sw:${PAL[k]}` : ""}">${k === "." ? icon("trash") : ""}</button>`).join("")}
            </div>
            <div class="seg" role="group" aria-label="Tool"><button type="button" data-tool="pencil">Pencil</button><button type="button" data-tool="fill">Fill</button></div>
            <button type="button" class="btn btn--ghost btn--small" id="px-clear">${icon("refresh")}Clear frame</button>
          </div>
          <canvas class="pix__canvas" width="480" height="480" tabindex="0" aria-label="Drawing grid, ${n} by ${n} pixels. Use arrow keys to move and Space to paint."></canvas>
          ${multi ? `
          <div class="pix__frames">
            <div class="pix__strip" id="px-strip"></div>
            <div class="lab-row">
              <button type="button" class="btn btn--ghost btn--small" id="px-copy">${icon("plus")}Copy frame</button>
              <button type="button" class="btn btn--ghost btn--small" id="px-new">${icon("plus")}Blank frame</button>
              <button type="button" class="btn btn--ghost btn--small" id="px-del">${icon("trash")}Delete frame</button>
              <label class="check-row"><input type="checkbox" id="px-onion" checked> Show previous frame faintly</label>
            </div>
            <div class="lab-row">
              <button type="button" class="btn btn--launch" id="px-play">${icon("rocket")}Play</button>
              <div class="range range--inline"><label for="px-fps">Speed <b id="px-fps-v">${fps} fps</b></label><input type="range" id="px-fps" min="1" max="12" value="${fps}"></div>
            </div>
          </div>` : ""}
        </div>
        <div class="pix__side">
          ${idx === 2 ? `<div class="lab-panel"><h3>The code</h3><ol class="pix__code pix__code--target">${ROCKET.map((r) => `<li>${encodeRow(r)}</li>`).join("")}</ol><p class="muted">Letters: . empty · K black · Y yellow · W white · R red · B blue</p></div>` : ""}
          <div class="lab-panel"><h3>${idx === 2 ? "Your picture as code" : "Your picture as code"}</h3><ol class="pix__code" id="px-code"></ol><p class="muted" id="px-size"></p></div>
          ${idx === 1 ? `<div class="lab-panel"><h3>Same circle, three resolutions</h3><div class="res-row" id="px-res"></div>
            <p><strong>Which shows the curve most smoothly?</strong></p><div class="choice-grid">${["4 × 4", "8 × 8", "16 × 16"].map((t, i) => `<button type="button" class="choice" data-res="${i}">${t}</button>`).join("")}</div></div>` : ""}
          ${multi ? `<div class="lab-panel"><h3>Preview</h3><canvas class="pix__preview" width="160" height="160" aria-label="Animation preview"></canvas></div>` : ""}
          ${idx === 5 ? `<button type="button" class="btn btn--primary btn--big" id="px-save">${icon("check")}Save to my gallery</button>` : `<button type="button" class="btn btn--primary" id="px-check">${icon("check")}Check my work</button>`}
        </div>
      </div>`;

    const canvas = el.querySelector(".pix__canvas");
    const ctx = canvas.getContext("2d");
    const preview = el.querySelector(".pix__preview");
    const cell = canvas.width / n;

    function drawGrid(g, c = ctx, size = canvas.width, ghost = null, cursor = true) {
      const cs = size / n;
      c.fillStyle = "#f4f1e6"; c.fillRect(0, 0, size, size);
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if ((x + y) % 2) { c.fillStyle = "#ebe6d6"; c.fillRect(x * cs, y * cs, cs, cs); }
      if (ghost) { c.globalAlpha = 0.25; ghost.forEach((r, y) => r.forEach((k, x) => { if (PAL[k]) { c.fillStyle = PAL[k]; c.fillRect(x * cs, y * cs, cs, cs); } })); c.globalAlpha = 1; }
      g.forEach((r, y) => r.forEach((k, x) => { if (PAL[k]) { c.fillStyle = PAL[k]; c.fillRect(x * cs, y * cs, cs, cs); } }));
      if (c === ctx) {
        c.strokeStyle = "rgba(13,29,54,.18)"; c.lineWidth = 1;
        for (let i = 0; i <= n; i++) { c.beginPath(); c.moveTo(i * cs, 0); c.lineTo(i * cs, size); c.stroke(); c.beginPath(); c.moveTo(0, i * cs); c.lineTo(size, i * cs); c.stroke(); }
        if (cursor && document.activeElement === canvas) { c.strokeStyle = "#ec7a2f"; c.lineWidth = 3; c.strokeRect(kb[0] * cs + 1.5, kb[1] * cs + 1.5, cs - 3, cs - 3); }
      }
    }
    function render() {
      drawGrid(frames[cur], ctx, canvas.width, multi && onion && cur > 0 ? frames[cur - 1] : null);
      el.querySelector("#px-code").innerHTML = frames[cur].map((r) => `<li>${encodeRow(r.join(""))}</li>`).join("");
      const code = encode(frames[cur]);
      el.querySelector("#px-size").textContent = `${code.replace(/\//g, "").replace(/ /g, "").length} characters as code, instead of ${n * n} pixels listed one by one.`;
      el.querySelectorAll("[data-c]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.c === color)));
      el.querySelectorAll("[data-tool]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tool === tool)));
      if (multi) {
        el.querySelector("#px-strip").innerHTML = frames.map((f, i) => `<button type="button" class="frame-thumb ${i === cur ? "is-current" : ""}" data-frame="${i}" aria-label="Frame ${i + 1}${i === cur ? " (editing)" : ""}">${SE.pixelSvg(encode(f), n, 48, `Frame ${i + 1}`)}<span>${i + 1}</span></button>`).join("");
        if (!playing) drawGrid(frames[cur], preview.getContext("2d"), preview.width);
      }
    }
    function paint(x, y) {
      if (x < 0 || y < 0 || x >= n || y >= n) return;
      const g = frames[cur];
      if (tool === "fill") {
        const target = g[y][x];
        if (target === color) return;
        const stack = [[x, y]];
        while (stack.length) {
          const [px, py] = stack.pop();
          if (px < 0 || py < 0 || px >= n || py >= n || g[py][px] !== target) continue;
          g[py][px] = color;
          stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
        }
      } else g[y][x] = color;
      render();
    }
    const cellAt = (e) => {
      const r = canvas.getBoundingClientRect();
      return [Math.floor(((e.clientX - r.left) / r.width) * n), Math.floor(((e.clientY - r.top) / r.height) * n)];
    };
    let drawing = false;
    canvas.addEventListener("pointerdown", (e) => { drawing = true; canvas.setPointerCapture(e.pointerId); const [x, y] = cellAt(e); kb = [x, y]; paint(x, y); });
    canvas.addEventListener("pointermove", (e) => { if (drawing && tool === "pencil") { const [x, y] = cellAt(e); if (frames[cur][y] && frames[cur][y][x] !== color) paint(x, y); } });
    canvas.addEventListener("pointerup", () => { drawing = false; });
    canvas.addEventListener("keydown", (e) => {
      const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (mv) { e.preventDefault(); kb = [Math.max(0, Math.min(n - 1, kb[0] + mv[0])), Math.max(0, Math.min(n - 1, kb[1] + mv[1]))]; render(); }
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); paint(kb[0], kb[1]); }
    });
    canvas.addEventListener("focus", render);
    canvas.addEventListener("blur", render);

    el.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t) return;
      if (t.dataset.c) { color = t.dataset.c; render(); }
      else if (t.dataset.tool) { tool = t.dataset.tool; render(); }
      else if (t.dataset.frame) { stop(); cur = Number(t.dataset.frame); render(); }
      else if (t.id === "px-clear") { frames[cur] = blank(n); render(); }
      else if (t.id === "px-copy") { stop(); frames.splice(cur + 1, 0, copy(frames[cur])); cur++; render(); }
      else if (t.id === "px-new") { stop(); frames.splice(cur + 1, 0, blank(n)); cur++; render(); }
      else if (t.id === "px-del") { stop(); if (frames.length > 1) { frames.splice(cur, 1); cur = Math.max(0, cur - 1); } render(); }
      else if (t.id === "px-play") { playing ? stop() : play(); }
      else if (t.id === "px-check") check();
      else if (t.id === "px-save") check(true);
      else if (t.dataset.res) {
        if (t.dataset.res === "2") { t.classList.add("is-right"); resOk = true; api.say("Right: more pixels, smoother curve.", "good"); check(); }
        else { t.classList.add("is-wrong"); api.say("Look closely at the edges of each circle. Which one looks least blocky?", "warn"); }
      }
    });
    const onionBox = el.querySelector("#px-onion");
    if (onionBox) onionBox.addEventListener("change", () => { onion = onionBox.checked; render(); });
    const fpsIn = el.querySelector("#px-fps");
    if (fpsIn) fpsIn.addEventListener("input", () => { fps = Number(fpsIn.value); el.querySelector("#px-fps-v").textContent = `${fps} fps`; if (playing) { stop(); play(); } api.log("lab_fps", { fps }); });

    let fpsTried = new Set();
    function play() {
      if (frames.length < 2) { api.say("Add a second frame first. Use Copy frame.", "warn"); return; }
      let i = 0;
      fpsTried.add(fps);
      el.querySelector("#px-play").innerHTML = `${icon("clock")}Stop`;
      const pc = preview.getContext("2d");
      playing = setInterval(() => { drawGrid(frames[i % frames.length], pc, preview.width); i++; }, 1000 / fps);
      api.log("lab_play", { frames: frames.length, fps });
    }
    function stop() { if (playing) { clearInterval(playing); playing = null; const b = el.querySelector("#px-play"); if (b) b.innerHTML = `${icon("rocket")}Play`; } }

    // Resolution comparison circles
    let resOk = false;
    if (idx === 1) {
      el.querySelector("#px-res").innerHTML = [4, 8, 16].map((r) => {
        const g = Array.from({ length: r }, (_, y) => Array.from({ length: r }, (_, x) => { const dx = x + 0.5 - r / 2, dy = y + 0.5 - r / 2; return dx * dx + dy * dy <= (r * 0.42) ** 2 ? "B" : "."; }));
        return `<figure>${SE.pixelSvg(encode(g), r, 72, `Circle drawn with ${r} by ${r} pixels`)}<figcaption>${r} × ${r}</figcaption></figure>`;
      }).join("");
    }

    const count = (g) => g.flat().filter((k) => k !== ".").length;
    const colorsUsed = (g) => new Set(g.flat().filter((k) => k !== ".")).size;
    const diff = (a, b) => a.flat().filter((k, i) => k !== b.flat()[i]).length;
    const center = (g) => { let sx = 0, sy = 0, m = 0; g.forEach((r, y) => r.forEach((k, x) => { if (k !== ".") { sx += x; sy += y; m++; } })); return m ? [sx / m, sy / m] : null; };

    function result() { return { n, frames: frames.map(encode), fps }; }
    function check(save) {
      const g = frames[cur];
      if (idx === 0) {
        if (count(g) < 12) return api.say(`You've painted ${count(g)} pixels. Paint at least 12.`, "warn");
        if (colorsUsed(g) < 3) return api.say(`You've used ${colorsUsed(g)} color${colorsUsed(g) === 1 ? "" : "s"}. Use at least 3.`, "warn");
        api.say(`Your picture uses ${count(g)} pixels and ${colorsUsed(g)} colors.`, "good");
        return api.win(result());
      }
      if (idx === 1) {
        if (count(g) < 30) return api.say(`Paint at least 30 pixels to make your round shape (you have ${count(g)}).`, "warn");
        if (!resOk) return api.say("Nice drawing! Now answer the resolution question.", "info");
        return api.win(result());
      }
      if (idx === 2) {
        const want = ROCKET.map((r) => r.split(""));
        const wrongRows = want.map((r, y) => (r.join("") === g[y].join("") ? -1 : y)).filter((y) => y >= 0);
        if (wrongRows.length) return api.say(`Close! Row${wrongRows.length > 1 ? "s" : ""} ${wrongRows.map((y) => y + 1).join(", ")} ${wrongRows.length > 1 ? "don't" : "doesn't"} match the code yet. Compare your code with the target code.`, "warn");
        api.say("Exact match. You decoded the picture!", "good");
        return api.win(result());
      }
      if (idx === 3) {
        if (frames.length < 2) return api.say("You need 2 frames. Press Copy frame.", "warn");
        const d = diff(frames[0], frames[1]);
        if (count(frames[0]) < 8) return api.say("Draw something in frame 1 first.", "warn");
        if (d === 0) return api.say("Your two frames are exactly the same. Change a few pixels in frame 2.", "warn");
        if (d > n * n * 0.3) return api.say(`${d} pixels changed between frames. That's a big jump. Try changing just a few, like closing the eyes.`, "warn");
        if (!fpsTried.size) return api.say("Press Play to watch your animation first.", "info");
        api.say(`${d} pixels change between frames. That's a blink!`, "good");
        return api.win(result());
      }
      if (idx === 4) {
        if (frames.length < 4) return api.say(`You have ${frames.length} frame${frames.length === 1 ? "" : "s"}. Make at least 4.`, "warn");
        const cs = frames.map(center);
        if (cs.some((c) => !c)) return api.say("Some frames are empty. Every frame needs your shape.", "warn");
        const moved = cs.slice(1).every((c, i) => Math.hypot(c[0] - cs[i][0], c[1] - cs[i][1]) >= 0.5);
        if (!moved) return api.say("Your shape should move a little in every frame. Check each frame with the strip below the grid.", "warn");
        if (fpsTried.size < 2) return api.say("It moves! Now play it at two different speeds. What changes?", "info");
        api.say("Motion achieved, and you tried different frame rates.", "good");
        return api.win(result());
      }
      if (idx === 5) {
        if (frames.length < 4) return api.say("Your animation needs at least 4 frames.", "warn");
        if (frames.some((f) => count(f) < 4)) return api.say("Some frames are almost empty. Fill each frame before saving.", "warn");
        if (!save) return;
        api.say("Saved to your gallery! Your teacher can see it too.", "good");
        return api.win(result());
      }
    }

    // Level 5 preview loads saved work; starting frames for the motion level help students begin
    render();
    return () => stop();
  }

  SE.labs.register({
    id: "pixel-studio",
    area: "creative",
    title: "Pixel Animation Studio",
    tagline: "Draw pixel art, decode a lighthouse, and bring a Maine postcard to life frame by frame.",
    levels: LEVELS,
    mount
  });
  SE.pixelEncode = { encode, decode };
})();
