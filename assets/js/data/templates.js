/*
 * STEM 207 — Learning Plan templates.
 *
 * A template is a ready-made Learning Plan an educator copies ("Use this template") and adapts. Copies are
 * the educator's own; editing one never changes the template, an activity, or anyone else's plan.
 *
 * Step: { id, kind: "mission", activityId, required, note }
 *   note   what students see next to the activity (optional). Each activity's own reflection is the
 *          deliverable, checked with Pass / Try again, so steps carry no separate evidence or synthesis.
 * reviewed: true once an educator approved the wording (October 21, 2026). Maine Coast Explorers' notes
 * come from the brief's table; Coding Foundations is built from STEM.pathway; the AI route isn't reviewed.
 */
window.STEM = window.STEM || {};
(function () {
  const STEM = window.STEM;
  // One activity step. label/bridge/evidence are folded into the student note ("Observe. … Show: …").
  const m = (activityId, extra = {}) => {
    const note = [extra.label && !/^(Stage|Step) /.test(extra.label) ? `${extra.label}.` : null, extra.bridge, extra.evidence ? `Show: ${extra.evidence}` : null].filter(Boolean).join(" ");
    return { kind: "mission", activityId, required: extra.required !== false, note: note || null };
  };
  const syn = () => null;   // final-reflection steps are retired: each activity's reflection is the deliverable
  const ids = (t) => { t.steps = t.steps.filter(Boolean); t.steps.forEach((s, i) => { s.id = `${t.id}-s${i + 1}`; }); return t; };

  STEM.pathwayTemplates = [
    ids({
      id: "tpl-maine-coast", reviewed: true,
      title: "Maine Coast Explorers",
      essentialQuestion: "How does a working coast function, and how can we explain it?",
      goal: "Understand and explain a working coast.",
      finalProduct: "A small coastal exhibit: a field log, a tide graph, reflector prototype and test notes, an animated lighthouse signal, and an explanation connecting evidence to design choices.",
      audience: { grades: ["6-8"], minutes: null, equipment: [], prior: "Basic Scratch event experience." },
      steps: [
        m("lab-field-station", { label: "Observe", evidence: "A field log that separates observations from inferences, and questions about coastal conditions." }),
        m("tide-watchers", { label: "Investigate", evidence: "A tide graph and an explanation of why conditions differ across locations." }),
        m("lighthouse-beam", { label: "Engineer", evidence: "A prototype image or a teacher observation, plus before-and-after test notes." }),
        m("event-party", { label: "Readiness", required: false, bridge: "For students without Scratch event experience, before the Program step. Its time isn't in the pathway total." }),
        m("lighthouse-network", { label: "Program", evidence: "A Scratch project and an explanation of how events and messages coordinate it." }),
        m("maine-postcard", { label: "Communicate", bridge: "Reuse the lighthouse scene as the postcard base where practical.", evidence: "Explain one accurate observation and one creative choice." }),
        syn("Explain how observation, data, physical design, and code contributed to the exhibit.", [20, 30])
      ]
    }),
    ids({
      id: "tpl-machine-decisions", reviewed: true,
      title: "How Machines Make Decisions",
      essentialQuestion: "When should a computer's decision be checked by a person?",
      goal: "Distinguish explicit rules from learned patterns, and explain when human review matters.",
      finalProduct: "A story in which a character checks a computer's recommendation.",
      audience: { grades: ["6-8"], minutes: null, equipment: [], prior: "" },
      steps: [
        m("lab-moon-gate"),
        m("lab-pattern-machine"),
        m("ai-limits-detectives"),
        m("interactive-story"),
        syn("Create a story in which a character checks a computer's recommendation.", null)
      ]
    }),
    ids({
      id: "tpl-instructions-invention", reviewed: true,
      title: "From Instructions to Invention",
      essentialQuestion: "How do we make instructions another person can follow?",
      goal: "Communicate precise instructions, test them with another person, and improve an ambiguous step.",
      finalProduct: "Revised instruction cards and a peer-decoded picture.",
      audience: { grades: ["2-3", "4-5"], minutes: null, equipment: [], prior: "No coding experience or headset needed." },
      steps: [
        m("fix-the-recipe"),
        m("sense-think-act"),
        m("pixel-art-code"),
        syn("Share your revised instruction cards, and have a partner decode your picture.", null)
      ]
    }),
    // Built from the AI learning route (STEM.aiRoute): one step per activity, each step's idea as its bridge.
    // Not yet reviewed by an educator, so it shows "Proposed: review before teaching".
    ids({
      id: "tpl-ai-route", reviewed: false,
      title: "AI Learning Route",
      essentialQuestion: "How do computers learn from examples, and when should a person check their answers?",
      goal: "Six steps, from spotting patterns to deciding when AI should be trusted.",
      finalProduct: STEM.aiRoute[STEM.aiRoute.length - 1].idea,
      audience: { grades: [], minutes: null, equipment: [], prior: "" },
      steps: (() => {
        const seen = new Set();
        return STEM.aiRoute.flatMap((st) => st.activities.filter((id) => !seen.has(id) && seen.add(id)).map((id) => m(id, { label: `Step ${st.step}`, bridge: st.idea })));
      })()
    }),
    // Built from the seven-stage coding pathway: each stage's first mission is required, the others optional practice.
    ids({
      id: "tpl-coding-foundations", reviewed: true,
      title: "Coding Foundations",
      essentialQuestion: "How do we go from clear instructions to a project of our own?",
      goal: "Seven readiness-based stages, from first instructions to independent projects.",
      finalProduct: STEM.pathway[STEM.pathway.length - 1].project,
      audience: { grades: [], minutes: null, equipment: [], prior: "" },
      steps: STEM.pathway.flatMap((st) => st.activities.map((id, i) => m(id, {
        label: `Stage ${st.stage}`, required: i === 0,
        bridge: i === 0 ? `${st.title}. ${st.iCan}` : `More practice for stage ${st.stage}.`
      })))
    })
  ];
})();
