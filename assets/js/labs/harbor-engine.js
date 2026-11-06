/*
 * STEM 207 — the harbor engine, shared by Harbor Code Lab (lab-coding.js), Captain Code (lab-captain.js),
 * the Harbor Python Lab, the Code Review lab, and the Level Designer.
 *
 *   SE.harbor.BLOCKS                    the block catalog (label, kind, glyph, container?, count?, hasElse?)
 *   SE.harbor.make(type, extra)         a new block; clone(list), countBlocks(list)
 *   SE.harbor.parse(src)                starter programs in shorthand: F L R P D, [n ...] for repeat
 *   SE.harbor.parseGrid(rows)           a map: # ledge, . water, S start, G wharf/mooring, * trap, o trap spot
 *   SE.harbor.run(list, st, ctx)        the interpreter: a generator that yields once per block, so a lab can
 *                                       step through a program. Bounded: 400 operations, call depth 5.
 * Pure: no DOM. Loaded before minipy.js and every lab that sails the boat.
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});
  /* ───────── Block catalog ───────── */
  const BLOCKS = {
    move: { label: "Forward", kind: "motion", glyph: "arrowRight" },
    left: { label: "Turn left", kind: "motion", glyph: "refresh", flip: true },
    right: { label: "Turn right", kind: "motion", glyph: "refresh" },
    pick: { label: "Haul trap", kind: "action", glyph: "buoy" },
    drop: { label: "Set trap", kind: "action", glyph: "plus" },
    repeat: { label: "Repeat", kind: "control", glyph: "refresh", container: true, count: true },
    untilGoal: { label: "Repeat until at wharf", kind: "control", glyph: "flag", container: true },
    ifGem: { label: "If at a buoy", kind: "control", glyph: "question", container: true },
    ifSpot: { label: "If at a dashed spot", kind: "control", glyph: "question", container: true },
    ifWall: { label: "If ledge ahead", kind: "control", glyph: "question", container: true, hasElse: true },
    ifLedgeLeft: { label: "If ledge on the left", kind: "control", glyph: "question", container: true, hasElse: true },
    ifLedgeRight: { label: "If ledge on the right", kind: "control", glyph: "question", container: true, hasElse: true },
    setVar: { label: "Set steps to", kind: "variable", glyph: "box", count: true },
    changeVar: { label: "Change steps by", kind: "variable", glyph: "plus", count: true },
    repeatVar: { label: "Repeat steps times", kind: "control", glyph: "refresh", container: true },
    call: { label: "Zig", kind: "function", glyph: "star" }
  };
  let nextId = 1;
  const make = (type, extra = {}) => {
    const b = { id: `b${nextId++}`, type, ...extra };
    if (BLOCKS[type].container) b.body = b.body || [];
    if (BLOCKS[type].hasElse) b.else = b.else || [];
    if (BLOCKS[type].count && b.n == null) b.n = type === "changeVar" ? 1 : type === "setVar" ? 1 : 2;
    return b;
  };
  const clone = (list) => list.map((b) => {
    const c = { ...b, id: `b${nextId++}` };
    if (b.body) c.body = clone(b.body);
    if (b.else) c.else = clone(b.else);
    return c;
  });
  const countBlocks = (list) => list.reduce((n, b) => n + 1 + (b.body ? countBlocks(b.body) : 0) + (b.else ? countBlocks(b.else) : 0), 0);

  /* Starter programs written in a tiny shorthand: F L R P D, [n ...] for repeat. */
  function parse(src) {
    const tokens = src.match(/\[\d+|\]|F|L|R|P|D/g) || [];
    let i = 0;
    const read = () => {
      const out = [];
      while (i < tokens.length) {
        const t = tokens[i++];
        if (t === "]") return out;
        if (t[0] === "[") out.push(make("repeat", { n: Number(t.slice(1)), body: read() }));
        else out.push(make({ F: "move", L: "left", R: "right", P: "pick", D: "drop" }[t]));
      }
      return out;
    };
    return read();
  }

  const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const RIGHT = { N: "E", E: "S", S: "W", W: "N" };
  const LEFT = { N: "W", W: "S", S: "E", E: "N" };
  const ROT = { N: -90, E: 0, S: 90, W: 180 };

  function parseGrid(rows) {
    let start = null, goal = null;
    const gems = [], spots = [], marks = [];
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      if (ch === "S") start = [x, y];
      if (ch === "G") goal = [x, y];
      if (ch === "*") gems.push(`${x},${y}`);
      if (ch === "o") spots.push(`${x},${y}`);
      if (ch === "x") marks.push(`${x},${y}`);
    }));
    return { rows, w: rows[0].length, h: rows.length, start, goal, gems, spots, marks };
  }
  const isWall = (g, x, y) => x < 0 || y < 0 || x >= g.w || y >= g.h || g.rows[y][x] === "#";

  /* ───────── Interpreter (a generator, so we can step one block at a time) ───────── */
  function* run(list, st, ctx) {
    for (const b of list) {
      if (st.ops++ > 400) { st.error = "loop"; return; }
      switch (b.type) {
        case "move": {
          const [dx, dy] = DIRS[st.dir];
          const nx = st.x + dx, ny = st.y + dy;
          if (isWall(ctx.g, nx, ny)) { st.error = "crash"; yield b; return; }
          st.x = nx; st.y = ny;
          if (st.visited) st.visited.add(`${nx},${ny}`);   // search marks (Captain Code)
          yield b; break;
        }
        case "left": st.dir = LEFT[st.dir]; yield b; break;
        case "right": st.dir = RIGHT[st.dir]; yield b; break;
        case "pick": {
          const k = `${st.x},${st.y}`;
          if (st.gems.has(k) && !st.got.has(k)) { st.got.add(k); yield b; }
          else { st.error = "nogem"; yield b; return; }
          break;
        }
        case "drop": {
          const k = `${st.x},${st.y}`;
          if (!st.spots.has(k) || st.dropped.has(k)) { st.error = "nospot"; yield b; return; }
          if (ctx.carry && st.got.size - st.dropped.size <= 0) { st.error = "empty"; yield b; return; }
          st.dropped.add(k); yield b;
          break;
        }
        case "repeat":
          for (let i = 0; i < b.n; i++) { yield* run(b.body, st, ctx); if (st.error || st.done) return; }
          break;
        case "repeatVar": {
          const n = st.vars.steps || 0;
          for (let i = 0; i < n; i++) { yield* run(b.body, st, ctx); if (st.error || st.done) return; }
          break;
        }
        case "untilGoal": {
          let guard = 0;
          while (!(st.x === ctx.g.goal[0] && st.y === ctx.g.goal[1])) {
            if (guard++ > 120) { st.error = "loop"; return; }
            const before = st.ops;
            yield* run(b.body, st, ctx);
            if (st.error || st.done) return;
            if (st.ops === before) { st.error = "loop"; return; }
          }
          break;
        }
        case "ifGem": {
          const k = `${st.x},${st.y}`;
          yield { ...b, checking: true };
          if (st.gems.has(k) && !st.got.has(k)) yield* run(b.body, st, ctx);
          if (st.error) return;
          break;
        }
        case "ifSpot": {
          const k = `${st.x},${st.y}`;
          yield { ...b, checking: true };
          if (st.spots.has(k) && !st.dropped.has(k)) yield* run(b.body, st, ctx);
          if (st.error) return;
          break;
        }
        case "ifWall": {
          const [dx, dy] = DIRS[st.dir];
          yield { ...b, checking: true };
          if (isWall(ctx.g, st.x + dx, st.y + dy)) yield* run(b.body, st, ctx);
          else yield* run(b.else, st, ctx);
          if (st.error) return;
          break;
        }
        case "ifLedgeLeft":
        case "ifLedgeRight": {
          const [dx, dy] = DIRS[(b.type === "ifLedgeLeft" ? LEFT : RIGHT)[st.dir]];
          yield { ...b, checking: true };
          if (isWall(ctx.g, st.x + dx, st.y + dy)) yield* run(b.body, st, ctx);
          else yield* run(b.else || [], st, ctx);
          if (st.error) return;
          break;
        }
        case "setVar": st.vars.steps = b.n; yield b; break;
        case "changeVar": st.vars.steps = (st.vars.steps || 0) + b.n; yield b; break;
        case "call":
          if (ctx.depth > 5) { st.error = "loop"; return; }
          ctx.depth++;
          st.calls = (st.calls || 0) + 1;
          yield { ...b, checking: true };
          yield* run(ctx.fn, st, ctx);
          ctx.depth--;
          if (st.error) return;
          break;
      }
    }
  }

  /* ───────── Captain Code additions (pure; Harbor Code doesn't use them) ───────── */
  /* A fresh boat state for a map. */
  const startState = (g, dir) => ({ x: g.start[0], y: g.start[1], dir, gems: new Set(g.gems), got: new Set(), spots: new Set(g.spots), dropped: new Set(),
    visited: new Set([`${g.start[0]},${g.start[1]}`]), vars: { steps: 0 }, ops: 0, calls: 0, error: null, done: false });

  /* Did the run meet the level's objectives? reason: crash | nogem | nospot | empty | loop (errors), then
     short | traps | spots | marks | calls (something missing), or ok. values carry the numbers feedback names. */
  function check(L, st, g) {
    const v = { hauled: st.got.size, traps: g.gems.length, set: st.dropped.size, spots: g.spots.length,
      marked: g.marks.filter((k) => st.visited.has(k)).length, marks: g.marks.length, calls: st.calls || 0, minCalls: L.minCalls || 0,
      x: st.x, y: st.y, dir: st.dir };
    const at = st.x === g.goal[0] && st.y === g.goal[1];
    const out = (reason) => ({ ok: reason === "ok", reason, values: v, atGoal: at });
    if (st.error) return out(st.error);
    if (!at) return out("short");
    if (L.needGems && v.hauled < v.traps) return out("traps");
    if (L.needDrops && v.set < v.spots) return out("spots");
    if (v.marked < v.marks) return out("marks");
    if (v.calls < v.minCalls) return out("calls");
    return out("ok");
  }

  /* Run a whole program at once (tests, "Test all channels", predictions). path: the boat after each block. */
  function sail(L, grid, main, fn = []) {
    const g = parseGrid(grid);
    const st = startState(g, L.dir);
    const path = [{ x: st.x, y: st.y, dir: st.dir }];
    for (const b of run(main, st, { g, fn, depth: 0, carry: !!L.carry })) { path.push({ x: st.x, y: st.y, dir: st.dir, block: b }); if (path.length > 2000) break; }
    return { g, st, path, result: check(L, st, g) };
  }

  /* Problems with a map, in words (empty when it's fine). */
  function validateGrid(rows) {
    if (!Array.isArray(rows) || !rows.length) return ["The map has no rows."];
    const bad = [];
    if (rows.some((r) => typeof r !== "string" || r.length !== rows[0].length)) bad.push("Every row of the map must be the same length.");
    const all = rows.join("");
    const odd = all.match(/[^#.SG*ox]/);
    if (odd) bad.push(`The map has a square it doesn't know: ${odd[0]}`);
    if ((all.match(/S/g) || []).length !== 1) bad.push("The map needs exactly one start (S).");
    if ((all.match(/G/g) || []).length !== 1) bad.push("The map needs exactly one mooring (G).");
    return bad;
  }

  /* Fog: the squares a captain can see from (x, y), the boat's square and the 8 around it. */
  function visibleFrom(g, x, y, radius = 1) {
    const out = new Set();
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h) out.add(`${nx},${ny}`);
    }
    return out;
  }

  SE.harbor = Object.assign(SE.harbor || {}, { BLOCKS, make, clone, countBlocks, parse, parseGrid, isWall, DIRS, LEFT, RIGHT, ROT, run,
    startState, check, sail, validateGrid, visibleFrom });
})();
