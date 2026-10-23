/*
 * STEM 207 — Learning Plan templates.
 *
 * A template is a ready-made Learning Plan an educator copies ("Use this template") and adapts. Copies are
 * the educator's own; editing one never changes the template, an activity, or anyone else's plan.
 *
 * Step: { id, kind: "mission", activityId, required, note }
 *   note   what students see next to the activity (optional). Each activity's own reflection is the
 *          deliverable, checked with Pass / Try again, so steps carry no separate evidence or synthesis.
 * group: "course" marks a multi-session course (Moxie); "workshop" marks a packaged STEM 207 workshop. Both can carry workshop: { format, sessions: [{ title, steps: [step numbers] }] };
 * future: [text] names content that isn't ready yet (shown as text, never as a step).
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
    // ───── Moxie: the 16-session ESP32 course (pilot). Each step is one session sheet; the units are the sessions groups.
    ids({
      id: "tpl-moxie", group: "course", reviewed: false,
      title: "Moxie: ESP32 Physical Computing",
      essentialQuestion: "What could we build that helps someone?",
      goal: "Start with a blinking light and finish with a working device, built with a partner, that solves a real problem for someone.",
      audience: { grades: [], minutes: null, equipment: [], prior: "No experience needed. Students work in partner teams the teacher sets on the Moxie teacher page." },
      workshop: { format: "16 sessions in 4 units (session length set by the pilot)", sessions: [
        { title: "Unit 1: Outputs", steps: [1, 2, 3, 4] }, { title: "Unit 2: Inputs & Decisions", steps: [5, 6, 7, 8] },
        { title: "Unit 3: Displays, Time, Sensors & Motion", steps: [9, 10, 11, 12] }, { title: "Unit 4: Capstone", steps: [13, 14, 15, 16] }] },
      steps: Array.from({ length: 16 }, (_, i) => m(`moxie-${String(i + 1).padStart(2, "0")}`, { label: `Session ${i + 1}` }))
    }),
    // ───── STEM 207 workshops: packaged plans for a workshop day or series (proposed, not yet reviewed).
    // workshop.sessions group the steps; future names content that isn't ready yet (text only, never a step).
    ids({
      id: "tpl-ws-sampler", group: "workshop", reviewed: false,
      title: "Maine Tech Sampler",
      essentialQuestion: "What can you make with code, AI, virtual reality, and engineering?",
      goal: "Try a different kind of STEM in each activity, one from every category, and say which you'd explore next.",
      audience: { grades: ["4-5"], minutes: null, equipment: [], prior: "No experience needed." },
      workshop: { format: "Half day, about 3 hours with breaks", sessions: [
        { title: "Code and AI", steps: [1, 3] }, { title: "Explore and build", steps: [2, 4] }, { title: "Create", steps: [5, 6] }, { title: "Add-on: 3D printing (90 min)", steps: [7] }] },
      steps: [
        m("lab-dance-party", { label: "Coding", bridge: "Warm up: program a robot dance." }),
        m("acadia-from-above", { label: "Virtual reality", bridge: "Look closely before you guess." }),
        m("how-ai-sorts", { label: "AI", bridge: "Teach a computer to sort, then catch its mistakes." }),
        m("paper-bridge", { label: "Engineering", bridge: "Test, change one thing, test again." }),
        m("pixel-art-code", { label: "Creative", bridge: "Code a picture with pixels." }),
        m("sink-or-float", { label: "Science", required: false, bridge: "If there's time: predict, test, explain." }),
        m("3d-buoy-charm", { label: "3D Printing", required: false, bridge: "Add-on with a 3D printer: design a buoy charm to take home." })
      ]
    }),
    ids({
      id: "tpl-ws-robots", group: "workshop", reviewed: false,
      title: "Robots & Smart Machines",
      essentialQuestion: "How do machines follow rules, and when do they learn instead?",
      goal: "Write precise instructions, program sensors and decisions, and explain when a person should check a machine.",
      audience: { grades: ["4-5", "6-8"], minutes: null, equipment: [], prior: "No coding experience needed." },
      workshop: { format: "Two sessions of about 90 minutes", sessions: [
        { title: "Machines that follow rules", steps: [1, 2, 3] }, { title: "Machines that decide and learn", steps: [4, 5, 6] }] },
      future: ["Next step: the Moxie course (in pilot), where partners build a working ESP32 device that helps someone."],
      steps: [
        m("lab-robot-chef", { label: "Session 1", bridge: "Robots do exactly what you say. Find the bugs." }),
        m("sense-think-act", { label: "Session 1", bridge: "Be the robot: sense, think, act." }),
        m("lab-line-follower", { label: "Session 1", bridge: "Give a snowplow robot rules for its two sensors." }),
        m("lab-moon-gate", { label: "Session 2", bridge: "If this, then that: test every case." }),
        m("lab-pattern-machine", { label: "Session 2", bridge: "Now the machine learns from examples instead of rules." }),
        m("ai-limits-detectives", { label: "Session 2", required: false, bridge: "Grades 6–8: when is the computer wrong?" })
      ]
    }),
    ids({
      id: "tpl-ws-katahdin", group: "workshop", reviewed: false,
      title: "Coast to Katahdin Explorers",
      essentialQuestion: "What can we notice, test, and build about Maine, from the coast to the mountains?",
      goal: "Observe Maine places, code a lobster boat, sort with a machine, and build a working lighthouse beam.",
      audience: { grades: ["2-3", "4-5"], minutes: null, equipment: [], prior: "No experience needed." },
      workshop: { format: "Four sessions of about 45 minutes", sessions: [
        { title: "Observe", steps: [1] }, { title: "Code", steps: [2] }, { title: "Sort and test", steps: [3, 4] }, { title: "Build", steps: [5, 6] }, { title: "Add-on: 3D printing (90 min)", steps: [7] }] },
      steps: [
        m("lab-field-station", { label: "Session 1", bridge: "Tide pools and the North Woods. What do you notice?" }),
        m("lab-rover", { label: "Session 2", bridge: "Steer a lobster boat with code. Do the first voyage." }),
        m("blueberry-sorter", { label: "Session 3", bridge: "Help a machine sort wild blueberries." }),
        m("melting-race", { label: "Session 3", bridge: "Predict which ice melts first, then test it." }),
        m("lighthouse-beam", { label: "Session 4", bridge: "Build a beam that reaches the far shore." }),
        m("animate-your-name", { label: "Session 4", required: false, bridge: "If there's time: make your initials move." }),
        m("3d-trail-marker", { label: "3D Printing", required: false, bridge: "Add-on for grades 4–5 with a 3D printer: design a trail marker." })
      ]
    }),
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
