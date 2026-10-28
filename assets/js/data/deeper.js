/*
 * STEM 207 — Go deeper: a grades 4–6 stretch and vetted outside resources for every activity.
 *
 * Each activity gets a.deeper = { challenge, links }. The challenge is the activity's own `extend`
 * unless CHALLENGE below gives a stronger grades 4–6 version. Links come from the LINKS library.
 *
 * Every URL here was fetched on the `verified` date and kept only if it loaded, is free, and suits
 * grades 4–8. Some sites are apps that only return their page title to a fetcher; those count as
 * reachable and are marked app: true. Re-check links each term (tests/tools/test_deeper.js lists them).
 * Rules: https only, reputable free providers, no student personal information required to start.
 * account: "none" (open it and go) · "teacher" (the teacher sets it up) · "student" (needs a student account).
 */
window.STEM = window.STEM || {};
(function () {
  const STEM = window.STEM;
  const V = "2026-10-22";
  const ALL = ["2-3", "4-5", "6-8"], UP = ["4-5", "6-8"];
  const LINKS = {
    dance: { title: "Dance Party", provider: "Code.org", url: "https://studio.code.org/s/dance", grades: ALL, minutes: 60, account: "none", app: true,
      why: "Code a dance to real songs using events and loops, the same ideas as the Go deeper levels." },
    scratchIdeas: { title: "Scratch Ideas and tutorials", provider: "Scratch (MIT)", url: "https://scratch.mit.edu/ideas", grades: ALL, minutes: 30, account: "none", app: true,
      why: "Step-by-step Scratch tutorials and starter ideas. You can try them without signing in; saving online needs an account." },
    maze: { title: "Maze", provider: "Blockly Games", url: "https://blockly.games/maze", grades: ALL, minutes: 30, account: "none", app: true,
      why: "Ten maze levels that build from simple steps to loops and if–else decisions." },
    turtle: { title: "Turtle", provider: "Blockly Games", url: "https://blockly.games/turtle", grades: UP, minutes: 30, account: "none", app: true,
      why: "Draw shapes and patterns with loops, then see the same program written as real code." },
    kidbots: { title: "Kidbots", provider: "CS Unplugged", url: "https://www.csunplugged.org/en/topics/kidbots/", grades: ["2-3", "4-5"], minutes: 30, account: "none",
      why: "Robot games with a partner, no computer needed: plan, code, test, and debug instructions." },
    sorting: { title: "Sorting networks", provider: "CS Unplugged", url: "https://www.csunplugged.org/en/topics/sorting-networks/", grades: ALL, minutes: 30, account: "none",
      why: "Sort numbers by walking a chalk network on the floor, and see how computers compare many pairs at once." },
    binary: { title: "Binary numbers", provider: "CS Unplugged", url: "https://www.csunplugged.org/en/topics/binary-numbers/", grades: ALL, minutes: 30, account: "none",
      why: "Count with cards that are only 0 or 1, and find out how a computer stores every number." },
    pixels: { title: "Image representation", provider: "CS Unplugged", url: "https://www.csunplugged.org/en/topics/image-representation/", grades: ALL, minutes: 30, account: "none",
      why: "How a picture becomes pixels and numbers, the idea behind pixel art code." },
    oceans: { title: "AI for Oceans", provider: "Code.org", url: "https://code.org/oceans", grades: ALL, minutes: 45, account: "none",
      why: "Train an AI to sort fish from trash, and see how the examples you give shape what it learns." },
    quickdraw: { title: "Quick, Draw!", provider: "Google", url: "https://quickdraw.withgoogle.com/", grades: ALL, minutes: 15, account: "none",
      why: "Draw while a neural network guesses. Then look at the drawings it learned from: are they all alike?" },
    teachable: { title: "Teachable Machine", provider: "Google", url: "https://teachablemachine.withgoogle.com/", grades: UP, minutes: 30, account: "none", app: true,
      why: "Train a real model in your browser with your own examples. Use objects or hands, not faces." },
    earth: { title: "Google Earth", provider: "Google", url: "https://earth.google.com/web/", grades: ALL, minutes: 30, account: "none", app: true,
      why: "Fly anywhere on Earth in 3D. Works best in Chrome." },
    acadia: { title: "Nature at Acadia National Park", provider: "National Park Service", url: "https://www.nps.gov/acad/learn/nature/index.htm", grades: ALL, minutes: 20, account: "none",
      why: "The plants, animals, and rocky coast of Acadia, from the people who protect it." },
    gmri: { title: "Gulf of Maine Research Institute", provider: "Gulf of Maine Research Institute", url: "https://www.gmri.org/", grades: UP, minutes: 20, account: "none",
      why: "Real Maine scientists studying the Gulf of Maine's fish, lobsters, and changing waters." },
    tides: { title: "Tides & Currents", provider: "NOAA", url: "https://tidesandcurrents.noaa.gov/", grades: UP, minutes: 20, account: "none",
      why: "Official tide predictions for Portland, Eastport, and every U.S. station. Look up this week's tides." },
    buoyancy: { title: "Buoyancy: Basics", provider: "PhET (University of Colorado)", url: "https://phet.colorado.edu/en/simulations/buoyancy-basics", grades: ALL, minutes: 20, account: "none",
      why: "A free simulation: change an object's mass and size and watch whether it sinks or floats." },
    projectile: { title: "Projectile Motion", provider: "PhET (University of Colorado)", url: "https://phet.colorado.edu/en/simulations/projectile-motion", grades: UP, minutes: 20, account: "none",
      why: "Launch objects at different angles and speeds and measure how far they fly." },
    forces: { title: "Forces and Motion: Basics", provider: "PhET (University of Colorado)", url: "https://phet.colorado.edu/en/simulations/forces-and-motion-basics", grades: ALL, minutes: 20, account: "none",
      why: "Push, pull, and add friction, then watch how forces change motion." },
    states: { title: "States of Matter: Basics", provider: "PhET (University of Colorado)", url: "https://phet.colorado.edu/en/simulations/states-of-matter-basics", grades: ALL, minutes: 20, account: "none",
      why: "Heat and cool atoms and watch a solid melt into a liquid and boil into a gas." },
    teachEng: { title: "TeachEngineering", provider: "TeachEngineering", url: "https://www.teachengineering.org/", grades: UP, minutes: 30, account: "none",
      why: "A free library of hands-on engineering challenges. Ask your teacher to pick one with you." },
    designSquad: { title: "Design Squad videos", provider: "PBS KIDS", url: "https://pbskids.org/designsquad/", grades: UP, minutes: 15, account: "none",
      why: "Watch kids and real engineers design, test, fail, and fix their inventions." },
    piskel: { title: "Piskel", provider: "Piskel", url: "https://www.piskelapp.com/", grades: ALL, minutes: 30, account: "none",
      why: "A free pixel art and animation editor. Best on a laptop, not a phone." },
    lighthouses: { title: "American Lighthouse Foundation", provider: "American Lighthouse Foundation", url: "https://www.lighthousefoundation.org/", grades: UP, minutes: 15, account: "none",
      why: "History of Maine lighthouses and the people who keep them shining, including Maine Open Lighthouse Day." },
    maple: { title: "Maine Maple Producers", provider: "Maine Maple Producers Association", url: "https://mainemapleproducers.com/", grades: ALL, minutes: 15, account: "none",
      why: "Maine's maple farmers and the sugarhouses that open their doors to visitors." },
    tinkercad: { title: "Tinkercad lessons", provider: "Tinkercad (Autodesk)", url: "https://www.tinkercad.com/learn", grades: UP, minutes: 30, account: "teacher", app: true,
      why: "Free step-by-step 3D design lessons. Join your teacher's Tinkercad Class with the class code and your nickname." }
  };

  /* Which resources go with which activity (up to two each). */
  const MAP = {
    "robot-maze-mission": ["kidbots", "turtle"], "event-party": ["scratchIdeas", "dance"], "loop-dance": ["dance", "scratchIdeas"],
    "debug-animation": ["scratchIdeas", "kidbots"], "interactive-story": ["scratchIdeas"], "score-keeper": ["scratchIdeas", "binary"],
    "my-blocks-patterns": ["turtle", "scratchIdeas"], "capstone-game": ["scratchIdeas", "designSquad"], "fix-the-recipe": ["kidbots"],
    "lab-robot-chef": ["kidbots", "maze"], "sort-the-catch": ["sorting"], "lighthouse-network": ["scratchIdeas", "lighthouses"],
    "snowstorm-clones": ["scratchIdeas"], "noreaster-alerts": ["scratchIdeas"], "catch-log-lists": ["gmri", "scratchIdeas"],
    "snowflake-functions": ["turtle"], "capstone-studio": ["scratchIdeas", "designSquad"], "python-turtle-bridge": ["turtle"], "lab-harbor-python": ["turtle", "maze"],
    "lobster-trap-logic": ["gmri"], "lab-rover": ["maze"], "lab-dance-party": ["dance", "scratchIdeas"], "lab-space-blob": ["scratchIdeas", "binary"],
    "lab-moon-gate": ["maze"],
    "ecosystem-field-trip": ["acadia", "gmri"], "notice-and-wonder-360": ["earth"], "acadia-from-above": ["acadia"], "lab-field-station": ["acadia", "gmri"],
    "how-ai-sorts": ["oceans", "quickdraw"], "teachable-machine-classroom": ["quickdraw"], "ai-secret-signals": ["quickdraw", "oceans"],
    "ai-for-oceans": ["quickdraw"], "ai-limits-detectives": ["quickdraw", "oceans"], "pattern-predictors": ["quickdraw"],
    "blueberry-sorter": ["oceans", "teachable"], "lab-pattern-machine": ["teachable", "quickdraw"],
    "paper-bridge": ["teachEng", "designSquad"], "sense-think-act": ["kidbots"], "marble-run-iteration": ["designSquad", "forces"],
    "lighthouse-beam": ["lighthouses", "designSquad"], "float-a-turbine": ["teachEng"], "lab-launcher": ["projectile", "teachEng"],
    "lab-line-follower": ["kidbots"],
    "sink-or-float": ["buoyancy"], "paper-helicopter": ["forces", "designSquad"], "melting-race": ["states"], "tide-watchers": ["tides"],
    "sap-run-detectives": ["maple", "states"], "lab-ramp-racers": ["forces"],
    "pixel-art-code": ["pixels", "piskel"], "animate-your-name": ["scratchIdeas"], "stop-motion-studio": ["piskel"], "maine-postcard": ["scratchIdeas", "acadia"],
    "lab-pixel-studio": ["piskel", "pixels"],
    "3d-buoy-charm": ["tinkercad"], "3d-trail-marker": ["tinkercad"], "3d-fix-it-clip": ["tinkercad"]
  };

  /* Stronger grades 4–6 challenges where the activity's own `extend` is mainly for younger students. */
  const CHALLENGE = {
    "lab-dance-party": "Finish the Go deeper levels in the lab: use Repeat blocks, fix a buggy dance, and make a 12-move dance with 5 blocks or fewer. Then take your dance to Scratch in Loop Dance Choreographers.",
    "fix-the-recipe": "Write an algorithm for a harder job, like tying a shoe. Test it on a partner who follows it exactly, count the bugs they find, and fix them.",
    "sink-or-float": "Measure it: how many pennies can your clay boat carry before it sinks? Change one thing about its shape, predict the new number, and test.",
    "pixel-art-code": "Compress your picture: write it as run-length code (like 2W 4B 2W) and count how many characters you saved. Which kinds of pictures compress best?",
    "sense-think-act": "Write sense–think–act rules for a robot vacuum as a table: what it senses, what it decides, and what it does. Test the table with a partner acting as the robot."
  };

  const byId = {};
  (STEM.activities || []).concat(STEM.drafts || []).forEach((a) => { byId[a.id] = a; });
  STEM.deeperLinks = LINKS;
  Object.entries(MAP).forEach(([id, keys]) => {
    const a = byId[id];
    if (!a) return;
    a.deeper = {
      challenge: CHALLENGE[id] || a.extend || "",
      links: keys.map((k) => Object.assign({ verified: V }, LINKS[k]))
    };
  });
})();
