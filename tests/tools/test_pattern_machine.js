// Pattern Machine Lab: the k-NN model (assets/js/labs/ml-kit.js) and every dataset's lesson
// (assets/js/labs/pattern-machine-data.js), checked against the real model.
//   node tests/tools/test_pattern_machine.js
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.resolve(__dirname, "../..");
const R = [];
const ok = (n, c, x = "") => { R.push(!!c); console.log((c ? "PASS " : "FAIL ") + n, c ? "" : x); };
const sandbox = { window: {}, console };
sandbox.window.SE = { icon: () => "", esc: (s) => String(s), labs: { register() {}, goals() {} } };
vm.createContext(sandbox);
["assets/js/labs/ml-kit.js", "assets/js/labs/pattern-machine-data.js"].forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f }));
const M = sandbox.window.SE.mlKit, D = sandbox.window.SE.pmData;
const ex = (id, s, label) => ({ id, traits: M.parse(s), label });
const throws = (fn) => { try { fn(); return false; } catch (e) { return true; } };

/* ───────── The model ───────── */
ok("distance counts the traits that differ", M.distance(M.parse("blue round 2 pointy 1 short"), M.parse("orange round 3 pointy 1 short")) === 2);
ok("identical creatures are distance 0", M.distance(M.parse("green spiky 1 none 0 long"), M.parse("green spiky 1 none 0 long")) === 0);
ok("all six traits can differ", M.distance(M.parse("blue round 1 none 0 short"), M.parse("orange spiky 2 pointy 1 long")) === 6);

const T = [ex("t1", "blue round 2 pointy 1 short", "Glim"), ex("t2", "blue round 2 pointy 2 short", "Glim"), ex("t3", "orange spiky 1 none 0 long", "Norp"),
  ex("t4", "orange spiky 1 round 0 long", "Norp"), ex("t5", "blue round 2 none 1 short", "Norp")];
const p = M.knn(T, M.parse("blue round 2 pointy 0 short"));
ok("the 3 nearest are chosen by distance", p.neighbors.map((n) => n.ex.id).join() === "t1,t2,t5", p.neighbors.map((n) => n.ex.id + ":" + n.distance).join());
ok("neighbors report their real distances and differing traits", p.neighbors[0].distance === 1 && p.neighbors[0].diffs.join() === "antennae");
ok("the vote is a plain majority (2 Glim, 1 Norp → Glim)", p.label === "Glim" && p.votes.Glim === 2 && p.votes.Norp === 1);
ok("agreement is winning votes ÷ K", Math.abs(p.agree - 2 / 3) < 1e-9);
ok("K = 1 uses the single nearest example", M.knn(T, M.parse("blue round 2 none 0 short"), { K: 1 }).neighbors.length === 1);
ok("K defaults to 3 for anything but 1, 3, or 5", M.knn(T, M.parse("blue round 2 none 0 short"), { K: 4 }).K === 3);

// Deterministic ties: same distance → the example added first.
const tie = [ex("x1", "blue round 1 none 0 short", "Norp"), ex("x2", "orange round 1 none 0 short", "Glim")];
const target = M.parse("green round 1 none 0 short");
ok("equal distances: the example added first wins (K = 1)", M.knn(tie, target, { K: 1 }).label === "Norp" && M.knn(tie.slice().reverse(), target, { K: 1 }).label === "Glim");
ok("the same input always gives the same answer", JSON.stringify(M.knn(T, target)) === JSON.stringify(M.knn(T, target)));
ok("a tie at the edge of the K nearest is reported", M.knn([...tie, ex("x3", "purple round 1 none 0 short", "Norp")], target, { K: 1 }).tieAtEdge === true);
ok("a vote tie (2 examples, K = 3) goes to the nearest neighbor's label", M.knn([ex("y1", "blue round 1 none 0 short", "Glim"), ex("y2", "orange spiky 3 pointy 2 long", "Norp")], M.parse("blue round 1 none 0 long")).label === "Glim");

ok("an empty training set predicts nothing (null)", M.knn([], target) === null);
const one = M.knn([ex("o1", "blue round 1 none 0 short", "Glim"), ex("o2", "orange round 1 none 0 short", "Glim")], target);
ok("a one-label training set predicts that label with full agreement", one.label === "Glim" && one.agree === 1);
const dup = [ex("d1", "blue round 1 none 0 short", "Glim"), ex("d2", "blue round 1 none 0 short", "Glim"), ex("d3", "blue round 1 none 0 short", "Norp")];
ok("duplicates and contradictory copies each count as one vote", M.knn(dup, M.parse("blue round 1 none 0 short")).votes.Glim === 2);
ok("an unknown trait value is refused", throws(() => M.parse("pink round 1 none 0 short")) && throws(() => M.knn(T, { color: "blue" })));
ok("a training example with no label is refused", throws(() => M.knn([{ id: "z", traits: M.parse("blue round 1 none 0 short") }], target)));
ok("the model refuses anything but id, traits, and label (no rule can sneak in)", throws(() => M.knn([{ ...T[0], rule: "horns" }], target)));
ok("training sets are bounded", throws(() => M.knn(Array.from({ length: 41 }, (_, i) => ({ ...T[0], id: "b" + i })), target)));
ok("possible agreement levels: K=3 → 67, 100; K=5 → 60, 80, 100", M.possibleAgreements(3).join() === "67,100" && M.possibleAgreements(5).join() === "60,80,100");

// Training changes the model.
const before = M.knn(T, M.parse("orange round 2 pointy 1 short")).label;
const after = M.knn(T.concat([ex("t6", "orange round 2 pointy 1 long", "Norp"), ex("t7", "orange round 2 pointy 0 short", "Norp")]), M.parse("orange round 2 pointy 1 short")).label;
ok("adding examples changes the prediction", before === "Glim" && after === "Norp", before + " → " + after);

/* ───────── Evaluation ───────── */
const test = [ex("e1", "blue round 3 pointy 1 short", "Glim"), ex("e2", "orange spiky 2 none 0 long", "Norp"), ex("e3", "green spiky 1 pointy 0 long", "Glim"), ex("e4", "green round 2 none 1 long", "Norp")];
const r = M.evaluate(T, test);
const manual = test.filter((t) => M.knn(T, t.traits).label === t.label).length;
ok("accuracy = right ÷ answered, counted from real predictions", r.correct === manual && r.accuracy === manual / 4 && r.total === 4);
ok("right + wrong + withheld = every test creature", r.correct + r.wrong + r.withheld === r.total);
ok("a training creature in the test set is refused (same id)", throws(() => M.evaluate(T, [T[0]])));
ok("a training creature in the test set is refused (same traits, new id)", throws(() => M.evaluate(T, [{ ...T[0], id: "copy" }])));
const g = r.byGroup("color");
ok("group accuracy adds up to the overall numbers", Object.values(g).reduce((s, v) => s + v.n, 0) === 4 && Object.values(g).reduce((s, v) => s + v.correct, 0) === r.correct);
const r100 = M.evaluate(T, test, { threshold: 100 });
ok("a threshold withholds low-agreement answers and lowers coverage", r100.answered === test.filter((t) => M.knn(T, t.traits).agree === 1).length && r100.coverage <= r.coverage);
ok("accuracy among answered uses the answered count", r100.answered === 0 ? r100.accuracy === null : r100.accuracy === r100.correct / r100.answered);
ok("70% and 100% behave the same with 3 neighbors", JSON.stringify(M.evaluate(T, test, { threshold: 70 }).items.map((i) => i.answered)) === JSON.stringify(r100.items.map((i) => i.answered)));
ok("the novelty check withholds creatures far from every example", M.evaluate(T, test, { novelty: 1 }).answered === 0);
const dist = M.distribution(T);
ok("distribution counts labels and trait × label", dist.labels.Glim === 2 && dist.labels.Norp === 3 && dist.byTrait.color.blue.Glim === 2 && dist.byTrait.color.blue.Norp === 1);
ok("missing combinations are found", M.missingCombos(T, "color", "horns", { color: ["blue", "orange"], horns: ["pointy", "none"] }).some((c) => c.color === "orange" && c.horns === "pointy"));

/* ───────── Every dataset: no leaks, ids unique, labels from the rule ───────── */
const all = [D.A.start, [D.A.next], D.B.start, D.B.breakers, D.CD.base, D.CD.same, D.CD.variety, D.CD.test, D.E.train, D.E.test, D.E.candidates, D.F.train, D.F.test, D.G.pool, D.G.test].flat();
ok("every creature id is unique", new Set(all.map((e) => e.id)).size === all.length);
ok("pools and test sets are separate (stage 2 and 3)", M.leaks(D.POOL.map((c) => ({ ...c, label: "x" })), D.TESTPOOL).length === 0);
ok("the accuracy experiment never trains on a test creature", M.leaks(D.CD.base.concat(D.CD.same, D.CD.variety), D.CD.test).length === 0);
ok("the bias fix never trains on a test creature", M.leaks(D.E.train.concat(D.E.candidates), D.E.test).length === 0);
ok("the final challenge never trains on a test creature", M.leaks(D.G.pool, D.G.test).length === 0);
ok("set sizes fit a Chromebook and the model's bounds", D.POOL.length === 24 && D.TESTPOOL.length === 12 && D.CD.test.length === 16 && D.G.pool.length === 30 && D.G.test.length === 20);

/* Stage 1 */
ok("A: the new creature follows the rule", D.A.next.label === "Glim" && D.A.start.every((e) => e.label === D.A.rule(e.traits)));
const fits = (rule, list) => list.every((e) => rule(e.traits) === (e.label === "Glim"));
const first = D.B_RULES.filter(([, , t]) => fits(t, D.B.start)).map(([id]) => id);
ok("B: more than one rule fits the first four examples", first.includes("blue") && first.includes("pointy"), first.join());
ok("B: only pointy horns fits all six", D.B_RULES.filter(([, , t]) => fits(t, D.B.start.concat(D.B.breakers))).map(([id]) => id).join() === "pointy");
ok("B: the first new example breaks the color rule", D.B.breakers[0].traits.color === "blue" && D.B.breakers[0].label === "Norp");
ok("the rule game: every rule has both kinds in the pool", D.GAME_RULES.every((g) => D.POOL.some((c) => g.test(c.traits)) && D.POOL.some((c) => !g.test(c.traits))));

/* Stage 2/3: every secret rule can be learned */
D.SECRET_RULES.forEach((rule) => {
  const tr = D.labelWith(rule, D.POOL), te = D.labelWith(rule, D.TESTPOOL);
  const glims = tr.filter((e) => e.label === "Glim").length;
  ok(`secret rule "${rule.id}": both labels in the pool and the tests, and learnable (≥75% with all 24)`, glims >= 7 && glims <= 17 && te.some((e) => e.label === "Glim") && te.some((e) => e.label === "Norp") && M.evaluate(tr, te).overall >= 0.75, `${glims} Glims, ${Math.round(M.evaluate(tr, te).overall * 100)}%`);
});

/* Stage 4: accuracy experiment (fixed batches of 3) */
const curve = (pool) => [0, 1, 2, 3].map((b) => M.evaluate(D.CD.base.concat(pool.slice(0, b * D.CD.batch)), D.CD.test).overall);
const cs = curve(D.CD.same), cv = curve(D.CD.variety);
ok("CD: both runs start from the same baseline score", cs[0] === cv[0]);
ok("CD: more variety ends higher than more of the same", cv[3] > cs[3], `${cs} vs ${cv}`);
ok("CD: more of the same isn't steady (accuracy can drop when examples are added)", cs.some((v, i) => i && v < cs[i - 1]), String(cs));
ok("CD: training accuracy looks perfect even when test accuracy isn't", (() => { const tr = D.CD.base.concat(D.CD.same); return tr.every((e) => M.knn(tr, e.traits, { K: 1 }).label === e.label) && cs[3] < 1; })());

/* Stage 5: bias */
const counterOf = (res) => res.items.filter((i) => D.E.counter(i.ex));
const eb = M.evaluate(D.E.train, D.E.test);
ok("E: typical creatures are all right", eb.items.filter((i) => !D.E.counter(i.ex)).every((i) => i.correct));
ok("E: the counter group (blue Glims, orange Norps) is all wrong", counterOf(eb).length === 6 && counterOf(eb).every((i) => !i.correct));
ok("E: color shows the problem (blue and orange groups score lower than green)", eb.byGroup("color").green.accuracy === 1 && eb.byGroup("color").blue.accuracy < 1 && eb.byGroup("color").orange.accuracy < 1);
ok("E: some mistakes come with full agreement", eb.items.some((i) => !i.correct && i.agree === 1));
const fixed = M.evaluate(D.E.train.concat(D.E.candidates.slice(0, 6)), D.E.test);
ok("E: adding the missing kinds fixes most of the group", counterOf(fixed).filter((i) => i.correct).length >= 5 && fixed.overall > eb.overall, `${counterOf(fixed).filter((i) => i.correct).length}/6`);
ok("E: adding only green examples doesn't help", M.evaluate(D.E.train.concat(D.E.candidates.slice(6)), D.E.test).overall === eb.overall);

/* Stage 6: confidence trap */
const ev = (th) => M.evaluate(D.F.train, D.F.test, { K: D.F.K, threshold: th });
const f0 = ev(0), f80 = ev(80), f100 = ev(100);
ok("F: a balanced training set (10 and 10)", D.F.train.filter((e) => e.label === "Glim").length === 10);
ok("F: raising the threshold answers fewer", f0.coverage > f80.coverage && f80.coverage > f100.coverage);
ok("F: 80% is more accurate than answering everything", f80.accuracy > f0.accuracy);
ok("F: 100% is NOT more accurate than 80% (higher isn't always better)", f100.accuracy < f80.accuracy, `${f80.accuracy} vs ${f100.accuracy}`);
const confWrong = f0.items.filter((i) => !i.correct && i.agree === 1);
ok("F: there are confident mistakes (5 of 5 agree, still wrong)", confWrong.length >= 2);
ok("F: every confident mistake is the new kind (purple)", confWrong.every((i) => i.ex.traits.color === D.F.newKind));
ok("F: the normal creatures are mostly right (7 of 8)", f0.items.filter((i) => i.ex.traits.color !== "purple" && i.correct).length === 7);

/* Stage 8: final challenge */
const gFull = M.evaluate(D.G.pool, D.G.test).overall;
const gSmall = M.evaluate(D.G.pool.slice(0, 4).concat(D.G.pool.slice(12, 16)), D.G.test).overall;
ok("G: a good training set does well but isn't perfect", gFull >= 0.8 && gFull < 1, String(gFull));
ok("G: a lopsided first set does worse, so improving is possible", gSmall < gFull, `${gSmall} → ${gFull}`);
ok("G: the pool has both labels", D.G.pool.some((e) => e.label === "Glim") && D.G.pool.some((e) => e.label === "Norp"));

/* Stage 7: the cases */
ok("10 decision cases from the workshop brief", D.SCENARIOS.length === 10 && D.PASS === 7);
ok("every case's reasons and floors are real keys", D.SCENARIOS.every((s) => s.fits.length && s.fits.every((k) => D.REASONS[k]) && (!s.floor || s.floor.every((k) => D.DECISIONS[k]))));
ok("high-stakes cases rule out AI deciding alone", ["discipline", "medical", "scholarship", "emergency"].every((id) => D.SCENARIOS.find((s) => s.id === id).floor.includes("help")));

/* Art: every trait shows up in the picture's words */
const svg = M.creature(M.parse("purple spiky 3 pointy 2 long"));
ok("the picture's label names every trait", ["purple", "spiky", "3 eyes", "pointy horns", "2 antennae", "long tail"].every((w) => svg.includes(w)));

/* ───────── Pattern Machine 2.0: the model's new options, Inside the Machine, Change One Thing, the Field Guide ───────── */
["assets/js/labs/pm-ui.js", "assets/js/labs/pm-explain.js", "assets/js/labs/pm-knowledge.js"].forEach((f) => vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), sandbox, { filename: f }));
const X = sandbox.window.SE.pmExplain, KN = sandbox.window.SE.pmKnow;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// features: left out (or all six) gives exactly the legacy result on every dataset.
const sets = [[D.CD.base.concat(D.CD.variety), D.CD.test, 3], [D.E.train, D.E.test, 3], [D.F.train, D.F.test, 5], [D.G.pool, D.G.test, 3]];
ok("features = all six gives exactly the default results on every dataset", sets.every(([tr, te, K]) => same(M.evaluate(tr, te, { K }).items.map((i) => [i.label, i.agree]), M.evaluate(tr, te, { K, features: M.KEYS.slice() }).items.map((i) => [i.label, i.agree]))));
ok("an invalid features list falls back to all six", same(M.featuresOf(["wings"]), M.KEYS) && same(M.featuresOf([]), M.KEYS));
ok("with features, distance counts only those traits", M.distance(M.parse("blue round 2 pointy 1 short"), M.parse("orange spiky 2 pointy 1 short"), ["horns", "eyes"]) === 0);
ok("features change predictions only through distance (horns only: pointy → its pointy neighbors)", M.knn(D.E.train, M.parse("blue round 2 pointy 1 short"), { features: ["horns"] }).label === "Glim" && M.knn(D.E.train, M.parse("blue round 2 pointy 1 short")).label === "Norp");
// rank: exported, deterministic, the same order knn uses.
const r1 = M.rank(T, target), r2 = M.rank(T, target);
ok("rank is deterministic and knn's neighbors are its first K", same(r1.map((r) => r.ex.id), r2.map((r) => r.ex.id)) && same(M.knn(T, target).neighbors.map((n) => n.ex.id), r1.slice(0, 3).map((r) => r.ex.id)));
ok("K = 1, 3, 5 use 1, 3, 5 neighbors when there are enough", [1, 3, 5].every((k) => M.knn(D.G.pool, D.G.test[0].traits, { K: k }).used === k));
// byCombo, confusion, trainAccuracy, contradictions.
const eE = M.evaluate(D.E.train, D.E.test);
const combo = eE.byCombo(["color", "horns"]);
ok("byCombo counts every test creature once", Object.values(combo).reduce((s, g) => s + g.n, 0) === D.E.test.length);
ok("byCombo finds the failing group (blue + pointy: 0 right)", combo["blue|pointy"] && combo["blue|pointy"].correct === 0 && combo["blue|pointy"].n === 3, JSON.stringify(combo["blue|pointy"]));
const cm = M.confusion(eE);
ok("the confusion counts add up to the test set, and match the right answers", cm.GG + cm.GN + cm.NG + cm.NN === eE.total && cm.GG + cm.NN === eE.items.filter((i) => i.correct).length, JSON.stringify(cm));
ok("training accuracy is measured on the training examples themselves", M.trainAccuracy(D.CD.base) === D.CD.base.filter((e) => M.knn(D.CD.base, e.traits).label === e.label).length / D.CD.base.length);
ok("contradictions: same traits, different labels", M.contradictions([ex("c1", "blue round 1 none 0 short", "Glim"), ex("c2", "blue round 1 none 0 short", "Norp"), ex("c3", "green round 1 none 0 short", "Glim")]).length === 1 && M.contradictions(D.G.pool).length === 0);
// Inside the Machine: the steps are the model.
const ivS = X.steps(D.CD.base, D.CD.test[0].traits, { K: 3 });
ok("Inside the Machine's steps are knn's result", same(ivS.p.neighbors.map((n) => n.ex.id), M.knn(D.CD.base, D.CD.test[0].traits).neighbors.map((n) => n.ex.id)) && ivS.ranked.length === D.CD.base.length);
const html4 = X.insideHtml({ train: D.CD.base, x: D.CD.test[0], truth: D.CD.test[0].label, K: 3, step: 4 });
ok("step 4 states the model's real agreement, not as a probability", html4.includes(`Model agreement: ${Math.round(ivS.p.agree * 100)}%`) && html4.includes("isn't the chance"));
const v = { step: 1, reached: 1, truth: "Glim" };
["next", "next", "next", "next"].forEach((d) => X.act(v, "iv-step", d));
X.act(v, "iv-reveal"); const doneEarly = v.done;
X.act(v, "iv-guess", "right"); X.act(v, "iv-reveal");
ok("the walkthrough is done only after a prediction and the reveal", v.step === 5 && !doneEarly && v.done === true);
// Change One Thing.
const cfx = X.counterfactual(D.A.start, D.A.next.traits, "horns", "none", { K: 3 });
ok("Change One Thing compares before and after with the real model", cfx.before.label === M.knn(D.A.start, D.A.next.traits).label && cfx.after.label === M.knn(D.A.start, Object.assign({}, D.A.next.traits, { horns: "none" })).label && cfx.changed === (cfx.before.label !== cfx.after.label));
ok("Change One Thing changes exactly one trait", M.distance(cfx.traits, D.A.next.traits) === 1);
ok("neighbors in and out are the real differences", same(cfx.neighborsIn, cfx.after.neighbors.map((n) => n.ex.id).filter((id) => !cfx.before.neighbors.some((n) => n.ex.id === id))));
// The Field Guide's demos show what they say.
const f = KN.demoFacts();
ok("Field Guide B: with only Glims, the answer is Glim", f.onlyGlims.label === "Glim" && Object.keys(f.onlyGlims.votes).join() === "Glim");
ok("Field Guide E: training accuracy is higher than test accuracy for the stage 4 baseline", f.trainAcc > f.testAcc, [f.trainAcc, f.testAcc]);
ok("Field Guide F: there is a blue Glim the biased model gets wrong", !!f.bias && f.bias.truth === "Glim" && f.bias.label === "Norp");
ok("Field Guide G: a purple creature is wrong with 5 of 5 agreeing", !!f.trap && f.trap.agree === 1 && !f.trap.correct && f.trap.ex.traits.color === "purple");
ok("Field Guide: 8 cards, each with every part", KN.CARDS.length === 8 && KN.CARDS.every((c) => c.def && c.analogy && c.demo && c.q && c.q[1].some((o) => o[0] === c.q[2]) && c.miscon && c.world && c.deeper));
ok("Field Guide A: the sort has rule-based and learned examples", KN.SORT.some((s) => s[2] === "rule") && KN.SORT.some((s) => s[2] === "learned"));
const svg2 = M.creature(M.parse("blue round 2 pointy 1 short"));
ok("the creature art groups each trait for highlighting", ["horns", "eyes", "tail", "antennae", "shape color"].every((t) => svg2.includes(`data-trait="${t}"`)));

const failed = R.filter((x) => !x).length;
console.log(`\n${R.length - failed}/${R.length} passed`);
process.exit(failed ? 1 : 0);
