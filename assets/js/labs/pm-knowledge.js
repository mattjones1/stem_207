/*
 * Pattern Machine Lab: the AI Field Guide and its concept cards (SE.pmKnow).
 *
 * Eight cards, A–H: what AI is, training data, patterns, prediction, testing, bias, confidence, and human
 * judgment. Each card has a plain definition, an analogy, a small interactive demo that runs the real model
 * (SE.mlKit) on the lab's own datasets (SE.pmData), a prediction question, a misconception, a real-world
 * link, and an optional "go deeper". Nothing is generated or sent anywhere.
 *
 * Cards unlock as the student reaches the stage that uses them (CARD.stage, 0-based). Stages show a
 * context button (contextButton(id)) that opens the guide at that card.
 *   mount(panel, S, save, { stage, mode, log })  → { open(id), render() }
 * Pure, for tests: CARDS, demoFacts() (the real numbers each demo shows).
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;
  const M = SE.mlKit, D = SE.pmData;
  const { tag, b, chips, pct, paint, delegate } = SE.pmUI;

  /* The real numbers behind the demos (computed once, from the model). */
  function demoFacts() {
    const onlyGlims = D.A.start.filter((e) => e.label === "Glim");
    const bias = M.evaluate(D.E.train, D.E.test).items.find((i) => D.E.counter(i.ex) && !i.correct && i.ex.traits.color === "blue");
    const trap = M.evaluate(D.F.train, D.F.test, { K: D.F.K }).items.find((i) => i.agree === 1 && !i.correct);
    return {
      all: M.knn(D.A.start, D.A.next.traits), onlyGlims: M.knn(onlyGlims, D.A.next.traits),
      k1: M.knn(D.A.start, D.A.next.traits, { K: 1 }), k3: M.knn(D.A.start, D.A.next.traits, { K: 3 }),
      trainAcc: M.trainAccuracy(D.CD.base), testAcc: M.evaluate(D.CD.base, D.CD.test).overall,
      bias, trap
    };
  }
  let FACTS = null;
  const facts = () => (FACTS = FACTS || demoFacts());

  const MAP = {
    ai: ["Artificial intelligence (AI)", "Computer systems built to do tasks that usually take human thinking, like recognizing patterns, making predictions, or working with language.", "A phone that turns your speech into text.", "The biggest circle. Machine learning is one way to build AI; there are others."],
    ml: ["Machine learning", "A kind of AI that finds patterns in examples instead of following rules a person wrote out.", "A music app that suggests songs from what you've played.", "Inside AI. The Pattern Machine learns from labeled examples, so it's machine learning."],
    cls: ["Classification", "A machine-learning job: put something new into a group, using labeled examples.", "Sorting email into Inbox or Spam.", "Inside machine learning. The Pattern Machine classifies creatures as Glims or Norps."]
  };
  const SORT = [["thermostat", "A heater that turns on whenever the room is below 65°F", "rule"], ["spam", "An email filter that learned from emails people marked as spam", "learned"], ["pm", "The Pattern Machine, which compares new creatures with labeled examples", "learned"]];

  /* Each card: stage it unlocks at, title, def, analogy, demo(st) → html, q: [prompt, options, answer, why], miscon, world, deeper. */
  const CARDS = [
    { id: "A", stage: 0, title: "What is AI?",
      def: "AI means computer systems built to do tasks that usually take human thinking, like recognizing patterns or making predictions.",
      analogy: "AI is a big toolbox. Machine learning is one tool in it, and classification is one job that tool can do.",
      demo: (st) => `<div class="pm-map" role="group" aria-label="AI concept map">${["ai", "ml", "cls"].map((k) => b("fg-map", k, esc(MAP[k][0]), `pm-map__n pm-map__n--${k}`, `aria-pressed="${st.map === k}"`)).join("")}</div>
        ${st.map ? `<div class="pm-map__card"><p><strong>${esc(MAP[st.map][0])}.</strong> ${esc(MAP[st.map][1])}</p><p><strong>Everyday example:</strong> ${esc(MAP[st.map][2])}</p><p><strong>And the Pattern Machine?</strong> ${esc(MAP[st.map][3])}</p></div>` : `<p class="muted pm-small">Tap a circle.</p>`}
        <p><strong>Rule-based or learned?</strong> A rule-based program follows steps a person wrote. A learned one finds its pattern in examples.</p>
        <ul class="pm-sort">${SORT.map(([id, text, ans]) => { const v = (st.sort || {})[id]; return `<li><span>${esc(text)}</span>${chips("fg-sort", [[`${id}|rule`, "Rule-based"], [`${id}|learned`, "Learned"]], v ? `${id}|${v}` : "")}${v ? `<span class="pm-small ${v === ans ? "pm-ok" : "pm-no"}">${v === ans ? "Yes." : "Look again."}</span>` : ""}</li>`; }).join("")}</ul>`,
      q: ["Do all AI systems work like the Pattern Machine?", [["yes", "Yes, they all compare with examples"], ["no", "No, AI is built in many different ways"]], "no", "The Pattern Machine is one simple kind. Chatbots and image tools work in very different ways."],
      miscon: "“AI thinks like a person.” It doesn't. This one counts differences between traits.",
      world: "Spam filters, map apps that predict traffic, and tools that turn speech into text all use AI.",
      deeper: "AI is a broad field. Machine learning is the part where a system improves from data. Some machine-learning systems use examples directly, like this one (k-nearest neighbors); others adjust millions of numbers inside a model. Rule-based programs are still common and useful." },
    { id: "B", stage: 1, title: "What is training data?",
      def: "Training data is the set of labeled examples a model learns from. Each example has features (its traits) and a label (Glim or Norp).",
      analogy: "Like flashcards: the picture is the features, and the answer on the back is the label.",
      demo: (st) => { const f = facts(); return `<p>The machine learns from the 4 labeled creatures in stage 1, then predicts a new one.</p>
        <div class="pm-row">${D.A.start.map((e) => `<span class="pm-mini pm-mini--static">${M.creature(e.traits, 40, " ")}${tag(e.label)}</span>`).join("")}<span class="pm-arrow" aria-hidden="true">→</span><span class="pm-mini pm-mini--static">${M.creature(D.A.next.traits, 40)}<span class="pm-tag">?</span></span></div>
        ${chips("fg-train", [["all", "Train on all 4"], ["glims", "Train on only the Glims"]], st.train || "")}
        ${st.train ? `<p class="pm-result">${icon("ai")}Prediction: ${tag((st.train === "all" ? f.all : f.onlyGlims).label)}. ${st.train === "glims" ? "With only Glims to compare with, every answer has to be Glim." : "With both kinds, it can compare with each."}</p>` : ""}`; },
      q: ["If every training example were a Glim, what would the machine say about a new creature?", [["glim", "Glim, every time"], ["norp", "Norp"], ["either", "It could be either"]], "glim", "It can only vote with the labels it has. No Norps in the examples means no Norp answers."],
      miscon: "“More data always fixes it.” The kinds of examples matter as much as how many.",
      world: "A wildlife camera that learned only from daytime photos may struggle at night.",
      deeper: "Features are what the model can measure; labels are the answers people gave. A test example is labeled too, but it's kept apart so it can check the model fairly." },
    { id: "C", stage: 0, title: "What is a pattern?",
      def: "A pattern is something examples have in common. A machine can find one without understanding what the examples mean.",
      analogy: "Like noticing every bus on your street is yellow, until a blue one drives by.",
      demo: (st) => { const r = D.B_RULES[0], shown = D.B.start.concat(st.more ? [D.B.breakers[0]] : []), fits = shown.every((e) => r[2](e.traits) === (e.label === "Glim")); return `<p>Rule to test: <strong>${esc(r[1])}</strong></p>
        <div class="pm-row">${shown.map((e) => `<span class="pm-mini pm-mini--static">${M.creature(e.traits, 40)}${tag(e.label)}</span>`).join("")}</div>
        <p class="pm-result ${fits ? "is-good" : "is-warn"}">${icon(fits ? "check" : "alert")}It fits ${shown.filter((e) => r[2](e.traits) === (e.label === "Glim")).length} of ${shown.length} examples.</p>
        ${st.more ? "" : b("fg-more", "x", `${icon("plus")}Show one more example`)}`; },
      q: ["A rule fits the first four examples. Is it true?", [["yes", "Yes, it fits"], ["maybe", "Maybe. More examples could break it"]], "maybe", "A few examples can fit more than one rule. New examples test it."],
      miscon: "“If it fits the examples, it's the real rule.” It might just fit by chance.",
      world: "Scientists keep testing a pattern on new cases before they trust it.",
      deeper: "A pattern that works only on the examples you saw is said to overfit. Generalizing means it also works on new examples." },
    { id: "D", stage: 2, title: "How does it predict?",
      def: "This model finds the training examples closest to a new creature (the fewest different traits) and lets them vote.",
      analogy: "Like guessing a new kid's favorite sport by asking the three kids most like them.",
      demo: (st) => { const f = facts(), p = st.k === "1" ? f.k1 : f.k3; return `<div class="pm-row">${M.creature(D.A.next.traits, 56)}<span>${chips("fg-k", [["1", "Ask 1 neighbor"], ["3", "Ask 3 neighbors"]], st.k || "3")}</span></div>
        <p class="pm-result">${icon("ai")}Prediction ${tag(p.label)} with ${pct(p.agree)} agreement. Its ${p.used === 1 ? "neighbor" : "neighbors"}: ${p.neighbors.map((n) => `${tag(n.ex.label)} (distance ${n.distance})`).join(", ")}.</p>`; },
      q: ["Does training this machine mean it writes a rule?", [["rule", "Yes, it writes a rule"], ["store", "No, it stores the examples and compares with them"]], "store", "Training this kind of model means storing labeled examples. Inside the Machine shows the comparing."],
      miscon: "“The machine knows why.” It only knows which examples were closest.",
      world: "Some shopping sites suggest products by finding shoppers with similar tastes.",
      deeper: "This is k-nearest neighbors (KNN). K is how many neighbors vote. Distance here is the number of traits that differ, and every trait counts the same. Other models learn weights instead of storing examples." },
    { id: "E", stage: 3, title: "What is a test set?",
      def: "A test set is labeled examples the model never trains on. It shows how well the model works on new cases.",
      analogy: "Practice problems you've already seen don't show you're ready. A new quiz does.",
      demo: (st) => { const f = facts(); return `<p>The stage 4 starting model (4 training examples):</p>
        ${b("fg-test", "x", `${icon("flask")}Score it two ways`, "btn btn--ghost btn--small", st.test ? "disabled" : "")}
        ${st.test ? `<div class="pm-pair"><p>On its own training examples<strong>${pct(f.trainAcc)}</strong></p><p>On ${D.CD.test.length} new test creatures<strong>${pct(f.testAcc)}</strong></p></div>` : ""}`; },
      q: ["Which number tells you how it will do on new creatures?", [["train", "The score on its training examples"], ["test", "The score on the test set"]], "test", "It has already seen its training examples. Only new examples show how it generalizes."],
      miscon: "“A high score on practice means it's good.” Only new examples show that.",
      world: "Apps are tested on new photos, voices, or messages before they're released.",
      deeper: "Mixing test examples into training is called leakage. This lab refuses it: a test creature can't also be a training example." },
    { id: "F", stage: 4, title: "What is bias in data?",
      def: "When training examples are lopsided, a model can learn a shortcut that works for most cases and fails one group again and again.",
      analogy: "If every red apple you've seen was sweet, you might guess every red fruit is sweet.",
      demo: (st) => { const x = facts().bias; return x ? `<p>In the stage 5 training data, every Glim is orange and every Norp is blue. This test creature is a blue Glim (pointy horns).</p>
        <div class="pm-row">${M.creature(x.ex.traits, 56)}<span>${chips("fg-bias", [["Glim", "I think it'll say Glim"], ["Norp", "I think it'll say Norp"]], st.bias || "")}</span></div>
        ${st.bias ? `<p class="pm-result is-warn">${icon("alert")}It said ${tag(x.label)}. Really ${tag(x.truth)}. Its neighbors were mostly blue creatures, and in the training data blue meant Norp.</p>` : ""}` : ""; },
      q: ["Equal numbers of Glims and Norps. Is the data fair?", [["yes", "Yes, it's balanced"], ["notnec", "Not necessarily. Some kinds could still be missing"]], "notnec", "Balance in labels can hide missing combinations, like blue Glims."],
      miscon: "“Balanced labels means no bias.” What's missing matters too.",
      world: "A sorting machine trained mostly on one kind of berry can misjudge another.",
      deeper: "Checking accuracy group by group can reveal a problem the overall score hides. Real fairness for people is much more complicated than made-up creatures." },
    { id: "G", stage: 5, title: "Can it be confident and wrong?",
      def: "Model agreement is how many neighbors voted the same way. It isn't the chance of being right.",
      analogy: "Five friends who've never seen a kiwi might all agree it's a potato.",
      demo: (st) => { const x = facts().trap; return x ? `<p>Five out of five neighbors agree about this creature.</p>
        <div class="pm-row">${M.creature(x.ex.traits, 56)}<span>${chips("fg-trap", [["trust", "I'd trust it"], ["check", "I'd still check"]], st.trap || "")}</span></div>
        ${st.trap ? `<p class="pm-result is-warn">${icon("alert")}It said ${tag(x.label)} with ${pct(x.agree)} agreement. Really ${tag(x.truth)}. No purple creatures were in its training data, so all five neighbors were a different kind.</p>` : ""}` : ""; },
      q: ["The model says 100% agreement. What does that mean?", [["right", "It's definitely right"], ["agree", "All the neighbors voted the same way"]], "agree", "Agreement among imperfect examples isn't proof."],
      miscon: "“100% means certain.” It means the neighbors agreed.",
      world: "Navigation apps can be confident about a road that just closed.",
      deeper: "With K neighbors and two labels, only a few agreement values are possible: for K = 5, 60%, 80%, or 100%. A threshold sends low-agreement answers to a person, but it can't catch confident mistakes on new kinds of cases." },
    { id: "H", stage: 6, title: "When should people decide?",
      def: "AI outputs can be wrong. The bigger the consequences of a mistake, the more a person should check, or decide instead.",
      analogy: "A spell checker can suggest. You decide what your essay says.",
      demo: (st) => `<p>Who should check the answer?</p>
        ${[["game", "A game that guesses your favorite color"], ["med", "A tool that flags X-rays for a doctor"]].map(([id, t]) => `<div class="pm-scen"><p><strong>${esc(t)}</strong></p>${chips("fg-who", [[`${id}|none`, "No one needs to"], [`${id}|person`, "A person reviews"], [`${id}|decide`, "A person decides"]], (st.who || {})[id] ? `${id}|${st.who[id]}` : "")}</div>`).join("")}
        ${st.who && st.who.game && st.who.med ? `<p class="pm-result">${icon("users")}${st.who.med === "none" ? "A missed X-ray finding could hurt a patient. Most people say a doctor must check." : "A mistake in a game costs little; a mistake about health can hurt someone. That's why the answers differ."}</p>` : ""}`,
      q: ["Who is responsible when an AI makes a mistake?", [["ai", "The AI"], ["people", "The people who build and use it"]], "people", "People choose the data, set the thresholds, and decide how it's used."],
      miscon: "“If a computer said it, it must be right.”",
      world: "Doctors, judges, and teachers can use AI tools, but the decision stays with people.",
      deeper: "Some uses need a person to review every important answer; some shouldn't use AI to decide at all. The Human Decision Room is where you practice that judgment." }
  ];
  const byId = (id) => CARDS.find((c) => c.id === id);

  const contextButton = (id) => { const c = byId(id); return c ? `<button type="button" class="pm-fgq" data-fg="${id}" data-k="fg-open:${id}">${icon("question")}${esc(c.title)}</button>` : ""; };

  function mount(panel, S, save, o = {}) {
    S.fg = Object.assign({ open: null, seen: [], q: {}, demo: {} }, S.fg || {});
    const fg = S.fg;
    const unlocked = (c) => c.stage <= (o.stage || 0) || fg.seen.includes(c.id);
    const draw = () => paint(panel, html());
    function html() {
      const c = fg.open && byId(fg.open);
      const st = c ? (fg.demo[c.id] = fg.demo[c.id] || {}) : null;
      const qa = c && fg.q[c.id];
      return `<div class="pm-fg__head"><h3>${icon("bulb")}AI Field Guide</h3><p class="muted pm-small">Ideas you can revisit. New cards unlock as you go.</p></div>
        <div class="pm-fg__list" role="group" aria-label="Cards">${CARDS.map((x) => unlocked(x) ? b("fg-card", x.id, `${esc(x.id)}. ${esc(x.title)}`, "pm-chip", `aria-pressed="${fg.open === x.id}"`) : `<span class="pm-chip pm-chip--locked">${icon("lock")}${esc(x.id)}. Locked</span>`).join("")}</div>
        ${c ? `<article class="pm-fg__card" aria-labelledby="pm-fg-h">
          <h4 id="pm-fg-h">${esc(c.id)}. ${esc(c.title)}</h4>
          <p class="pm-fg__def">${esc(c.def)}</p>
          <p><strong>Think of it like this:</strong> ${esc(c.analogy)}</p>
          <div class="pm-fg__demo"><p class="pm-fg__k">${icon("flask")}Try it</p>${c.demo(st)}</div>
          <div class="pm-fg__q"><p class="pm-fg__k">${icon("target")}Predict</p><p>${esc(c.q[0])}</p>${chips("fg-q", c.q[1].map(([id, t]) => [`${c.id}|${id}`, t]), qa ? `${c.id}|${qa}` : "")}
            ${qa ? `<p class="pm-result ${qa === c.q[2] ? "is-good" : "is-warn"}">${icon(qa === c.q[2] ? "check" : "alert")}${qa === c.q[2] ? "Yes. " : "Not quite. "}${esc(c.q[3])}</p>` : ""}</div>
          <p><strong>Common mix-up:</strong> ${esc(c.miscon)}</p>
          <p><strong>In the real world:</strong> ${esc(c.world)}</p>
          <details class="pm-numbers" data-k="fg-deep:${c.id}"><summary>Go deeper</summary><p>${esc(c.deeper)}</p></details>
        </article>` : `<p>Pick a card.</p>`}`;
    }
    const demoOf = () => (fg.demo[fg.open] = fg.demo[fg.open] || {});
    delegate(panel, {
      "fg-card": (id) => { fg.open = id; save(); draw(); },
      "fg-q": (v) => { const [id, a] = v.split("|"); fg.q[id] = a; save(); draw(); if (o.log) o.log("lab_test_run", { card: id }); },
      "fg-map": (k) => { demoOf().map = k; save(); draw(); },
      "fg-sort": (v) => { const [id, a] = v.split("|"); const d = demoOf(); d.sort = Object.assign(d.sort || {}, { [id]: a }); save(); draw(); },
      "fg-train": (k) => { demoOf().train = k; save(); draw(); },
      "fg-more": () => { demoOf().more = true; save(); draw(); },
      "fg-k": (k) => { demoOf().k = k; save(); draw(); },
      "fg-test": () => { demoOf().test = true; save(); draw(); },
      "fg-bias": (k) => { demoOf().bias = k; save(); draw(); },
      "fg-trap": (k) => { demoOf().trap = k; save(); draw(); },
      "fg-who": (v) => { const [id, a] = v.split("|"); const d = demoOf(); d.who = Object.assign(d.who || {}, { [id]: a }); save(); draw(); }
    });
    return {
      render: draw,
      open(id) { if (!byId(id)) return; if (!fg.seen.includes(id)) fg.seen.push(id); fg.open = id; save(); draw(); }
    };
  }

  SE.pmKnow = { CARDS, MAP, SORT, demoFacts, contextButton, mount };
})();
