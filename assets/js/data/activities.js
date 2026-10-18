/*
 * STEM 207 — activity library.
 *
 * Every activity follows the same shape. To add one, copy an existing entry,
 * give it a unique `id`, and fill in each field. See README.md for the full
 * field reference.
 *
 * launch.status:
 *   "ready"        — a verified external resource. Opens in a new tab.
 *   "coming-soon"  — a resource hasn't been chosen yet. Shows an honest placeholder.
 *   "none"         — hands-on activity. All directions are on the page.
 *
 * access.account: "none" | "optional" | "required"
 * access.cost:    "free" | "paid"
 */
window.STEM = window.STEM || {};

window.STEM.activities = [
  /* ───────────────────────────── Coding & Computer Science ───────────────────────────── */
  {
    id: "robot-maze-mission",
    pilot: true,
    time: { prep: 5, core: [15, 20], verified: false },
    stopAt: "You solve Maze level 3 online. The floor maze (Part 1) is an optional warm-up, and levels after 3 are bonus.",
    check: "Point to where the character will stop before you press Run. If it goes the wrong way, show the first block that caused it and explain your fix.",
    stuck: ["Watch the character move. Stop at the first wrong move.", "Left and right mean the character's left and right, not yours.", "Fix only one block, then run it again."],
    next: "event-party",
    title: "Robot Maze Mission",
    area: "coding",
    summary: "Guide a robot through a maze, first with your feet, then with code blocks.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 45,
    format: "collaborative",
    equipment: ["computer"],
    source: "original",
    pathwayStage: 1,
    keywords: ["algorithm", "sequence", "maze", "blockly", "unplugged", "directions"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: {
      status: "ready",
      label: "Open Blockly Games: Maze",
      url: "https://blockly.games/maze",
      provider: "Blockly Games",
      note: "Free. No account needed. Runs in any modern browser."
    },
    mission:
      "A rover is stuck at one end of a maze. Your team will write a set of exact instructions that gets it to the goal without bumping a wall, then test your thinking in a coding game.",
    learn: [
      "Write an algorithm as a step-by-step sequence of instructions.",
      "Predict what a program will do before running it.",
      "Find and fix the first step that goes wrong."
    ],
    before: {
      materials: [
        "Masking tape to make a floor grid (about 5 × 5 squares)",
        "Index cards with arrows: Forward, Turn left, Turn right",
        "One laptop or Chromebook per pair for Part 2"
      ],
      setup: [
        "Tape a grid on the floor and mark a Start square and a Goal square.",
        "Add 2–3 \"wall\" squares with a sticky note or a book."
      ],
      prerequisites: "None. This is a great first coding activity."
    },
    steps: [
      "Part 1: One partner is the Robot and stands on Start. The Robot can only do what the cards say.",
      "The Programmer lays out arrow cards in order to reach the Goal. No talking to the Robot!",
      "Run the program: the Programmer reads each card and the Robot moves one square or turns.",
      "If the Robot hits a wall, stop. Find the card where it went wrong, fix it, and run it again.",
      "Switch roles and try a new wall layout.",
      "Part 2: Open the Maze game. Drag blocks to move the character to the goal.",
      "Before you press Run, say out loud where you think the character will end up.",
      "Play as many levels as you can. Later levels add repeat blocks."
    ],
    reflect: "When your robot went the wrong way, how did you find the exact card that caused it?",
    extend: "Write the shortest program you can for one level. Then try to beat your own record by using a repeat block.",
    teacherNotes: [
      "Pilot core: Maze levels 1–3. Play levels 1–3 once on a student device before class to confirm they match these steps.",
      "Model one round of the floor maze with a volunteer before pairs begin.",
      "Ask \"Which step went wrong first?\" rather than \"What's wrong?\" to build debugging habits.",
      "Younger students can stop after levels 1–3 of the online maze. Levels 4+ introduce loops and conditionals and connect to later pathway stages.",
      "For students with limited mobility, run Part 1 as a tabletop maze with a game piece."
    ]
  },
  {
    id: "event-party",
    pilot: true,
    time: { prep: 5, core: [15, 20], verified: false },
    stopAt: "Your sprite reacts to a click and to the space key (step 5). Step 6 is bonus.",
    check: "Before you test, say what will happen when you click the sprite and when you press space. Then show both working.",
    stuck: ["To test a click, click the sprite on the stage, not the blocks.", "Check that the key in your block is the key you press.", "Event blocks wait on their own. You don't need the green flag."],
    next: "animate-your-name",
    title: "Click, Tap, Go! Event Party",
    area: "coding",
    summary: "Make a character jump, spin, and talk when you click or press a key.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 30,
    format: "independent",
    equipment: ["computer"],
    source: "original",
    pathwayStage: 2,
    keywords: ["events", "input", "scratch", "keyboard", "click"],
    access: {
      account: "optional",
      accountNote: "An account is only needed to save online. Students can use File → Save to your computer instead.",
      cost: "free",
      supervision: false,
      hardware: []
    },
    launch: {
      status: "ready",
      label: "Open the Scratch editor",
      url: "https://scratch.mit.edu/projects/editor/",
      provider: "Scratch (MIT)",
      note: "Free. Works without signing in."
    },
    mission:
      "Build a character that reacts to you. Each key or click should make something different happen.",
    learn: [
      "Explain that an event is something that starts a program, like a click or a key press.",
      "Connect at least three different events to three different actions.",
      "Test each event on its own to check it works."
    ],
    before: {
      materials: ["Laptop or Chromebook with a keyboard", "Headphones if you add sounds"],
      setup: ["Open the Scratch editor in a browser tab before students arrive."],
      prerequisites: "Stage 1: can put instructions in order."
    },
    steps: [
      "Open Scratch. Pick a sprite you like or keep the cat.",
      "From the yellow Events blocks, drag out \"when this sprite clicked.\"",
      "Snap a Looks or Motion block under it, like \"say Hello!\" or \"turn 15 degrees.\"",
      "Click your sprite to test it.",
      "Add \"when space key pressed\" and make the sprite do something different.",
      "Add one more event using a different key.",
      "Test each event one at a time. If one doesn't work, check which key it's listening for."
    ],
    reflect: "What's the difference between a program that runs once and a program that waits for you?",
    extend: "Add a second sprite. Can a click on one sprite make the other one move? (Hint: try the broadcast blocks.)",
    teacherNotes: [
      "Pair students who finish early with someone still testing; explaining their events is good practice.",
      "If a sprite \"does nothing,\" the most common cause is pressing a different key than the block expects.",
      "Remind students not to type their real name or other personal details into speech bubbles in projects they share."
    ]
  },
  {
    id: "loop-dance",
    title: "Loop Dance Choreographers",
    area: "coding",
    summary: "Turn a long dance into a short program by spotting the moves that repeat.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 30,
    format: "collaborative",
    equipment: ["unplugged"],
    source: "original",
    pathwayStage: 3,
    keywords: ["loops", "repeat", "patterns", "unplugged", "dance"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Your team is writing dance instructions for a robot that reads every word. Make the program as short as possible without changing the dance.",
    learn: [
      "Spot a repeating pattern in a set of instructions.",
      "Rewrite repeated steps as a loop: \"Repeat 4 times: clap, stomp.\"",
      "Check that the shorter program still produces the same result."
    ],
    before: {
      materials: ["Paper and pencils", "A board or projector to show the long dance", "Optional: music"],
      setup: [
        "Write this dance where everyone can see it: clap, stomp, clap, stomp, clap, stomp, spin, jump, clap, stomp, clap, stomp, clap, stomp, spin, jump."
      ],
      prerequisites: "Stage 2: has made something happen in response to an event."
    },
    steps: [
      "As a class, perform the long dance once. Count how many instructions there are (16).",
      "In teams, circle any group of moves that repeats.",
      "Rewrite the dance using \"Repeat ___ times:\" so it uses fewer lines.",
      "Trade programs with another team and perform their version exactly as written.",
      "Did their dance match the original? If not, find the line that changed it.",
      "Write your own dance with a loop inside a loop and teach it to the class."
    ],
    reflect: "Why would a programmer want a shorter program if the result is the same?",
    extend: "Rebuild your team's dance in Scratch using the \"repeat\" block and costume changes.",
    teacherNotes: [
      "A complete answer: Repeat 2 times: [Repeat 3 times: clap, stomp] then spin, jump. That's 5 lines instead of 16.",
      "Expect some teams to write \"Repeat 6 times: clap, stomp\" and miss the spin/jump. Performing it reveals the bug, which is the point.",
      "Seated movements (tap desk, snap, wave) work well for students who prefer not to dance."
    ]
  },
  {
    id: "debug-animation",
    title: "Debug the Broken Animation",
    area: "coding",
    summary: "A fish animation has four bugs hiding in it. Find them and fix them.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 30,
    format: "independent",
    equipment: ["computer"],
    source: "original",
    pathwayStage: 3,
    keywords: ["debugging", "loops", "scratch", "animation", "bugs"],
    access: {
      account: "optional",
      accountNote: "An account is only needed to save online.",
      cost: "free",
      supervision: false,
      hardware: []
    },
    launch: {
      status: "ready",
      label: "Open the Scratch editor",
      url: "https://scratch.mit.edu/projects/editor/",
      provider: "Scratch (MIT)",
      note: "Free. Works without signing in."
    },
    mission:
      "The fish is supposed to swim back and forth forever, flipping around at each edge. Right now it swims once, flips upside down, and stops. You're the debugging crew.",
    learn: [
      "Use a step-by-step process to find a bug: run, observe, compare, change one thing.",
      "Explain the difference between \"repeat 10\" and \"forever.\"",
      "Describe what each bug did and how you fixed it."
    ],
    before: {
      materials: ["Laptop or Chromebook", "A paper bug log (Bug / What I saw / What I changed)"],
      setup: [
        "Add the Fish sprite in Scratch and a water backdrop.",
        "Build this broken script for the fish (or have students build it from the board):",
        "when green flag clicked → go to x: 0 y: 0 → repeat 10 → move 100 steps → if on edge, bounce → end repeat",
        "Leave the rotation style at its default (all around)."
      ],
      prerequisites: "Stage 3: can use a repeat block."
    },
    steps: [
      "Click the green flag and watch closely. Write down everything that looks wrong.",
      "Bug 1: The fish stops. Which block makes it stop after a while? Try swapping it for \"forever.\"",
      "Bug 2: The fish jumps instead of swimming. Change \"move 100 steps\" to a smaller number and test again.",
      "Bug 3: The fish flips upside down. Find \"set rotation style\" and choose left-right.",
      "Bug 4: The fish swims too fast to see. Add \"wait 0.05 seconds\" inside the loop.",
      "Change only one thing at a time, then run it. Write each fix in your bug log.",
      "When it works, add a second fish that swims at a different speed."
    ],
    reflect: "Which bug was hardest to find? What clue finally helped you see it?",
    extend: "Plant one new bug in your working project and swap with a partner. Can they find it with only three test runs?",
    teacherNotes: [
      "Resist fixing bugs for students. Ask: \"What did you expect? What happened instead? Which block controls that?\"",
      "The bug log matters more than the finished fish. Collect it as evidence of debugging process.",
      "Some students fix two bugs at once and lose track of which change helped. Point back to \"one change, one test.\""
    ]
  },
  {
    id: "interactive-story",
    title: "Build an Interactive Story",
    area: "coding",
    summary: "Write a story where the reader chooses what happens next.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["computer"],
    source: "original",
    pathwayStage: 4,
    keywords: ["conditionals", "if then else", "story", "scratch", "choices", "branching"],
    access: {
      account: "optional",
      accountNote: "An account is only needed to save online.",
      cost: "free",
      supervision: false,
      hardware: []
    },
    launch: {
      status: "ready",
      label: "Open the Scratch editor",
      url: "https://scratch.mit.edu/projects/editor/",
      provider: "Scratch (MIT)",
      note: "Free. Works without signing in."
    },
    mission:
      "Create a short story with at least one big choice. The reader's answer decides which ending they see.",
    learn: [
      "Use an if–then–else block to make a program choose between two paths.",
      "Plan a branching story on paper before building it.",
      "Test every path, not just the one you expect readers to pick."
    ],
    before: {
      materials: ["Laptop or Chromebook per pair", "Paper for a story map"],
      setup: ["Show an example story map on the board: Start → Choice → Ending A / Ending B."],
      prerequisites: "Stage 3: can use loops. Comfortable with events and speech blocks."
    },
    steps: [
      "With your partner, draw a story map: a beginning, one choice, and two endings.",
      "In Scratch, pick a character and a backdrop for the beginning.",
      "Use \"say\" blocks to tell the first part of the story.",
      "Use \"ask ___ and wait\" for the choice, like \"Do you open the door? (yes/no).\"",
      "Add an \"if answer = yes then ... else ...\" block from Control and Operators.",
      "Inside each branch, switch backdrops and tell that ending.",
      "Test both answers. Then test an unexpected answer, like \"maybe.\" What happens?"
    ],
    reflect: "What did your program do when someone typed an answer you didn't plan for? How could you handle it?",
    extend: "Add a second choice inside one of the branches so your story has three or four endings.",
    teacherNotes: [
      "Questions in the story should be about the story world (\"Which path?\"), never about the student (name, age, school).",
      "The \"maybe\" test introduces the idea that programs need to handle unexpected input. Celebrate teams that add a \"Please type yes or no\" loop.",
      "Teams can split roles: one writes dialogue, one builds code, then switch halfway."
    ]
  },
  {
    id: "score-keeper",
    title: "Score Keeper: Catch the Stars",
    area: "coding",
    summary: "Build a catching game that counts your points and remembers your score.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer"],
    source: "original",
    pathwayStage: 5,
    keywords: ["variables", "score", "game", "scratch", "data"],
    access: {
      account: "optional",
      accountNote: "An account is only needed to save online.",
      cost: "free",
      supervision: false,
      hardware: []
    },
    launch: {
      status: "ready",
      label: "Open the Scratch editor",
      url: "https://scratch.mit.edu/projects/editor/",
      provider: "Scratch (MIT)",
      note: "Free. Works without signing in."
    },
    mission:
      "Make a game where stars fall and a player catches them. The game needs to remember how many stars you've caught.",
    learn: [
      "Create a variable and explain that it stores a value that can change.",
      "Change a variable when something happens in the program.",
      "Reset a variable at the start so every game begins fairly."
    ],
    before: {
      materials: ["Laptop or Chromebook"],
      setup: ["Open Scratch. Students will need a catcher sprite (like a bowl) and a star sprite."],
      prerequisites: "Stage 4: can use if–then blocks."
    },
    steps: [
      "Add a catcher sprite. Make it follow the mouse left and right: forever → set x to mouse x.",
      "Add a star sprite. Make it start at the top in a random spot: go to x: (pick random -200 to 200) y: 170.",
      "Make the star fall: forever → change y by -5.",
      "In Variables, click Make a Variable and name it \"score.\"",
      "Add: if touching catcher then change score by 1 and send the star back to the top.",
      "Add: if the star reaches the bottom (y < -170), send it back to the top.",
      "Play three games in a row. Does the score start at 0 each time? If not, add \"set score to 0\" when the green flag is clicked."
    ],
    reflect: "What would happen to your game if the variable didn't exist?",
    extend: "Add a second variable called \"lives\" that goes down when a star is missed. End the game when lives reach 0.",
    teacherNotes: [
      "The score that never resets is a planned bug. Let students discover it on game two.",
      "Connect to everyday variables: a scoreboard at a game, a thermometer, a bank balance.",
      "Students who finish early can make the stars speed up as the score goes up."
    ]
  },
  {
    id: "my-blocks-patterns",
    title: "Pattern Studio with My Blocks",
    area: "coding",
    summary: "Make your own drawing block, then reuse it to create a big pattern.",
    level: "advanced",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer"],
    source: "original",
    pathwayStage: 6,
    keywords: ["functions", "decomposition", "my blocks", "pen", "scratch", "geometry", "art"],
    access: {
      account: "optional",
      accountNote: "An account is only needed to save online.",
      cost: "free",
      supervision: false,
      hardware: []
    },
    launch: {
      status: "ready",
      label: "Open the Scratch editor",
      url: "https://scratch.mit.edu/projects/editor/",
      provider: "Scratch (MIT)",
      note: "Free. Works without signing in. Add the Pen extension from the bottom-left button."
    },
    mission:
      "Build a custom block that draws one shape. Then use it again and again, with different inputs, to make a complex pattern.",
    learn: [
      "Break a big drawing into smaller, reusable parts (decomposition).",
      "Create a custom block (a function) with an input like size.",
      "Explain why reusing a block makes a program easier to fix."
    ],
    before: {
      materials: ["Laptop or Chromebook"],
      setup: ["In Scratch, show students where to add the Pen extension (blue button, bottom left)."],
      prerequisites: "Stage 5: has used a variable."
    },
    steps: [
      "Add the Pen extension. Write a short script that draws a square using repeat 4: move 50, turn 90.",
      "Go to My Blocks → Make a Block. Name it \"square\" and add a number input called \"size.\"",
      "Move your square code under the new \"define square\" block. Replace 50 with the size input.",
      "Test it: erase all, pen down, square (100).",
      "Now build a pattern: repeat 12 → square (80) → turn 30 degrees.",
      "Make a second custom block for a different shape and combine them.",
      "Change the size inside just one block. Notice how the whole pattern updates."
    ],
    reflect: "If you had written every line of the pattern by hand, how many blocks would you need? Why is a custom block better?",
    extend: "Give your block a second input for color, or make a \"flower\" block that uses your \"square\" block inside it.",
    teacherNotes: [
      "Students often forget \"pen down\" or \"erase all.\" Turn that into a quick check: \"What should happen before we draw?\"",
      "Ask students to explain their custom block to a partner without showing the code. Clear names are part of good design.",
      "Projecting a few finished patterns at the end makes a strong gallery moment."
    ]
  },
  {
    id: "capstone-game",
    title: "Mission Capstone: Design Your Own Game",
    area: "coding",
    summary: "Plan, build, test, and present a game or app of your own idea.",
    level: "advanced",
    grades: ["6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer"],
    source: "original",
    pathwayStage: 7,
    keywords: ["project", "capstone", "planning", "testing", "debugging", "presentation", "scratch"],
    access: {
      account: "optional",
      accountNote: "Recommended for multi-session projects so work can be saved online. Saving to the computer also works.",
      cost: "free",
      supervision: false,
      hardware: []
    },
    launch: {
      status: "ready",
      label: "Open the Scratch editor",
      url: "https://scratch.mit.edu/projects/editor/",
      provider: "Scratch (MIT)",
      note: "Free. Works without signing in."
    },
    mission:
      "Design an original game or interactive project. You decide what it does. You'll plan it, build it, test it with a classmate, fix what they find, and explain how it works.",
    learn: [
      "Write a plan with a goal, the sprites needed, and the main events.",
      "Use at least three skills from earlier stages (loops, conditions, variables, custom blocks).",
      "Use feedback from a tester to find and fix bugs, and explain those fixes."
    ],
    before: {
      materials: ["Laptop or Chromebook", "Planning sheet: Goal / Player / Rules / Sprites / How you win"],
      setup: ["Plan for at least two sessions: one to plan and build, one to test, fix, and present."],
      prerequisites: "Stage 6: has made and reused a custom block."
    },
    steps: [
      "Plan: fill in your planning sheet. Keep the first version small.",
      "Build the smallest version that works: one player, one goal.",
      "Test it yourself. Write down three things to fix or add.",
      "Swap with a tester. They play without your help while you take notes.",
      "Fix the most important problem your tester found.",
      "Add one feature that makes your game more fun.",
      "Present: show your game and explain one bug you fixed and how you found it."
    ],
    reflect: "What changed between your plan and your finished project? Why?",
    extend: "Add a title screen, instructions, and a way to play again without clicking the green flag.",
    teacherNotes: [
      "Check plans before building starts. Most stalled projects began too big.",
      "Use the \"I can\" statement for Stage 7 as the assessment: plan, build, test, debug, and explain.",
      "Presentations can be quick (60–90 seconds) or recorded as a short screen walkthrough."
    ]
  },

  {
    id: "fix-the-recipe",
    title: "Bug Hunt: Fix the Sandwich Algorithm",
    area: "coding",
    summary: "A set of sandwich instructions has bugs. Follow them exactly and find what's wrong.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 20,
    format: "teacher-led",
    equipment: ["unplugged"],
    source: "original",
    pathwayStage: 1,
    keywords: ["debugging", "algorithm", "sequence", "unplugged", "instructions", "bugs"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "The teacher is a robot chef who follows instructions exactly as written. The class's sandwich algorithm has bugs. Find them and fix them so the robot can make the sandwich.",
    learn: [
      "Explain that a computer follows instructions exactly, even when they're wrong.",
      "Find bugs: steps that are missing, out of order, or unclear.",
      "Rewrite a step so it is precise."
    ],
    before: {
      materials: [
        "Bread, a spreadable topping (or paper cutouts of bread and a paper \"spread\"), a butter knife, and a plate",
        "Board or chart paper"
      ],
      setup: [
        "Write this buggy algorithm on the board: 1. Put the spread on the bread. 2. Put the bread together. 3. Open the bread bag. 4. Eat the sandwich.",
        "Check for food allergies before using real food, or use paper props."
      ],
      prerequisites: "None."
    },
    steps: [
      "Read the algorithm aloud. The teacher-robot follows step 1 exactly (for example, sets the whole jar on the bag of bread).",
      "Students say \"Bug!\" when something goes wrong. Ask: which step caused it?",
      "Classify the bug: missing step, wrong order, or unclear step.",
      "Students rewrite the step to be more precise.",
      "Run the algorithm again from the start with the fix.",
      "Keep going until the robot makes the sandwich."
    ],
    reflect: "Why does the robot need more detail than a person would?",
    extend: "Write a bug-free algorithm for another everyday task, like brushing teeth, and test it on a partner.",
    teacherNotes: [
      "Ham it up. The more literally you follow the steps, the clearer the idea becomes.",
      "Use paper props in classrooms with food restrictions; it works just as well.",
      "This is a strong 20-minute opener before any coding stage."
    ]
  },

  /* ───────────────────────────── Virtual Reality ───────────────────────────── */
  {
    id: "ecosystem-field-trip",
    title: "Explore a Virtual Ecosystem",
    area: "vr",
    summary: "Fly to a rainforest, a reef, or a desert and record what lives there.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "teacher-led",
    equipment: ["computer", "projector", "vr"],
    source: "original",
    keywords: ["ecosystem", "field trip", "google earth", "habitat", "observation", "biome"],
    access: {
      account: "none",
      cost: "free",
      supervision: true,
      hardware: ["Google Earth runs in Chrome on laptops and Chromebooks", "VR headset optional"]
    },
    launch: {
      status: "ready",
      label: "Open Google Earth",
      url: "https://earth.google.com/web/",
      provider: "Google Earth",
      note: "Free. No account needed. Works best in Chrome. This is the non-headset version; a headset experience hasn't been chosen yet."
    },
    vr: {
      setup: [
        "A headset version of this trip hasn't been selected yet. Until it is, run the activity on laptops or the projector with Google Earth.",
        "If you have headsets, charge them the day before and check that each one opens to a home screen without asking for a sign-in.",
        "Plan for no more than 10–15 minutes in a headset at a time. Have students sit or stand clear of furniture."
      ],
      nonHeadset:
        "Everyone can take part on a laptop, Chromebook, or the projector. Students drag to look around and use the search box to fly to each place."
    },
    mission:
      "You're a field scientist visiting a new ecosystem. Collect at least five observations that describe how living things there survive.",
    learn: [
      "Describe an ecosystem using observations, not guesses.",
      "Compare two ecosystems using evidence you saw.",
      "Ask a question that a scientist could investigate."
    ],
    before: {
      materials: ["Observation log: I see / I think / I wonder", "Pencils"],
      setup: [
        "Pick 2–3 places ahead of time, such as the Amazon Rainforest, the Sahara Desert, and the Great Barrier Reef.",
        "Test that Google Earth loads on the classroom network."
      ],
      prerequisites: "None."
    },
    steps: [
      "Look at the first place for one full minute without talking. Just observe.",
      "Write three \"I see\" observations: plants, land, water, color, light.",
      "Write one \"I think\" statement about how something survives there.",
      "Fly to the second place and repeat.",
      "With a partner, compare: What's different? What's the same?",
      "Write one \"I wonder\" question you'd want to investigate."
    ],
    reflect: "What's one thing you noticed that you would have missed in a photo?",
    extend: "Choose an animal that lives in one of your ecosystems. Using your observations, explain which features help it survive there.",
    teacherNotes: [
      "Model the difference between an observation (\"tall trees with big leaves\") and an inference (\"it rains a lot\").",
      "On the projector, let students take turns as the \"pilot\" who controls the view.",
      "Keep the search box teacher-controlled for younger students so the trip stays on course.",
      "Google Earth's menus have changed and now include \"Ask Google Earth,\" an AI search. Decide before class whether students may use it. If they do, treat its answers as claims to check against what students can see. Run through your route once on your classroom device, since button names may differ from these steps."
    ]
  },
  {
    id: "notice-and-wonder-360",
    title: "360° Notice & Wonder Challenge",
    area: "vr",
    summary: "Look all around a 360° scene and find details your classmates missed.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 30,
    format: "teacher-led",
    equipment: ["vr", "projector"],
    source: "original",
    keywords: ["360", "observation", "notice", "wonder", "headset"],
    access: {
      account: "none",
      cost: "free",
      supervision: true,
      hardware: ["VR headset or a projector that can show a 360° scene"]
    },
    launch: {
      status: "coming-soon",
      note: "A 360° scene for this challenge hasn't been chosen yet. Teachers can run it now with any 360° image or video the program already uses."
    },
    vr: {
      setup: [
        "Load the 360° scene on each headset before class so students don't need to navigate menus.",
        "Set a timer for 3–4 minutes per headset turn.",
        "Pair each headset user with a recorder who writes down what they call out."
      ],
      nonHeadset:
        "Project the 360° scene and let students direct the view (\"look left, look up\"). Recorders and spotters participate fully without a headset."
    },
    mission:
      "Find as many details as you can in a 360° scene. Points go to details no one else noticed.",
    learn: [
      "Make careful, specific observations.",
      "Use position words (above, behind, to the left of) to describe where something is.",
      "Turn an observation into a question."
    ],
    before: {
      materials: ["Recorder sheet with three columns: Detail / Where / Question"],
      setup: ["Choose a scene rich in detail: a market, a museum hall, a coral reef, or a city street."],
      prerequisites: "None."
    },
    steps: [
      "Spotter (headset or projector) looks around and calls out details.",
      "Recorder writes each detail and where it is.",
      "After 3 minutes, switch roles.",
      "As a class, share details. Cross off any that another team also found.",
      "Teams with unique details explain exactly where to look so others can find them.",
      "Each student writes one question the scene made them wonder about."
    ],
    reflect: "How did describing exactly where something was help other people see it?",
    extend: "Sketch a map of the scene from above, placing your details in the right spots.",
    teacherNotes: [
      "Headsets: students who feel dizzy should remove the headset and switch to the recorder role. No one needs to wear a headset to participate.",
      "Projected version works well for the whole class at once and needs no headsets.",
      "This activity is labeled \"Resource coming soon\" until the program selects a 360° scene."
    ]
  },

  /* ───────────────────────────── Artificial Intelligence ───────────────────────────── */
  {
    id: "how-ai-sorts",
    pilot: true,
    time: { prep: 15, core: [15, 20], verified: false },
    stopAt: "Your team has sorted the test pile and talked about one card your rule got wrong. Retraining (step 6) is bonus.",
    check: "Your team explains one card your rule got wrong, or one card that was hard to label, using the class's definition of fruit.",
    stuck: ["Use only your rule, not what you already know about food.", "A card that doesn't fit your rule is a clue your rule needs work.", "Ask: what do the fruit cards in the training pile have in common?"],
    next: "blueberry-sorter",
    title: "How Does an AI Sort?",
    area: "ai",
    summary: "Be the computer: learn a sorting rule from examples, then test it on new ones.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 30,
    format: "teacher-led",
    equipment: ["unplugged"],
    source: "original",
    keywords: ["training data", "examples", "classification", "patterns", "unplugged"],
    access: { account: "none", cost: "free", supervision: true, hardware: [] },
    launch: { status: "none" },
    mission:
      "Your team is a computer that has never seen a fruit before. Learn to sort fruit only from the examples you're given, then see how well you do on new ones.",
    learn: [
      "Explain that AI learns patterns from training examples.",
      "Predict a label for something new based on those patterns.",
      "Notice how missing or unusual examples lead to mistakes."
    ],
    before: {
      materials: [
        "Picture cards of fruits and vegetables (print or draw 20–24)",
        "Two labels: \"Fruit\" and \"Not fruit\""
      ],
      setup: [
        "Make a training pile of 10 cards that are all common and clearly labeled (apple, banana, carrot, lettuce…).",
        "Keep a test pile with some tricky ones: tomato, cucumber, pepper, pumpkin."
      ],
      prerequisites: "None."
    },
    steps: [
      "Give each team the training pile with labels. Teams look for a rule: \"Fruit is sweet,\" \"Fruit is round.\"",
      "Teams write down their rule. That's their \"model.\"",
      "Show one test card at a time. Teams use only their rule to predict: Fruit or Not fruit?",
      "Reveal the answer. Keep score of correct predictions.",
      "Talk about the misses: Why did the tomato fool most teams?",
      "Add the tricky cards to the training pile and let teams update their rule."
    ],
    reflect: "How did adding more examples change your rule? What does that tell you about how AI learns?",
    extend: "Design a test card that you think would trick every team's model. Explain why.",
    teacherNotes: [
      "Before class, decide which definition of fruit you'll use. In plant science, tomatoes and cucumbers are fruit; in cooking they're vegetables. Tell students the definition, or make the disagreement part of the lesson.",
      "Connect explicitly: the training pile is \"training data,\" the rule is the \"model,\" and the test cards are new inputs.",
      "There's no single correct rule. The goal is noticing that a model is only as good as its examples.",
      "Use foods or objects, never photos of classmates."
    ]
  },
  {
    id: "teachable-machine-classroom",
    title: "Train a Classroom Model",
    area: "ai",
    summary: "Teach a computer to tell three objects apart using your webcam.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "teacher-led",
    equipment: ["computer", "projector"],
    source: "original",
    keywords: ["teachable machine", "training", "machine learning", "webcam", "classification", "model"],
    access: {
      account: "none",
      accountNote: "Not needed to train or test. Do not save projects to Google Drive with student accounts.",
      cost: "free",
      supervision: true,
      hardware: ["Teacher laptop with a webcam, connected to the projector"]
    },
    launch: {
      status: "ready",
      label: "Open Teachable Machine",
      url: "https://teachablemachine.withgoogle.com/",
      provider: "Google Teachable Machine",
      note: "Free. Choose Get Started → Image Project → Standard image model. Google says training happens in the browser on your device."
    },
    mission:
      "As a class, train a model to recognize three classroom objects. Then try to find where it goes wrong and figure out why.",
    learn: [
      "Collect training examples and explain why variety matters.",
      "Describe a prediction and its confidence level in plain words.",
      "Identify a limitation of the model and suggest how to improve it."
    ],
    before: {
      materials: ["Three distinct objects (e.g., a pencil, a book, a water bottle)", "Projector"],
      setup: [
        "Run this from the teacher computer only, displayed on the projector.",
        "Point the webcam at a desk area, not at students' faces. Turn the camera off when done."
      ],
      prerequisites: "\"How Does an AI Sort?\" or a similar introduction to training examples is helpful."
    },
    steps: [
      "Open Teachable Machine and start an Image Project. Name three classes after your objects.",
      "Hold up object 1 and record about 50 images. Ask students: should we move it around? Why?",
      "Record the other two objects the same way.",
      "Click Train Model and wait.",
      "Test: hold up each object. Read the confidence bars aloud.",
      "Now try something the model has never seen, like a hand or a stapler. What does it predict?",
      "Discuss why it guessed that, then add better examples and retrain."
    ],
    reflect: "The model always picks one of your three classes, even for things it's never seen. Why could that be a problem in real life?",
    extend: "Add a fourth class called \"nothing\" with images of an empty desk. Does that fix the wrong guesses?",
    teacherNotes: [
      "Keep the camera on objects, not people. Avoid training on students' faces or bodies.",
      "No student logins or personal information are needed. If a save prompt appears, skip it.",
      "Students will want to trick the model. Channel it: each trick is a test case that reveals a limitation.",
      "Teachable Machine's FAQ says samples aren't sent to any servers unless you save to Google Drive, and training runs in the browser tab. Re-check current terms with your district before use."
    ]
  },
  {
    id: "ai-secret-signals",
    title: "Teach the Computer Your Secret Signals",
    area: "ai",
    summary: "Train Teachable Machine to recognize two hand signals for a space station's contact-free controls. Test it with new examples, find where it fails, add better data, and compare.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["computer", "webcam"],
    source: "original",
    keywords: ["teachable machine", "training data", "test data", "image classification", "machine learning", "hand signals", "space", "variety", "retrain"],
    access: {
      account: "none",
      accountNote: "Teachable Machine's FAQ says no account or login is needed. Students should not save to Drive, upload, or export.",
      cost: "free",
      supervision: true,
      hardware: ["Laptop or Chromebook with a webcam (one per pair)", "A sheet of plain paper as a background"]
    },
    launch: {
      status: "ready",
      label: "Open Teachable Machine",
      url: "https://teachablemachine.withgoogle.com/",
      provider: "Google Teachable Machine",
      note: "Free. Get Started → Image Project → Standard image model. Full student mission, low-reading version, test table, and teacher guide are in the STEM 207 repo under missions/ai/secret-signals."
    },
    mission: "You're designing a contact-free control system for a space station. Can you train a computer to recognize two secret hand signals, and recognize when neither signal is present?",
    learn: [
      "Explain the difference between training examples and new test examples.",
      "Show how changing the training data changes the model's predictions.",
      "Describe a prediction score as a model output, not a guarantee or proof of understanding."
    ],
    before: {
      materials: ["Device with a webcam per pair", "Plain paper or a plain wall for a background", "Printed test table (one per pair)"],
      setup: [
        "Teacher setup, about 20 minutes: test Teachable Machine on a student device (the FAQ doesn't list supported devices), check camera permissions, and confirm your district allows webcam use.",
        "Frame only hands and a plain background. Keep faces and names out of the camera.",
        "Camera not suitable? Use the classroom-objects version: two objects plus an empty background, or teacher-taken object photos with Upload.",
        "Plan one session. Closing the tab erases the project, and saving would store students' hand images."
      ],
      prerequisites: "None. \"How Does an AI Sort?\" or Train a Classroom Model makes a good lead-in."
    },
    steps: [
      "Get Started → Image Project → Standard image model. Name classes Open hand and Closed fist, then Add a class: No signal.",
      "Click Webcam. Use Hold to Record in short 1-second bursts, in one spot. Keep the classes about the same size.",
      "Click Train Model. Predict what it will say for a new hand position.",
      "In Preview (Input ON), test each class live with new examples. Record results in the test table.",
      "Change one thing: hand angle, distance, or background. Test again and note any mistake.",
      "Add varied examples to every class, keep them balanced, and click Train Model again.",
      "Repeat the same tests and compare Round 1 with Round 2.",
      "Challenge: fix a position it struggled with. Record what failed, what you added, what happened, and one limitation. Close the tab."
    ],
    reflect: "Your detector showed a high score but was wrong. What does a score really tell you, and why do new test examples matter more than the pictures you trained on?",
    extend: "With permission, test with a partner's hand before adding it to training. Who might a model like this work worse for, and how would a team check?",
    teacherNotes: [
      "Learning goal: training examples are what the model learns from; test examples are new ones it has never seen, like the live webcam image in Preview.",
      "Hold to Record captures 24 frames per second by default, so a long hold adds many nearly identical pictures. Short bursts from different positions give more variety.",
      "Scores are model outputs, not guarantees. The model always picks one of its classes, even for something new like a thumbs-up.",
      "Privacy (official FAQ): no account needed; samples aren't sent to servers unless saved to Drive; closing the tab without saving keeps nothing. Uploading a model publishes it to Google servers, so students should never upload or export.",
      "Not confirmed in official docs: supported browsers and devices, and age or district terms. Test on your devices and check policy first.",
      "A perfect detector isn't required. A clear before-and-after record and one limitation complete the mission.",
      "Full materials: missions/ai/secret-signals in the STEM 207 repo (student mission, low-reading version, teacher guide, test table, hints and extension)."
    ]
  },
  {
    id: "ai-for-oceans",
    title: "Clean the Ocean with AI",
    area: "ai",
    summary: "Train an AI to spot fish and trash, then see how your training changes its choices.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "teacher-led",
    equipment: ["computer"],
    source: "original",
    keywords: ["code.org", "ai for oceans", "training data", "bias", "machine learning"],
    access: {
      account: "optional",
      accountNote: "Not required to play. A Code.org teacher section is only needed to track progress.",
      cost: "free",
      supervision: true,
      hardware: []
    },
    launch: {
      status: "ready",
      label: "Open AI for Oceans",
      url: "https://code.org/oceans",
      provider: "Code.org",
      note: "Free. Opens the first lesson with a short video."
    },
    mission:
      "Help an AI robot learn which objects belong in the ocean and which are trash. Then teach it something harder and see what it learns from you.",
    learn: [
      "Label training data and explain how it shapes the AI's decisions.",
      "Notice when an AI makes a choice based on your examples, not on what's true.",
      "Talk about why the people who train an AI are responsible for what it learns."
    ],
    before: {
      materials: ["Laptop or Chromebook per student or pair", "Headphones for the videos"],
      setup: ["Watch the first video together on the projector before students start."],
      prerequisites: "None. Pairs well after \"How Does an AI Sort?\""
    },
    steps: [
      "Watch the opening video as a class.",
      "Label fish and trash to train the robot. Then run it and watch its choices.",
      "Continue through the levels. Read each instruction carefully.",
      "When the activity asks you to train on words like \"angry\" or \"delicious,\" pause.",
      "With a partner, compare: did your AI make the same choices as theirs? Why or why not?",
      "As a class, discuss what happened when people trained on opinions."
    ],
    reflect: "If two people train the same AI with different examples, can both AIs be \"right\"?",
    extend: "Write a short list of rules for people who train AI. What should they check before they share it?",
    teacherNotes: [
      "Stop the class at the opinion-based levels for a whole-group discussion. That's where the big idea lives.",
      "Younger students may need a partner who reads instructions aloud.",
      "The activity does not ask students for personal information."
    ]
  },
  {
    id: "ai-limits-detectives",
    title: "AI Detectives: When Is the Computer Wrong?",
    area: "ai",
    summary: "Investigate made-up AI mistakes and decide who should fix them.",
    level: "advanced",
    grades: ["6-8"],
    duration: 30,
    format: "teacher-led",
    equipment: ["unplugged"],
    source: "original",
    keywords: ["responsible ai", "limitations", "bias", "ethics", "discussion"],
    access: { account: "none", cost: "free", supervision: true, hardware: [] },
    launch: { status: "none" },
    mission:
      "Each case file describes an AI that made a mistake. Your detective team will figure out what went wrong and recommend a fix.",
    learn: [
      "Trace an AI error back to its training examples.",
      "Explain why an AI can sound confident and still be wrong.",
      "Recommend a responsible way to check or improve an AI system."
    ],
    before: {
      materials: ["Case cards (below), one per team", "Chart paper"],
      setup: [
        "Case 1: A plant-ID app trained only on photos taken in sunny gardens often fails on photos taken indoors.",
        "Case 2: A homework helper chatbot gives a confident answer about a historical date that is wrong.",
        "Case 3: A cafeteria app trained on last year's orders recommends pizza to everyone, even students who don't eat cheese.",
        "Case 4: A voice assistant struggles with some accents because it heard few examples of them during training."
      ],
      prerequisites: "At least one earlier AI activity, such as \"Train a Classroom Model.\""
    },
    steps: [
      "Each team reads one case.",
      "Answer: What did the AI do wrong? Who might be affected?",
      "Answer: What about its training could explain the mistake?",
      "Propose one fix (better examples, a human check, a warning label).",
      "Share with the class in one minute.",
      "As a class, write three rules for using AI tools responsibly at school."
    ],
    reflect: "When an AI tool gives you an answer, how can you check whether it's right?",
    extend: "Find an AI feature you use (like autocomplete). Describe one way it might be wrong and how you'd notice.",
    teacherNotes: [
      "These cases are fictional and written for this lesson. They describe common real-world issues without naming products.",
      "Keep the focus on systems and training data, not on blaming users.",
      "The class rules make a useful poster for the room."
    ]
  },

  {
    id: "pattern-predictors",
    pilot: true,
    time: { prep: 5, core: [10, 20], verified: false },
    stopAt: "The class has finished “I like to eat ___.” The fool-the-class extension is bonus.",
    check: "Explain one prediction that was likely but not certain, and why it could still be wrong.",
    stuck: ["Say the pattern out loud.", "Ask: what happened every time before?", "More than one answer can make sense."],
    next: "how-ai-sorts",
    title: "Pattern Predictors",
    area: "ai",
    summary: "Guess what comes next, then find out how computers make the same kind of guess.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 20,
    format: "teacher-led",
    equipment: ["unplugged"],
    source: "original",
    keywords: ["prediction", "patterns", "autocomplete", "ai", "unplugged"],
    access: { account: "none", cost: "free", supervision: true, hardware: [] },
    launch: { status: "none" },
    mission:
      "Predict the next item in a series of patterns. Some are easy. Some are tricky. Then compare your thinking to how an AI predicts the next word in a sentence.",
    learn: [
      "Make a prediction based on a pattern.",
      "Explain that AI makes predictions from patterns in examples it has seen.",
      "Describe why a prediction can be likely but still wrong."
    ],
    before: {
      materials: ["Board or chart paper"],
      setup: [
        "Prepare four patterns: 2, 4, 6, 8, __ · red, blue, red, blue, __ · Mon, Tue, Wed, __ · \"Once upon a ___\""
      ],
      prerequisites: "None."
    },
    steps: [
      "Show the first pattern. Students write or call out their prediction.",
      "Ask: How sure are you? Show with fingers, 1 (guessing) to 5 (certain).",
      "Repeat for each pattern.",
      "On \"Once upon a ___,\" collect several answers. Most will say \"time.\" Why?",
      "Explain: AI tools that suggest words do this too. They predict what usually comes next, based on lots of examples.",
      "Try a pattern with two good answers, like \"I like to eat ___.\" Is any prediction wrong?"
    ],
    reflect: "When a computer finishes your sentence, is it guessing what you mean or what most people would say?",
    extend: "Make up a pattern that looks like it goes one way but actually goes another. Can you fool the class?",
    teacherNotes: [
      "Keep \"I like to eat ___\" answers about food. Don't ask students to share personal details.",
      "Older students can discuss why a prediction tool might repeat stereotypes it saw in its examples.",
      "Pairs well with \"How Does an AI Sort?\""
    ]
  },

  /* ───────────────────────────── Engineering & Robotics ───────────────────────────── */
  {
    id: "paper-bridge",
    title: "Paper Bridge Challenge",
    area: "engineering",
    summary: "Build a bridge from paper and tape that holds as many coins as possible.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["building", "unplugged"],
    source: "original",
    keywords: ["bridge", "design challenge", "engineering design", "testing", "iteration", "structures"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Design a bridge that spans a 20 cm gap between two stacks of books, using only paper and tape. Test it with coins, improve it, and test again.",
    learn: [
      "Use the engineering design process: plan, build, test, improve.",
      "Explain how shape (folds, tubes, arches) changes strength.",
      "Record test results and use them to make a design decision."
    ],
    before: {
      materials: [
        "5 sheets of printer paper per team",
        "30 cm of tape per team",
        "Two equal stacks of books, 20 cm apart",
        "A cup and a pile of coins or washers",
        "Ruler"
      ],
      setup: ["Set up one test station per 2–3 teams."],
      prerequisites: "None."
    },
    steps: [
      "Test a flat sheet of paper across the gap with the cup on it. How many coins does it hold? (Probably very few.)",
      "Plan: sketch two bridge ideas. Circle the one you'll try first.",
      "Build Version 1 in 10 minutes.",
      "Test: place the cup in the middle and add coins one at a time. Record the number just before it fails.",
      "Look at how it failed: did it bend, slide, or tear?",
      "Improve: make one change based on how it failed. Build Version 2.",
      "Test again and record the result. Did your change help?"
    ],
    reflect: "What change made the biggest difference, and why do you think it worked?",
    extend: "Rebuild using only 3 sheets of paper. Can you match your best score with fewer materials?",
    teacherNotes: [
      "Grades 2–3: allow 6 sheets and focus on fold vs. no fold. Grades 6–8: add a budget (each sheet costs $10, tape $1/cm) and compare strength per dollar.",
      "Folded accordions, rolled tubes, and stacked layers usually do well. Let students discover this rather than showing them.",
      "Record all team results on the board. Patterns across teams make strong evidence."
    ]
  },
  {
    id: "sense-think-act",
    title: "Sense–Think–Act: Human Robot Game",
    area: "engineering",
    summary: "Act out how a robot senses the world, decides, and moves.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 20,
    format: "teacher-led",
    equipment: ["unplugged"],
    source: "original",
    keywords: ["robots", "sensors", "robot behavior", "if then", "unplugged", "game"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Become a robot that follows behavior rules. You can only react to what your \"sensors\" tell you.",
    learn: [
      "Describe the robot loop: sense, think, act.",
      "Write a robot behavior as an if–then rule.",
      "Notice what happens when two rules conflict."
    ],
    before: {
      materials: ["Open floor space", "Colored paper squares (red, green, yellow)"],
      setup: ["Write the first rule on the board: IF you see green, THEN walk. IF you see red, THEN stop."],
      prerequisites: "None."
    },
    steps: [
      "Volunteers are \"robots.\" Their sensor is their eyes, and they may only react to the colored cards.",
      "The teacher holds up colors. Robots follow the rule.",
      "Add a rule: IF you see yellow, THEN turn around.",
      "Add a touch sensor: IF someone taps your shoulder, THEN freeze.",
      "Try a conflict: hold up green while tapping a shoulder. What should the robot do?",
      "As a class, decide which rule wins and write it down. That's a robot priority."
    ],
    reflect: "Why do robot designers need to decide which rule wins when two happen at once?",
    extend: "Invent a robot for a real job, like cleaning the classroom. Write three sense–think–act rules for it.",
    teacherNotes: [
      "Use this as a warm-up before any robotics kit lesson.",
      "Students who prefer not to move can be the \"programmers\" who write new rules.",
      "Connect to conditionals in the coding pathway (Stage 4)."
    ]
  },
  {
    id: "marble-run-iteration",
    title: "Marble Run Iteration Lab",
    area: "engineering",
    summary: "Build a marble run that takes as close to 10 seconds as you can get.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["building", "unplugged"],
    source: "original",
    keywords: ["iteration", "design", "testing", "marble run", "timing", "data"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Design a marble run on a wall or a cardboard panel. The goal isn't speed: the marble should take as close to exactly 10 seconds as possible.",
    learn: [
      "Make one change at a time and measure its effect.",
      "Use data from repeated trials to make a decision.",
      "Explain how slope and path length affect time."
    ],
    before: {
      materials: [
        "Cardboard panel or wall space",
        "Paper tubes, cut paper towel rolls, or folded cardstock",
        "Masking tape",
        "A marble",
        "Stopwatch or timer"
      ],
      setup: ["Give each team a panel and a materials tray. Post the 10-second target on the board."],
      prerequisites: "Comfortable with the basic design cycle (e.g., the Paper Bridge Challenge)."
    },
    steps: [
      "Build a simple first run with at least three pieces.",
      "Time it three times. Record each time and the average.",
      "Decide: too fast or too slow? Pick one change (steeper, flatter, longer, a switchback).",
      "Make only that change, then time three more runs.",
      "Repeat until your average is within 1 second of 10.",
      "Record every version in a table: Version / Change / Average time."
    ],
    reflect: "Why did you time each version three times instead of once?",
    extend: "Add a section where the marble must change direction at least four times while still hitting 10 seconds.",
    teacherNotes: [
      "The 10-second target pushes students to control variables instead of just building bigger.",
      "Older students can graph Version vs. Average time to show convergence.",
      "If marbles go missing, a shallow box at the bottom of each run saves time."
    ]
  },

  /* ───────────────────────────── Science & Discovery ───────────────────────────── */
  {
    id: "sink-or-float",
    title: "Sink or Float: Predict, Test, Explain",
    area: "science",
    summary: "Predict which objects will float, test them, and explain the surprises.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 30,
    format: "collaborative",
    equipment: ["science", "unplugged"],
    source: "original",
    keywords: ["prediction", "experiment", "density", "evidence", "water"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Test ten everyday objects. Before each test, make a prediction. After, use what you saw to explain why.",
    learn: [
      "Make a prediction and give a reason for it.",
      "Record observations accurately, even when they surprise you.",
      "Use evidence to revise an idea."
    ],
    before: {
      materials: [
        "A tub of water per team and towels",
        "10 objects: coin, cork, crayon, apple, paper clip, foil (flat), foil (crumpled into a ball), plastic spoon, wooden block, eraser",
        "Prediction chart: Object / Predict / Result / Surprise?"
      ],
      setup: ["Set up tubs on tables with towels underneath."],
      prerequisites: "None."
    },
    steps: [
      "For each object, write your prediction (sink or float) and one reason.",
      "Gently place the object in the water. Don't drop or push it.",
      "Record what happened.",
      "Put a star next to any surprise.",
      "Compare flat foil and crumpled foil. Same material, different result?",
      "With your team, write one rule that explains most of your results."
    ],
    reflect: "Which result surprised you most? How did it change your thinking?",
    extend: "Make a ball of clay sink. Now reshape the same clay so it floats. What did you change?",
    teacherNotes: [
      "Size and weight are common misconceptions (\"big things sink\"). The apple and the paper clip challenge that idea.",
      "Grades 4–5 can be introduced to the word density after they've built their own rule.",
      "Celebrate wrong predictions. They're where the learning happens."
    ]
  },
  {
    id: "paper-helicopter",
    title: "Paper Helicopter Investigation",
    area: "science",
    summary: "Change one thing about a paper helicopter and measure how it falls.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["science", "unplugged"],
    source: "original",
    keywords: ["variables", "fair test", "experiment", "data", "evidence", "air resistance"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Find out how wing length affects how long a paper helicopter takes to fall. Run a fair test and use your data to make a claim.",
    learn: [
      "Identify the variable you change, the one you measure, and the ones you keep the same.",
      "Repeat trials and use an average.",
      "Write a claim supported by evidence."
    ],
    before: {
      materials: [
        "Paper strips (about 5 cm × 20 cm)",
        "Scissors and paper clips",
        "Stopwatch or timer",
        "Data table: Wing length / Trial 1 / Trial 2 / Trial 3 / Average"
      ],
      setup: [
        "To make a helicopter: cut a strip down the middle from the top to halfway. Fold the two halves in opposite directions for wings. Fold the bottom up and add a paper clip.",
        "Pick a drop spot about 2 meters high (a teacher standing on the floor with arm raised works)."
      ],
      prerequisites: "Experience making predictions, such as Sink or Float."
    },
    steps: [
      "Make three helicopters with wing lengths of 4 cm, 7 cm, and 10 cm. Everything else stays the same.",
      "Predict: which will take longest to fall? Why?",
      "Drop each one from the same height. Time each drop.",
      "Repeat three times for each helicopter.",
      "Calculate the average time for each wing length.",
      "Write a claim: \"Longer wings make the helicopter fall ___ because our data shows ___.\""
    ],
    reflect: "What did you do to keep your test fair? What could have made it unfair?",
    extend: "Choose a different variable to test, like paper type or number of paper clips. Plan a fair test for it.",
    teacherNotes: [
      "Grades 4–5 can skip averaging and use the middle time of three trials instead.",
      "Grades 6–8 can graph wing length vs. fall time and discuss whether the pattern continues.",
      "Common fairness problems: different drop heights, throwing instead of dropping, and different timers."
    ]
  },

  {
    id: "melting-race",
    title: "Ice Melt Race",
    area: "science",
    summary: "Put ice cubes on different materials and predict which one melts first.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 20,
    format: "collaborative",
    equipment: ["science", "unplugged"],
    source: "original",
    keywords: ["heat", "conduction", "prediction", "observation", "materials", "ice"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Four ice cubes, four materials, one race. Predict which ice cube melts fastest, watch closely, and use what you see to explain why.",
    learn: [
      "Make a prediction and explain your reasoning.",
      "Record observations at regular times.",
      "Use evidence to explain how materials move heat differently."
    ],
    before: {
      materials: [
        "4 same-size ice cubes per team",
        "4 surfaces: metal (a spoon or baking tray), plastic, wood, and foam or cloth",
        "Paper towels and a timer"
      ],
      setup: ["Keep ice in a cooler until the moment teams start so every cube begins the same."],
      prerequisites: "None."
    },
    steps: [
      "Touch each surface. Which feels coldest? Write it down.",
      "Predict which ice cube will melt first and which will melt last.",
      "Place one ice cube on each surface at the same moment. Start the timer.",
      "Every 3 minutes, record what each cube looks like.",
      "After 15 minutes, rank the cubes from most melted to least melted.",
      "Compare to your prediction. Was the coldest-feeling surface the slowest?"
    ],
    reflect: "The metal felt coldest, but its ice cube melted fastest. How can both be true?",
    extend: "Design a container that keeps an ice cube frozen as long as possible using classroom materials.",
    teacherNotes: [
      "The surprise is the lesson: metal feels cold because it pulls heat from your hand quickly, and it moves heat into the ice quickly too.",
      "Grades 6–8 can use the terms conductor and insulator and graph melt over time.",
      "Use trays to catch water near devices."
    ]
  },

  /* ───────────────────────────── Creative STEM ───────────────────────────── */
  {
    id: "pixel-art-code",
    title: "Pixel Art Code",
    area: "creative",
    summary: "Turn a picture into a secret code, then trade codes and draw each other's art.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 20,
    format: "independent",
    equipment: ["unplugged", "art"],
    source: "original",
    keywords: ["pixels", "digital art", "encoding", "grid", "unplugged", "data"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Computers store pictures as tiny squares called pixels. Draw a picture on a grid, write it as a code, and see if a classmate can rebuild it exactly.",
    learn: [
      "Explain that digital pictures are made of pixels.",
      "Represent a picture as a set of instructions (an encoding).",
      "Check that a code is precise enough for someone else to follow."
    ],
    before: {
      materials: ["8 × 8 grid paper (two per student)", "Pencils and one or two markers"],
      setup: [
        "Show an example on the board: row 1 = W W B B B B W W (W = white, B = black)."
      ],
      prerequisites: "None."
    },
    steps: [
      "On your first grid, color squares to make a simple picture: a heart, a face, a rocket.",
      "Under the grid, write each row as letters: W for blank, B for colored.",
      "Fold your picture out of sight. Give only the code to a partner.",
      "Your partner colors a blank grid using only the code.",
      "Unfold and compare. Do they match? If not, find the row where it went wrong.",
      "Fix your code or your partner's drawing until they match."
    ],
    reflect: "If a single letter in your code was wrong, how would the picture change?",
    extend: "Shorten your code: instead of W W B B B B W W, write 2W 4B 2W. Is it still easy to follow?",
    teacherNotes: [
      "The shorter code in the extension is called run-length encoding, a real compression idea.",
      "Add a third letter for a second color to increase the challenge.",
      "Connects to the coding pathway's focus on precise instructions (Stage 1)."
    ]
  },
  {
    id: "animate-your-name",
    title: "Animate Your Initials",
    area: "creative",
    summary: "Make each letter of your initials move, spin, or change color.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 30,
    format: "independent",
    equipment: ["computer"],
    source: "original",
    keywords: ["animation", "scratch", "letters", "creative coding", "digital art"],
    access: {
      account: "optional",
      accountNote: "An account is only needed to save online.",
      cost: "free",
      supervision: false,
      hardware: []
    },
    launch: {
      status: "ready",
      label: "Open the Scratch editor",
      url: "https://scratch.mit.edu/projects/editor/",
      provider: "Scratch (MIT)",
      note: "Free. Works without signing in."
    },
    mission:
      "Bring letters to life. Each letter of your initials gets its own animation when it's clicked.",
    learn: [
      "Use sprites and events to make an interactive animation.",
      "Combine motion, looks, and sound blocks creatively.",
      "Choose animations that express an idea or a feeling."
    ],
    before: {
      materials: ["Laptop or Chromebook", "Headphones (optional)"],
      setup: ["Show where letter sprites live: Choose a Sprite → Letters."],
      prerequisites: "None. A first Scratch activity like the Event Party helps."
    },
    steps: [
      "Delete the cat. Add a letter sprite for each of your initials (2 or 3 letters).",
      "Pick a backdrop.",
      "For the first letter, add \"when this sprite clicked\" and make it spin.",
      "For the second letter, make it change color 10 times.",
      "For the third, make it grow and then shrink back.",
      "Test each letter. Adjust speeds until it looks the way you want."
    ],
    reflect: "How did you pick an animation that matched each letter?",
    extend: "Use the green flag to play all the animations together like a short title sequence.",
    teacherNotes: [
      "Students can use initials, a favorite word, or a made-up word if they'd prefer not to use their own name.",
      "A quick gallery walk at the end lets students borrow ideas from each other.",
      "Good entry point for grades 6–8 who are new to Scratch."
    ]
  },
  {
    id: "stop-motion-studio",
    title: "Stop-Motion Story Studio",
    area: "creative",
    summary: "Make a short movie by taking photos of tiny changes, one frame at a time.",
    level: "intermediate",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["tablet", "art"],
    source: "original",
    keywords: ["stop motion", "animation", "storytelling", "frames", "video", "tablet"],
    access: {
      account: "none",
      cost: "free",
      supervision: false,
      hardware: ["Tablet with a camera, plus a way to keep it still"]
    },
    launch: {
      status: "coming-soon",
      note: "A stop-motion app hasn't been chosen yet. Until then, take photos with the tablet's camera and play them back quickly in the photo gallery."
    },
    mission:
      "Tell a 5-second story with clay figures, paper cutouts, or toys. You'll need at least 30 photos to make it move smoothly.",
    learn: [
      "Explain how animation creates motion from still frames.",
      "Plan a short story with a beginning, middle, and end.",
      "Adjust the size of each change to control speed."
    ],
    before: {
      materials: [
        "Tablet with a camera",
        "Something to keep the tablet still (a stack of books or a stand)",
        "Clay, paper cutouts, or small toys",
        "A plain background (poster paper)"
      ],
      setup: [
        "Prop each tablet so it doesn't move between photos.",
        "Light the scene evenly so the photos don't flicker."
      ],
      prerequisites: "None."
    },
    steps: [
      "Plan a 3-box storyboard: beginning, middle, end.",
      "Set up your scene and lock the tablet in place.",
      "Take a photo. Move your character a tiny amount. Take another photo.",
      "Keep going until you've told your story. Aim for 30+ photos.",
      "Play the photos back quickly. Does the motion look smooth?",
      "If something jumps, reshoot that part with smaller moves."
    ],
    reflect: "What happened when you moved a character a big amount between photos compared to a small amount?",
    extend: "Add a title card and an end card. Try a scene where two characters move at the same time.",
    teacherNotes: [
      "Keep students and faces out of frame so finished videos can be shared safely.",
      "Groups of three work well: director, animator, photographer. Rotate roles.",
      "Connect to coding: each photo is like a costume change in Scratch."
    ]
  },

  /* ───────────────────────────── Made in Maine ─────────────────────────────
     Activities rooted in Maine places, work, and wildlife. All are original lessons
     with full directions on the page. */
  {
    id: "lobster-trap-logic",
    title: "Lobster Trap Logic",
    area: "coding",
    summary: "Write the if–else rules a Maine lobsterman uses to decide which lobsters to keep and which go back.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 30,
    format: "collaborative",
    equipment: ["unplugged"],
    source: "original",
    featured: true,
    pathwayStage: 4,
    keywords: ["maine", "lobster", "conditionals", "if else", "flowchart", "algorithm", "unplugged", "conservation", "gulf of maine"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "You're the sternman on a lobster boat off Stonington. Every trap you haul has lobsters in it, but Maine law says some must go back in the water. Write a set of if–else rules so anyone on the crew can sort every lobster the same way, every time.",
    learn: [
      "Write conditionals (if, else) that make a decision from data.",
      "Put several conditions in the right order in a flowchart.",
      "Explain how rules like these protect the lobster population for the future."
    ],
    before: {
      materials: [
        "Lobster cards: index cards with a lobster drawing, its carapace (body shell) length in inches, and two yes/no boxes: “eggs under tail” and “V-notch in tail”",
        "A ruler for each team",
        "Chart paper and markers for flowcharts",
        "Two bins or boxes labeled KEEP and BACK IN THE WATER"
      ],
      setup: [
        "Make 20 lobster cards. Include lengths from 2½ to 5½ inches, a few with eggs, and a few with a V-notch.",
        "Write the classroom version of the rules on the board: a lobster can be kept only if its carapace is at least 3¼ inches and no more than 5 inches, it has no eggs, and it has no V-notch."
      ],
      prerequisites: "None. Students who have tried Robot Maze Mission will recognize the step-by-step thinking."
    },
    steps: [
      "Read the rules together. Why might Maine protect small lobsters, very big lobsters, and females with eggs?",
      "In teams, draw a flowchart. Each diamond asks one yes/no question. Each arrow leads to another question or to KEEP or BACK.",
      "Run your flowchart: one teammate reads a card, another follows the arrows out loud, a third drops the card in a bin.",
      "Trade flowcharts with another team and run their cards through it. Did both flowcharts sort every lobster the same way?",
      "Debug: the teacher shows a flowchart that only checks “Is it at least 3¼ inches?” Find the lobster cards it gets wrong.",
      "Rewrite your rules as code-like text: IF eggs THEN back. ELSE IF V-notch THEN back. ELSE IF …"
    ],
    reflect: "Does it matter which question your flowchart asks first? Try putting the questions in a different order. Does it still sort correctly?",
    extend: "A lobsterman V-notches a female with eggs before putting her back, so she stays protected even after the eggs hatch. Add that step to your flowchart as an action.",
    teacherNotes: [
      "These are the main Maine lobster rules: a 3¼-inch minimum and 5-inch maximum carapace, and egg-bearing and V-notched females go back. Real rules include more detail and can change, so check the Maine Department of Marine Resources for the current version if students want to go deeper.",
      "The V-notch is a small notch fishermen cut in the tail of an egg-bearing female. It marks her as a proven breeder that must be released by anyone who catches her later.",
      "Order mostly doesn't matter here because every condition leads to BACK. That's a great discussion: when does order matter in a program, and when doesn't it?",
      "Connect to Harbor Code Lab level 8 (“Maybe a trap”), which uses an if block inside a loop."
    ]
  },
  {
    id: "tide-watchers",
    title: "Tide Watchers: Portland vs. Eastport",
    area: "science",
    summary: "Graph a day of tides at two Maine harbors and discover why one rises more than twice as high as the other.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["unplugged", "projector"],
    source: "original",
    keywords: ["maine", "tides", "ocean", "data", "graph", "pattern", "moon", "gulf of maine", "bay of fundy", "eastport", "portland"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "A harbormaster needs to know when boats can safely reach the town float. Graph the water level over one day at Portland and at Eastport, find the pattern, and explain the big difference between them.",
    learn: [
      "Plot data over time and read patterns from a line graph.",
      "Describe the tide cycle: about two high tides and two low tides each day.",
      "Use evidence to compare two places and propose an explanation."
    ],
    before: {
      materials: [
        "A printed table of tide predictions for one day at Portland and at Eastport (high and low times and heights)",
        "Graph paper and two colored pencils per team",
        "A map of the Maine coast"
      ],
      setup: [
        "Print the tide predictions for the same date at both stations from NOAA Tides & Currents (tidesandcurrents.noaa.gov). Choose any date; the pattern is always there.",
        "Draw the axes on the board: time of day across the bottom, water height in feet up the side."
      ],
      prerequisites: "Comfortable reading times and plotting points."
    },
    steps: [
      "Find Portland and Eastport on the map. Predict: will the tides be the same size at both places?",
      "Plot Portland's high and low tides as points. Connect them with a smooth, wavy line.",
      "In a second color, plot Eastport on the same graph.",
      "Count the high tides and low tides for each place. How long is it from one high tide to the next?",
      "Measure the tidal range (high minus low) at each harbor. How many times bigger is Eastport's?",
      "Look at the map again. Eastport sits at the mouth of the Bay of Fundy. Talk with your team: why might the shape of a bay make tides bigger?"
    ],
    reflect: "If you were a harbormaster in Eastport, what would you warn visiting boaters about? Use your graph as evidence.",
    extend: "Plot a full week of high tides for Portland. Each day, the high tide comes a little later. About how much later? (Hint: the Moon rises about 50 minutes later each day.)",
    teacherNotes: [
      "Expect a range of roughly 9 feet at Portland and close to 20 feet at Eastport. The Bay of Fundy, next door to Eastport, has some of the biggest tides in the world because the bay's shape and size funnel the water.",
      "Maine's tides are semidiurnal: about two highs and two lows a day, roughly 12 hours and 25 minutes apart.",
      "Field Station 360's Maine tide pool level shows what lives in the zone that floods and drains with each tide."
    ]
  },
  {
    id: "lighthouse-beam",
    title: "Lighthouse Beam Challenge",
    area: "engineering",
    summary: "Engineer a reflector that turns a weak flashlight into a beam bright enough to guide a boat home.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["building"],
    source: "original",
    keywords: ["maine", "lighthouse", "light", "reflection", "design", "iteration", "portland head light", "engineering design"],
    access: { account: "none", cost: "free", supervision: true, hardware: [] },
    launch: { status: "none" },
    mission:
      "Maine has more than 60 lighthouses, and each one has to throw light far out to sea. Your team gets one small flashlight. Design a reflector that makes its beam reach the far wall as a small, bright spot.",
    learn: [
      "Observe how light reflects off shiny and curved surfaces.",
      "Test a design, measure the result, and improve it.",
      "Connect a design to how real lighthouses focus light."
    ],
    before: {
      materials: [
        "One small LED flashlight per team (or a phone flashlight held by an adult)",
        "Aluminum foil, paper cups, cardstock, tape, and scissors",
        "A tape measure and a sheet of white paper taped to a far wall as the “ship”"
      ],
      setup: [
        "Darken the room as much as you can.",
        "Mark a launch line on the floor 3 meters from the wall."
      ],
      prerequisites: "None."
    },
    steps: [
      "Shine the bare flashlight at the wall from the launch line. Trace the spot on the paper. This is your baseline.",
      "Sketch a reflector idea: a cone, a bowl, a tube? Predict which shape will make the smallest, brightest spot.",
      "Build it with foil (shiny side in), cups, and cardstock. Fit the flashlight inside.",
      "Test from the launch line and trace the new spot. Is it smaller? Brighter?",
      "Change one thing (shape, depth, or smoothness of the foil) and test again.",
      "Share your best design and the spot it made. Which shapes worked best across the class?"
    ],
    reflect: "What did the reflector do to the light that the bare flashlight couldn't? What evidence do you have?",
    extend: "Real lighthouses also flash in a pattern so sailors can tell them apart. Give your lighthouse a signature, like two flashes then a pause, and see if other teams can identify it.",
    teacherNotes: [
      "A deep, smooth, bowl-shaped reflector (close to a parabola) gathers light that would spread sideways and sends it forward, so the spot gets smaller and brighter. Crumpled foil scatters light and makes a dimmer spot.",
      "Many historic Maine lighthouses, like Portland Head Light, used large glass Fresnel lenses that bend light instead of only reflecting it.",
      "Never shine flashlights in anyone's eyes. Keep the beams pointed at the wall."
    ]
  },
  {
    id: "float-a-turbine",
    title: "Float a Wind Turbine",
    area: "engineering",
    summary: "Design a floating platform that keeps a model wind turbine upright in waves, like the ones Maine engineers test for the Gulf of Maine.",
    level: "advanced",
    grades: ["6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["building"],
    source: "original",
    keywords: ["maine", "offshore wind", "energy", "buoyancy", "stability", "design", "umaine", "volturnus", "gulf of maine", "waves"],
    access: { account: "none", cost: "free", supervision: true, hardware: [] },
    launch: { status: "none" },
    mission:
      "The Gulf of Maine is windy, but its water is too deep for turbines that stand on the sea floor. Your team must design a floating base that keeps a tall turbine tower upright, even when the waves roll in.",
    learn: [
      "Explain how buoyancy and a low center of gravity keep something stable.",
      "Run repeatable tests and compare designs with data.",
      "Weigh trade-offs between stability, materials, and cost."
    ],
    before: {
      materials: [
        "A plastic tub of water (a storage bin works) and a ruler to make waves",
        "Plastic cups, foam blocks, straws, craft sticks, washers, string, and tape",
        "A 30 cm tower: a straw or dowel with a paper pinwheel on top",
        "Optional: a small desk fan for wind"
      ],
      setup: [
        "Fill the tub about two-thirds full.",
        "Set a budget: each team gets 10 “materials dollars” and a price list (for example, a cup costs $1, a foam block $2, a washer $1)."
      ],
      prerequisites: "Sink or Float or another buoyancy activity helps."
    },
    steps: [
      "Look at the tower. Predict: what will happen if you float it on one cup?",
      "Sketch a platform design and list what it costs.",
      "Build it and set it in calm water. Does the tower stand straight?",
      "Make waves: push the ruler back and forth 10 times. Count how many times the tower tips past 45° or falls over.",
      "Try adding weight low down (washers hanging below) or spreading the base wider. Test again with the same 10 waves.",
      "Record each design, its cost, and its result in a table. Choose your best design and explain why it works."
    ],
    reflect: "Which change helped most: making the base wider, or putting weight lower? How do you know it wasn't luck?",
    extend: "Turn on the fan. Does wind on the blades change which design works best? What would engineers have to think about for a winter storm?",
    teacherNotes: [
      "In 2013 the University of Maine floated VolturnUS, a one-eighth-scale prototype, off Castine. It was the first grid-connected floating offshore wind turbine in the Americas.",
      "The key ideas: a wide base resists tipping, and weight hung low lowers the center of gravity. Many real floating platforms use both.",
      "Insist on the same 10-wave test every time. That's the fair-test habit students need for the comparison to mean anything."
    ]
  },
  {
    id: "blueberry-sorter",
    title: "Blueberry Sorting Machine",
    area: "ai",
    summary: "Be the machine: learn to sort wild blueberries from example cards, then find out what happens when the examples are missing something.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 30,
    format: "teacher-led",
    equipment: ["unplugged"],
    source: "original",
    keywords: ["maine", "blueberry", "wild blueberries", "training data", "examples", "classification", "unplugged", "bias", "farming"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "Maine grows more wild blueberries than any other state, and at harvest, machines help sort berries from leaves and stems. Today, a volunteer becomes the sorting machine. The class trains it with examples, then tests what it learned.",
    learn: [
      "Explain that a machine learns to sort from labeled examples.",
      "Show that missing examples cause wrong answers.",
      "Describe why people still check the machine's work."
    ],
    before: {
      materials: [
        "About 24 picture cards: ripe blueberries (deep blue), unripe berries (green or red), leaves, twigs, and a few tricky ones like a dusty-blue leaf or a very small ripe berry",
        "Two paper plates labeled KEEP and TOSS"
      ],
      setup: [
        "Make a training set of 8 cards that leaves out the tricky ones.",
        "Keep the rest face down as the test set."
      ],
      prerequisites: "None. How Does an AI Sort? is a good follow-up."
    },
    steps: [
      "Explain the job: the machine sorts berries into KEEP and leaves, twigs, and unripe berries into TOSS.",
      "Training: the class shows the volunteer each training card and says KEEP or TOSS. The volunteer can't ask why.",
      "Testing: flip test cards one at a time. The volunteer sorts each one. The class tracks right and wrong on the board.",
      "Look at the mistakes together. What was the machine missing? (Maybe it never saw a dusty-blue leaf.)",
      "Retrain with a few of the tricky cards, then test again with new cards. Did it get better?"
    ],
    reflect: "The machine only knew what it was shown. What kinds of examples should we always include so it doesn't get fooled?",
    extend: "Invent a new tricky card the machine has never seen. Predict what it will do, then test it.",
    teacherNotes: [
      "Maine is the largest producer of wild (lowbush) blueberries in the United States. Wild blueberries grow on low plants in fields called barrens, mostly Down East.",
      "Keep the volunteer honest: they should sort only by what they learned from the cards, not by their own blueberry knowledge. This mirrors how a model only knows its training data.",
      "Pairs with Pattern Machine Lab level 4 (bias), where students fix a lopsided training set on the computer."
    ]
  },
  {
    id: "sap-run-detectives",
    title: "Sap Run Detectives",
    area: "science",
    summary: "Use temperature data to figure out the weather maple trees need before sap starts to flow, then do the sugaring math.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 30,
    format: "collaborative",
    equipment: ["unplugged"],
    source: "original",
    keywords: ["maine", "maple", "sap", "syrup", "temperature", "data", "pattern", "ratio", "math", "maine maple sunday"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "none" },
    mission:
      "A sugarhouse in western Maine has a two-week log of temperatures and how much sap came out of its taps each day. Find the weather pattern that makes sap run, then figure out how much sap it takes to fill a jug of syrup.",
    learn: [
      "Find a pattern in a data table and describe it with evidence.",
      "Connect freezing and thawing to how sap moves in a tree.",
      "Use a ratio to solve a real-world problem."
    ],
    before: {
      materials: [
        "A practice data table (made up for this lesson) with 14 days of nighttime low, daytime high, and gallons of sap collected",
        "Colored pencils"
      ],
      setup: [
        "Build the table so sap only flows on days that follow a freezing night (below 32°F) and have a thawing day (above 32°F). Include a few days that stay frozen all day and a few warm nights.",
        "Tell students the data is practice data, made up to show a real pattern."
      ],
      prerequisites: "Reading a table and comparing numbers to 32°F (freezing)."
    },
    steps: [
      "Circle the days with the most sap. What do you notice about the night before and the day itself?",
      "Color each night blue if it froze and each day orange if it thawed. Where do blue nights and orange days line up?",
      "Write a rule: “Sap runs when …” Test your rule on every day in the table.",
      "Sugaring math: it takes about 40 gallons of sap to make 1 gallon of syrup. How much sap for a quart (¼ gallon)? For 5 gallons?",
      "The whole log collected a certain amount of sap. How much syrup could the sugarhouse make?"
    ],
    reflect: "Why do you think a warm winter could be a problem for maple sugaring? Use your rule to explain.",
    extend: "Maple sap is mostly water with about 2% sugar. Syrup is about two-thirds sugar. Explain where all that water goes when sap is boiled.",
    teacherNotes: [
      "Sap flows best when nights freeze and days thaw. The freeze and thaw change the pressure inside the tree, which pushes sap out of the tap hole.",
      "The 40-to-1 ratio is a rule of thumb; it depends on how sweet the sap is.",
      "Maine Maple Sunday, held in March, is when many Maine sugarhouses open to visitors: a natural field-trip tie-in."
    ]
  },
  {
    id: "acadia-from-above",
    title: "Acadia from Above",
    area: "vr",
    summary: "Fly over Acadia National Park in a virtual globe, find famous landmarks, and read the land like a geologist.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 30,
    format: "teacher-led",
    equipment: ["computer", "projector"],
    source: "original",
    keywords: ["maine", "acadia", "virtual field trip", "google earth", "cadillac mountain", "lighthouse", "glaciers", "map", "compass"],
    access: { account: "none", cost: "free", supervision: true, hardware: [] },
    launch: {
      status: "ready",
      label: "Open Google Earth",
      url: "https://earth.google.com/web/",
      provider: "Google Earth",
      note: "Free. No account needed. Works best in Chrome."
    },
    vr: {
      setup: [
        "Run this from the teacher computer on the projector. Search each landmark by name.",
        "Use the 3D button to tilt the view so mountains and cliffs stand up."
      ],
      nonHeadset: "This trip is designed for a projector or laptops. No headset needed."
    },
    mission:
      "You're leading a class trip to Acadia National Park on Mount Desert Island, without leaving the room. Visit four landmarks, use compass directions to get between them, and find evidence that glaciers once covered this land.",
    learn: [
      "Use a virtual globe to explore a real place from many angles.",
      "Give directions using compass headings.",
      "Read clues in the landscape, like scraped rock and U-shaped valleys."
    ],
    before: {
      materials: ["Teacher computer and projector", "A student “trip log” with four boxes: I see / I think / I wonder"],
      setup: ["Search “Acadia National Park” ahead of time and check that 3D view loads."],
      prerequisites: "None."
    },
    steps: [
      "Fly to Cadillac Mountain. Tilt to 3D and turn all the way around. What can you see in each direction?",
      "Fly to Sand Beach. Which direction is the open ocean from here?",
      "Fly to Bass Harbor Head Light. Why do you think the lighthouse was built right here?",
      "Fly to Somes Sound, the long, narrow bay that cuts into the island. Describe its shape.",
      "In your trip log, write one observation, one inference, and one question from each stop."
    ],
    reflect: "Somes Sound and the smooth, rounded tops of Acadia's mountains were shaped by glaciers. What clues did you see that ice once moved across this land?",
    extend: "Plan a route that visits all four stops with the shortest drive. Use the measure tool to compare two routes.",
    teacherNotes: [
      "In fall and winter, Cadillac Mountain is one of the first places in the United States to see the sunrise.",
      "Glaciers scraped and rounded Acadia's pink granite mountains and carved Somes Sound into a long valley that the sea later filled.",
      "Pair with Field Station 360's Maine tide pool level for a full Maine coast unit.",
      "Google Earth's menus have changed and now include \"Ask Google Earth,\" an AI search. Run the four stops once before class to confirm the 3D view and the measure tool are where you expect, and decide whether students may use the AI search. If they do, check its answers against the landscape."
    ]
  },
  {
    id: "maine-postcard",
    title: "Animated Maine Postcard",
    area: "creative",
    summary: "Design an animated postcard of your favorite Maine place: a sweeping lighthouse beam, falling snow, or a loon diving.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer"],
    source: "original",
    keywords: ["maine", "animation", "postcard", "scratch", "storyboard", "digital art", "lighthouse", "loon", "snow"],
    access: { account: "optional", accountNote: "An account is needed only to save projects online. Students can download projects to the computer instead.", cost: "free", supervision: false, hardware: [] },
    launch: {
      status: "ready",
      label: "Open the Scratch editor",
      url: "https://scratch.mit.edu/projects/editor/",
      provider: "Scratch (MIT)",
      note: "Free. An account is optional and only needed to save online."
    },
    mission:
      "Make a postcard that moves. Pick a Maine place you love or want to visit, draw it, and add one thing that animates on a loop, so anyone who opens it feels like they're there.",
    learn: [
      "Plan an animation with a storyboard.",
      "Use loops and costume changes to make motion repeat smoothly.",
      "Combine art and code to communicate a feeling about a place."
    ],
    before: {
      materials: ["Laptop or Chromebook", "Paper for a 4-box storyboard"],
      setup: ["Show two or three example ideas: a lighthouse with a turning beam, snow on a pine, a lobster boat bobbing."],
      prerequisites: "Animate Your Initials or the Pixel Animation Studio is a good warm-up."
    },
    steps: [
      "Choose your place and write a one-line greeting, like “Greetings from Monhegan!”",
      "Sketch a 4-box storyboard: what's still (the backdrop) and what moves?",
      "In Scratch, paint the backdrop. Add a sprite for the moving part.",
      "Make 2–4 costumes for the sprite, or use glide and turn blocks.",
      "Put the motion inside a forever loop. Adjust the wait time until it looks right.",
      "Add your greeting text. Share your postcard with a partner and ask what place it makes them think of."
    ],
    reflect: "What did you change after you saw your animation run for the first time? Why?",
    extend: "Add a sound that fits your place, like waves, a foghorn, or a loon call, recorded or made yourself.",
    teacherNotes: [
      "Students who finish early can add a second moving element that runs at a different speed.",
      "Remind students not to put their own name, school, or photo in a shared project.",
      "Postcards make a great hallway display: print the backdrop and add a QR code to the project if you share them."
    ]
  },

  /* ───────────────────────────── Interactive labs (run inside STEM 207) ───────────────────────────── */
  {
    id: "lab-rover",
    title: "Harbor Code Lab",
    area: "coding",
    summary: "Program a lobster boat with code blocks across three voyages and 36 levels: haul and set traps, dodge granite ledges, and write your own functions.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    featured: false,
    keywords: ["lab", "maine", "blocks", "voyages", "sequence", "loops", "conditionals", "variables", "functions", "debugging", "lobster boat", "harbor", "interactive"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "rover", label: "Open the Harbor Code Lab", note: "Runs inside STEM 207. No outside account or website needed." },
    mission: "You're the captain of a lobster boat working the Maine coast. Start in Casco Bay, then sail on to Penobscot Bay and Down East. Steer to the wharf, haul and set your traps, and find your way through the fog. Each voyage climbs through the same coding ideas with new harbors, and later levels limit how many blocks you can use, so you'll need loops, conditionals, variables, and your own blocks.",
    learn: [
      "Build and run a program as a sequence of instructions.",
      "Use loops, if–else, and a variable to write shorter, smarter programs.",
      "Debug a program by stepping through it one block at a time."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet"],
      setup: ["Students can sign in to save progress, or explore as guests.", "The lab has three voyages of 12 levels. Every voyage starts with beginner sequences and builds to functions and a free build, so students who finish Voyage 1 can keep practicing at the same level in Voyages 2 and 3.", "Within a voyage, levels 1–3 suit any beginner. Levels 8–12 suit students ready for conditionals, variables, and functions."],
      prerequisites: "None. The lab starts at the very beginning and climbs the coding pathway."
    },
    steps: [
      "Open the lab and read the goal for the level.",
      "Tap blocks to add them to your program. Tap a gap to choose where new blocks go.",
      "Press Run to watch the boat, or Step to run one block at a time.",
      "If the boat bumps a granite ledge, find the highlighted block and fix it.",
      "When you finish a level, read “What you just learned,” then try the next one.",
      "When a voyage is done, pick the next voyage at the top of the lab."
    ],
    reflect: "Which level made you change how you were thinking about the problem? What did you do differently?",
    extend: "On each voyage's free build, solve the level, then try to beat par by using loops and conditionals to make your program shorter.",
    teacherNotes: [
      "Each voyage follows the same map to the coding pathway: levels 1–3 sequencing and debugging (Stage 1), 4–6 loops (Stage 3), 7–9 actions and conditionals (Stages 2 and 4), 10 variables (Stage 5), 11 functions (Stage 6), 12 independent creation (Stage 7). The coding pathway page links to every matching level.",
      "Voyage 2 (Penobscot Bay) adds Set trap and If at a dashed spot. Voyage 3 (Down East) adds a simple rule: you can only set a trap you have already hauled. Both are actions and conditionals at the same skill level as Voyage 1.",
      "Debug levels vary the kind of bug: a wrong turn, an extra block, a wrong turn inside a loop, and a loop that repeats too few times.",
      "Block limits on later levels are intentional. They push students to find the pattern instead of brute-forcing with many Forward blocks.",
      "Step-through is the key debugging habit. Ask “Which block went wrong first?” before helping.",
      "Your dashboard shows each student's level progress, test runs, and hints used."
    ]
  },
  {
    id: "lab-dance-party",
    pilot: true,
    time: { prep: 5, core: [10, 15], verified: false },
    stopAt: "You finish level 2 (Swap two steps). Levels 3 and 4 are bonus.",
    check: "Swap two steps in a program. Before you press Run, say what the robot will do differently. Then run it and explain what changed.",
    stuck: ["Read your program from the top. Step 1 happens first.", "Press Reset robot to start over. Your program stays.", "Use the ▲ and ▼ buttons to move a step. No dragging needed."],
    next: "robot-maze-mission",
    title: "Robot Dance Party",
    area: "coding",
    summary: "Build a dance from five moves, run it, and watch a robot follow your program one step at a time. Swap two steps and the whole dance changes.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 20,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "sequence", "order", "algorithm", "robot", "dance", "predict", "debugging", "interactive", "first coding"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "dance-party", label: "Open Robot Dance Party", note: "Runs inside STEM 207. About 10 minutes. No outside account or website needed." },
    mission: "The robot is ready to dance, but it only does exactly what your program says, in exactly that order. Predict, run, swap, and create, then take on the challenge: jump, spin, and finish with a pose.",
    learn: [
      "Explain that a sequence is a set of instructions a computer follows in order.",
      "Predict what a program will do first and last before running it.",
      "Show that changing the order of the same instructions changes the result."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet (keyboard works too)"],
      setup: ["Works as a 10-minute warm-up. Students can sign in to save progress or explore as guests.", "Optional unplugged opener: have one student \"run\" a three-card dance program for the class."],
      prerequisites: "None. This is a first coding activity."
    },
    steps: [
      "Level 1: Read the three-step example. Predict what the robot does first and last, then press Run.",
      "Level 2: Swap two instructions with the ▲ and ▼ buttons and run it again. What changed?",
      "Level 3: Make a dance with at least five instructions.",
      "Level 4: Challenge. Make the robot jump, spin, and then pose. It must finish with the pose.",
      "Remember: computers follow your instructions in the order you give them."
    ],
    reflect: "You used the same three moves in Level 1 and Level 2. Why did the robot dance differently?",
    extend: "Write a dance on paper first, then have a partner predict it before you run it. Did they get the first and last moves right?",
    teacherNotes: [
      "Learning objective: students understand that a sequence is a set of instructions run in order, and that changing the order changes the result.",
      "Common misconception: the computer \"knows\" what you meant, or does the important moves first. It doesn't. It runs step 1, then step 2, and so on, exactly as written. Students who put Strike a pose first are often surprised that the robot poses before dancing.",
      "Ask afterward: \"If two programs use exactly the same instructions, will the robot always do the same dance? Why or why not?\"",
      "The challenge is checked from the steps the robot actually ran, so students can't skip it by clicking. Feedback names what went wrong (a missing move, the wrong order, or not ending with the pose) without giving the answer. Each level has two hints that appear one at a time.",
      "The robot never leaves the dance floor: moving past an edge makes it wiggle in place. That's a good chance to ask students to predict where it will end up."
    ]
  },
  {
    id: "lab-space-blob",
    pilot: true,
    time: { prep: 5, core: [15, 20], verified: false },
    stopAt: "You finish level 3 (Lost the reset?). The challenge, level 4, is bonus.",
    check: "Predict what snacks will be after 3 feeds if it starts at 2 and adds 3. Then show what Restart does with the set block on and off.",
    stuck: ["The orange snacks box shows the number stored right now.", "Changed a number? Press Restart to use it.", "Count each Feed: start, then add the amount, again and again."],
    next: "score-keeper",
    title: "Feed the Space Blob",
    area: "coding",
    summary: "A hungry alien blob and a variable called snacks. Set its starting value, choose how much each Feed click adds, and find out what happens when a program forgets to reset.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 20,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "variables", "initialization", "events", "counter", "predict", "debugging", "alien", "space", "interactive"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "space-blob", label: "Open Feed the Space Blob", note: "Runs inside STEM 207. About 15 minutes. No outside account or website needed." },
    mission: "The Space Blob is hungry, and your code keeps count. Feed it, change the code, predict, and test. Then find out why every program needs a known starting value.",
    learn: [
      "Explain that a variable stores a value that the program can read and change.",
      "Show that an event (a Feed click) can change a variable's value.",
      "Explain that initialization (setting a starting value) makes every run start the same way."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet"],
      setup: ["Best after students know sequences and click events (Robot Dance Party and coding pathway stage 2).", "Plan about 15 minutes. Students can sign in to save progress or explore as guests."],
      prerequisites: "Understands sequences and that a click can start code (events)."
    },
    steps: [
      "Level 1: Press Start, feed the blob 3 times, then say what is stored in snacks.",
      "Level 2: Change “change snacks by” to 2. Predict the value after 3 feeds, then test it.",
      "Level 3: Turn off “set snacks to” and Restart. Watch snacks keep its old value. Turn it back on.",
      "Level 4: Challenge. Start with 2 snacks, add 3 per feed, and reach 14 after 4 feeds."
    ],
    reflect: "Why does a game set your score to 0 when you start a new game? What would happen if it didn't?",
    extend: "Make the blob lose snacks: try a negative number in “change snacks by.” What starting value keeps snacks from going below 0 after 5 feeds?",
    teacherNotes: [
      "Variables: snacks is a named box that holds one number. The orange monitor shows what's in the box right now. “change snacks by” reads the old value and adds to it; “set snacks to” replaces it.",
      "Initialization: “when run starts, set snacks to 0” gives the variable a known starting value. In Level 3, students switch that block off and restart: snacks keeps the number from the last run. That's the bug behind a game that starts with last game's score.",
      "Code is read when the run starts. If students edit a number mid-run, a banner tells them to press Restart. Ask: “Why didn't the blob change when you typed a new number?”",
      "Common mistake: mixing up set and change. “set snacks to 2” makes it 2; “change snacks by 2” adds 2.",
      "Common mistake: counting the start as a feed (off-by-one). 0 with +2 three times is 6, not 8. The run history lists every step, so students can check their own counting.",
      "Common mistake: reaching 14 by luck (for example, start at 14 and add 0). The challenge checks the starting value, the amount, and the number of feeds, and explains which one is off using the student's own numbers.",
      "Ask afterward: “If you pressed Restart and snacks didn't go back to 0, what would you check first?”"
    ]
  },
  {
    id: "lab-moon-gate",
    title: "Moon Base Gatekeeper",
    area: "coding",
    summary: "Write an IF / ELSE rule for a moon base gate, predict what each robot visitor will do, and test every badge. Then find the bug in a rule that lets everyone in.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 20,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "conditionals", "if else", "equals", "testing", "debugging", "branches", "space", "moon", "interactive"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "moon-gate", label: "Open Moon Base Gatekeeper", note: "Runs inside STEM 207. About 15–20 minutes. No outside account or website needed." },
    mission: "You run the gate at a moon base. Robot visitors arrive wearing Moon, Star, or Planet badges, and your IF / ELSE rule decides who gets in. Predict, test, fix a broken rule, and get the Star team into their meeting.",
    learn: [
      "Explain that a conditional checks a rule and chooses one of two actions.",
      "Trace which branch (THEN or ELSE) runs for a given input.",
      "Explain why a rule must be tested with inputs that match and inputs that don't."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet"],
      setup: ["Best after students know events and stored values (Robot Dance Party and Feed the Space Blob).", "Optional opener: you are the gate. Students hold up badge cards and the class says “open” or “closed” using a rule on the board."],
      prerequisites: "Understands simple events and that a program can store a value."
    },
    steps: [
      "Level 1: Predict what happens to a Moon visitor, then test.",
      "Level 2: Predict and test a Star visitor.",
      "Level 3: Change which badge gets in, then test a visitor that matches and one that doesn't.",
      "Level 4: A rule is broken. Find a visitor that shows the bug, fix the rule, and test again.",
      "Level 5: Challenge. Only Star visitors get in. Test all three badges."
    ],
    reflect: "Your first test passed in Level 4, but the rule was still broken. How many tests do you need to trust a rule?",
    extend: "Write a rule on paper for a different base (for example, only Planet visitors stay out). List the tests you'd run before you trust it.",
    teacherNotes: [
      "Conditionals: IF checks one thing, here whether the visitor's badge equals the badge in the rule. The answer is true or false, and that decides what happens next.",
      "Branch selection: true runs THEN; false runs ELSE. Exactly one branch runs every time. The trace and the highlighted code show which branch ran and which was skipped.",
      "Why one test isn't enough: in Level 4, the broken rule says THEN Open gate and ELSE Open gate. A Moon visitor gets in, so the rule looks fine. Only a visitor who doesn't match shows the bug. Good testers try a case that should pass and a case that should fail.",
      "The challenge only counts tests of the current rule. If a student edits the rule, earlier results are crossed out and they must test all three badges again. Ask: “Why don't your old tests count anymore?”",
      "Common mistake: thinking ELSE is the “wrong answer.” ELSE is just what happens when the check is false. It can open or close the gate.",
      "Ask afterward: “If a rule worked for one visitor, how could it still be broken?”"
    ]
  },
  {
    id: "lab-field-station",
    title: "Field Station 360",
    area: "vr",
    summary: "Start in a Gulf of Maine tide pool and a North Woods pond, then visit a rainforest, desert, and coral reef. Find clues, use a compass, and think like a field scientist.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer", "tablet", "vr", "projector"],
    source: "original",
    keywords: ["lab", "maine", "360", "field trip", "habitat", "adaptations", "compass", "observation", "inference", "tide pool", "north woods", "moose", "katahdin", "interactive"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "field-station", label: "Open Field Station 360", note: "Runs inside STEM 207. Drag, tap the Look arrows, or use arrow keys to look around. This is a 360° page, not an immersive headset experience." },
    vr: {
      setup: [
        "This lab is not an immersive VR experience. A headset's web browser shows it as a flat page, so laptops, tablets, or a projector work better.",
        "Keep headset turns to 10–15 minutes, seated or standing clear of furniture.",
        "The lab saves nothing to the headset; students can sign in with their picture code to save progress."
      ],
      nonHeadset: "The lab is built for laptops, Chromebooks, tablets, and projectors. Students drag, tap the Look arrows, or use arrow keys to turn. On a projector, students can take turns as the navigator."
    },
    mission: "You're a field scientist, starting at home. Explore a Maine tide pool at low tide and a North Woods pond below Katahdin, then travel to three habitats far from Maine. Turn around to find hidden clues, separate what you see from what you think it means, and complete each station's compass check.",
    learn: [
      "Tell the difference between an observation and an inference.",
      "Explain how adaptations help living things survive in a habitat.",
      "Use compass headings in degrees (north 0°, east 90°, south 180°, west 270°)."
    ],
    before: {
      materials: ["Laptop, Chromebook, tablet, projector, or VR headset with a web browser"],
      setup: ["Optional: give students a paper field log to record I see / I think / I wonder."],
      prerequisites: "None."
    },
    steps: [
      "Open the lab and pick the first station.",
      "Look all the way around. Tap a search marker when you find one.",
      "Read the observation, then choose the inference that fits best.",
      "Complete the compass check by turning to the heading you're given.",
      "After the five habitats, compare them and practice sorting observations from inferences."
    ],
    reflect: "Which clue surprised you most? What did you observe, and what did you infer from it?",
    extend: "Pick a habitat near your school: a schoolyard, a stream, a patch of woods, or a beach. List three observations you could make there and one inference for each.",
    teacherNotes: [
      "The core skill is separating observation from inference. Ask students: “Could you point to that, or is it your explanation?”",
      "“Scan for a clue” turns the view toward the nearest unfound clue. It supports students who are struggling to navigate.",
      "Compass headings connect to math (angles) and geography. Have students stand and physically face each direction before the check.",
      "The two Maine levels pair with Tide Watchers and Acadia from Above for a Maine coast-and-woods unit."
    ]
  },
  {
    id: "lab-pattern-machine",
    title: "Pattern Machine Lab",
    area: "ai",
    summary: "Train a real machine-learning model with examples, then find out how it learns, where it goes wrong, and why.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "machine learning", "training data", "bias", "confidence", "responsible ai", "classifier", "interactive"],
    access: { account: "none", cost: "free", supervision: true, hardware: [] },
    launch: { status: "lab", labId: "pattern-machine", label: "Open the Pattern Machine Lab", note: "Runs inside STEM 207. Uses made-up creatures only: no cameras, photos, or personal information." },
    mission: "Teach a machine to sort creatures, then put it to the test. You'll see how the number and variety of examples change what it learns, catch it learning the wrong lesson, and decide when AI should and shouldn't be trusted.",
    learn: [
      "Explain that AI learns patterns from labeled training examples.",
      "Show how too few or lopsided examples lead to wrong predictions (bias).",
      "Decide when an AI's answer needs a human to check it."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet"],
      setup: ["Preview levels 4 and 6 so you're ready to lead a short discussion on bias and responsible use."],
      prerequisites: "“How Does an AI Sort?” is a helpful unplugged warm-up."
    },
    steps: [
      "Open the lab and find the pattern in labeled examples.",
      "Invent your own rule and train the machine with examples.",
      "Add examples and watch accuracy change on the chart.",
      "Find and fix a biased training set.",
      "Set a confidence threshold, then decide which uses of AI are responsible."
    ],
    reflect: "The machine never knew the rule, only the examples. What does that mean for AI tools you use in real life?",
    extend: "Think of an AI tool you've seen (like autocomplete). What examples do you think it learned from? What might be missing from them?",
    teacherNotes: [
      "The machine is a real k-nearest-neighbors classifier. It shows the 3 training examples it compared against, so its reasoning is visible, not magic.",
      "Pause the class after level 4 (bias) for a whole-group discussion: where could real AI training data be lopsided?",
      "Level 6 has no single “correct” answer for every case. The explanations model good reasoning; welcome thoughtful disagreement.",
      "No student data, images, or text leave the page. Creatures are generated from simple features."
    ]
  },
  {
    id: "lab-launcher",
    title: "Pumpkin Launcher Lab",
    area: "engineering",
    summary: "Design and tune a catapult for a fall-fair pumpkin toss. Predict, test, change one thing at a time, and work within a budget.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "collaborative",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "maine", "catapult", "pumpkin", "fall fair", "design", "iteration", "fair test", "budget", "optimize", "engineering notebook", "interactive"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "launcher", label: "Open the Pumpkin Launcher Lab", note: "Runs inside STEM 207." },
    mission: "It's fall in Maine, and your team is building a launcher for the fair's pumpkin toss. Land pumpkins on the hay bale targets, clear the bale stack, stay on budget, and record every trial in your engineering notebook.",
    learn: [
      "Use test results to decide what to change next (iteration).",
      "Change one variable at a time to run a fair test.",
      "Balance constraints like height and budget to optimize a design."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet per pair"],
      setup: ["Pairs work well: one operates, one records predictions and reasons in a paper notebook."],
      prerequisites: "Paper Bridge Challenge or any design-test-improve activity helps."
    },
    steps: [
      "Set the angle, spring force, and load.",
      "Predict how far it will go, then launch.",
      "Read the result and the notebook. Decide what to change.",
      "Change one thing and launch again.",
      "Keep iterating until you hit the target."
    ],
    reflect: "Which setting had the biggest effect on distance? How do you know?",
    extend: "Build a real catapult from craft sticks and rubber bands. Do the patterns from the lab hold up?",
    teacherNotes: [
      "Level 3 enforces one-change-at-a-time. Students who struggle often skip the notebook; point them back to it.",
      "Level 5 rewards finding that about 45° gives the most distance, a great moment to connect to math.",
      "Pair this lab with the hands-on Paper Bridge Challenge or Marble Run Iteration Lab."
    ]
  },
  {
    id: "lab-line-follower",
    title: "Snowplow Robot Lab",
    area: "engineering",
    summary: "A nor'easter buried the roads. Write sense → think → act rules so a robot plow follows the road on its own.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 30,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "maine", "robot", "snowplow", "snow", "sensors", "rules", "robot behavior", "if then", "debugging", "trade-offs", "interactive"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "line-follower", label: "Open the Snowplow Robot Lab", note: "Runs inside STEM 207." },
    mission: "Your town's robot plow has two light sensors that can tell the dark road line from white snow. Give it rules for everything it might sense so it can plow a full lap, handle sharp village corners, and clear the roads before the buses come.",
    learn: [
      "Describe the sense → think → act loop that robots use.",
      "Write if–then rules for each sensor state.",
      "Debug robot behavior and balance speed against accuracy."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet"],
      setup: ["Run Sense–Think–Act: Human Robot Game first for younger groups."],
      prerequisites: "Comfortable with if–then ideas (coding pathway Stage 4 is a good match)."
    },
    steps: [
      "Choose an action for each thing the robot can sense.",
      "Press Run and watch the sensors light up as the robot drives.",
      "If it leaves the track, watch what it sensed right before.",
      "Fix the rule and run again."
    ],
    reflect: "Why does the robot need a rule for when it sees nothing at all?",
    extend: "Design rules for a robot vacuum that bumps into walls. What sensors would it need? Write its rules as a table.",
    teacherNotes: [
      "Real classroom robots (and robot vacuums) use this exact approach. If you have a robot kit, students can test the same rule table on a real line.",
      "Level 3's sharp corners require a memory rule (“keep turning the same way”): a nice bridge to variables.",
      "Level 4 is a trade-off: the fastest speed isn't always the best."
    ]
  },
  {
    id: "lab-ramp-racers",
    title: "Sled Hill Science",
    area: "science",
    summary: "It's a snow day. Run a real investigation on a model sledding hill: predict, repeat trials, keep it fair, graph your data, and explain your results.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "maine", "experiment", "sled", "snow", "variables", "fair test", "data", "graph", "average", "claim evidence reasoning", "friction", "interactive"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "ramp-racers", label: "Open Sled Hill Science", note: "Runs inside STEM 207." },
    mission: "Find out what makes a sled go farther. On a model sledding hill, you'll test the hill's height, the kind of snow, and the sled's weight, then write a scientific explanation backed by your own data.",
    learn: [
      "Repeat trials and use the average because measurements vary.",
      "Control variables so a test is fair.",
      "Write a claim supported by evidence and reasoning."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet", "Optional: a tray ramp, a small toy sled or block, and a tape measure to compare"],
      setup: ["Results include small random variation, just like a real experiment."],
      prerequisites: "Sink or Float or any prediction activity."
    },
    steps: [
      "Read the question and make a prediction.",
      "Set up the hill, the snow, and the sled, then run a trial.",
      "Run more trials and watch the data table and graph.",
      "Keep everything the same except the one thing you're testing.",
      "Answer the question using your data."
    ],
    reflect: "Was there a time your data didn't match your prediction? What did you do?",
    extend: "On the next snow day (or with a tray ramp and books), test a real sled or block. Do your real results show the same pattern as the lab?",
    teacherNotes: [
      "Level 4 (mass) targets a common misconception: most students predict a heavier sled goes farther. Let the data do the persuading.",
      "Unfair trials are marked in the table and left off the graph, so students see why control matters.",
      "The CER level works well as an exit ticket. You can see each student's chosen evidence on your dashboard."
    ]
  },
  {
    id: "lab-pixel-studio",
    title: "Pixel Animation Studio",
    area: "creative",
    summary: "Draw pixel art, decode a picture of a lighthouse, and bring your own Maine postcard to life frame by frame.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 45,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "pixels", "resolution", "encoding", "animation", "frames", "fps", "digital art", "lighthouse", "interactive"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "pixel-studio", label: "Open the Pixel Animation Studio", note: "Runs inside STEM 207. Signed-in students' animations are saved to their gallery." },
    mission: "Learn how computers store pictures, then make your own looping animation and save it to your gallery.",
    learn: [
      "Explain that digital images are made of pixels and that resolution changes detail.",
      "Read and write a picture as run-length code.",
      "Create animation with frames and control its speed with frames per second."
    ],
    before: {
      materials: ["Laptop, Chromebook, or tablet (touch screens work well)"],
      setup: ["Pairs well after the unplugged Pixel Art Code activity, and before Animated Maine Postcard."],
      prerequisites: "None."
    },
    steps: [
      "Pick a color and tap or drag on the grid to draw.",
      "Watch your picture turn into code as you draw.",
      "Decode a picture from its code.",
      "Use Copy frame to build an animation, then press Play.",
      "Try different speeds, then save your best animation."
    ],
    reflect: "How is a flipbook like your animation? What makes motion look smooth?",
    extend: "Plan a 6-frame animation on paper first, then build it. Did your plan change once you saw it move?",
    teacherNotes: [
      "Students' saved animations appear in their profile and on your student detail page.",
      "The keyboard works too: arrow keys move the cursor, and Space paints.",
      "Run-length encoding is a real compression method. Ask: when does it make files smaller, and when doesn't it help?"
    ]
  }
];
