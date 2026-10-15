/*
 * STEM Explorers — progression rules.
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
    replay: 0.25             // repeating a mission earns a quarter of its base XP
  },

  /* Explorer ranks. Insignia are drawn from `chevrons` and `stars`. */
  ranks: [
    { id: "cadet", name: "Cadet", xp: 0, chevrons: 0, stars: 0, motto: "Every expedition starts with one step." },
    { id: "scout", name: "Scout", xp: 300, chevrons: 1, stars: 0, motto: "You know how to look closely." },
    { id: "navigator", name: "Navigator", xp: 800, chevrons: 2, stars: 0, motto: "You can find your own way." },
    { id: "pathfinder", name: "Pathfinder", xp: 1600, chevrons: 3, stars: 0, motto: "Others follow the trails you find." },
    { id: "trailblazer", name: "Trailblazer", xp: 2800, chevrons: 3, stars: 1, motto: "You go where no one has mapped yet." },
    { id: "voyager", name: "Voyager", xp: 4500, chevrons: 3, stars: 2, motto: "Long journeys don't scare you." },
    { id: "commander", name: "Mission Commander", xp: 7000, chevrons: 3, stars: 3, motto: "You can lead an expedition." }
  ],

  /*
   * Mission patches. `rule` names a check in game.js; `n` is its target.
   * `icon` uses the app's icon set. `ring` is "teal", "orange", or "navy".
   */
  patches: [
    { id: "first-launch", name: "First Launch", icon: "rocket", ring: "orange", rule: "missions", n: 1,
      how: "Complete your first mission." },
    { id: "logbook", name: "Logbook Keeper", icon: "clipboard", ring: "teal", rule: "reflections", n: 5,
      how: "Answer 5 \"Think about it\" questions." },
    { id: "further", name: "Further Out", icon: "flag", ring: "navy", rule: "extensions", n: 3,
      how: "Try 3 \"Take it further\" challenges." },
    { id: "wide-horizon", name: "Wide Horizon", icon: "mountain", ring: "orange", rule: "sectors", n: 4,
      how: "Complete missions in 4 different exploration areas." },
    { id: "crew", name: "Crew Member", icon: "users", ring: "teal", rule: "collaborative", n: 3,
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
    { id: "pathway-3", name: "Trail Markers", icon: "list", ring: "teal", rule: "stages", n: 3,
      how: "Clear 3 coding pathway stages." },
    { id: "pathway-7", name: "Full Pathway", icon: "target", ring: "orange", rule: "stages", n: 7,
      how: "Clear all 7 coding pathway stages." },
    { id: "teacher-level", name: "Could Teach It", icon: "bulb", ring: "navy", rule: "confident", n: 3,
      how: "Finish 3 missions feeling ready to teach someone else." }
  ],

  /* Shared class goal. Everyone's XP adds up toward the next destination. */
  classGoal: [
    { name: "Launch pad", xp: 0 },
    { name: "Low orbit", xp: 3000 },
    { name: "The Moon", xp: 8000 },
    { name: "Mars", xp: 16000 },
    { name: "Jupiter", xp: 30000 },
    { name: "Neptune", xp: 50000 }
  ],

  /* How a student felt at the end of a mission. Shown to teachers. */
  confidence: [
    { id: "figuring", name: "Still figuring it out" },
    { id: "got-it", name: "I got it" },
    { id: "teach", name: "I could teach it" }
  ],

  /* Picture codes for student sign-in. Order matters; students pick three. */
  pictures: [
    { id: "moon", name: "Moon" },
    { id: "comet", name: "Comet" },
    { id: "compass", name: "Compass" },
    { id: "mountain", name: "Mountain" },
    { id: "wave", name: "Wave" },
    { id: "leaf", name: "Leaf" },
    { id: "crystal", name: "Crystal" },
    { id: "telescope", name: "Telescope" },
    { id: "lighthouse", name: "Lighthouse" }
  ]
};
