/*
 * STEM 207 — mini-Python for the harbor (planning/CODING_PLAN.md, the Python ramp).
 *
 * A small, friendly subset of Python that compiles to Harbor Code's block programs, so the same
 * interpreter (SE.harbor.run) steers the boat. Pure functions, no eval, no outside library: it works
 * offline on a Chromebook.
 *
 *   SE.minipy.parse(src) → { main, fn, fnName, errors: [{ line, message }] }
 *   SE.minipy.toPython(main, fn, fnName) → Python text for a block program (the "Python view")
 *
 * What it understands (one statement per line, 4-space indents; a tab counts as 4 spaces):
 *   move()  turn_left()  turn_right()  haul()  set_trap()      the boat's actions
 *   for _ in range(3):     for _ in range(steps):              repeat, a number of times or `steps` times
 *   while not at_wharf():                                      repeat until the boat is home
 *   if at_buoy():   if at_spot():                              check where the boat is
 *   if ledge_ahead(): ... else: ...                            check ahead, with an else
 *   steps = 2   steps += 1   steps -= 1                         the one variable, `steps`
 *   def zig(): ...   zig()                                     one function of your own
 *   pass   # comments
 * Errors are written for students: what's wrong, on which line, and what to try.
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});

  const ACTIONS = { move: "move", turn_left: "left", turn_right: "right", haul: "pick", set_trap: "drop" };
  const CHECKS = { at_buoy: "ifGem", at_spot: "ifSpot", ledge_ahead: "ifWall" };
  const KNOWN = Object.keys(ACTIONS).concat(Object.keys(CHECKS), ["at_wharf", "range", "steps", "print"]);

  /* How close two words are (to suggest "move" for "mvoe"). */
  function distance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  const suggest = (word, extra = []) => {
    const best = KNOWN.concat(extra).map((k) => [k, distance(word, k)]).sort((x, y) => x[1] - y[1])[0];
    return best && best[1] <= 2 ? best[0] : null;
  };

  function parse(src) {
    const errors = [];
    const err = (line, message) => { if (!errors.some((e) => e.line === line)) errors.push({ line, message }); };
    // Lines with their indent; blank and comment-only lines are skipped (but keep their numbers).
    const lines = String(src || "").replace(/\t/g, "    ").split(/\r?\n/).map((raw, i) => {
      const code = raw.replace(/#.*$/, "").replace(/\s+$/, "");
      return { n: i + 1, indent: code.length - code.trimStart().length, text: code.trim() };
    }).filter((l) => l.text);
    const fnNames = lines.map((l) => (l.text.match(/^def\s+([a-z_][a-z0-9_]*)\s*\(\s*\)\s*:?$/i) || [])[1]).filter(Boolean);

    let i = 0;
    // Read the statements of one block, all at exactly `indent` spaces.
    function block(indent) {
      const out = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.indent < indent) break;
        if (l.indent > indent) { err(l.n, `Line ${l.n}: this line is indented more than the line above it. Line it up, or put a line ending in a colon (:) above it.`); i++; continue; }
        i++;
        const stmt = statement(l, indent);
        if (stmt) out.push(stmt);
      }
      return out;
    }
    // The indented body under a line that ends with a colon.
    function body(l, indent) {
      const next = lines[i];
      if (!next || next.indent <= indent) { err(l.n, `Line ${l.n}: after a line ending in a colon (:), indent the next line 4 spaces to put it inside.`); return []; }
      return block(next.indent);
    }
    function statement(l, indent) {
      const t = l.text;
      const colon = (what) => {
        if (!/:$/.test(t)) err(l.n, `Line ${l.n}: ${what} lines end with a colon (:).`);
      };
      let m;
      // def name():
      if (/^def\b/.test(t)) {
        m = t.match(/^def\s+([a-z_][a-z0-9_]*)\s*\(\s*\)\s*:?$/i);
        if (!m) { err(l.n, `Line ${l.n}: write a function like this: def zig():`); return null; }
        colon("def");
        if (indent > 0) err(l.n, `Line ${l.n}: put def at the left edge, not inside another block.`);
        if (fnDef) err(l.n, `Line ${l.n}: this harbor has room for one function. Use the one you already made.`);
        const b = body(l, indent);
        if (!fnDef) { fnDef = { name: m[1], body: b }; }
        return null;
      }
      // for _ in range(N): / range(steps)
      if (/^for\b/.test(t)) {
        m = t.match(/^for\s+[a-z_][a-z0-9_]*\s+in\s+range\s*\(\s*(\d+|steps)\s*\)\s*:?$/i);
        if (!m) { err(l.n, `Line ${l.n}: write a loop like this: for i in range(3):`); body(l, indent); return null; }
        colon("for");
        const b = body(l, indent);
        if (m[1] === "steps") return { type: "repeatVar", body: b };
        const n = Number(m[1]);
        if (n < 1 || n > 20) err(l.n, `Line ${l.n}: use a number from 1 to 20 in range().`);
        return { type: "repeat", n, body: b };
      }
      // while not at_wharf():
      if (/^while\b/.test(t)) {
        if (!/^while\s+not\s+at_wharf\s*\(\s*\)\s*:?$/.test(t)) { err(l.n, `Line ${l.n}: in this harbor, the while loop is: while not at_wharf():`); body(l, indent); return null; }
        colon("while");
        return { type: "untilGoal", body: body(l, indent) };
      }
      // if check(): ... else:
      if (/^(if|elif)\b/.test(t)) {
        if (/^elif\b/.test(t)) { err(l.n, `Line ${l.n}: this harbor's Python doesn't use elif. Use if and else.`); body(l, indent); return null; }
        m = t.match(/^if\s+([a-z_]+)\s*\(\s*\)\s*:?$/);
        if (!m || !CHECKS[m[1]]) {
          const w = m ? m[1] : (t.match(/^if\s+([a-z_]+)/) || [])[1];
          const s = w && suggest(w);
          err(l.n, `Line ${l.n}: the boat can check at_buoy(), at_spot(), or ledge_ahead().${s && CHECKS[s] ? ` Did you mean ${s}()?` : ""}`);
          body(l, indent); return null;
        }
        colon("if");
        const type = CHECKS[m[1]];
        const node = { type, body: body(l, indent) };
        if (type === "ifWall") node.else = [];
        const next = lines[i];
        if (next && next.indent === indent && /^else\b/.test(next.text)) {
          i++;
          if (!/^else\s*:$/.test(next.text)) err(next.n, `Line ${next.n}: write else with a colon: else:`);
          if (type !== "ifWall") { err(next.n, `Line ${next.n}: only if ledge_ahead() has an else in this harbor.`); body(next, indent); }
          else node.else = body(next, indent);
        }
        return node;
      }
      if (/^else\b/.test(t)) { err(l.n, `Line ${l.n}: else needs an if right above it, at the same indent.`); body(l, indent); return null; }
      if (t === "pass") return null;   // an empty block (the Python view writes pass)
      // steps = N / steps += N / steps -= N
      if ((m = t.match(/^steps\s*(=|\+=|-=)\s*(-?\d+)$/))) {
        const n = Number(m[2]);
        if (m[1] === "=") return { type: "setVar", n };
        return { type: "changeVar", n: m[1] === "+=" ? n : -n };
      }
      if (/^[a-z_][a-z0-9_]*\s*(=|\+=|-=)/i.test(t)) {
        err(l.n, `Line ${l.n}: this harbor has one variable, steps. Try steps = 2 or steps += 1.`);
        return null;
      }
      // name()
      if ((m = t.match(/^([a-z_][a-z0-9_]*)\s*\(\s*\)$/i))) {
        const name = m[1];
        if (ACTIONS[name]) return { type: ACTIONS[name] };
        if (fnNames.includes(name)) return { type: "call", fnName: name };
        const s = suggest(name, fnNames);
        err(l.n, `Line ${l.n}: Python doesn't know ${name}().${s ? ` Did you mean ${s}()?` : ""}`);
        return null;
      }
      // A known action without parentheses, or anything else.
      if ((m = t.match(/^([a-z_][a-z0-9_]*)$/i))) {
        const name = m[1];
        if (ACTIONS[name] || fnNames.includes(name)) { err(l.n, `Line ${l.n}: add parentheses to run it: ${name}()`); return null; }
        const s = suggest(name, fnNames);
        err(l.n, `Line ${l.n}: Python doesn't know ${name}.${s ? ` Did you mean ${s}()?` : ""}`);
        return null;
      }
      err(l.n, `Line ${l.n}: Python couldn't read this line. Check the spelling, the parentheses, and the colon.`);
      return null;
    }

    let fnDef = null;
    if (lines.length && lines[0].indent > 0) err(lines[0].n, `Line ${lines[0].n}: the first line of a program starts at the left edge, with no spaces.`);
    const main = block(lines.length ? Math.min(...lines.map((l) => l.indent)) : 0);
    errors.sort((a, b) => a.line - b.line);
    return { main, fn: fnDef ? fnDef.body : [], fnName: fnDef ? fnDef.name : null, errors };
  }

  /* A block program as Python (the "Python view"). */
  const PY = { move: "move()", left: "turn_left()", right: "turn_right()", pick: "haul()", drop: "set_trap()" };
  const COND = { ifGem: "at_buoy()", ifSpot: "at_spot()", ifWall: "ledge_ahead()" };
  function toPython(main, fn = [], fnName = "zig") {
    const out = [];
    const name = String(fnName || "zig").toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const emit = (list, pad) => {
      if (!list.length) { out.push(`${pad}pass`); return; }
      list.forEach((b) => {
        if (PY[b.type]) out.push(pad + PY[b.type]);
        else if (b.type === "repeat") { out.push(`${pad}for i in range(${b.n}):`); emit(b.body, pad + "    "); }
        else if (b.type === "repeatVar") { out.push(`${pad}for i in range(steps):`); emit(b.body, pad + "    "); }
        else if (b.type === "untilGoal") { out.push(`${pad}while not at_wharf():`); emit(b.body, pad + "    "); }
        else if (COND[b.type]) {
          out.push(`${pad}if ${COND[b.type]}:`); emit(b.body, pad + "    ");
          if (b.type === "ifWall" && b.else && b.else.length) { out.push(`${pad}else:`); emit(b.else, pad + "    "); }
        }
        else if (b.type === "setVar") out.push(`${pad}steps = ${b.n}`);
        else if (b.type === "changeVar") out.push(b.n < 0 ? `${pad}steps -= ${-b.n}` : `${pad}steps += ${b.n}`);
        else if (b.type === "call") out.push(`${pad}${name}()`);
      });
    };
    if (fn && fn.length) { out.push(`def ${name}():`); emit(fn, "    "); out.push(""); }
    emit(main, "");
    return out.join("\n");
  }

  SE.minipy = { parse, toPython, ACTIONS, CHECKS };
})();
