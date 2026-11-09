/*
 * STEM 207 — the harbor block editor, shared by Harbor Code Lab (lab-coding.js) and Captain Code (lab-captain.js).
 * Tap a block to add it at the cursor (no dragging), tap a gap to move the cursor, ✕ to remove, + and − for
 * counts. Containers (Repeat, If) take the cursor inside, so the next block nests.
 *
 *   const ed = SE.harbor.editor(box, opts)   renders the toolbox, your-block box, program, and Python view in box
 *     opts.blocks       block types in the toolbox            opts.labelOf(type)  a block's words
 *     opts.usesFn       show the "your own block" box          opts.fnName         its name (default "Zig")
 *     opts.maxBlocks    block budget for the counter           opts.par            par for the counter
 *     opts.starter      a starting program (block list)        opts.countFn        count your block's blocks too
 *     opts.undo         show Undo and Redo (Ctrl+Z, Ctrl+Y)    opts.pythonNote     text under the Python view
 *     opts.python       false hides the Python view            opts.varName        the variable's name in Python
 *     opts.isBusy()     true while the boat sails (edits wait) opts.onEdit()       after every change
 *     opts.paletteLabel(type)  a toolbox button's words    opts.countText(n)   the counter's words
 *     opts.loops        richer loops (Captain Code): each container ends with an "end repeat" / "end if" foot,
 *                       tap a count to pick 1–12, "See it unrolled" under a Repeat, a lap badge while it runs,
 *                       and Select blocks → Put in a Repeat to wrap blocks that sit next to each other
 *     opts.say(text, kind)  a message for the student (used by Put in a Repeat)
 *   ed.program, ed.fn   the current lists        ed.count()  blocks that count against the budget
 *   ed.set(main, fn)    replace the program      ed.highlight(b) / ed.clearHighlight()   the running block
 * Harbor Code calls it with its old options, so its markup and behavior stay the same.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  SE.harbor = SE.harbor || {};
  SE.harbor.editor = function (box, opts) {
    const { BLOCKS, make, clone, countBlocks } = SE.harbor;
    const o = Object.assign({ blocks: [], usesFn: false, fnName: "Zig", python: true, isBusy: () => false, onEdit: () => {} }, opts);
    const labelOf = o.labelOf || ((type) => (type === "call" ? o.fnName : BLOCKS[type].label));
    let program = o.starter || [];
    let fn = [];
    let cursor = { owner: "root", branch: "body", index: program.length };
    const past = [], future = [];
    const rich = !!o.loops;
    const canWrap = rich && o.blocks.includes("repeat");
    let picking = null;            // the block whose count picker is open
    const unrolled = new Set();    // Repeat blocks showing what they stand for
    let selecting = false;
    const selected = new Set();    // blocks chosen for Put in a Repeat

    box.innerHTML = `
          <div class="palette" role="group" aria-label="Blocks you can use">
            ${o.blocks.map((t) => `<button type="button" class="blk blk--${BLOCKS[t].kind} blk--btn" data-add="${t}">${icon(BLOCKS[t].glyph, BLOCKS[t].flip ? 'style="transform:scaleX(-1)"' : "")}${esc(o.paletteLabel ? o.paletteLabel(t) : labelOf(t) + (BLOCKS[t].count ? " #" : ""))}</button>`).join("")}
          </div>
          ${o.usesFn ? `<div class="prog prog--fn"><div class="prog__head"><strong>${icon("star", 'class="inline-icon"')}${esc(o.fnName)} =</strong><span class="muted" id="fn-count"></span></div><div id="fn-list"></div></div>` : ""}
          <div class="prog">
            <div class="prog__head"><strong>Your program</strong><span id="blk-count" class="blk-count"></span>
              ${canWrap ? `<button type="button" class="linkish" id="rv-select" aria-pressed="false">${icon("check")}Select blocks</button>` : ""}
              ${o.undo ? `<button type="button" class="linkish" id="rv-undo" disabled>${icon("refresh", 'style="transform:scaleX(-1)"')}Undo</button><button type="button" class="linkish" id="rv-redo" disabled>${icon("refresh")}Redo</button>` : ""}<button type="button" class="linkish" id="rv-clear">${icon("trash")}Clear</button></div>
            ${canWrap ? `<div class="prog__wrapbar" id="rv-wrapbar" hidden><span id="rv-wrapnote">Tick the blocks that repeat, next to each other.</span><button type="button" class="btn btn--primary btn--small" id="rv-wrap" disabled>${icon("refresh")}Put in a Repeat</button></div>` : ""}
            <div id="prog-list"></div>
          </div>
          <p class="field-help">Tap a gap (the dashed line) to choose where new blocks go. Tap ✕ to remove a block.</p>
          ${o.python && SE.minipy ? `<details class="py-view"><summary>${icon("code")}See it in Python</summary><pre class="py-view__code" id="py-view" aria-live="polite"></pre><p class="field-help">${esc(o.pythonNote || "The same program, written in Python. Try typing programs like this in the Harbor Python Lab.")}</p></details>` : ""}
        `;

    function listFor(owner, branch) {
      if (owner === "root") return program;
      if (owner === "fn") return fn;
      const find = (list) => {
        for (const b of list) {
          if (b.id === owner) return b[branch];
          for (const k of ["body", "else"]) if (b[k]) { const r = find(b[k]); if (r) return r; }
        }
        return null;
      };
      return find(program) || find(fn);
    }
    const isLoop = (t) => t === "repeat" || t === "repeatVar" || t === "untilGoal";
    const minFor = (b) => (b.type === "changeVar" ? -3 : 1);
    /* What a Repeat stands for, written out: its body n times, nested Repeats opened too (at most 40 lines). */
    function unroll(list, out = []) {
      for (const b of list) {
        if (out.length >= 40) break;
        if (b.type === "repeat") for (let i = 0; i < b.n && out.length < 40; i++) unroll(b.body, out);
        else out.push(labelOf(b.type) + (BLOCKS[b.type].count ? ` ${b.n}` : ""));
      }
      return out;
    }
    function renderList(list, owner, branch) {
      const slot = (i, where = "") => {
        const on = cursor.owner === owner && cursor.branch === branch && cursor.index === i;
        return `<button type="button" class="slot ${on ? "is-cursor" : ""} ${where ? "slot--after" : ""}" data-owner="${owner}" data-branch="${branch}" data-index="${i}" ${where && on ? `data-where="${where}"` : ""} aria-label="Put new blocks here${where ? `, ${where}` : ""}${on ? " (selected)" : ""}"></button>`;
      };
      let html = `<ol class="blocks">${slot(0)}`;
      list.forEach((b, i) => {
        const def = BLOCKS[b.type];
        const label = labelOf(b.type);
        const count = !def.count ? "" : rich
          ? `<span class="blk__count"><button type="button" data-dec="${b.id}" aria-label="Fewer">−</button><button type="button" class="blk__n" data-pick="${b.id}" aria-expanded="${picking === b.id}" aria-label="${esc(label)}: ${b.n}. Choose a number">${b.n}</button><button type="button" data-inc="${b.id}" aria-label="More">+</button>${b.type === "repeat" ? "<span>times</span>" : ""}</span>`
          : `<span class="blk__count"><button type="button" data-dec="${b.id}" aria-label="Decrease">−</button><b>${b.n}</b><button type="button" data-inc="${b.id}" aria-label="Increase">+</button>${b.type === "repeat" ? "<span>times</span>" : ""}</span>`;
        const pick = rich && picking === b.id ? `<div class="blk__pick" role="group" aria-label="Choose a number for ${esc(label)}">${Array.from({ length: 13 - minFor(b) }, (_, k) => k + minFor(b)).filter((n) => n !== 0 || b.type !== "changeVar").map((n) => `<button type="button" data-set="${b.id}" data-n="${n}" aria-pressed="${n === b.n}">${n}</button>`).join("")}</div>` : "";
        const foot = rich && def.container ? `<div class="blk__foot" aria-hidden="true">${isLoop(b.type) ? "end repeat" : "end if"}</div>` : "";
        const unrollBtn = rich && b.type === "repeat" && b.body.length ? `<button type="button" class="linkish blk__unrollbtn" data-unroll="${b.id}" aria-expanded="${unrolled.has(b.id)}">${unrolled.has(b.id) ? "Hide the long way" : "See it unrolled"}</button>` : "";
        const unrollList = rich && unrolled.has(b.id) && b.body.length ? (() => { const u = unroll([b]); return `<div class="blk__unrolled"><p>Without the loop, that's ${u.length}${u.length >= 40 ? "+" : ""} blocks:</p><ol>${u.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div>`; })() : "";
        const tick = selecting && owner !== "fn" ? `<input type="checkbox" class="blk__sel" data-sel="${b.id}" ${selected.has(b.id) ? "checked" : ""} aria-label="Select ${esc(label)}">` : "";
        html += `<li class="blk blk--${def.kind} ${rich && def.container ? "blk--c" : ""}" data-bid="${b.id}">
          <div class="blk__row">
            ${tick}${icon(def.glyph, def.flip ? 'style="transform:scaleX(-1)"' : "")}
            <span class="blk__label">${esc(label)}</span>
            ${count}<span class="blk__lap" aria-hidden="true"></span>
            <button type="button" class="blk__del" data-del="${b.id}" aria-label="Remove ${esc(label)}">✕</button>
          </div>
          ${pick}
          ${def.container ? `<div class="blk__body">${renderList(b.body, b.id, "body")}</div>` : ""}
          ${def.hasElse ? `<div class="blk__else"><span>else</span></div><div class="blk__body">${renderList(b.else, b.id, "else")}</div>` : ""}
          ${foot}${unrollBtn}${unrollList}
        </li>${slot(i + 1, rich && def.container ? (isLoop(b.type) ? "after the loop" : "after the if") : "")}`;
      });
      return html + "</ol>";
    }
    /* Put in a Repeat: the ticked blocks must sit next to each other in one list. */
    function wrapSelected() {
      const ids = [...selected];
      const find = (list) => {
        const at = list.map((b, i) => (selected.has(b.id) ? i : -1)).filter((i) => i >= 0);
        if (at.length) return { list, at };
        for (const b of list) for (const k of ["body", "else"]) if (b[k]) { const r = find(b[k]); if (r) return r; }
        return null;
      };
      const r = find(program);
      if (!r || r.at.length !== ids.length) return "Tick blocks from one list only: all in the main program, or all inside the same block.";
      if (r.at[r.at.length - 1] - r.at[0] + 1 !== r.at.length) return "Tick blocks that sit next to each other, with no gap between them.";
      const loop = make("repeat", { n: 2, body: r.list.splice(r.at[0], r.at.length) });
      r.list.splice(r.at[0], 0, loop);
      cursor = { owner: loop.id, branch: "body", index: loop.body.length };
      return "";
    }
    function setSelecting(on) {
      selecting = on; selected.clear();
      const b = box.querySelector("#rv-select"), bar = box.querySelector("#rv-wrapbar");
      if (b) { b.setAttribute("aria-pressed", String(on)); b.innerHTML = `${icon("check")}${on ? "Done selecting" : "Select blocks"}`; }
      if (bar) bar.hidden = !on;
    }
    function syncWrap() {
      const w = box.querySelector("#rv-wrap");
      if (w) w.disabled = selected.size === 0;
      const n = box.querySelector("#rv-wrapnote");
      if (n) n.textContent = selected.size ? `${selected.size} block${selected.size === 1 ? "" : "s"} ticked. Put them in a Repeat?` : "Tick the blocks that repeat, next to each other.";
    }
    const count = () => countBlocks(program) + (o.countFn ? countBlocks(fn) : 0);
    function render() {
      box.querySelector("#prog-list").innerHTML = program.length || cursor.owner !== "root" ? renderList(program, "root", "body") : `${renderList(program, "root", "body")}<p class="prog__empty">Tap a block above to add it here.</p>`;
      if (o.usesFn) {
        box.querySelector("#fn-list").innerHTML = renderList(fn, "fn", "body");
        box.querySelector("#fn-count").textContent = `${countBlocks(fn)} blocks`;
      }
      const n = count();
      const bc = box.querySelector("#blk-count");
      bc.textContent = o.countText ? o.countText(n) : o.maxBlocks ? `${n} / ${o.maxBlocks} blocks` : `${n} blocks${o.par ? ` · par ${o.par}` : ""}`;
      bc.classList.toggle("is-over", !!(o.maxBlocks && n > o.maxBlocks));
      const pv = box.querySelector("#py-view");   // the Python view updates as blocks change
      if (pv) pv.textContent = program.length || fn.length ? SE.minipy.toPython(program, fn, o.fnName, { varName: o.varName, goal: o.goal }) : "# Add blocks to see them in Python.";
      const u = box.querySelector("#rv-undo"), r = box.querySelector("#rv-redo");
      if (u) { u.disabled = !past.length; r.disabled = !future.length; }
    }
    function findAndRemove(list, id) {
      const i = list.findIndex((b) => b.id === id);
      if (i >= 0) { list.splice(i, 1); return true; }
      return list.some((b) => (b.body && findAndRemove(b.body, id)) || (b.else && findAndRemove(b.else, id)));
    }
    function findBlock(list, id) {
      for (const b of list) {
        if (b.id === id) return b;
        for (const k of ["body", "else"]) if (b[k]) { const r = findBlock(b[k], id); if (r) return r; }
      }
      return null;
    }
    const snapshot = () => ({ program: clone(program), fn: clone(fn) });
    function restore(s) { program = s.program; fn = s.fn; cursor = { owner: "root", branch: "body", index: program.length }; }
    function undo(dir) {
      const from = dir < 0 ? past : future, to = dir < 0 ? future : past;
      if (!from.length || o.isBusy()) return;
      to.push(snapshot()); restore(from.pop());
      render(); o.onEdit();
    }

    box.addEventListener("change", (e) => {
      const c = e.target.closest("[data-sel]");
      if (!c) return;
      if (c.checked) selected.add(c.dataset.sel); else selected.delete(c.dataset.sel);
      syncWrap();
    });
    box.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t || o.isBusy()) return;
      if (t.id === "rv-undo") return undo(-1);
      if (t.id === "rv-redo") return undo(1);
      if (t.id === "rv-select") { setSelecting(!selecting); render(); syncWrap(); return; }
      if (t.dataset.pick) { picking = picking === t.dataset.pick ? null : t.dataset.pick; render(); const f = box.querySelector(`[data-set="${t.dataset.pick}"][aria-pressed="true"]`) || box.querySelector(`[data-pick="${t.dataset.pick}"]`); if (f) f.focus(); return; }
      if (t.dataset.unroll) { const id = t.dataset.unroll; if (unrolled.has(id)) unrolled.delete(id); else unrolled.add(id); render(); const f = box.querySelector(`[data-unroll="${id}"]`); if (f) f.focus(); return; }
      const before = o.undo ? snapshot() : null;
      let edited = true;
      if (t.dataset.add) {
        const type = t.dataset.add;
        const list = listFor(cursor.owner, cursor.branch) || program;
        const b = make(type);
        list.splice(cursor.index, 0, b);
        // After adding a container, put the cursor inside it so the next block nests.
        cursor = BLOCKS[type].container ? { owner: b.id, branch: "body", index: 0 } : { ...cursor, index: cursor.index + 1 };
      } else if (t.dataset.owner) {
        cursor = { owner: t.dataset.owner, branch: t.dataset.branch, index: Number(t.dataset.index) };
        edited = false;
      } else if (t.dataset.del) {
        findAndRemove(program, t.dataset.del) || findAndRemove(fn, t.dataset.del);
        if (!listFor(cursor.owner, cursor.branch)) cursor = { owner: "root", branch: "body", index: program.length };
        cursor.index = Math.min(cursor.index, (listFor(cursor.owner, cursor.branch) || []).length);
      } else if (t.dataset.inc || t.dataset.dec) {
        const b = findBlock(program, t.dataset.inc || t.dataset.dec) || findBlock(fn, t.dataset.inc || t.dataset.dec);
        const min = minFor(b);
        b.n = Math.max(min, Math.min(12, b.n + (t.dataset.inc ? 1 : -1)));
        if (b.type === "changeVar" && b.n === 0) b.n = t.dataset.inc ? 1 : -1;   // "change by 0" would do nothing
      } else if (t.dataset.set) {
        const b = findBlock(program, t.dataset.set) || findBlock(fn, t.dataset.set);
        b.n = Number(t.dataset.n); picking = null;
      } else if (t.id === "rv-wrap") {
        const why = wrapSelected();
        if (why) { if (o.say) o.say(why, "warn"); return; }
        setSelecting(false);
        if (o.say) o.say("Your blocks are inside a Repeat now. Set how many times it runs.", "info");
      } else if (t.id === "rv-clear") {
        program = []; fn = o.usesFn ? [] : fn; cursor = { owner: "root", branch: "body", index: 0 };
        if (selecting) setSelecting(false);
      } else return;
      if (before && edited) { past.push(before); if (past.length > 60) past.shift(); future.length = 0; }
      render();
      if (selecting) syncWrap();
      if (t.dataset.set) { const f = box.querySelector(`[data-pick="${t.dataset.set}"]`); if (f) f.focus(); }
      o.onEdit();
    });
    if (o.undo) box.addEventListener("keydown", (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(-1); }
      else if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); undo(1); }
    });

    render();
    return {
      get program() { return program; },
      get fn() { return fn; },
      count,
      render,
      set(main, f = []) { if (o.undo) { past.push(snapshot()); future.length = 0; } program = main; fn = f; cursor = { owner: "root", branch: "body", index: program.length }; render(); },
      highlight(b) {
        box.querySelectorAll(".blk.is-active").forEach((n) => n.classList.remove("is-active"));
        const node = box.querySelector(`[data-bid="${b.id}"]`);
        if (node) node.classList.add("is-active");
        // A loop starting a lap shows "lap 2 of 4" until the run ends (b.lap comes from ctx.loopTicks).
        if (node && b.lap) { node.classList.add("is-looping"); const lap = node.querySelector(":scope > .blk__row > .blk__lap"); if (lap) lap.textContent = `lap ${b.lap} of ${b.of}`; }
      },
      clearHighlight() {
        box.querySelectorAll(".blk.is-active").forEach((n) => n.classList.remove("is-active"));
        box.querySelectorAll(".blk.is-looping").forEach((n) => n.classList.remove("is-looping"));
        box.querySelectorAll(".blk__lap").forEach((n) => { n.textContent = ""; });
      }
    };
  };
})();
