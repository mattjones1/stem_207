/*
 * STEM Explorer Academy — exploration areas and shared vocabularies.
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
      "Algorithms, sequences, loops, conditionals, variables, debugging, and creative programming. Start anywhere on the coding pathway and move forward when you're ready.",
    topics: ["Algorithms", "Sequences", "Loops", "Conditionals", "Variables", "Debugging", "Creative programming"]
  },
  {
    id: "vr",
    name: "Virtual Reality",
    short: "Virtual Reality",
    icon: "vr",
    tagline: "Travel anywhere and look closely.",
    description:
      "Guided virtual field trips, immersive exploration, and observation challenges. Every VR activity includes teacher setup notes and a way to take part without a headset.",
    topics: ["Virtual field trips", "Immersive exploration", "Observation challenges"]
  },
  {
    id: "ai",
    name: "Artificial Intelligence",
    short: "AI",
    icon: "ai",
    tagline: "Find out how computers learn from examples.",
    description:
      "Patterns, training examples, how computers make predictions, where they go wrong, and how to use them responsibly. AI activities are teacher-guided and never ask students for personal information.",
    topics: ["Patterns", "Training examples", "Predictions", "Limitations", "Responsible use"]
  },
  {
    id: "engineering",
    name: "Engineering & Robotics",
    short: "Engineering",
    icon: "gear",
    tagline: "Design it, build it, test it, make it better.",
    description:
      "Design challenges, building, testing, iteration, and robot behaviors. Most engineering activities need only classroom materials.",
    topics: ["Design challenges", "Building", "Testing", "Iteration", "Robot behaviors"]
  },
  {
    id: "science",
    name: "Science & Discovery",
    short: "Science",
    icon: "flask",
    tagline: "Predict, observe, and let the evidence decide.",
    description:
      "Experiments, predictions, observations, and evidence. Students make a claim and back it up with what they measured.",
    topics: ["Experiments", "Predictions", "Observations", "Evidence"]
  },
  {
    id: "creative",
    name: "Creative STEM",
    short: "Creative",
    icon: "palette",
    tagline: "Make art and stories with technology.",
    description:
      "Digital art, animation, storytelling, and projects that combine creativity with technology.",
    topics: ["Digital art", "Animation", "Storytelling", "Creative technology"]
  }
];

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
  vr: { name: "VR headset", filter: true },
  projector: { name: "Projector or shared screen", filter: true },
  webcam: { name: "Webcam", filter: false },
  building: { name: "Building materials", filter: true },
  science: { name: "Science supplies", filter: true },
  art: { name: "Art supplies", filter: true }
};
