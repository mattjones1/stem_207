/*
 * Pattern Machine Lab: the datasets and the Human Decision Room cases (SE.pmData).
 *
 * Every creature is made up and has a stable id. Each dataset names its true rule, which traits matter,
 * and what the lesson expects to happen. Those claims are checked against the real model by
 * tests/tools/test_pattern_machine.js, so if a dataset changes, the test says whether the lesson still works.
 * The rules make the labels; the model only ever sees { id, traits, label }.
 *
 * Teacher notes (not shown to students):
 *   A  Basic: pointy horns → Glim. Four examples, one new creature.
 *   B  Ambiguous: the first four fit "Glims are blue" and "Glims have pointy horns". b5 (a blue Norp) breaks
 *      the color idea; b6 (an orange Glim) confirms horns. Only the horns rule fits all six.
 *   CD Accuracy experiment: one baseline (4) and one test set (16). In the baseline, color, body, eyes, and tail
 *      all line up with the label, so the model can't tell that horns matter. "More of the same" (C) keeps
 *      those patterns; "More variety" (D) breaks them. Batches are fixed groups of 3, added in order.
 *      Measured: C 69% → 63% → 75% → 69%; D 69% → 81% → 81% → 88%.
 *   E  Bias: horns decide, but every training Glim is orange, spiky, long-tailed and every Norp blue, round,
 *      short-tailed. Typical creatures 10 of 10; blue Glims and orange Norps 0 of 6 (63% overall).
 *      Adding the six blue-Glim / orange-Norp candidates → 94% (5 of 6). The two green candidates don't help.
 *   F  Confidence trap (K = 5): pointy horns → Glim, except purple creatures, a new kind the training data
 *      never included, are the other way round. Threshold 0: 58% right, all answered. 80%: 67%, 75% answered.
 *      100%: 50%, half answered: three purple creatures stay wrong with 5 of 5 neighbors agreeing.
 *   G  Final challenge: two antennae AND a long tail → Glim. All 30 pool creatures → 90% on the 20 tests;
 *      a lopsided first 8 → 60%.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const M = SE.mlKit;
  const make = (prefix, rule, list) => list.map((s, i) => {
    const traits = M.parse(s);
    return { id: `${prefix}${String(i + 1).padStart(2, "0")}`, traits, label: rule(traits) };
  });
  const horns = (t) => (t.horns === "pointy" ? "Glim" : "Norp");

  /* Stage 1: be the machine */
  const A = { rule: horns, ruleText: "Glims have pointy horns.", relevant: ["horns"],
    start: make("a-", horns, ["blue round 2 pointy 1 short", "green spiky 1 round 2 long", "orange spiky 3 pointy 2 long", "blue round 1 none 1 short"]),
    next: make("a-n", horns, ["orange round 2 pointy 1 short"])[0] };
  const B = { rule: horns, relevant: ["horns"], irrelevant: ["color"],
    start: make("b-", horns, ["blue round 2 pointy 1 short", "blue spiky 1 pointy 2 long", "orange round 3 round 0 long", "orange spiky 2 none 1 short"]),
    breakers: make("b-x", horns, ["blue round 1 round 2 short", "orange spiky 3 pointy 0 long"]) };
  /* Rules students can test against B. Each: [id, words, test] */
  const B_RULES = [
    ["blue", "Glims are blue", (t) => t.color === "blue"],
    ["pointy", "Glims have pointy horns", (t) => t.horns === "pointy"],
    ["spiky", "Glims have spiky bodies", (t) => t.shape === "spiky"],
    ["antennae", "Glims have antennae", (t) => t.antennae > 0]
  ];

  /* The rule game (stage 1) and the secret rules (stage 2). Every rule can be learned from the six traits. */
  const GAME_RULES = [
    { id: "tail", text: "Glims have long tails", test: (t) => t.tail === "long" },
    { id: "ant2", text: "Glims have 2 antennae", test: (t) => t.antennae === 2 },
    { id: "spiky", text: "Glims have spiky bodies", test: (t) => t.shape === "spiky" },
    { id: "pointy", text: "Glims have pointy horns", test: (t) => t.horns === "pointy" },
    { id: "eyes3", text: "Glims have 3 eyes", test: (t) => t.eyes === 3 }
  ];
  const SECRET_RULES = [
    { id: "horns", text: "Pointy horns make a Glim.", simple: "Pointy horns: Glim.", test: (t) => t.horns === "pointy", traits: ["horns"] },
    { id: "antennae", text: "Two antennae make a Glim.", simple: "2 antennae: Glim.", test: (t) => t.antennae === 2, traits: ["antennae"] },
    { id: "tail", text: "A long tail makes a Glim.", simple: "Long tail: Glim.", test: (t) => t.tail === "long", traits: ["tail"] },
    { id: "spikyEyes", text: "A spiky body AND 2 or more eyes make a Glim.", simple: "Spiky and 2+ eyes: Glim.", test: (t) => t.shape === "spiky" && t.eyes >= 2, traits: ["shape", "eyes"] },
    { id: "roundOrNone", text: "Round horns OR no antennae make a Glim.", simple: "Round horns or no antennae: Glim.", test: (t) => t.horns === "round" || t.antennae === 0, traits: ["horns", "antennae"] }
  ];
  /* Unlabeled creatures for stage 2 (students label them) and a separate set for stage 3's tests. */
  const unlabeled = (prefix, list) => list.map((s, i) => ({ id: `${prefix}${String(i + 1).padStart(2, "0")}`, traits: M.parse(s) }));
  const POOL = unlabeled("p-", ["orange spiky 1 round 2 long", "green round 1 pointy 2 short", "green spiky 3 round 1 short", "blue round 2 pointy 2 long", "blue spiky 2 none 1 long", "blue round 1 round 1 long", "blue spiky 1 round 2 short", "green spiky 2 round 2 short", "orange spiky 3 pointy 2 long", "green spiky 2 pointy 1 long", "orange spiky 1 pointy 2 long", "blue round 2 pointy 1 short", "green spiky 1 none 0 short", "blue spiky 3 pointy 2 long", "green spiky 1 pointy 1 long", "orange round 2 pointy 0 short", "green spiky 3 none 0 long", "orange round 2 pointy 2 long", "blue round 2 pointy 1 long", "green spiky 2 none 1 long", "green spiky 2 round 0 short", "blue round 3 none 1 short", "green round 1 none 2 long", "orange spiky 1 pointy 1 short"]);
  const TESTPOOL = unlabeled("q-", ["blue spiky 3 pointy 0 long", "blue spiky 2 round 1 short", "orange spiky 3 round 1 short", "green round 1 round 2 short", "blue round 2 pointy 2 short", "green round 2 round 1 short", "orange spiky 2 pointy 1 long", "orange round 1 none 2 short", "orange spiky 3 pointy 0 long", "orange round 1 round 1 long", "green round 3 pointy 1 long", "blue round 3 pointy 2 short"]);
  const labelWith = (rule, list) => list.map((c) => ({ id: c.id, traits: c.traits, label: rule.test(c.traits) ? "Glim" : "Norp" }));

  /* Stage 4: the accuracy experiment */
  const CD = { rule: horns, relevant: ["horns"],
    base: make("cd-b", horns, ["blue round 2 pointy 1 short", "blue round 2 pointy 2 short", "orange spiky 1 none 0 long", "orange spiky 1 round 0 long"]),
    same: make("cd-c", horns, ["blue round 2 pointy 0 short", "blue round 3 pointy 1 short", "blue round 1 pointy 2 short", "orange spiky 2 none 0 long", "orange spiky 1 none 1 long", "orange spiky 1 round 1 long", "blue round 3 pointy 2 short", "orange spiky 2 round 0 long", "orange spiky 3 none 0 long"]),
    variety: make("cd-d", horns, ["orange spiky 1 pointy 0 long", "blue round 2 none 1 short", "green round 3 pointy 0 long", "orange round 2 round 2 short", "blue spiky 1 pointy 1 long", "green spiky 3 none 2 short", "purple round 1 pointy 2 long", "blue round 1 round 0 short", "orange spiky 3 pointy 2 short"]),
    test: make("cd-t", horns, ["orange spiky 2 pointy 1 long", "blue round 3 none 2 short", "green round 1 pointy 1 short", "green spiky 2 round 1 long", "blue spiky 3 pointy 0 short", "orange round 1 none 2 long", "purple spiky 2 pointy 2 long", "purple round 3 round 0 short", "blue round 2 round 1 long", "orange round 3 pointy 0 short", "green spiky 1 none 0 long", "blue spiky 2 none 2 long", "orange spiky 3 round 1 short", "green round 2 pointy 2 long", "purple spiky 1 none 1 short", "blue round 1 pointy 0 long"]),
    batch: 3 };

  /* Stage 5: bias detective */
  const E = { rule: horns, relevant: ["horns"], spurious: ["color", "shape", "tail"],
    train: make("e-t", horns, ["orange spiky 2 pointy 1 long", "orange spiky 3 pointy 2 long", "orange spiky 1 pointy 1 long", "orange spiky 2 pointy 0 long", "orange spiky 3 pointy 0 long", "orange spiky 1 pointy 2 long", "orange round 2 pointy 1 long",
      "blue round 2 none 1 short", "blue round 1 round 1 short", "blue round 3 none 0 short", "blue round 2 round 2 short", "blue round 1 none 2 short", "blue round 3 round 1 short", "blue spiky 2 none 0 short"]),
    test: make("e-x", horns, ["orange spiky 2 pointy 2 long", "orange spiky 1 pointy 0 long", "orange spiky 3 pointy 1 long", "blue round 1 none 1 short", "blue round 3 round 2 short", "blue round 2 none 2 short", "orange round 3 pointy 2 long", "blue round 1 round 0 short", "green spiky 2 pointy 1 long", "green round 1 none 1 short",
      "blue round 2 pointy 1 short", "blue round 3 pointy 0 short", "blue round 1 pointy 2 short", "orange spiky 2 none 1 long", "orange spiky 1 round 0 long", "orange spiky 3 none 2 long"]),
    candidates: make("e-p", horns, ["blue round 2 pointy 2 short", "blue round 1 pointy 0 short", "blue round 3 pointy 1 short", "orange spiky 2 none 2 long", "orange spiky 1 round 1 long", "orange spiky 3 none 1 long", "green round 2 pointy 0 short", "green spiky 3 round 2 long"]),
    /* The group the model fails: creatures whose color doesn't match the pattern in the training data. */
    counter: (e) => (e.traits.color === "blue" && e.label === "Glim") || (e.traits.color === "orange" && e.label === "Norp") };

  /* Stage 6: the confidence trap (K = 5) */
  const xorPurple = (t) => ((t.horns === "pointy") !== (t.color === "purple") ? "Glim" : "Norp");
  const F = { rule: xorPurple, K: 5, newKind: "purple",
    train: make("f-t", xorPurple, ["orange round 3 pointy 0 short", "orange spiky 2 none 2 long", "green round 3 pointy 0 short", "orange spiky 1 none 0 short", "green round 3 pointy 2 long", "blue spiky 3 none 2 long", "orange round 3 pointy 2 long", "blue round 3 none 1 short", "green round 1 pointy 0 short", "green spiky 2 none 2 short", "blue round 3 pointy 2 short", "green spiky 3 none 2 long", "orange spiky 2 pointy 2 long", "orange round 2 none 1 long", "green spiky 1 pointy 0 long", "orange round 2 round 0 short", "green round 1 pointy 2 long", "green round 3 round 0 short", "blue spiky 1 pointy 2 short", "green round 2 round 1 long"]),
    test: make("f-x", xorPurple, ["blue round 3 pointy 0 long", "green spiky 1 pointy 0 short", "green spiky 1 pointy 2 short", "blue round 2 pointy 0 long", "orange spiky 1 none 1 short", "green spiky 1 none 0 short", "blue round 1 none 0 long", "orange spiky 1 round 0 long", "purple round 2 pointy 2 short", "purple round 2 pointy 0 long", "purple round 3 none 2 long", "purple round 2 round 1 short"]),
    scenarios: [
      { id: "game", text: "A sorting game for fun. A wrong answer just means you lose a point.", stakes: "low" },
      { id: "bite", text: "Sorting creatures at a pet shop. A wrong answer could mean someone gets bitten.", stakes: "high" }
    ] };

  /* Stage 8: the final challenge */
  const gRule = (t) => (t.antennae === 2 && t.tail === "long" ? "Glim" : "Norp");
  const G = { rule: gRule, ruleText: "Glims have 2 antennae AND a long tail.", relevant: ["antennae", "tail"],
    pool: make("g-p", gRule, ["blue spiky 3 round 2 long", "green round 2 pointy 2 long", "blue round 3 none 2 long", "green round 2 none 2 long", "green spiky 1 pointy 2 long", "blue round 2 round 2 long", "orange spiky 2 none 2 long", "green round 1 none 2 long", "green spiky 2 none 2 long", "blue spiky 2 none 2 long", "green spiky 1 round 2 long", "orange round 2 round 2 long", "blue round 3 none 2 short", "orange round 1 round 2 short", "orange round 1 round 0 long", "green spiky 1 none 0 long", "orange round 1 none 0 long", "orange round 2 pointy 0 short", "green spiky 3 round 0 short", "green spiky 3 round 1 long", "green round 1 none 1 short", "orange round 3 none 0 short", "orange spiky 1 none 1 long", "orange round 2 pointy 1 long", "blue spiky 3 round 0 short", "green spiky 3 pointy 0 short", "blue spiky 2 none 0 long", "green round 1 none 2 short", "green round 3 pointy 2 short", "green spiky 2 round 1 long"]),
    test: make("g-x", gRule, ["green spiky 3 pointy 2 long", "orange spiky 3 round 2 long", "orange spiky 3 none 2 long", "blue spiky 1 round 2 long", "green spiky 2 round 2 long", "orange spiky 1 none 2 long", "green round 3 none 2 long", "green round 2 round 2 long", "blue spiky 3 pointy 1 short", "orange spiky 3 none 0 short", "orange spiky 1 round 0 short", "green round 3 pointy 1 long", "blue round 1 pointy 0 long", "blue round 2 none 1 short", "orange spiky 3 pointy 1 long", "orange round 2 pointy 2 short", "green spiky 1 none 1 short", "blue spiky 2 round 1 short", "green spiky 1 none 1 long", "green round 2 none 1 long"]) };

  /* ───────── Stage 7: the Human Decision Room ─────────
   * Decisions: help (AI can help with this), review (AI can help, but a person reviews important decisions),
   * not (AI should not make this decision).
   *   floor: decisions this case rules out (null = a judgment call where any decision can be sound)
   *   fits:  reasons that actually apply to the case
   *   view:  what many people think, shown as one perspective, not the answer
   * A case is sound when the decision is allowed and the reason fits. This rubric is a draft for teacher review. */
  const DECISIONS = { help: "AI can help with this", review: "AI can help, but a person must review important decisions", not: "AI should not make this decision" };
  const REASONS = {
    small: "A mistake would be small and easy to catch",
    help: "It saves people time on a slow or repetitive job",
    choice: "A person still makes the final choice",
    harm: "A mistake could hurt someone",
    unfair: "It could treat some people unfairly",
    private: "It uses private information",
    missing: "The training examples could be missing some cases",
    cantknow: "The AI can't really know this from the data"
  };
  const AFFECTS = { scientists: "Scientists", farmers: "Farmers and workers", students: "Students", families: "Families", patients: "Patients", everyone: "Anyone in town" };
  const SCENARIOS = [
    { id: "puffins", text: "Counting puffins in wildlife photos from a Maine seabird island", floor: null, fits: ["small", "help", "missing"],
      view: "Many people call this a good use: it saves scientists hours, and a person can spot-check the photos." },
    { id: "blueberries", text: "Sorting Maine wild blueberries by size and quality on a conveyor belt", floor: null, fits: ["small", "help"],
      view: "Many people call this a good use: a mistake means one berry ends up in the wrong bin." },
    { id: "library", text: "Helping a school library sort books by subject", floor: null, fits: ["small", "help", "choice"],
      view: "Many people call this a good use, as long as a librarian can fix books that end up on the wrong shelf." },
    { id: "music", text: "Recommending music based on what someone likes to listen to", floor: null, fits: ["small", "choice", "private"],
      view: "Many people call this a good use because you still choose what to play. Some worry about apps keeping a record of everything you listen to." },
    { id: "weather", text: "Helping a scientist spot unusual weather patterns", floor: null, fits: ["help", "choice", "missing", "harm"],
      view: "Many people say AI can help here, and that a scientist should check anything that would turn into a warning for the public." },
    { id: "discipline", text: "Deciding whether a student should be disciplined", floor: ["help"], fits: ["harm", "unfair", "cantknow", "missing"],
      rule: "Discipline affects a student's life, and an AI can't know the whole story, so it can't decide on its own.",
      view: "Many people say AI should not make this decision at all. Some say it could help sort paperwork if a person decides." },
    { id: "medical", text: "Helping a doctor review X-rays and other medical images", floor: ["help"], fits: ["harm", "help", "choice", "missing"],
      rule: "A missed or wrong finding could hurt a patient, so this can't be left to AI alone. A doctor has to check.",
      view: "Many people say it's OK if a doctor checks: AI can help doctors find things faster." },
    { id: "scholarship", text: "Deciding who receives a scholarship", floor: ["help"], fits: ["unfair", "harm", "missing", "private"],
      rule: "AI trained on past choices can copy past unfairness, and the decision changes people's lives, so it can't decide alone.",
      view: "Many people say people must make this choice. Some say AI shouldn't be used for it at all." },
    { id: "translate", text: "Helping translate town information into other languages", floor: null, fits: ["help", "harm", "choice"],
      view: "Many people call this helpful, especially if a fluent speaker checks important messages like dates and safety notes." },
    { id: "emergency", text: "Deciding whether a person should receive emergency assistance", floor: ["help"], fits: ["harm", "unfair", "cantknow", "missing"],
      rule: "A wrong answer in an emergency could seriously hurt someone, so a person has to make this call.",
      view: "Many people say AI should not make this decision. Some say it could help a person sort requests faster." }
  ];
  const PASS = 7;

  SE.pmData = { A, B, B_RULES, GAME_RULES, SECRET_RULES, POOL, TESTPOOL, labelWith, CD, E, F, G, DECISIONS, REASONS, AFFECTS, SCENARIOS, PASS };
})();
