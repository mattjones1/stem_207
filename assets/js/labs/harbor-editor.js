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

    box.innerHTML = `
          <div class="palette" role="group" aria-label="Blocks you can use">
            ${o.blocks.map((t) => `<button type="button" class="blk blk--${BLOCKS[t].kind} blk--btn" data-add="${t}">${icon(BLOCKS[t].glyph, BLOCKS[t].flip ? 'style="transform:scaleX(-1)"' : "")}${esc(o.paletteLabel ? o.paletteLabel(t) : labelOf(t) + (BLOCKS[t].count ? " #" : ""))}</button>`).join("")}
          </div>
          ${o.usesFn ? `<div class="prog prog--fn"><div class="prog__head"><strong>${icon("star", 'class="inline-icon"')}${esc(o.fnName)} =</strong><span class="muted" id="fn-count"></span></div><div id="fn-list"></div></div>` : ""}
          <div class="prog">
            <div class="prog__head"><strong>Your program</strong><span id="blk-count" class="blk-count"></span>
              ${o.undo ? `<button type="button" class="linkish" id="rv-undo" disabled>${icon("refresh", 'style="transform:scaleX(-1)"')}Undo</button><button type="button" class="linkish" id="rv-redo" disabled>${icon("refresh")}Redo</button>` : ""}<button type="button" class="linkish" id="rv-clear">${icon("trash")}Clear</button></div>
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
    function renderList(list, owner, branch) {
      const slot = (i) => `<button type="button" class="slot ${cursor.owner === owner && cursor.branch === branch && cursor.index === i ? "is-cursor" : ""}" data-owner="${owner}" data-branch="${branch}" data-index="${i}" aria-label="Put new blocks here${cursor.owner === owner && cursor.branch === branch && cursor.index === i ? " (selected)" : ""}"></button>`;
      let html = `<ol class="blocks">${slot(0)}`;
      list.forEach((b, i) => {
        const def = BLOCKS[b.type];
        html += `<li class="blk blk--${def.kind}" data-bid="${b.id}">
          <div class="blk__row">
            ${icon(def.glyph, def.flip ? 'style="transform:scaleX(-1)"' : "")}
            <span class="blk__label">${esc(labelOf(b.type))}</span>
            ${def.count ? `<span class="blk__count"><button type="button" data-dec="${b.id}" aria-label="Decrease">−</button><b>${b.n}</b><button type="button" data-inc="${b.id}" aria-label="Increase">+</button>${b.type === "repeat" ? "<span>times</span>" : ""}</span>` : ""}
            <button type="button" class="blk__del" data-del="${b.id}" aria-label="Remove ${esc(labelOf(b.type))}">✕</button>
          </div>
          ${def.container ? `<div class="blk__body">${renderList(b.body, b.id, "body")}</div>` : ""}
          ${def.hasElse ? `<div class="blk__else"><span>else</span></div><div class="blk__body">${renderList(b.else, b.id, "else")}</div>` : ""}
        </li>${slot(i + 1)}`;
      });
      return html + "</ol>";
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

    box.addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t || o.isBusy()) return;
      if (t.id === "rv-undo") return undo(-1);
      if (t.id === "rv-redo") return undo(1);
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
        const min = b.type === "changeVar" ? -3 : 1;
        b.n = Math.max(min, Math.min(12, b.n + (t.dataset.inc ? 1 : -1)));
      } else if (t.id === "rv-clear") {
        program = []; fn = o.usesFn ? [] : fn; cursor = { owner: "root", branch: "body", index: 0 };
      } else return;
      if (before && edited) { past.push(before); if (past.length > 60) past.shift(); future.length = 0; }
      render();
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
      },
      clearHighlight() { box.querySelectorAll(".blk.is-active").forEach((n) => n.classList.remove("is-active")); }
    };
  };
})();
