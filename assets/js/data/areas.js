/*
 * STEM 207 — exploration areas and shared vocabularies.
 *
 * Everything the filters and badges display is defined here, so adding a new
 * piece of equipment or a new area only means editing this file.
 */
window.STEM = window.STEM || {};

window.STEM.areas = [
  {
    id: "coding",
    name: "Coding & Computer Science",
    short: "Coding",
    icon: "code",
    tagline: "Give clear instructions and build things that respond.",
    description:
      "Algorithms, sequences, loops, conditionals, variables, debugging, and creative programming. Steer a lobster boat around the harbor in the Harbor Code Lab, sort the day's catch with if–else rules, and try more coding activities when you're ready.",
    topics: ["Algorithms", "Sequences", "Loops", "Conditionals", "Variables", "Debugging", "Creative programming"]
  },
  {
    id: "vr",
    name: "Virtual Reality",
    short: "Virtual Reality",
    icon: "vr",
    tagline: "Travel anywhere, starting with Maine, and look closely.",
    description:
      "Guided virtual field trips, immersive exploration, and observation challenges. Explore a Gulf of Maine tide pool, a North Woods pond below Katahdin, and Acadia from above, then travel the world. Every VR activity includes teacher setup notes and a way to take part without a headset.",
    topics: ["Virtual field trips", "Immersive exploration", "Observation challenges"]
  },
  {
    id: "ai",
    name: "Artificial Intelligence",
    short: "AI",
    icon: "ai",
    tagline: "Find out how computers learn from examples.",
    description:
      "Patterns, training examples, how computers make predictions, where they go wrong, and how to use them responsibly, from sorting wild blueberries to counting puffins. AI activities are teacher-guided and never ask students for personal information.",
    topics: ["Patterns", "Training examples", "Predictions", "Limitations", "Responsible use"]
  },
  {
    id: "engineering",
    name: "Engineering & Robotics",
    short: "Engineering",
    icon: "gear",
    tagline: "Design it, build it, test it, make it better.",
    description:
      "Design challenges, building, testing, iteration, and robot behaviors. Launch pumpkins, program a snowplow robot, focus a lighthouse beam, and float a wind turbine for the Gulf of Maine. Most engineering activities need only classroom materials.",
    topics: ["Design challenges", "Building", "Testing", "Iteration", "Robot behaviors"]
  },
  {
    id: "science",
    name: "Science & Discovery",
    short: "Science",
    icon: "flask",
    tagline: "Predict, observe, and let the evidence decide.",
    description:
      "Experiments, predictions, observations, and evidence. Graph Maine's giant tides, crack the maple sap code, and test sleds on a snowy hill, then make a claim and back it up with what you measured.",
    topics: ["Experiments", "Predictions", "Observations", "Evidence"]
  },
  {
    id: "creative",
    name: "Creative STEM",
    short: "Creative",
    icon: "palette",
    tagline: "Make art and stories with technology.",
    description:
      "Digital art, animation, storytelling, and projects that combine creativity with technology. Decode a lighthouse in pixels and make an animated postcard from your favorite Maine place.",
    topics: ["Digital art", "Animation", "Storytelling", "Creative technology"]
  },
  {
    // Live since October 22, 2026 with three Tinkercad exercises. Two unpublished placeholders remain in
    // data/drafts-3d-printing.js (educators only). An area with status "coming-soon" is left out of SE.liveAreas.
    id: "3d-printing",
    name: "3D Printing",
    short: "3D Printing",
    icon: "cube",
    tagline: "Design it on screen, then hold it in your hand.",
    description: "Design real objects in Tinkercad, measure in millimeters, and print them. Make a lobster buoy charm, a trail marker for the way to Katahdin, and a clip that solves a classroom problem.",
    topics: ["3D design (CAD)", "Measurement", "Prototyping", "Engineering design"]
  }
];

/* Coding browsing groups (planning/CODING_PLAN.md). Every coding activity has one `group`; an activity in
   another category can join through `alsoIn: ["coding"]` plus a `group`. A group with no activities is never
   shown (Web Development waits for reviewed content). Order here is the order on the Coding page. */
window.STEM.codingGroups = [
  { id: "foundations", name: "Coding Foundations", blurb: "Clear instructions, sorting, and debugging. Start here, with or without a computer." },
  { id: "labs", name: "Code right here", blurb: "In-site labs: steer a lobster boat, guard a moon gate, feed a space blob. Nothing to install." },
  { id: "blocks", name: "Block coding with Scratch", blurb: "Events, loops, conditions, and custom blocks in Scratch projects." },
  { id: "games", name: "Game Dev crew: games and stories", blurb: "Design levels, build games and stories, playtest them with real players, and ship version 2." },
  { id: "python", name: "Python and text coding", blurb: "From blocks to real Python: read it, put it in order, fix it, then write your own." },
  { id: "crew-ai", name: "AI Engineer crew", blurb: "Engineers who build with AI check its work. Test and fix code an AI wrote." },
  { id: "robotics", name: "Robotics and physical computing", blurb: "Sensors, rules, and robots that act on their own." },
  { id: "web", name: "Web development", blurb: "Build web pages with HTML and CSS." },
];

/* Skills that cross categories (optional `skills: [...]` on an activity). Tag an activity only after
   the proposed tags in planning/CATEGORIES_PATHWAYS_AUDIT.md (section 6a) are approved. */
window.STEM.skills = [
  { id: "sequencing", name: "Sequencing and algorithms" },
  { id: "debugging", name: "Debugging" },
  { id: "events", name: "Events and messages" },
  { id: "loops", name: "Loops" },
  { id: "logic", name: "Conditions and logic" },
  { id: "data", name: "Variables and data" },
  { id: "functions", name: "Functions and decomposition" },
  { id: "observation", name: "Observation" },
  { id: "fair-testing", name: "Prediction and fair testing" },
  { id: "design-iteration", name: "Design and iteration" },
  { id: "training-data", name: "Training data and patterns" },
  { id: "responsible-use", name: "Responsible use" },
  { id: "encoding-art", name: "Pixels, encoding, and animation" },
  { id: "communication", name: "Communicating ideas" }
];

/* Every unpublished record (Moxie sessions, 3D Printing placeholders, imported drafts) is added here.
   Drafts are found by id (SE.activityById) but never listed, counted, suggested, or assigned. */
window.STEM.drafts = window.STEM.drafts || [];

/* Experience levels. `pips` drives the 1–3 dot meter so level is never shown by color alone. */
window.STEM.levels = [
  { id: "beginner", name: "Beginner", pips: 1, hint: "No experience needed" },
  { id: "intermediate", name: "Intermediate", pips: 2, hint: "Some practice helps" },
  { id: "advanced", name: "Advanced", pips: 3, hint: "Ready for a challenge" }
];

window.STEM.gradeBands = [
  { id: "2-3", name: "Grades 2–3" },
  { id: "4-5", name: "Grades 4–5" },
  { id: "6-8", name: "Grades 6–8" }
];

/* Session lengths a teacher can plan around. An activity fits if its duration is at or under the limit. */
window.STEM.durations = [
  { id: "20", name: "20 minutes or less", max: 20 },
  { id: "30", name: "30 minutes or less", max: 30 },
  { id: "45", name: "45 minutes or less", max: 45 }
];

window.STEM.formats = {
  independent: { name: "Independent", hint: "Students work on their own" },
  collaborative: { name: "Collaborative", hint: "Students work in pairs or teams" },
  "teacher-led": { name: "Teacher-led", hint: "The teacher guides the whole group" }
};

/* Equipment keys used by activities. `filter: true` puts the item in the equipment filter. */
window.STEM.equipment = {
  unplugged: { name: "No devices needed", filter: true },
  computer: { name: "Laptop or Chromebook", filter: true },
  tablet: { name: "Tablet", filter: true },
  vr: { name: "VR headset optional", filter: true },
  projector: { name: "Projector or shared screen", filter: true },
  webcam: { name: "Webcam", filter: false },
  building: { name: "Building materials", filter: true },
  science: { name: "Science supplies", filter: true },
  art: { name: "Art supplies", filter: true },
  electronics: { name: "Electronics kit (microcontroller)", filter: false },
  printer3d: { name: "3D printer and filament", filter: true }
};
