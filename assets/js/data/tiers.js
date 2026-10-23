/*
 * STEM 207 — the free tier (DRAFT for review; see planning/STEM 207 PAID.md).
 *
 * Lists what stays free on the public demo. **Anything not listed is paid**, so new content is locked
 * until someone adds it here on purpose. Nothing reads this yet: Phase 1 (locked cards) and
 * tools/build_bundles.js (Phase 2) will. Keep it about 20% of published activities, with every live
 * category represented. Check: node tests/tools/test_tiers.js
 *
 * activities: free activity ids (11 of 56).
 * labs: "full" = every level free; 1 = only level 1 is free (a preview; the activity page stays locked).
 * templates: free Learning Plan templates. None yet: every template needs paid steps.
 * moxie: free Moxie sessions. None; session 1 shows a teaser.
 * sampleClass: guests and free educators get the read-only sample class.
 */
window.STEM = window.STEM || {};
window.STEM.tiers = {
  draft: true,
  activities: [
    // Coding (3 of 23): a first lesson for grades 2–5, a first lesson for grades 6–8, and a full lab.
    "robot-maze-mission",
    "sort-the-catch",
    "lab-dance-party",
    // VR & 360 (1 of 4)
    "ecosystem-field-trip",
    // AI (1 of 8): unplugged, no account needed
    "how-ai-sorts",
    // Engineering (1 of 7)
    "paper-bridge",
    // Science & Discovery (2 of 6): a hands-on investigation and a full lab
    "sink-or-float",
    "lab-ramp-racers",
    // Creative STEM (2 of 5): a Scratch project and a full lab
    "animate-your-name",
    "lab-pixel-studio",
    // 3D Printing (1 of 3)
    "3d-buoy-charm",
  ],
  labs: {
    "dance-party": "full",
    "ramp-racers": "full",
    "pixel-studio": "full",
    "rover": 1,
    "space-blob": 1,
    "moon-gate": 1,
    "robot-chef": 1,
    "field-station": 1,
    "pattern-machine": 1,
    "launcher": 1,
    "line-follower": 1,
  },
  templates: [],
  moxie: [],
  sampleClass: true,
};
