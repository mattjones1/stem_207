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
    missionByDuration: { 20: 100, 30: 150, 45: 200 },
    levelBonus: { beginner: 0, intermediate: 50, advanced: 100 },
    reflection: 25,          // answered "Think about it"
    extension: 50,           // tried "Take it further"
    newSector: 50,           // first mission in an exploration area
    stageCleared: 100,       // teacher confirmed a pathway "I can"
    labLevel: 30,            // finished a level in an interactive lab (first time)
    replay: 0                // repeating a mission is practice: no new XP
  },

  /* Completions recorded before this date (ms) came from the old one-click flow, so teacher
     views label them "legacy" instead of treating them as current evidence. Sample data is exempt. */
  legacyBefore: Date.UTC(2026, 9, 18, 14, 0),

  /* Explorer ranks, Maine-style: from the dock to the top of Katahdin.
     Insignia are drawn from `chevrons` and `stars`. */
  ranks: [
    { id: "deckhand", name: "Deckhand", xp: 0, chevrons: 0, stars: 0, motto: "Every expedition starts at the dock." },
    { id: "tidepooler", name: "Tidepooler", xp: 300, chevrons: 1, stars: 0, motto: "You know how to look closely." },
    { id: "trail-scout", name: "Trail Scout", xp: 800, chevrons: 2, stars: 0, motto: "You can find your own way through the woods." },
    { id: "keeper", name: "Lighthouse Keeper", xp: 1600, chevrons: 3, stars: 0, motto: "Others steer by the light you keep." },
    { id: "harbor-pilot", name: "Harbor Pilot", xp: 2800, chevrons: 3, stars: 1, motto: "You can guide a boat home through fog." },
    { id: "ridge-runner", name: "Ridge Runner", xp: 4500, chevrons: 3, stars: 2, motto: "Long climbs don't scare you." },
    { id: "katahdin", name: "Katahdin Guide", xp: 7000, chevrons: 3, stars: 3, motto: "You can lead an expedition all the way to the summit." }
  ],

  /*
   * Mission patches. `rule` names a check in game.js; `n` is its target.
   * `icon` uses the app's icon set. `ring` is "teal", "orange", or "navy".
   */
  patches: [
    { id: "first-launch", name: "Cast Off", icon: "boat", ring: "orange", rule: "missions", n: 1,
      how: "Complete your first mission." },
    { id: "logbook", name: "Logbook Keeper", icon: "clipboard", ring: "teal", rule: "reflections", n: 5,
      how: "Answer 5 \"Think about it\" questions." },
    { id: "further", name: "Past the Breakwater", icon: "flag", ring: "navy", rule: "extensions", n: 3,
      how: "Try 3 \"Take it further\" challenges." },
    { id: "wide-horizon", name: "Down East", icon: "compass", ring: "orange", rule: "sectors", n: 4,
      how: "Complete missions in 4 different exploration areas." },
    { id: "crew", name: "Sternman", icon: "users", ring: "teal", rule: "collaborative", n: 3,
      how: "Complete 3 team missions." },
    { id: "bug-hunter", name: "Bug Hunter", icon: "bug", ring: "navy", rule: "keyword", keyword: "debugging", n: 2,
      how: "Complete 2 debugging missions." },
    { id: "sector-coding", name: "Code Sector", icon: "code", ring: "teal", rule: "area", area: "coding", n: 3,
      how: "Complete 3 Coding missions." },
    { id: "sector-vr", name: "Far Sight", icon: "vr", ring: "navy", rule: "area", area: "vr", n: 2,
      how: "Complete 2 Virtual Reality missions." },
    { id: "sector-ai", name: "Pattern Finder", icon: "ai", ring: "orange", rule: "area", area: "ai", n: 2,
      how: "Complete 2 AI missions." },
    { id: "sector-engineering", name: "Builder", icon: "gear", ring: "teal", rule: "area", area: "engineering", n: 2,
      how: "Complete 2 Engineering missions." },
    { id: "sector-science", name: "Field Scientist", icon: "flask", ring: "navy", rule: "area", area: "science", n: 2,
      how: "Complete 2 Science missions." },
    { id: "sector-creative", name: "Maker", icon: "palette", ring: "orange", rule: "area", area: "creative", n: 2,
      how: "Complete 2 Creative missions." },
    { id: "pathway-3", name: "Trail Blazes", icon: "pine", ring: "teal", rule: "stages", n: 3,
      how: "Clear 3 coding pathway stages." },
    { id: "pathway-7", name: "Summit Katahdin", icon: "mountain", ring: "orange", rule: "stages", n: 7,
      how: "Clear all 7 coding pathway stages." },
    { id: "lab-explorer", name: "Lab Explorer", icon: "flask", ring: "teal", rule: "labs", n: 3,
      how: "Finish a level in 3 different interactive labs." },
    { id: "lab-master", name: "Lab Master", icon: "star", ring: "orange", rule: "labFull", n: 1,
      how: "Finish every level of one interactive lab." },
    { id: "lab-legend", name: "Lab Legend", icon: "lighthouse", ring: "navy", rule: "labLevels", n: 30,
      how: "Finish 30 lab levels." },
    { id: "teacher-level", name: "Could Teach It", icon: "bulb", ring: "navy", rule: "confident", n: 3,
      how: "Finish 3 missions feeling ready to teach someone else." }
  ],

  /* Shared class goal: the class travels Maine together, from the state line to the summit.
     Everyone's XP adds up toward the next stop. */
  classGoal: [
    { name: "Kittery", xp: 0 },
    { name: "Portland Head", xp: 3000 },
    { name: "Penobscot Bay", xp: 8000 },
    { name: "Acadia", xp: 16000 },
    { name: "Moosehead", xp: 30000 },
    { name: "Katahdin", xp: 50000 }
  ],

  /* How a student felt at the end of a mission. Shown to teachers. */
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
