/*
 * STEM 207 — curated pathway templates (categories-pathways Phase 3).
 *
 * A template is a ready-made pathway an educator copies ("Use this template") and adapts. Copies are
 * the educator's own; editing one never changes the template, a mission, or anyone else's pathway.
 *
 * Step: { id, kind: "mission" | "synthesis", activityId, required, label, bridge, evidence, prompt, minutes }
 *   evidence  what to collect for this step. null means the mission's own "Show what you know" check.
 *   prompt    a synthesis step's task (educator-authored; not a library mission).
 *   minutes   [min, max] for a synthesis step (mission steps use the mission's own time).
 * reviewed: true once an educator approved the prompts (approved October 21, 2026). Wording for
 * Maine Coast Explorers comes from the brief's table; the other templates use each mission's own
 * check, plus the brief's goal and final product. Coding Foundations is built from STEM.pathway.
 */
window.STEM = window.STEM || {};
(function () {
  const STEM = window.STEM;
  const m = (activityId, extra = {}) => Object.assign({ kind: "mission", activityId, required: true, label: null, bridge: null, evidence: null }, extra);
  const syn = (prompt, minutes, extra = {}) => Object.assign({ kind: "synthesis", required: true, label: "Synthesize", bridge: null, prompt, minutes }, extra);
  const ids = (t) => { t.steps.forEach((s, i) => { s.id = `${t.id}-s${i + 1}`; }); return t; };

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
        m("lab-pattern-machine", { bridge: "A full lab: choose the levels to use and set your own time estimate." }),
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
