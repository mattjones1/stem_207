/*
 * STEM 207 — progression rules.
 *
 * Everything a student earns is calculated from their activity log, so these
 * rules can be tuned at any time and every student's rank and patches update
 * to match. Nothing here is stored per student.
 */
window.STEM = window.STEM || {};

window.STEM.progression = {
  /* Experience points (XP) for each kind of accomplishment. */
  xp: {
    mission: 150,            // earned when the teacher passes an activity (no extra XP for longer activities)
    missionByDuration: { 20: 150, 30: 150, 45: 150 },   // kept for older code; all equal now
    teacherConfirmed: 0,     // retired: the pass itself earns the activity's XP
    levelBonus: { beginner: 0, intermediate: 50, advanced: 100 },
    reflection: 0,           // retired (XP comes only from a pass)
    extension: 0,            // retired (XP comes only from a pass)
    newSector: 50,           // first pass in a category
    stageCleared: 0,         // retired with the coding pathway's stage checks
    labLevel: 0,             // retired: lab levels are practice (they still count toward lab patches)
    replay: 0                // repeating an activity is practice: no new XP
  },

  /* Completions recorded before this date (ms) came from the old one-click flow, so teacher
     views label them "legacy" instead of treating them as current evidence. Sample data is exempt. */
  legacyBefore: Date.UTC(2026, 9, 18, 14, 0),

  /* Explorer ranks, Maine-style: from the dock to the top of Katahdin.
     Insignia are drawn from `chevrons` and `stars`. */
  ranks: [
    { id: "deckhand", name: "Deckhand", xp: 0, chevrons: 0, stars: 0, motto: "Every voyage starts at the dock." },
    { id: "tidepooler", name: "Tidepooler", xp: 300, chevrons: 1, stars: 0, motto: "You know how to look closely." },
    { id: "trail-scout", name: "Trail Scout", xp: 800, chevrons: 2, stars: 0, motto: "You can find your own way through the woods." },
    { id: "keeper", name: "Lighthouse Keeper", xp: 1600, chevrons: 3, stars: 0, motto: "Others steer by the light you keep." },
    { id: "harbor-pilot", name: "Harbor Pilot", xp: 2800, chevrons: 3, stars: 1, motto: "You can guide a boat home through fog." },
    { id: "ridge-runner", name: "Ridge Runner", xp: 4500, chevrons: 3, stars: 2, motto: "Long climbs don't scare you." },
    { id: "katahdin", name: "Katahdin Guide", xp: 7000, chevrons: 3, stars: 3, motto: "You can lead a whole crew all the way to the summit." }
  ],

  /*
   * Activity patches. `rule` names a check in game.js; `n` is its target.
   * `icon` uses the app's icon set. `ring` is "teal", "orange", or "navy".
   */
  patches: [
    { id: "first-launch", name: "Cast Off", icon: "boat", ring: "orange", rule: "missions", n: 1,
      how: "Pass your first activity." },
    { id: "logbook", name: "Logbook Keeper", icon: "clipboard", ring: "teal", rule: "reflections", n: 5,
      how: "Pass 5 activities with a written reflection." },
    { id: "further", name: "Past the Breakwater", icon: "flag", ring: "navy", rule: "extensions", n: 3,
      how: "Pass 3 activities where you tried Go deeper." },
    { id: "wide-horizon", name: "Down East", icon: "compass", ring: "orange", rule: "sectors", n: 4,
      how: "Pass activities in 4 different categories." },
    { id: "crew", name: "Sternman", icon: "users", ring: "teal", rule: "collaborative", n: 3,
      how: "Pass 3 team activities." },
    { id: "crew-ai-engineer", name: "AI Engineer", icon: "ai", ring: "navy", rule: "crewPass", crew: "tpl-crew-ai-engineer", n: 4,
      how: "Pass 4 activities from the AI Engineer crew." },
    { id: "bug-hunter", name: "Bug Hunter", icon: "bug", ring: "navy", rule: "keyword", keyword: "debugging", n: 2,
      how: "Pass 2 debugging activities." },
    { id: "sector-coding", name: "Coder", icon: "code", ring: "teal", rule: "area", area: "coding", n: 3,
      how: "Pass 3 Coding activities." },
    { id: "sector-vr", name: "Far Sight", icon: "vr", ring: "navy", rule: "area", area: "vr", n: 2,
      how: "Pass 2 Virtual Reality activities." },
    { id: "sector-ai", name: "Pattern Finder", icon: "ai", ring: "orange", rule: "area", area: "ai", n: 2,
      how: "Pass 2 AI activities." },
    { id: "sector-engineering", name: "Builder", icon: "gear", ring: "teal", rule: "area", area: "engineering", n: 2,
      how: "Pass 2 Engineering activities." },
    { id: "sector-science", name: "Field Scientist", icon: "flask", ring: "navy", rule: "area", area: "science", n: 2,
      how: "Pass 2 Science activities." },
    { id: "sector-creative", name: "Maker", icon: "palette", ring: "orange", rule: "area", area: "creative", n: 2,
      how: "Pass 2 Creative activities." },
    { id: "pathway-3", name: "Trail Blazes", icon: "pine", ring: "teal", rule: "missions", n: 10,
      how: "Pass 10 activities." },
    { id: "pathway-7", name: "Summit Katahdin", icon: "mountain", ring: "orange", rule: "missions", n: 25,
      how: "Pass 25 activities." },
    { id: "lab-explorer", name: "Lab Explorer", icon: "flask", ring: "teal", rule: "labs", n: 3,
      how: "Finish a level in 3 different interactive labs." },
    { id: "lab-master", name: "Lab Master", icon: "star", ring: "orange", rule: "labFull", n: 1,
      how: "Finish every level of one interactive lab." },
    { id: "lab-legend", name: "Lab Legend", icon: "lighthouse", ring: "navy", rule: "labLevels", n: 30,
      how: "Finish 30 lab levels." },
    { id: "teacher-level", name: "Could Teach It", icon: "bulb", ring: "navy", rule: "confident", n: 3,
      how: "Pass 3 activities feeling ready to teach someone else." }
  ],

  /* Class rewards (Batch 10) are separate from personal XP. Only class work moves the class:
     an activity the teacher assigned and the student sent, an activity the teacher confirmed, and a
     pathway stage the teacher confirmed. Personal XP, ranks, patches, and the harbor still count
     everything a student does. */
  classPoints: { passed: 100 },   // per assigned activity (or activity in an assigned Learning Plan) a teacher passes

  /* The class journey: the class travels Maine together, from the state line to the summit. */
  classGoal: [
    { name: "Kittery", pts: 0 },
    { name: "Portland Head", pts: 1500 },
    { name: "Penobscot Bay", pts: 4500 },
    { name: "Acadia", pts: 9000 },
    { name: "Moosehead", pts: 16000 },
    { name: "Katahdin", pts: 26000 }
  ],

  /* Badges the whole class earns together. */
  classBadges: [
    { id: "first-haul", name: "First Haul", icon: "boat", how: "Your teacher passes the class's first activity." },
    { id: "all-hands", name: "All Hands on Deck", icon: "users", how: "Every student passes at least one class activity." },
    { id: "pathfinders", name: "Pathfinders", icon: "compass", how: "Every student passes 3 activities." },
    { id: "right-on-tide", name: "Right on Tide", icon: "wave", how: "Everyone sends an assigned activity by its due date." },
    { id: "steady-crew", name: "Steady Crew", icon: "lighthouse", how: "Your teacher passes 10 activities across the class." }
  ],

  /* How a student felt at the end of an activity. Shown to teachers. */
  confidence: [
    { id: "figuring", name: "Still figuring it out" },
    { id: "got-it", name: "I got it" },
    { id: "teach", name: "I could teach it" }
  ],

  /* Picture codes for student sign-in. Order matters; students pick three. */
  pictures: [
    { id: "pine", name: "Pine tree" },
    { id: "lighthouse", name: "Lighthouse" },
    { id: "moon", name: "Moon" },
    { id: "boat", name: "Lobster boat" },
    { id: "wave", name: "Wave" },
    { id: "leaf", name: "Maple leaf" },
    { id: "compass", name: "Compass" },
    { id: "mountain", name: "Mountain" },
    { id: "snowflake", name: "Snowflake" }
  ]
};
