/*
 * STEM 207 — the machine-learning kit (SE.mlKit), used by the Pattern Machine Lab.
 *
 * Creatures have six traits. The model is a k-nearest-neighbors classifier students can check by hand:
 *   distance    the number of traits that differ (0–6). Every trait counts the same.
 *   neighbors   the K examples with the smallest distance. Ties at the same distance: the example
 *               added to the training set first wins (training sets are lists, in the order added).
 *   vote        plain majority of the K neighbors. K is 1, 3, or 5. If two labels tie (fewer examples
 *               than K), the label of the nearest neighbor wins.
 *   agree       winning votes ÷ neighbors used. Shown as the "model confidence score: based on how many
 *               nearby examples agree". It is a model output, not a probability of being right.
 *               With K = 3 it can only be 33%, 67%, or 100% (two labels: 67% or 100%).
 * Training examples are { id, traits, label } and nothing else: the rule that made the labels is never
 * given to the model. Everything runs in the browser; nothing is sent anywhere.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const esc = SE.esc || ((s) => String(s));

  const TRAITS = {
    color: ["blue", "orange", "green", "purple"],
    shape: ["round", "spiky"],
    eyes: [1, 2, 3],
    horns: ["none", "round", "pointy"],
    antennae: [0, 1, 2],
    tail: ["short", "long"]
  };
  const KEYS = Object.keys(TRAITS);
  const TRAIT_NAME = { color: "Color", shape: "Body", eyes: "Eyes", horns: "Horns", antennae: "Antennae", tail: "Tail" };
  const MAX_TRAIN = 40, MAX_TEST = 30;

  /* "blue round 2 pointy 1 long" → traits */
  function parse(s) {
    const [color, shape, eyes, horns, antennae, tail] = String(s).trim().split(/\s+/);
    return check({ color, shape, eyes: Number(eyes), horns, antennae: Number(antennae), tail });
  }
  function check(t) {
    if (!t || typeof t !== "object") throw new TypeError("A creature needs traits.");
    KEYS.forEach((k) => { if (!TRAITS[k].includes(t[k])) throw new TypeError(`"${t[k]}" isn't a ${k} this lab knows.`); });
    return t;
  }
  const valid = (t) => { try { check(t); return true; } catch (e) { return false; } };

  /* Words for one trait value, and for a whole creature (screen readers, tables, and the trait strip). */
  function traitText(k, v) {
    if (k === "color") return v;
    if (k === "shape") return v === "spiky" ? "spiky body" : "round body";
    if (k === "eyes") return `${v} eye${v > 1 ? "s" : ""}`;
    if (k === "horns") return v === "none" ? "no horns" : `${v} horns`;
    if (k === "antennae") return v === 0 ? "no antennae" : v === 1 ? "1 antenna" : "2 antennae";
    if (k === "tail") return `${v} tail`;
    return String(v);
  }
  const describe = (t) => `${t.color} creature: ${KEYS.filter((k) => k !== "color").map((k) => traitText(k, t[k])).join(", ")}`;

  /* ───────── Art: every trait is drawn, so students see what the model sees ───────── */
  const COLORS = { blue: "#3f7fc9", orange: "#ec7a2f", green: "#4f9a5a", purple: "#8a5cb8" };
  const INK = "#0d1d36", HORN = "#f4e6c8";
  function creature(t, size = 84, label) {
    const fill = COLORS[t.color] || "#999";
    const cx = 50, cy = 62, r = 23;
    const tail = t.tail === "long"
      ? `<path d="M${cx + 18} ${cy + 8} C 88 ${cy + 10}, 94 ${cy - 10}, 86 ${cy - 22}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M${cx + 18} ${cy + 8} C 88 ${cy + 10}, 94 ${cy - 10}, 86 ${cy - 22}" fill="none" stroke="${fill}" stroke-width="4.5" stroke-linecap="round"/>`
      : `<ellipse cx="${cx + 24}" cy="${cy + 9}" rx="7" ry="5" fill="${fill}" stroke="${INK}" stroke-width="2"/>`;
    let body;
    if (t.shape === "spiky") {
      const pts = [];
      for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; const rr = i % 2 ? r * 0.8 : r * 1.12; pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`); }
      body = `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
    } else body = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="2.2"/>`;
    const ant = { 0: [], 1: [[0, 0]], 2: [[-7, -4], [7, 4]] }[t.antennae].map(([dx, lean]) =>
      `<line x1="${cx + dx}" y1="${cy - r + 2}" x2="${cx + dx + lean}" y2="${cy - r - 20}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${cx + dx + lean}" cy="${cy - r - 22}" r="3.6" fill="${INK}"/>`).join("");
    const horns = t.horns === "none" ? "" : [-17, 17].map((dx) => t.horns === "pointy"
      ? `<polygon points="${cx + dx - 5},${cy - r + 8} ${cx + dx + 5},${cy - r + 8} ${cx + dx + dx * 0.25},${cy - r - 10}" fill="${HORN}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`
      : `<circle cx="${cx + dx}" cy="${cy - r + 4}" r="6" fill="${HORN}" stroke="${INK}" stroke-width="1.8"/>`).join("");
    const ex = { 1: [0], 2: [-8, 8], 3: [-11, 0, 11] }[t.eyes];
    const eyes = ex.map((dx) => { const y = cy - 7 - (t.eyes === 3 && dx === 0 ? 5 : 0); return `<circle cx="${cx + dx}" cy="${y}" r="5.4" fill="#fff" stroke="${INK}" stroke-width="1.5"/><circle cx="${cx + dx + 1}" cy="${y + 1}" r="2.4" fill="${INK}"/>`; }).join("");
    const feet = `<rect x="${cx - 14}" y="${cy + r - 5}" width="9" height="8" rx="3" fill="${INK}"/><rect x="${cx + 5}" y="${cy + r - 5}" width="9" height="8" rx="3" fill="${INK}"/>`;
    const mouth = `<path d="M${cx - 6} ${cy + 6} q6 5 12 0" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
    const a11y = label === " " ? 'aria-hidden="true" focusable="false"' : `role="img" aria-label="${esc(label || describe(t))}"`;   // " ": decorative, inside a labeled button
    return `<svg class="creature" viewBox="0 0 100 100" width="${size}" height="${size}" ${a11y}>${tail}${ant}${feet}${body}${horns}${eyes}${mouth}</svg>`;
  }

  /* ───────── The model ───────── */
  function asExample(e, i) {
    if (!e || typeof e !== "object") throw new TypeError(`Training example ${i + 1} is empty.`);
    const extra = Object.keys(e).filter((k) => !["id", "traits", "label"].includes(k));
    if (extra.length) throw new TypeError(`Training examples hold only id, traits, and label (got ${extra.join(", ")}).`);
    if (!e.label) throw new TypeError(`Training example ${e.id || i + 1} has no label.`);
    check(e.traits);
    return e;
  }
  const diffs = (a, b) => KEYS.filter((k) => a[k] !== b[k]);
  const distance = (a, b) => diffs(a, b).length;

  /* Rank every training example by distance; ties keep training order. */
  function ranked(train, traits) {
    check(traits);
    return train.map((e, i) => { asExample(e, i); return { ex: e, order: i, diffs: diffs(e.traits, traits) }; })
      .map((n) => ({ ...n, distance: n.diffs.length }))
      .sort((a, b) => a.distance - b.distance || a.order - b.order);
  }

  /* → null for an empty set, else { label, votes, agree, K, used, neighbors, tieAtEdge } */
  function knn(train, traits, opts = {}) {
    const K = [1, 3, 5].includes(opts.K) ? opts.K : 3;
    if (train.length > MAX_TRAIN) throw new RangeError(`Training sets hold up to ${MAX_TRAIN} examples.`);
    const all = ranked(train, traits);
    if (!all.length) return null;
    const neighbors = all.slice(0, K);
    // Was an example left out only because it was added later? (it had the same distance as the last one used)
    const tieAtEdge = all.length > K && all[K].distance === neighbors[neighbors.length - 1].distance;
    const votes = {};
    neighbors.forEach((n) => { votes[n.ex.label] = (votes[n.ex.label] || 0) + 1; });
    const top = Math.max(...Object.values(votes));
    const tied = Object.keys(votes).filter((l) => votes[l] === top);
    const label = tied.length === 1 ? tied[0] : neighbors.find((n) => tied.includes(n.ex.label)).ex.label;
    return { label, votes, agree: votes[label] / neighbors.length, K, used: neighbors.length, neighbors, tieAtEdge };
  }
  /* Distance to the nearest training example (for "never seen anything like it"). */
  function closest(train, traits) {
    const all = ranked(train, traits);
    return all.length ? all[0].distance : Infinity;
  }

  /* Training and test sets must not share a creature: same id, or exactly the same traits. */
  function leaks(train, test) {
    const ids = new Set(train.map((e) => e.id));
    const keys = new Set(train.map((e) => key(e.traits)));
    return test.filter((t) => ids.has(t.id) || keys.has(key(t.traits))).map((t) => t.id);
  }
  const key = (t) => KEYS.map((k) => t[k]).join("|");

  /* Evaluate on a held-out test set. test items: { id, traits, label } (label = the true answer).
     threshold: minimum agreement in percent to answer (0 = always answer). novelty: withhold when the
     closest example differs in at least this many traits (null = off). */
  function evaluate(train, test, opts = {}) {
    if (test.length > MAX_TEST) throw new RangeError(`Test sets hold up to ${MAX_TEST} creatures.`);
    const leak = leaks(train, test);
    if (leak.length) throw new Error(`These test creatures are also in the training data: ${leak.join(", ")}.`);
    const threshold = opts.threshold || 0, novelty = opts.novelty == null ? null : opts.novelty;
    const items = test.map((t) => {
      const p = knn(train, t.traits, opts);
      if (!p) return { ex: t, truth: t.label, label: null, agree: 0, answered: false, correct: false, why: "empty" };
      const near = p.neighbors[0].distance;
      const unsure = p.agree * 100 < threshold - 1e-9;
      const novel = novelty != null && near >= novelty;
      const answered = !unsure && !novel;
      return { ex: t, truth: t.label, label: p.label, agree: p.agree, near, answered, correct: p.label === t.label, why: unsure ? "low-agreement" : novel ? "novel" : "answered", p };
    });
    const answered = items.filter((r) => r.answered);
    const correct = answered.filter((r) => r.correct).length;
    const allCorrect = items.filter((r) => r.label !== null && r.correct).length;
    return {
      total: items.length,
      answered: answered.length,
      withheld: items.length - answered.length,
      correct,
      wrong: answered.length - correct,
      accuracy: answered.length ? correct / answered.length : null,      // among answered
      overall: items.length ? allCorrect / items.length : null,         // every test creature, threshold ignored
      coverage: items.length ? answered.length / items.length : 0,
      items,
      byGroup(trait) {
        const g = {};
        items.forEach((r) => {
          const v = r.ex.traits[trait];
          const s = (g[v] = g[v] || { n: 0, correct: 0, accuracy: null });
          s.n++; if (r.correct) s.correct++;
        });
        Object.values(g).forEach((s) => { s.accuracy = s.correct / s.n; });
        return g;
      }
    };
  }

  /* Counts by label, and by trait value × label. */
  function distribution(set) {
    const labels = {}, byTrait = {};
    KEYS.forEach((k) => { byTrait[k] = {}; TRAITS[k].forEach((v) => { byTrait[k][v] = {}; }); });
    set.forEach((e) => {
      labels[e.label] = (labels[e.label] || 0) + 1;
      KEYS.forEach((k) => { const c = byTrait[k][e.traits[k]]; c[e.label] = (c[e.label] || 0) + 1; });
    });
    return { n: set.length, labels, byTrait };
  }
  /* Value pairs of two traits that no example has (e.g. no "blue + pointy"). values limits each trait. */
  function missingCombos(set, a, b, values = {}) {
    const va = values[a] || TRAITS[a], vb = values[b] || TRAITS[b], out = [];
    va.forEach((x) => vb.forEach((y) => { if (!set.some((e) => e.traits[a] === x && e.traits[b] === y)) out.push({ [a]: x, [b]: y }); }));
    return out;
  }

  /* The thresholds that change anything for K neighbors and two labels: e.g. K=3 → [67, 100]. */
  function possibleAgreements(K) {
    const out = [];
    for (let v = Math.ceil(K / 2); v <= K; v++) out.push(Math.round((v / K) * 100));
    return out;
  }

  SE.mlKit = { TRAITS, KEYS, TRAIT_NAME, COLORS, MAX_TRAIN, MAX_TEST, parse, check, valid, traitText, describe, creature, distance, diffs, knn, closest, leaks, evaluate, distribution, missingCombos, possibleAgreements, key };
})();
