/*
 * STEM 207 — a light code editor for the web labs (Build Your First Website, Website Builder). No dependency.
 * It keeps the real <textarea> (so typing, the browser's own Undo, screen readers, and phone keyboards work as
 * always) and adds, around it:
 *   a colored copy of the code behind the text (aria-hidden), line numbers, and locked document lines
 *   ("shell") drawn above and below, read-only, each with a "why" note;
 *   auto-close: typing > after <tag adds </tag> (not for void tags); auto-indent on Enter; Tab indents
 *   (Esc, then Tab, leaves the editor); the tag pair at the cursor is outlined; Ctrl+F searches.
 *
 *   const ed = SE.codeEditor(textarea, { lang: "html" | "css", shellTop: [{ text, why }], shellBottom: [...] })
 *   ed.refresh()                  redraw after the value changed from outside (input events redraw by themselves)
 *   ed.goTo(start, end)           select a range, scroll to it, and flash it
 *   ed.showInsertPoint(at, label) a dashed "add it here" line at an offset; never changes the code
 *   ed.clearMarks()               remove the flash and the insert line
 *   ed.setShell(top, bottom)      change the locked lines (the <title> line follows the plan, say)
 *   ed.tidy()                     re-indent the code (one undoable edit)
 *   ed.lineOf(offset)             the line number a reader sees (shell lines count)
 * Pure helpers for tests: SE.codeEditor.highlight(code, lang), SE.codeEditor.pairAt(code, offset), SE.codeEditor.tidyHtml(code).
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const VOID = new Set("area base br col embed hr img input link meta source track wbr".split(" "));

  /* ───────── Coloring (pure) ───────── */
  function highlightHtml(code) {
    let out = "", i = 0;
    const re = /<!--[\s\S]*?(?:-->|$)|<\/?[a-zA-Z][a-zA-Z0-9-]*[^<>]*>?|<!DOCTYPE[^>]*>?/gi;
    let m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(i, m.index));
      const t = m[0];
      if (t.startsWith("<!--")) out += `<span class="ce-c">${esc(t)}</span>`;
      else if (/^<!doctype/i.test(t)) out += `<span class="ce-d">${esc(t)}</span>`;
      else {
        const nm = t.match(/^(<\/?)([a-zA-Z][a-zA-Z0-9-]*)/);
        const attrs = t.slice(nm[0].length);
        out += `<span class="ce-p">${esc(nm[1])}</span><span class="ce-t">${esc(nm[2])}</span>`;
        // attributes: name="value"
        let j = 0;
        const ar = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(\s*=\s*)?("[^"]*"?|'[^']*'?|[^\s"'>]+)?/g;
        let a;
        while ((a = ar.exec(attrs))) {
          if (!a[0]) { ar.lastIndex++; continue; }
          out += esc(attrs.slice(j, a.index));
          out += `<span class="ce-a">${esc(a[1])}</span>${a[2] ? esc(a[2]) : ""}${a[3] ? `<span class="ce-v">${esc(a[3])}</span>` : ""}`;
          j = a.index + a[0].length;
        }
        const tail = attrs.slice(j);
        out += tail.replace(/(\/?>)$/, "\u0000$1").split("\u0000").map((s, k) => (k ? `<span class="ce-p">${esc(s)}</span>` : esc(s))).join("");
      }
      i = m.index + t.length;
    }
    return out + esc(code.slice(i));
  }
  function highlightCss(code) {
    let out = "", i = 0, depth = 0;
    const re = /\/\*[\s\S]*?(?:\*\/|$)|[{};:]|[^{};:/]+|\//g;
    let m, inValue = false;
    while ((m = re.exec(code))) {
      const t = m[0];
      if (t.startsWith("/*")) out += `<span class="ce-c">${esc(t)}</span>`;
      else if (t === "{") { depth++; inValue = false; out += `<span class="ce-p">{</span>`; }
      else if (t === "}") { depth = Math.max(0, depth - 1); inValue = false; out += `<span class="ce-p">}</span>`; }
      else if (t === ";") { inValue = false; out += `<span class="ce-p">;</span>`; }
      else if (t === ":" && depth > 0) { inValue = true; out += `<span class="ce-p">:</span>`; }
      else if (depth === 0) out += `<span class="ce-s">${esc(t)}</span>`;
      else if (inValue) out += esc(t).replace(/(#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|em|rem|%|vh|vw|fr|s)?\b)/g, '<span class="ce-n">$1</span>').replace(/^(\s*)(.+)$/s, '$1<span class="ce-v">$2</span>');
      else out += esc(t).replace(/^(\s*)([a-zA-Z-]+)/, '$1<span class="ce-a">$2</span>');
      i = m.index + t.length;
    }
    return out + esc(code.slice(i));
  }
  const highlight = (code, lang) => (lang === "css" ? highlightCss(code) : highlightHtml(code));

  /* The tag pair around an offset: { open: [s, e], close: [s, e] | null, tag } or null. */
  function pairAt(code, at) {
    const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)[^<>]*?(\/?)>/g;
    const tags = [];
    let m;
    while ((m = re.exec(code))) {
      if (!m[2]) continue;
      tags.push({ s: m.index, e: m.index + m[0].length, name: m[2].toLowerCase(), close: !!m[1], self: !!m[3] || VOID.has(m[2].toLowerCase()) });
    }
    const here = tags.find((t) => at >= t.s && at <= t.e);
    if (!here) return null;
    if (here.self) return { open: [here.s, here.e], close: null, tag: here.name };
    const i = tags.indexOf(here);
    let depth = 0;
    if (!here.close) {
      for (let k = i + 1; k < tags.length; k++) {
        const t = tags[k];
        if (t.name !== here.name || t.self) continue;
        if (!t.close) depth++;
        else if (depth) depth--;
        else return { open: [here.s, here.e], close: [t.s, t.e], tag: here.name };
      }
      return { open: [here.s, here.e], close: null, tag: here.name };
    }
    for (let k = i - 1; k >= 0; k--) {
      const t = tags[k];
      if (t.name !== here.name || t.self) continue;
      if (t.close) depth++;
      else if (depth) depth--;
      else return { open: [t.s, t.e], close: [here.s, here.e], tag: here.name };
    }
    return { open: null, close: [here.s, here.e], tag: here.name };
  }

  /* Re-indent HTML by nesting, two spaces a level. Text lines keep their words. */
  function tidyHtml(code) {
    let depth = 0;
    return code.split("\n").map((raw) => {
      const line = raw.trim();
      if (!line) return "";
      const opens = (line.match(/<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(?<!\/)>/g) || []).filter((t) => !VOID.has(t.match(/<([a-zA-Z0-9-]+)/)[1].toLowerCase())).length;
      const closes = (line.match(/<\/[a-zA-Z][a-zA-Z0-9-]*>/g) || []).length;
      const startsClose = /^<\//.test(line);
      if (startsClose) depth = Math.max(0, depth - 1);
      const out = "  ".repeat(depth) + line;
      depth = Math.max(0, depth + opens - closes + (startsClose ? 1 : 0));
      return out;
    }).join("\n");
  }
  function tidyCss(code) {
    let depth = 0;
    return code.split("\n").map((raw) => {
      const line = raw.trim();
      if (!line) return "";
      if (line.startsWith("}")) depth = Math.max(0, depth - 1);
      const out = "  ".repeat(depth) + line;
      depth = Math.max(0, depth + (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length + (line.startsWith("}") ? 1 : 0));
      return out;
    }).join("\n");
  }

  /* ───────── The editor ───────── */
  function codeEditor(ta, opts = {}) {
    const lang = opts.lang || "html";
    let shellTop = opts.shellTop || [], shellBottom = opts.shellBottom || [];
    ta.setAttribute("wrap", "off");
    ta.setAttribute("spellcheck", "false");
    ta.classList.add("ce__input");
    const hintId = `${ta.id || "ce"}-keys`;
    const root = document.createElement("div");
    root.className = `ce ce--${lang}`;
    root.innerHTML = `
      <div class="ce__shell ce__shell--top"></div>
      <div class="ce__body">
        <div class="ce__gutter" aria-hidden="true"><div class="ce__nums"></div></div>
        <div class="ce__stack">
          <pre class="ce__hl" aria-hidden="true"><code></code></pre>
          <div class="ce__marks" aria-hidden="true"></div>
        </div>
      </div>
      <div class="ce__shell ce__shell--bottom"></div>
      <div class="ce__find" hidden role="search" aria-label="Search the code">
        <label class="visually-hidden" for="${hintId}-q">Search for</label>
        <input id="${hintId}-q" class="input ce__q" type="search" placeholder="Search your code">
        <button type="button" class="btn btn--ghost btn--small" data-ce="next">Next</button>
        <span class="ce__count" aria-live="polite"></span>
        <button type="button" class="linkish" data-ce="closefind">Close</button>
      </div>
      <p class="ce__keys field-help" id="${hintId}">Tab adds spaces. To leave the code box, press Esc, then Tab.</p>`;
    ta.parentNode.insertBefore(root, ta);
    root.querySelector(".ce__stack").insertBefore(ta, root.querySelector(".ce__marks"));
    ta.setAttribute("aria-describedby", [ta.getAttribute("aria-describedby"), hintId].filter(Boolean).join(" "));
    const hl = root.querySelector(".ce__hl code"), nums = root.querySelector(".ce__nums"), marks = root.querySelector(".ce__marks");
    const top = root.querySelector(".ce__shell--top"), bottom = root.querySelector(".ce__shell--bottom");
    let escArmed = false, flash = null, ghost = null, pair = null;

    function drawShell() {
      const line = (l, n) => `<div class="ce__sline"><span class="ce__sn" aria-hidden="true">${n}</span><code>${highlight(l.text, "html")}</code>${l.why ? `<span class="ce__why">${esc(l.why)}</span>` : ""}</div>`;
      top.innerHTML = shellTop.length ? `<p class="visually-hidden">Locked lines at the top of the file:</p>${shellTop.map((l, i) => line(l, i + 1)).join("")}` : "";
      const after = shellTop.length + ta.value.split("\n").length;
      bottom.innerHTML = shellBottom.length ? `<p class="visually-hidden">Locked lines at the end of the file:</p>${shellBottom.map((l, i) => line(l, after + i + 1)).join("")}` : "";
      top.hidden = !shellTop.length; bottom.hidden = !shellBottom.length;
    }
    /* Pixel position of an offset: lines are fixed height and the font is monospace, with wrapping off. */
    const metrics = () => {
      const cs = getComputedStyle(ta);
      const lh = parseFloat(cs.lineHeight) || 20;
      const probe = document.createElement("span");
      probe.textContent = "0000000000";
      probe.style.cssText = `position:absolute;visibility:hidden;font:${cs.font};white-space:pre`;
      document.body.appendChild(probe);
      const ch = probe.getBoundingClientRect().width / 10 || 8;
      probe.remove();
      return { lh, ch, padT: parseFloat(cs.paddingTop) || 0, padL: parseFloat(cs.paddingLeft) || 0 };
    };
    const where = (at) => { const before = ta.value.slice(0, at).split("\n"); return { line: before.length - 1, col: before[before.length - 1].replace(/\t/g, "  ").length }; };
    function box(s, e, cls, label) {
      const M = metrics(), a = where(s), b = where(Math.max(s, e));
      const lines = [];
      for (let l = a.line; l <= b.line; l++) {
        const c0 = l === a.line ? a.col : 0;
        const c1 = l === b.line ? b.col : (ta.value.split("\n")[l] || "").length;
        lines.push(`<span class="${cls}" style="top:${M.padT + l * M.lh}px;left:${M.padL + c0 * M.ch}px;width:${Math.max(2, (c1 - c0) * M.ch)}px;height:${M.lh}px">${label && l === a.line ? `<b>${esc(label)}</b>` : ""}</span>`);
      }
      return lines.join("");
    }
    function drawMarks() {
      let html = "";
      if (pair) [pair.open, pair.close].forEach((r) => { if (r) html += box(r[0], r[1], "ce-pair"); });
      if (flash) html += box(flash[0], flash[1], "ce-flash");
      if (ghost) { const M = metrics(), w = where(ghost.at); html += `<span class="ce-ghost" style="top:${M.padT + w.line * M.lh}px;left:${M.padL}px;height:${M.lh}px"><b>${esc(ghost.label)}</b></span>`; }
      marks.innerHTML = html;
      sync();
    }
    function sync() {
      const t = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`;
      root.querySelector(".ce__hl").style.transform = t;
      marks.style.transform = t;
      nums.style.transform = `translateY(${-ta.scrollTop}px)`;
    }
    function render() {
      hl.innerHTML = highlight(ta.value, lang) + "\n";
      const n = ta.value.split("\n").length;
      nums.innerHTML = Array.from({ length: n }, (_, i) => `<span>${shellTop.length + i + 1}</span>`).join("");
      drawShell();
      drawMarks();
    }
    function cursorMoved() {
      const p = lang === "html" ? pairAt(ta.value, ta.selectionStart) : null;
      const same = JSON.stringify(p) === JSON.stringify(pair);
      pair = p;
      if (!same) drawMarks();
    }
    const insert = (text) => {
      ta.focus();
      const ok = document.execCommand && document.execCommand("insertText", false, text);
      if (!ok) ta.setRangeText(text, ta.selectionStart, ta.selectionEnd, "end");
    };

    ta.addEventListener("input", (e) => {
      flash = null; ghost = null;
      // Auto-close: the student just typed the > of an opening tag.
      if (lang === "html" && e.inputType === "insertText" && e.data === ">" && opts.autoClose !== false) {
        const c = ta.selectionStart, before = ta.value.slice(0, c);
        const m = before.match(/<([a-zA-Z][a-zA-Z0-9-]*)(\s[^<>]*)?>$/);
        if (m && !VOID.has(m[1].toLowerCase()) && !/\/>$/.test(before)) {
          const name = m[1], close = `</${name}>`;
          if (!ta.value.slice(c).startsWith(close)) { insert(close); ta.setSelectionRange(c, c); }
        }
      }
      render(); cursorMoved();
    });
    ta.addEventListener("scroll", sync);
    ["click", "keyup", "select"].forEach((ev) => ta.addEventListener(ev, cursorMoved));
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { escArmed = true; return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") { e.preventDefault(); openFind(); return; }
      if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        if (escArmed) { escArmed = false; return; }   // Esc, then Tab: leave the editor
        e.preventDefault(); insert("  "); return;
      }
      escArmed = false;
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.isComposing) {
        const c = ta.selectionStart, v = ta.value;
        const lineStart = v.lastIndexOf("\n", c - 1) + 1;
        const indent = (v.slice(lineStart, c).match(/^[ \t]*/) || [""])[0];
        const prev = v.slice(lineStart, c), next = v.slice(ta.selectionEnd);
        const opensTag = lang === "html" && /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^<>]*)?>$/.test(prev) && !VOID.has((prev.match(/<([a-zA-Z][a-zA-Z0-9-]*)(\s[^<>]*)?>$/) || [])[1]);
        const opensRule = lang === "css" && /\{\s*$/.test(prev);
        e.preventDefault();
        if ((opensTag && /^<\//.test(next)) || (opensRule && /^\s*\}/.test(next))) {
          insert(`\n${indent}  \n${indent}`);
          const p = ta.selectionStart - indent.length - 1;
          ta.setSelectionRange(p, p);
        } else insert(`\n${indent}${opensTag || opensRule ? "  " : ""}`);
      }
    });

    /* Search */
    const find = root.querySelector(".ce__find"), q = root.querySelector(".ce__q");
    function openFind() { find.hidden = false; q.value = ta.value.slice(ta.selectionStart, ta.selectionEnd) || q.value; q.focus(); q.select(); }
    function findNext() {
      const term = q.value;
      if (!term) return;
      const v = ta.value.toLowerCase(), t = term.toLowerCase();
      let at = v.indexOf(t, ta.selectionEnd);
      if (at < 0) at = v.indexOf(t);
      const total = v.split(t).length - 1;
      root.querySelector(".ce__count").textContent = total ? `${total} found` : "Not found";
      if (at >= 0) api.goTo(at, at + term.length, { keepFocus: true });
    }
    q.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); findNext(); } if (e.key === "Escape") { find.hidden = true; ta.focus(); } });
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ce]");
      if (!b) return;
      if (b.dataset.ce === "next") findNext();
      if (b.dataset.ce === "closefind") { find.hidden = true; ta.focus(); }
    });

    const api = {
      root,
      refresh: render,
      lineOf: (at) => shellTop.length + where(at).line + 1,
      goTo(start, end, o = {}) {
        if (!o.keepFocus) ta.focus({ preventScroll: true });
        ta.setSelectionRange(start, end);
        const M = metrics(), w = where(start);
        const y = w.line * M.lh;
        if (y < ta.scrollTop || y > ta.scrollTop + ta.clientHeight - M.lh * 2) ta.scrollTop = Math.max(0, y - M.lh * 2);
        ta.scrollLeft = Math.max(0, w.col * M.ch - ta.clientWidth / 2);
        flash = [start, end]; ghost = null;
        cursorMoved(); drawMarks();
        if (root.scrollIntoView) root.scrollIntoView({ block: "nearest" });
      },
      showInsertPoint(at, label) {
        ta.focus({ preventScroll: true });
        ta.setSelectionRange(at, at);
        const M = metrics(), w = where(at);
        ta.scrollTop = Math.max(0, w.line * M.lh - M.lh * 2);
        ghost = { at, label }; flash = null;
        drawMarks();
        if (root.scrollIntoView) root.scrollIntoView({ block: "nearest" });
      },
      clearMarks() { flash = null; ghost = null; drawMarks(); },
      setShell(t, b) { shellTop = t || []; shellBottom = b || []; render(); },
      tidy() {
        const out = lang === "css" ? tidyCss(ta.value) : tidyHtml(ta.value);
        if (out === ta.value) return false;
        ta.focus(); ta.setSelectionRange(0, ta.value.length); insert(out);
        ta.dispatchEvent(new Event("input", { bubbles: true }));
        return true;
      }
    };
    if (typeof ResizeObserver !== "undefined") new ResizeObserver(() => drawMarks()).observe(ta);
    render();
    return api;
  }
  codeEditor.highlight = highlight;
  codeEditor.pairAt = pairAt;
  codeEditor.tidyHtml = tidyHtml;
  codeEditor.tidyCss = tidyCss;
  SE.codeEditor = codeEditor;
})();
