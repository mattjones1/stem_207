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
    group: "foundations",
    primm: {
      "predict": "Before you press Run, say out loud exactly where the character will stop.",
      "investigate": [
        "Where did it actually stop? Which block made the difference?",
        "Why do left and right depend on which way the character faces?"
      ],
      "modify": "Change one block so the character takes a shorter path.",
      "make": "Draw your own maze on grid paper, write its program, and trade with a partner."
    },
    career: {
      "role": "Robotics programmer",
      "industry": "Maine warehouses and logistics",
      "what": "Writes the exact moves that guide robots through aisles without bumping into anything."
    },
    explain: "In three sentences: how your program gets to the goal, one wrong turn you fixed, and how you'd solve a harder maze.",
    standards: [
      "1A-AP-10",
      "1A-AP-14"
    ],
    simple: {
      "mission": "A robot is stuck in a maze. Write steps that get it to the goal. Don't let it bump a wall!",
      "steps": [
        "One partner is the Robot. Stand on Start. Do only what the cards say.",
        "The Programmer puts arrow cards in order. No talking!",
        "The Programmer reads each card. The Robot moves one square or turns.",
        "Did the Robot bump a wall? Stop. Find the wrong card. Fix it. Try again.",
        "Switch jobs. Try a new maze.",
        "Now open the Maze game. Drag blocks to move to the goal.",
        "Before you press Run, say where it will stop.",
        "Play more levels. Later levels have repeat blocks."
      ]
    },
    skills: [
      "sequencing"
    ],
    why: "An algorithm is a set of exact steps. Computers can't guess what you mean, so every app, game, and robot starts with someone writing clear steps in the right order.",
    realWorld: "Warehouse robots, delivery robots, and Mars rovers all follow algorithms to get where they're going without bumping into things.",
    vocab: [{"term": "Algorithm", "def": "A set of steps, in order, that solves a problem."}, {"term": "Sequence", "def": "The order the steps happen in."}, {"term": "Bug", "def": "A mistake that makes a program do the wrong thing."}],
    bridge: { from: "lab-dance-party", text: "In Robot Dance Party you put moves in order and swapped them. Here you do the same thing with code blocks in a maze." },
    pilot: true,
    time: { prep: 5, core: [15, 20], verified: false },
    stopAt: "You solve Maze level 3 online. The floor maze (Part 1) is an optional warm-up, and levels after 3 are bonus.",
    check: "Point to where the character will stop before you press Run. If it goes the wrong way, show the first block that caused it and explain your fix.",
    stuck: ["Watch the character move. Stop at the first wrong move.", "Left and right mean the character's left and right, not yours.", "Fix only one block, then run it again."],
    next: "event-party",
    title: "Robot Maze",
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
      "Younger students can stop after levels 1–3 of the online maze. Levels 4+ introduce loops and conditionals and connect to later Coding Foundations steps.",
      "For students with limited mobility, run Part 1 as a tabletop maze with a game piece."
    ]
  },
  {
    id: "event-party",
    group: "blocks",
    primm: {
      "predict": "Before you click the sprite, say what it will do.",
      "investigate": [
        "What starts each script running?",
        "What happens if two events start at the same time?"
      ],
      "modify": "Change which key starts one of your scripts.",
      "make": "Make a character with three different events that each do something new."
    },
    career: {
      "role": "App developer",
      "industry": "Maine banks and payment companies",
      "what": "Builds apps where every tap and click starts exactly the right action."
    },
    explain: "In three sentences: what each event does, one that didn't work at first and how you fixed it, and one event you'd add next.",
    standards: [
      "1B-AP-10"
    ],
    simple: {
      "mission": "Make a character that moves when you click it. Keys can make it move too.",
      "steps": [
        "Open Scratch. Pick a sprite, or keep the cat.",
        "Find the yellow Events blocks. Drag out \"when this sprite clicked.\"",
        "Snap a block under it, like \"say Hello!\"",
        "Click your sprite to test it.",
        "Add \"when space key pressed.\" Make it do something new.",
        "Add one more key that does something else.",
        "Test each one. If one doesn't work, check which key it uses."
      ]
    },
    skills: [
      "events"
    ],
    why: "Most programs sit and wait for you. Events are how a program knows you clicked, tapped, or pressed a key, so it can do something.",
    realWorld: "Every button you tap on a phone and every key you press in a video game starts an event.",
    vocab: [{"term": "Event", "def": "Something that happens, like a click or a key press, that starts code."}, {"term": "Input", "def": "Information you give a program."}, {"term": "Sprite", "def": "A character or object in Scratch."}],
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
    group: "blocks",
    primm: {
      "predict": "Count the blocks in the long dance. How many do you think a loop could save?",
      "investigate": [
        "Which moves repeat, and how many times?",
        "Does the short program do exactly the same dance as the long one?"
      ],
      "modify": "Change the repeat count and predict how the dance changes.",
      "make": "Make your own dance with a loop inside a loop, and have a partner predict it."
    },
    career: {
      "role": "Software engineer",
      "industry": "Maine manufacturing",
      "what": "Uses loops to make machines repeat the same job thousands of times without a mistake."
    },
    explain: "In three sentences: what your dance does, how many blocks the loops saved, and how you checked it matched the long version.",
    standards: [
      "1A-AP-10",
      "1B-AP-10"
    ],
    simple: {
      "mission": "Write a robot dance. Use repeat to make the program short. The dance must stay the same.",
      "steps": [
        "Do the long dance as a class. Count the moves. There are 16.",
        "Circle moves that repeat. Write the dance again with \"Repeat ___ times.\"",
        "Open the Dance Crew starter in Scratch. Click the green flag.",
        "Count the blocks. Write the number down.",
        "Put a repeat block around one clap and stomp. Delete the extra copies.",
        "The dance happens twice. Put repeat 2 around the middle part.",
        "Run it. Is it the same dance? Count your blocks again.",
        "Bonus: make your own dance with a loop inside a loop."
      ]
    },
    skills: [
      "loops"
    ],
    next: "debug-animation",
    starter: { file: "assets/starters/dance-crew.sb3", label: "Download the Dance Crew project", how: "In Scratch, choose File, then Load from your computer, and pick dance-crew.sb3." },
    bridge: { from: "lab-dance-party", text: "In Robot Dance Party you put moves in order. Here you'll find the moves that repeat and loop them." },
    time: { prep: 5, core: [25, 30], verified: false },
    stopAt: "Your Scratch dance uses repeat blocks, has fewer blocks than the starter, and still does the same dance (step 7). Step 8 is bonus.",
    check: "Before you run your short version, say how many times each repeat will run. Then show that the dance still matches.",
    stuck: ["Count the pattern first: which two moves repeat, and how many times in a row?", "Drag a repeat block around the moves that repeat, then delete the extra copies.", "The whole dance happens twice. A repeat can go around another repeat."],
    why: "Programmers don't like repeating themselves. A loop says “do this again” in one line, so programs are shorter and easier to fix.",
    realWorld: "A music app repeating a song, a game's countdown timer, and a factory robot doing the same job all day all use loops.",
    vocab: [{"term": "Loop", "def": "Instructions that repeat."}, {"term": "Pattern", "def": "Something that happens again and again in the same way."}, {"term": "Nested loop", "def": "A loop inside another loop."}],
    title: "Loop Dance Choreographers",
    area: "coding",
    summary: "Turn a long dance into a short program by spotting the moves that repeat.",
    level: "beginner",
    grades: ["2-3", "4-5"],
    duration: 30,
    format: "collaborative",
    equipment: ["unplugged", "computer"],
    source: "original",
    pathwayStage: 3,
    keywords: ["loops", "repeat", "patterns", "unplugged", "dance", "scratch", "nested loops"],
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
      "Your team is writing dance instructions for a robot that reads every word. Make the program as short as possible without changing the dance.",
    learn: [
      "Spot a repeating pattern in a set of instructions.",
      "Rewrite repeated steps as a loop: \"Repeat 4 times: clap, stomp.\"",
      "Check that the shorter program still produces the same result."
    ],
    before: {
      materials: ["Paper and pencils", "A board or projector to show the long dance", "Laptop or Chromebook per pair for the Scratch part", "Optional: music"],
      setup: [
        "Write this dance where everyone can see it: clap, stomp, clap, stomp, clap, stomp, spin, jump, clap, stomp, clap, stomp, clap, stomp, spin, jump."
      ],
      prerequisites: "Stage 2: has made something happen in response to an event."
    },
    steps: [
      "Warm-up: as a class, perform the long dance once. Count how many moves there are (16).",
      "In teams, circle the groups of moves that repeat, then rewrite the dance on paper with \"Repeat ___ times:\" so it uses fewer lines.",
      "Open Scratch and load the Dance Crew starter (File, then Load from your computer). Click the green flag to watch the long dance.",
      "Count the blocks in the Dancer's script and write the number down.",
      "Find the first group that repeats (clap, stomp). Drag a repeat block from Control around one clap and stomp pair, set the number, and delete the extra copies.",
      "The whole dance happens twice. Put a repeat 2 block around everything except the first and last \"switch costume to ready\" blocks.",
      "Run it and watch. Does your short program do the same dance as the long one? Count your blocks again.",
      "Bonus: make your own dance with a loop inside a loop, then trade with another team and predict their dance before you run it."
    ],
    reflect: "Why would a programmer want a shorter program if the result is the same?",
    extend: "Change one number in your repeat blocks and predict how the dance will change before you run it.",
    teacherNotes: [
      "A complete answer: Repeat 2 times: [Repeat 3 times: clap, stomp] then spin, jump. That's 5 lines instead of 16.",
      "Expect some teams to write \"Repeat 6 times: clap, stomp\" and miss the spin/jump. Performing it reveals the bug, which is the point.",
      "Seated movements (tap desk, snap, wave) work well for students who prefer not to dance.",
      "The Dance Crew starter has the long dance written out one move at a time: 35 blocks. A full solution (repeat 2 around repeat 3 of clap and stomp, then spin and jump) uses about 15.",
      "Ask afterward: “How did you know how many times each loop should repeat?”"
    ]
  },
  {
    id: "debug-animation",
    group: "blocks",
    primm: {
      "predict": "Before you click the green flag, read the script. What do you think will go wrong?",
      "investigate": [
        "Which block caused each bug?",
        "Why does changing one thing at a time make debugging easier?"
      ],
      "modify": "Fix one bug, run it, then fix the next.",
      "make": "Add a second fish that swims at a different speed, and test it."
    },
    career: {
      "role": "Quality assurance engineer",
      "industry": "Maine software and game studios",
      "what": "Finds and reports bugs before a game or app goes out to players."
    },
    explain: "In three sentences: what the fish does now, the trickiest bug you fixed, and how your bug log helped.",
    standards: [
      "1B-AP-15",
      "2-AP-17"
    ],
    skills: [
      "debugging",
      "loops"
    ],
    check: "Show your bug log. Pick one bug, explain what caused it, and show the one block you changed to fix it.",
    stopAt: "All four bugs are fixed and written in your bug log. The second fish is a bonus.",
    stuck: [
      "Fix one bug at a time, then run it again.",
      "Watch the fish closely. When does it first go wrong?",
      "Read the blocks inside the loop one by one. Which one doesn't match what you want?"
    ],
    next: "interactive-story",
    time: {
      "prep": 5,
      "core": [
        25,
        30
      ],
      "verified": false
    },
    why: "Programmers spend a lot of their time finding and fixing bugs. Changing one thing at a time, then testing again, is how professionals do it.",
    realWorld: "Before an app update comes out, testers run it again and again looking for bugs, just like you.",
    vocab: [{"term": "Bug", "def": "A mistake that makes a program do the wrong thing."}, {"term": "Debugging", "def": "Finding and fixing bugs."}, {"term": "Forever loop", "def": "A loop that never stops on its own."}],
    bridge: { from: "lab-rover", text: "Harbor Code Lab levels 4–6 used repeat blocks. Here a repeat stops too soon, and you'll find out why." },
    starter: { file: "assets/starters/debug-the-fish.sb3", label: "Download the broken fish project", how: "In Scratch, choose File, then Load from your computer, and pick debug-the-fish.sb3." },
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
        "Download the starter project below (debug-the-fish.sb3) onto each device, or a shared drive. It has the fish, a water backdrop, and the broken script already built.",
        "The broken script in the starter is:",
        "when green flag clicked → go to x: 0 y: 0 → repeat 10 → move 100 steps → if on edge, bounce → end repeat",
        "Leave the rotation style at its default (all around)."
      ],
      prerequisites: "Stage 3: can use a repeat block."
    },
    steps: [
      "Open the starter project: in Scratch, choose File, then Load from your computer, and pick debug-the-fish.sb3.", "Click the green flag and watch closely. Write down everything that looks wrong.",
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
    group: "games",
    primm: {
      "predict": "Before you type an answer, say which ending you'll see.",
      "investigate": [
        "How does the if–else decide the ending?",
        "What happens with an answer you didn't plan for?"
      ],
      "modify": "Handle the unexpected answer, like maybe.",
      "make": "Add a second choice so the story has three or four endings."
    },
    career: {
      "role": "Narrative game designer",
      "industry": "Maine game and media studios",
      "what": "Plans the choices in a story game and programs which path each one opens."
    },
    explain: "In three sentences: how the reader's choice changes the story, how you handled an unexpected answer, and what you'd add next.",
    standards: [
      "1B-AP-10"
    ],
    skills: [
      "logic",
      "communication"
    ],
    check: "Play your story both ways for a partner. Point to the if–else block and explain how it picks the ending.",
    stopAt: "Both answers lead to their own ending, and you've tested what happens with an unexpected answer.",
    stuck: [
      "The answer has to match exactly. Is it yes, or Yes?",
      "Put the ending blocks inside the if or the else, not after them.",
      "Test both answers every time you change something."
    ],
    next: "score-keeper",
    time: {
      "prep": 5,
      "core": [
        40,
        45
      ],
      "verified": false
    },
    why: "Programs make choices. An if–then–else block lets your program pick a path based on what the reader decides.",
    realWorld: "Choose-your-path games, quizzes that show your score, and apps that ask “Are you sure?” all branch with if–else.",
    vocab: [{"term": "Conditional", "def": "A check that decides what happens next."}, {"term": "Condition", "def": "The question being checked, like “Did they answer yes?”"}, {"term": "Branch", "def": "One of the paths a program can take."}],
    bridge: { from: "lab-moon-gate", text: "In Moon Base Gatekeeper, IF/ELSE chose who got through the gate, and you tested every badge. Here IF/ELSE chooses the story's ending. Test every answer." },
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
    group: "games",
    primm: {
      "predict": "If you catch 3 stars, what should the score be? Will it start at 0 next game?",
      "investigate": [
        "Where in your code does the score change?",
        "Why does the score need to reset when the game starts?"
      ],
      "modify": "Make some stars worth more points than others.",
      "make": "Add a timer or lives, using another variable."
    },
    career: {
      "role": "Game developer",
      "industry": "Maine game and app studios",
      "what": "Programs scores, timers, and rules that make games fair and fun."
    },
    explain: "In three sentences: how your game keeps score, one bug with the score you fixed, and the feature you'd add next.",
    standards: [
      "1B-AP-09",
      "2-AP-11"
    ],
    skills: [
      "data"
    ],
    check: "Play a game for a partner. Explain what the score variable stores and where in your code it changes.",
    stopAt: "Stars fall, the catcher catches them, the score goes up, and it starts at 0 every game.",
    stuck: [
      "Is the score check inside the forever loop? It has to check again and again.",
      "If the score doesn't reset, add set score to 0 when the green flag is clicked.",
      "If the star never comes back, check the y position test at the bottom."
    ],
    next: "my-blocks-patterns",
    time: {
      "prep": 5,
      "core": [
        40,
        45
      ],
      "verified": false
    },
    why: "Programs need memory. A variable remembers a value, like a score, and can change while the game is played.",
    realWorld: "Step counters, game high scores, and the battery percent on a phone are all variables.",
    vocab: [{"term": "Variable", "def": "A named place that stores a value that can change."}, {"term": "Value", "def": "What's stored in the variable right now."}, {"term": "Reset", "def": "Setting a variable back to its starting value."}],
    bridge: { from: "lab-space-blob", text: "In Feed the Space Blob, snacks was a variable: set it at the start, change it when something happens. Score works the same way." },
    figure: "score-keeper-star",
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
      "Inside your forever loop, add: if touching catcher then change score by 1 and send the star back to the top.",
      "Also inside the forever loop, add: if y position < -170 then send the star back to the top. (Look at the picture below.)",
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
    group: "blocks",
    primm: {
      "predict": "What will square (100) draw? What about repeat 12 with a 30-degree turn?",
      "investigate": [
        "Why is a custom block easier than copying the same code?",
        "What does the size input change?"
      ],
      "modify": "Change the size inside one block and watch the whole pattern update.",
      "make": "Build a second custom shape and combine both into your own pattern."
    },
    career: {
      "role": "Software engineer",
      "industry": "Maine design and engineering firms",
      "what": "Writes reusable functions so one fix updates every place a tool is used."
    },
    explain: "In three sentences: what your custom block does, how the input changes it, and how reusing it built your pattern.",
    standards: [
      "2-AP-14"
    ],
    skills: [
      "functions"
    ],
    check: "Show your custom block's definition. Change its size input and explain how one change updates the whole pattern.",
    stopAt: "Your square block draws the 12-square pattern. A second custom shape is the challenge.",
    stuck: [
      "Did you put size in place of the number 50 inside the define block?",
      "Click erase all and pen down before you test.",
      "If the pattern is off, check the turn: 12 turns of 30 degrees make a full circle."
    ],
    next: "capstone-game",
    time: {
      "prep": 5,
      "core": [
        40,
        45
      ],
      "verified": false
    },
    why: "Big programs are built from small pieces you can reuse. When you make your own block, you write it once and use it anywhere.",
    realWorld: "Apps reuse the same code to draw every button. When programmers fix that code once, every button gets fixed.",
    vocab: [{"term": "Custom block (function)", "def": "A named set of steps you can reuse."}, {"term": "Input", "def": "A value you give a block, like size."}, {"term": "Decomposition", "def": "Breaking a big problem into smaller parts."}],
    bridge: { from: "lab-rover", text: "Harbor Code Lab level 11 had you make your own block. Here you'll make one that draws a shape, then reuse it." },
    starter: { file: "assets/starters/pattern-studio.sb3", label: "Download the Pattern Studio starter", how: "In Scratch, choose File, then Load from your computer, and pick pattern-studio.sb3. The Pen extension and a square script are already there." },
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
      setup: ["Download the starter project below (pattern-studio.sb3) onto each device. It already has the Pen extension and a square script. Without it, students add Pen with the blue button at the bottom left."],
      prerequisites: "Stage 5: has used a variable."
    },
    steps: [
      "Open the starter (File, then Load from your computer). The Pen extension is added and a script draws a square with repeat 4: move 50, turn 90. Click the green flag to test it.",
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
    group: "games",
    primm: {
      "predict": "Before your tester plays, predict where they'll get stuck.",
      "investigate": [
        "Where did your tester actually get confused?",
        "Which fix will help the most players?"
      ],
      "modify": "Fix your tester's top problem and test again.",
      "make": "Add one feature that makes the game more fun, and test it."
    },
    career: {
      "role": "Game designer and producer",
      "industry": "Maine game studios and app companies",
      "what": "Plans a game, watches players test it, and decides what to fix before release."
    },
    explain: "In three sentences: what your game is about, the problem your tester found and how you fixed it, and what you'd build next.",
    standards: [
      "1B-AP-13",
      "2-AP-15",
      "2-AP-17"
    ],
    skills: [
      "debugging",
      "design-iteration",
      "communication"
    ],
    check: "Present your game. Explain one bug your tester found and how you fixed it.",
    stopAt: "A classmate has tested your game, you've fixed their top problem, and you've added one feature.",
    stuck: [
      "Start smaller: one player, one goal. Add more later.",
      "Watch your tester play without helping. Write down where they get confused.",
      "Fix one problem at a time and test after each fix."
    ],
    next: "python-turtle-bridge",
    time: {
      "prep": 10,
      "core": [
        45,
        90
      ],
      "verified": false
    },
    why: "Real programmers plan, build, test with real users, and improve. This activity is the whole process, with your own idea.",
    realWorld: "Game studios and app teams work this way: plan, build a first version, playtest, fix, and repeat.",
    vocab: [{"term": "Plan", "def": "A sketch of what you'll build and how it works."}, {"term": "Playtest", "def": "Letting someone try your project while you watch what happens."}, {"term": "Iterate", "def": "Improving something by repeating build, test, fix."}],
    title: "Capstone: Design Your Own Game",
    area: "coding",
    summary: "Plan, build, test, and present a game or app of your own idea.",
    level: "advanced",
    grades: ["4-5", "6-8"],
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
      "Open to any student whose Stage 6 “I can” is confirmed, including ready grade 4–5 students. Readiness, not grade, decides who starts it.",
      "Check plans before building starts. Most stalled projects began too big.",
      "Use the \"I can\" statement for Stage 7 as the assessment: plan, build, test, debug, and explain.",
      "Presentations can be quick (60–90 seconds) or recorded as a short screen walkthrough."
    ]
  },

  {
    id: "fix-the-recipe",
    group: "foundations",
    primm: {
      "predict": "Read the algorithm. Which step do you think will cause the first problem?",
      "investigate": [
        "What happened when the robot followed that step exactly?",
        "Was the bug a missing step, a wrong order, or an unclear step?"
      ],
      "modify": "Rewrite the buggy step so the robot can't misunderstand it.",
      "make": "Write the precise steps for a different task, like brushing teeth, and test them on a partner."
    },
    career: {
      "role": "Technical writer",
      "industry": "Maine manufacturing",
      "what": "Writes step-by-step instructions so people and machines can do a job exactly right."
    },
    explain: "In three sentences: what your fixed algorithm does, the bug you're proudest of finding, and how you made one step precise.",
    standards: [
      "1A-AP-08",
      "1A-AP-14"
    ],
    simple: {
      "mission": "The robot chef does exactly what the steps say. The steps have bugs. Fix them so the robot can make a sandwich.",
      "steps": [
        "Read the robot chef's steps. Do you see a problem?",
        "Watch the robot do step 1 exactly.",
        "When something goes wrong, call out \"Bug!\" Which step was it?",
        "Is a step missing, in the wrong place, or not clear?",
        "Help fix the step so it says exactly what to do.",
        "Start again from step 1 with your fix.",
        "Keep fixing until the robot makes the sandwich."
      ]
    },
    skills: [
      "sequencing",
      "debugging"
    ],
    check: "Name one bug you found, say what kind it was (missing, wrong order, or unclear), and read your fixed step out loud.",
    stuck: [
      "Watch for the first moment the robot does something strange. That step has the bug.",
      "Ask: is a step missing, in the wrong place, or unclear?",
      "Pretend you're the robot. Do exactly what the step says, nothing more."
    ],
    time: {
      "prep": 10,
      "core": [
        15,
        20
      ],
      "verified": false
    },
    board: { title: "The robot chef's sandwich algorithm. It has bugs!", lines: ["Put the spread on the bread.", "Put the bread together.", "Open the bread bag.", "Eat the sandwich."], note: "Your teacher is the robot chef. The robot does exactly what each step says, and nothing more." },
    stopAt: "The robot chef makes the sandwich by following your class's fixed algorithm from step 1 to the end.",
    next: "lab-robot-chef",
    why: "Computers do exactly what you say, not what you mean. Writing precise steps is one of the most important skills in coding.",
    realWorld: "When a robot arm or a self-checkout machine does something strange, it's usually because a step in its instructions was missing or unclear.",
    vocab: [{"term": "Algorithm", "def": "A set of steps, in order, that solves a problem."}, {"term": "Bug", "def": "A mistake that makes a program do the wrong thing."}, {"term": "Precise", "def": "Exact, with nothing left to guess."}],
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
      "Read the robot chef's algorithm above. Can you spot a problem before the robot starts?",
      "Watch the robot chef follow step 1 exactly as it's written.",
      "When something goes wrong, call out \"Bug!\" Which step caused it?",
      "Name the kind of bug: a missing step, a step in the wrong order, or a step that's unclear.",
      "Help rewrite that step so it's precise. Example: \"Pick up the knife and spread the topping on one slice of bread.\"",
      "Run the whole algorithm again from step 1 with your fix.",
      "Keep fixing until the robot makes the sandwich."
    ],
    reflect: "Why does the robot need more detail than a person would?",
    extend: "Try Robot Chef, the on-screen version: fix the sandwich algorithm yourself, then write one from scratch.",
    teacherNotes: [
      "Ham it up. The more literally you follow the steps, the clearer the idea becomes.",
      "Robot chef script: Step 1, set the closed jar on top of the closed bread bag. Step 2, press the bag and jar together. Step 3, open the bag (now it works). Step 4, pretend to bite the bag.",
      "Fixes to look for: open the bag first (wrong order), take out two slices and open the jar (missing steps), and say which tool spreads what, and where (unclear step).",
      "Use paper props in classrooms with food restrictions; it works just as well.",
      "This is a strong 20-minute opener before any coding stage."
    ]
  },

  /* Batch 7: Robot Chef lab entry and the grades 6–8 coding track (one per stage) plus the Python bridge. */
  {
    "id": "lab-robot-chef",
    "group": "foundations",
    "primm": {
      "predict": "Before you press Run, point to the step where you think the robot will go wrong first.",
      "investigate": [
        "Which kind of bug did you find: missing, wrong order, or unclear?",
        "Why can't the robot just guess what you meant?"
      ],
      "modify": "Fix one step, then run the whole algorithm again from the top.",
      "make": "Write a full sandwich algorithm yourself from the step bank (level 5)."
    },
    "career": {
      "role": "Software tester",
      "industry": "Maine healthcare and hospitals",
      "what": "Checks that the steps in hospital software happen in the right order, so nothing important gets skipped."
    },
    "explain": "In three sentences: what your algorithm does, one bug you fixed and how you found it, and one step you'd make even more precise.",
    "standards": [
      "1A-AP-08",
      "1A-AP-14"
    ],
    "simple": {
      "mission": "The robot chef follows your steps exactly. Fix the bugs so the robot can make lunch.",
      "steps": [
        "Level 1: Run the steps. Find the first one that goes wrong.",
        "Level 2: Put the steps in the right order. Run it.",
        "Level 3: Add the missing steps. Put them in place.",
        "Level 4: Fix steps that aren't clear.",
        "Level 5: Write all the steps yourself."
      ]
    },
    "skills": [
      "sequencing",
      "debugging"
    ],
    "next": "robot-maze-mission",
    "title": "Robot Chef",
    "area": "coding",
    "summary": "A robot chef follows your sandwich algorithm exactly as written. Find the first bug, fix the order, add missing steps, and make every step precise.",
    "level": "beginner",
    "grades": [
      "2-3",
      "4-5"
    ],
    "duration": 20,
    "format": "independent",
    "equipment": [
      "computer",
      "tablet"
    ],
    "source": "original",
    "pathwayStage": 1,
    "keywords": [
      "lab",
      "algorithm",
      "sequence",
      "debugging",
      "bugs",
      "instructions",
      "precise",
      "interactive"
    ],
    "access": {
      "account": "none",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "lab",
      "labId": "robot-chef",
      "label": "Open Robot Chef",
      "note": "Runs inside STEM 207. About 15–20 minutes. No outside account or website needed."
    },
    "time": {
      "prep": 0,
      "core": [
        15,
        20
      ],
      "verified": false
    },
    "stopAt": "The robot makes and eats the sandwich in Level 4. Level 5 is the challenge.",
    "check": "Tell your teacher one bug you fixed: which step, what kind of bug, and how you fixed it.",
    "stuck": [
      "Press Run and read the message. The robot tells you what it needed.",
      "Up and Down move a step. Add puts a bank step at the end.",
      "An unclear step leaves the robot guessing. Choose the rewrite that says exactly what to do."
    ],
    "mission": "The robot chef will make a sandwich, but only by following your steps exactly as they're written. Find the bugs in the class algorithm and fix them until the robot gets its lunch.",
    "learn": [
      "Explain that a computer follows instructions exactly, even when they're wrong.",
      "Find and name three kinds of bugs: missing steps, steps in the wrong order, and unclear steps.",
      "Fix an algorithm, then run it again to test the fix."
    ],
    "why": "Computers do exactly what you say, not what you mean. Finding and fixing bugs one at a time is how every programmer works.",
    "realWorld": "Robots in factories and kitchens follow exact steps too. When one does something strange, engineers look for the step that was missing, out of order, or unclear.",
    "vocab": [
      {
        "term": "Algorithm",
        "def": "A set of steps, in order, that solves a problem."
      },
      {
        "term": "Bug",
        "def": "A mistake that makes a program do the wrong thing."
      },
      {
        "term": "Debugging",
        "def": "Finding and fixing bugs."
      }
    ],
    "before": {
      "materials": [
        "Laptop, Chromebook, or tablet"
      ],
      "setup": [
        "Great right after Bug Hunt: Fix the Sandwich Algorithm, or as a stand-alone first lesson on algorithms."
      ],
      "prerequisites": "None."
    },
    "steps": [
      "Level 1: Run the class's buggy sandwich algorithm. Find the first step that went wrong and name the kind of bug.",
      "Level 2: Fix the order with Up and Down, then run it.",
      "Level 3: Add the missing steps from the step bank and move them into place.",
      "Level 4: Rewrite the unclear steps so the robot doesn't have to guess.",
      "Level 5: Challenge. Write the whole algorithm yourself from the step bank."
    ],
    "reflect": "Which kind of bug was hardest to spot: missing, wrong order, or unclear? Why?",
    "extend": "Write a bug-free algorithm for another job, like packing a backpack. Test it on a partner who follows it exactly.",
    "teacherNotes": [
      "Objective: an algorithm is a precise sequence, and a computer follows it literally. Students name three bug kinds: missing steps, wrong order, and unclear steps.",
      "The robot stops at the first bug and names the student's own step and what it needed, without giving the answer.",
      "Common mistake: thinking a step is fine because a person would understand it. The robot can't fill in gaps, so “Put the spread on the bread” fails.",
      "Level 4: one unclear step can become several precise steps. That's decomposition, which comes back in Stage 6.",
      "Ask afterward: “Why does a robot need more detail than a person?”"
    ]
  },
  {
    "id": "sort-the-catch",
    "group": "foundations",
    "primm": {
      "predict": "Which algorithm do you think will take fewer comparisons for 8 cards? Write your guess before you start.",
      "investigate": [
        "How many comparisons did each algorithm take? Were you right?",
        "What happens to the number of comparisons when the list doubles to 16 cards?"
      ],
      "modify": "Start from a list that's already almost sorted. Which algorithm wins now?",
      "make": "Invent your own way to sort the cards and count its comparisons against A and B."
    },
    "career": {
      "role": "Software engineer",
      "industry": "Maine seafood and shipping logistics",
      "what": "Chooses fast algorithms to sort and track thousands of orders and shipments every day."
    },
    "explain": "In three sentences: which algorithm you'd recommend and why, what your comparison counts showed, and what would change with a much bigger list.",
    "standards": [
      "1B-AP-08",
      "2-AP-10"
    ],
    "skills": [
      "sequencing"
    ],
    "track": "6-8",
    "title": "Sort the Catch: Race Two Algorithms",
    "area": "coding",
    "summary": "Sort a pile of lobster-size cards two different ways, count every comparison, and find out which algorithm does less work.",
    "level": "intermediate",
    "grades": [
      "6-8"
    ],
    "duration": 30,
    "format": "collaborative",
    "equipment": [
      "unplugged"
    ],
    "source": "original",
    "pathwayStage": 1,
    "keywords": [
      "algorithm",
      "sorting",
      "efficiency",
      "comparisons",
      "unplugged",
      "lobster",
      "grades 6-8"
    ],
    "access": {
      "account": "none",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "none"
    },
    "time": {
      "prep": 10,
      "core": [
        25,
        30
      ],
      "verified": false
    },
    "bridge": {
      "from": "lab-rover",
      "text": "Harbor Code Lab had you write exact steps for a boat. Here you'll compare two sets of exact steps that do the same job."
    },
    "stopAt": "Your pair has comparison counts for both algorithms on the same starting order, and a recommendation with a reason.",
    "check": "Tell your teacher which algorithm took fewer comparisons for your cards, and whether that would always be true.",
    "stuck": [
      "Count a comparison every time you look at two cards to decide which is smaller, even if you don't move them.",
      "Lost your place? Put the cards back in the starting order from your sheet and start that algorithm again.",
      "In Bubble, a pass goes all the way to the end of the row before you start again from the left."
    ],
    "next": "lighthouse-network",
    "mission": "The co-op dock needs the day's catch sorted from smallest to largest. Your crew will run two sorting algorithms on the same cards, count the work each one takes, and recommend the faster one.",
    "learn": [
      "Follow a sorting algorithm exactly and count its comparisons.",
      "Compare two algorithms that give the same result with different amounts of work.",
      "Explain why the faster algorithm matters more as the list gets bigger."
    ],
    "why": "Computers sort huge lists all the time: search results, contacts, prices. With millions of items, a faster algorithm can mean seconds instead of hours.",
    "realWorld": "When you sort a spreadsheet, or a store sorts products by price, a sorting algorithm runs. Programmers choose between algorithms by counting the work each one takes.",
    "vocab": [
      {
        "term": "Algorithm",
        "def": "A set of steps, in order, that solves a problem."
      },
      {
        "term": "Comparison",
        "def": "Checking two items to decide which comes first."
      },
      {
        "term": "Efficiency",
        "def": "How much work an algorithm takes to finish."
      }
    ],
    "before": {
      "materials": [
        "8 index cards per pair, numbered with lobster sizes (for example 3, 7, 1, 8, 2, 6, 4, 5)",
        "Pencil and a tally sheet"
      ],
      "setup": [
        "Make card sets, or have pairs write their own 8 numbers in a random order.",
        "Write the two algorithm names on the board: A, Find the smallest. B, Bubble."
      ],
      "prerequisites": "Can follow and write step-by-step instructions. New to coding? Start with Robot Maze."
    },
    "steps": [
      "Shuffle your 8 cards and lay them face up in a row. Copy the starting order onto your sheet.",
      "Algorithm A, Find the smallest: look along the row for the smallest card and move it to a new sorted row. Make a tally mark every time you compare two cards. Repeat until no cards are left.",
      "Write down how many comparisons Algorithm A took.",
      "Put the cards back in the same starting order.",
      "Algorithm B, Bubble: compare the first two cards. If the left one is bigger, swap them. Move one card to the right and compare again, all the way to the end of the row. Tally every comparison.",
      "Keep doing passes from the left until you make a whole pass with no swaps. Write down the total comparisons.",
      "Compare with another pair. Did you all end with the same sorted row? Did both algorithms take the same work?",
      "Predict how many comparisons each algorithm needs for 16 cards. Test one if you have time."
    ],
    "reflect": "If two algorithms give the same answer, why would a programmer care which one they use?",
    "extend": "Invent your own sorting algorithm. Write it as exact steps, test it on the cards, and count its comparisons. Can you beat both?",
    "teacherNotes": [
      "Objective: algorithms that produce the same result can take very different amounts of work. Counting comparisons is a simple way to measure efficiency.",
      "Algorithm A always takes 28 comparisons for 8 cards (7 + 6 + 5 + 4 + 3 + 2 + 1), and 120 for 16. Algorithm B depends on the starting order: only 7 if the cards are already sorted, and many more if they start in reverse.",
      "Common mistake: deciding the algorithms are the same because the sorted row is the same. The point is the work, not the result.",
      "Ask afterward: “If two programs give the same answer, how would you choose between them?”"
    ]
  },
  {
    "area": "coding",
    "grades": [
      "6-8"
    ],
    "track": "6-8",
    "format": "independent",
    "equipment": [
      "computer"
    ],
    "source": "original",
    "access": {
      "account": "optional",
      "accountNote": "An account is only needed to save online. Students can use File → Save to your computer instead.",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "ready",
      "label": "Open the Scratch editor",
      "url": "https://scratch.mit.edu/projects/editor/",
      "provider": "Scratch (MIT)",
      "note": "Free. Works without signing in."
    },
    "id": "lighthouse-network",
    "group": "blocks",
    "primm": {
      "predict": "When you press space, which lighthouse flashes first, and in what order do the others follow?",
      "investigate": [
        "How does a broadcast pass the signal along?",
        "What's the difference between broadcast and broadcast and wait?"
      ],
      "modify": "Add a fourth lighthouse to the chain.",
      "make": "Design your own message chain, like a relay race or a doorbell system."
    },
    "career": {
      "role": "Network engineer",
      "industry": "Maine telecommunications and broadband",
      "what": "Designs how messages travel from device to device across the state's networks."
    },
    "explain": "In three sentences: how your signal travels, what broadcast and wait changed, and one bug in the chain you fixed.",
    "standards": [
      "1B-AP-10",
      "2-AP-13"
    ],
    "skills": [
      "events"
    ],
    "title": "Lighthouse Network: Broadcast Messages",
    "summary": "Make three lighthouses signal each other with broadcast messages, so one key press sends a light down the coast.",
    "level": "intermediate",
    "duration": 30,
    "pathwayStage": 2,
    "keywords": [
      "events",
      "broadcast",
      "messages",
      "scratch",
      "lighthouse",
      "grades 6-8"
    ],
    "time": {
      "prep": 5,
      "core": [
        25,
        30
      ],
      "verified": false
    },
    "bridge": {
      "from": "lab-dance-party",
      "text": "In Robot Dance Party, the green flag started your program. Here, a message from one sprite starts another sprite's program."
    },
    "stopAt": "One key press makes all three lighthouses flash in order and the boat answers (step 7). Step 8 is bonus.",
    "check": "Point to one broadcast block and the when I receive block it starts. Explain how the signal gets from North to South.",
    "stuck": [
      "Check the message names: the message in broadcast must be the same message chosen in when I receive.",
      "Each lighthouse needs its own script. Click the sprite in the sprite list to see its code.",
      "Nothing flashes? Make sure each lighthouse has two costumes, named off and on."
    ],
    "next": "snowstorm-clones",
    "mission": "Fog is rolling in. Build a chain of three lighthouses: when you press a key, the first one flashes and passes a signal to the next, all the way down the coast.",
    "learn": [
      "Use broadcast and when I receive blocks to send messages between sprites.",
      "Build a chain of events where one script starts the next.",
      "Explain the difference between broadcast and broadcast and wait."
    ],
    "why": "Big programs are split into parts that send messages to each other. Broadcasts let one part of your program tell the others that something happened.",
    "realWorld": "When a text arrives, the messaging part of your phone sends a message to the notification part, which tells the speaker to ding. Real apps are built from parts passing messages.",
    "vocab": [
      {
        "term": "Broadcast",
        "def": "A message one script sends to every sprite."
      },
      {
        "term": "When I receive",
        "def": "An event that starts a script when a message arrives."
      },
      {
        "term": "Broadcast and wait",
        "def": "Sends a message, then waits until the scripts it started have finished."
      }
    ],
    "before": {
      "materials": [
        "Laptop or Chromebook with a keyboard"
      ],
      "setup": [
        "Open the Scratch editor in a browser tab."
      ],
      "prerequisites": "Has made a sprite react to a click or a key (Click, Tap, Go! Event Party)."
    },
    "steps": [
      "Open Scratch. Delete the cat, then paint a simple lighthouse sprite. A tall rectangle with a triangle on top is enough.",
      "Paint a second costume with a bright yellow light at the top. Name the costumes off and on.",
      "Duplicate the lighthouse twice and spread all three across the stage. Name them North, Middle, and South.",
      "In North, build: when space key pressed, switch costume to on, wait 0.5 seconds, switch costume to off, then broadcast a new message called middle.",
      "In Middle, build: when I receive middle, flash the same way, then broadcast a new message called south.",
      "In South, build: when I receive south, flash. Press space and watch the signal travel down the coast.",
      "Add a boat sprite. At the end of South's script, broadcast a message called safe. Make the boat say \"Thanks, I see the light!\" when it receives safe.",
      "At the end of North's script, add say Signal sent! for 2 seconds. Try broadcast middle, then broadcast middle and wait. When does North speak each time?"
    ],
    "reflect": "Why might a programmer use messages instead of putting all the code in one sprite?",
    "extend": "Make the signal bounce back north after it reaches South, so the lights run up and down the coast. How will you make it stop?",
    "teacherNotes": [
      "Objective: messages coordinate several sprites, which is how larger programs are organized.",
      "Common mistake: two messages with almost the same name. Students should pick the existing message from the menu instead of making a new one.",
      "Step 8: with broadcast, North speaks right away. With broadcast and wait, North waits until Middle's when I receive script finishes, then speaks.",
      "Ask afterward: “How is a broadcast like passing a note down a row?”"
    ]
  },
  {
    "area": "coding",
    "grades": [
      "6-8"
    ],
    "track": "6-8",
    "format": "independent",
    "equipment": [
      "computer"
    ],
    "source": "original",
    "access": {
      "account": "optional",
      "accountNote": "An account is only needed to save online. Students can use File → Save to your computer instead.",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "ready",
      "label": "Open the Scratch editor",
      "url": "https://scratch.mit.edu/projects/editor/",
      "provider": "Scratch (MIT)",
      "note": "Free. Works without signing in."
    },
    "id": "snowstorm-clones",
    "group": "blocks",
    "primm": {
      "predict": "How many snowflakes do you think will be on the screen at once?",
      "investigate": [
        "What does each clone do on its own?",
        "Why does a clone need to delete itself?"
      ],
      "modify": "Give the flakes different speeds with a variable for this sprite only.",
      "make": "Simulate something else with clones, like rain, stars, or fish in a school."
    },
    "career": {
      "role": "Weather data programmer",
      "industry": "Maine weather forecasting and emergency management",
      "what": "Builds simulations that help forecasters predict where a storm's snow will fall."
    },
    "explain": "In three sentences: how your storm works, what the clones and variables do, and one change that made it more realistic.",
    "standards": [
      "2-AP-12"
    ],
    "skills": [
      "loops"
    ],
    "title": "Snowstorm Simulator: Clones and Loops",
    "summary": "Use loops to make 100 snowflake clones that each fall on their own, with random sizes and speeds.",
    "level": "intermediate",
    "duration": 45,
    "pathwayStage": 3,
    "keywords": [
      "loops",
      "clones",
      "repeat until",
      "random",
      "snow",
      "simulation",
      "scratch",
      "grades 6-8"
    ],
    "time": {
      "prep": 5,
      "core": [
        30,
        40
      ],
      "verified": false
    },
    "bridge": {
      "from": "lab-rover",
      "text": "Harbor Code Lab's loops repeated steps for one boat. Here a loop makes a hundred copies, and each copy runs its own loop."
    },
    "stopAt": "Snowflakes of different sizes fall from random spots and disappear at the bottom (step 6). Steps 7–8 are bonus.",
    "check": "Explain the job of each loop: which loop makes the flakes, and which loop makes one flake fall?",
    "stuck": [
      "No flakes? The original sprite hides, and only clones show. Check that the clone script has show.",
      "Flakes stuck at the top? Inside repeat until, change y by a negative number so they move down.",
      "Scratch allows up to 300 clones at once. If flakes stop appearing, check that each clone ends with delete this clone."
    ],
    "next": "noreaster-alerts",
    "mission": "A nor'easter is heading for the Maine coast. Program a snowstorm from one snowflake sprite, cloned again and again, with every flake falling on its own.",
    "learn": [
      "Use a loop with create clone to make many copies of one sprite.",
      "Use when I start as a clone and a repeat until loop to control each copy.",
      "Explain why clones should delete themselves when they're done."
    ],
    "why": "Loops let one program control hundreds of things at once. Clones plus loops are how games make crowds, raindrops, and enemies without writing code for each one.",
    "realWorld": "Video games and weather animations use the same idea: one piece of code, copied many times, with each copy keeping its own position and speed.",
    "vocab": [
      {
        "term": "Clone",
        "def": "A copy of a sprite that runs its own scripts."
      },
      {
        "term": "Repeat until",
        "def": "A loop that keeps going until a condition becomes true."
      },
      {
        "term": "Local variable",
        "def": "A variable each sprite or clone keeps for itself (\"For this sprite only\")."
      }
    ],
    "before": {
      "materials": [
        "Laptop or Chromebook"
      ],
      "setup": [
        "Open the Scratch editor in a browser tab."
      ],
      "prerequisites": "Can use a repeat loop and explain how many times it runs (Stage 3)."
    },
    "steps": [
      "Open Scratch. Paint a dark blue backdrop. Delete the cat and paint a small white circle as a Snowflake sprite.",
      "In Snowflake, build: when green flag clicked, hide, then repeat 100: create clone of myself, wait 0.1 seconds.",
      "Start a second script: when I start as a clone, go to x: (pick random -230 to 230) y: 180, then show.",
      "Under that, add repeat until <(y position) < -170>, and inside it put change y by -3.",
      "After the repeat until loop, add delete this clone. Click the green flag and watch the storm.",
      "Make every flake different: before the falling loop, set size to (pick random 30 to 100) %.",
      "Make some flakes faster: make a variable called speed and choose \"For this sprite only.\" At the start of the clone script, set speed to (pick random 2 to 6). Change y by (0 - speed) instead of -3.",
      "Add wind: inside the falling loop, change x by (pick random -1 to 1)."
    ],
    "reflect": "Your program makes 100 snowflakes, but you wrote the falling code once. How does that work?",
    "extend": "Make the snow pile up: add the Pen extension and stamp each flake just before it deletes itself.",
    "teacherNotes": [
      "Objective: one loop creates clones, and a second loop inside each clone moves it. Students see that one script can run as many copies.",
      "Scratch allows up to 300 clones at a time. Deleting clones at the bottom keeps the storm going.",
      "Common mistake: putting the falling loop under the green flag script, so only the original sprite moves. Clone behavior starts with when I start as a clone.",
      "Step 7: a variable made \"For this sprite only\" gives every clone its own speed. A variable for all sprites would make every flake share one speed.",
      "Ask afterward: “How many times does the code inside repeat until run in total, across all the flakes?”"
    ]
  },
  {
    "area": "coding",
    "grades": [
      "6-8"
    ],
    "track": "6-8",
    "format": "independent",
    "equipment": [
      "computer"
    ],
    "source": "original",
    "access": {
      "account": "optional",
      "accountNote": "An account is only needed to save online. Students can use File → Save to your computer instead.",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "ready",
      "label": "Open the Scratch editor",
      "url": "https://scratch.mit.edu/projects/editor/",
      "provider": "Scratch (MIT)",
      "note": "Free. Works without signing in."
    },
    "id": "noreaster-alerts",
    "group": "blocks",
    "primm": {
      "predict": "For each test reading, write which alert you expect before you run it.",
      "investigate": [
        "Why does the order of the checks matter?",
        "What happens at an edge case, like exactly 35 mph?"
      ],
      "modify": "Swap the order of two checks and find the test that breaks.",
      "make": "Add a new alert with its own compound condition, and write two tests for it."
    },
    "career": {
      "role": "Emergency alert systems developer",
      "industry": "Maine public safety and weather services",
      "what": "Writes and tests the rules that decide when to send storm warnings to phones."
    },
    "explain": "In three sentences: how your station picks an alert, the edge case you handled, and why the order of the checks matters.",
    "standards": [
      "2-AP-12",
      "2-AP-17"
    ],
    "skills": [
      "logic",
      "design-iteration"
    ],
    "title": "Nor'easter Alert Station: Compound Conditions",
    "summary": "Build a weather station that asks for wind, snow, and temperature, then uses and, or, and not to choose the right alert.",
    "level": "intermediate",
    "duration": 30,
    "pathwayStage": 4,
    "keywords": [
      "conditionals",
      "and",
      "or",
      "not",
      "boolean",
      "testing",
      "weather",
      "scratch",
      "grades 6-8"
    ],
    "time": {
      "prep": 5,
      "core": [
        25,
        35
      ],
      "verified": false
    },
    "bridge": {
      "from": "lab-moon-gate",
      "text": "Moon Base Gatekeeper's rule checked one thing. This station checks several things at once."
    },
    "board": {
      "title": "Test readings (wind mph, snow inches, temperature °F)",
      "lines": [
        "Test 1: 40 mph, 10 in, 20°F",
        "Test 2: 20 mph, 10 in, 25°F",
        "Test 3: 55 mph, 0 in, 40°F",
        "Test 4: 10 mph, 2 in, 28°F",
        "Test 5: 10 mph, 2 in, 36°F",
        "Test 6: 35 mph, 7 in, 30°F"
      ],
      "note": "Before you run each test, write down which alert it should show. These are made-up rules for practice; real weather alerts use more information, like how far you can see."
    },
    "stopAt": "Your station shows the alert you expected for all six test readings (step 6).",
    "check": "Show your teacher one test where and mattered, and one where the order of your checks mattered.",
    "stuck": [
      "The answer block holds only the latest answer. Set each variable right after its ask block.",
      "With and, both sides must be true. With or, only one side needs to be true.",
      "Put not around the whole check: not <(temp) > 32> means 32 degrees or colder."
    ],
    "next": "catch-log-lists",
    "mission": "Your town's weather station needs an alert system. It asks for three readings and decides which alert to show. Your rules have to give the right alert for every storm.",
    "learn": [
      "Combine conditions with and, or, and not.",
      "Put if–else checks in the right order, from most serious to least.",
      "Test rules with a table of test cases, including edge cases."
    ],
    "why": "Real decisions depend on more than one thing. And, or, and not let a program check several facts at once and choose correctly.",
    "realWorld": "Weather apps, game rules, and security systems all combine conditions, like a door that opens if you have a badge and it's a school day.",
    "vocab": [
      {
        "term": "And",
        "def": "True only when both conditions are true."
      },
      {
        "term": "Or",
        "def": "True when at least one condition is true."
      },
      {
        "term": "Not",
        "def": "Flips true to false, and false to true."
      },
      {
        "term": "Edge case",
        "def": "A test right at a boundary, like exactly 35."
      }
    ],
    "before": {
      "materials": [
        "Laptop or Chromebook with a keyboard"
      ],
      "setup": [
        "Open the Scratch editor in a browser tab."
      ],
      "prerequisites": "Can use if–then–else and test every path (Stage 4)."
    },
    "steps": [
      "Open Scratch and pick a sprite to be the station. Make three variables: wind, snow, and temp.",
      "When green flag clicked: ask \"Wind speed in miles per hour?\" and wait, then set wind to (answer). Do the same for snow (inches expected) and temp (degrees F).",
      "Add an if–else: if <<(wind) > 35> and <(snow) > 6>> then say \"BLIZZARD ALERT: stay home.\"",
      "In the else part, add another if–else: if <<(snow) > 6> or <(wind) > 50>> then say \"STORM WARNING: travel with care.\"",
      "In that else part, add one more if–else: if <<(snow) > 0> and <not <(temp) > 32>>> then say \"Snowy day. Dress warm!\" else say \"No alert today.\"",
      "Run all six test readings above. Check each alert against the one you wrote down.",
      "Swap the order so the storm check comes first. Run Test 1 again. What breaks, and why?",
      "Test 6 is an edge case. Should exactly 35 mph count? Scratch has no ≥ block, so combine > and = with or, then explain your choice."
    ],
    "reflect": "Why did the order of your checks change the result, even though the rules were the same?",
    "extend": "Add a fourth reading, like visibility, and a rule that uses it. Write two new test readings for it before you build it.",
    "teacherNotes": [
      "Objective: compound conditions (and, or, not) and the order of if–else checks.",
      "Expected alerts: Test 1 Blizzard, Test 2 Storm, Test 3 Storm, Test 4 Snowy day, Test 5 No alert, Test 6 Storm (35 is not greater than 35).",
      "These thresholds are made up for practice. If students ask, real winter storm alerts also depend on things like visibility and timing.",
      "Common mistake: checking the less serious alert first. The first true check wins, so a blizzard shows as a storm warning.",
      "Ask afterward: “Why does the order of if–else checks matter?”"
    ]
  },
  {
    "area": "coding",
    "grades": [
      "6-8"
    ],
    "track": "6-8",
    "format": "independent",
    "equipment": [
      "computer"
    ],
    "source": "original",
    "access": {
      "account": "optional",
      "accountNote": "An account is only needed to save online. Students can use File → Save to your computer instead.",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "ready",
      "label": "Open the Scratch editor",
      "url": "https://scratch.mit.edu/projects/editor/",
      "provider": "Scratch (MIT)",
      "note": "Free. Works without signing in."
    },
    "id": "catch-log-lists",
    "group": "blocks",
    "primm": {
      "predict": "With 2, 4, 6, 8, and 10, what should the total, average, and best day be?",
      "investigate": [
        "How does the loop visit every item in the list?",
        "Why does best start as the first item?"
      ],
      "modify": "Add the worst day to your catch log.",
      "make": "Log something else for a week, like steps or temperatures, and report the totals."
    },
    "career": {
      "role": "Data analyst",
      "industry": "Maine fisheries and aquaculture",
      "what": "Turns daily catch and harvest numbers into totals and trends that help crews plan."
    },
    "explain": "In three sentences: what your log calculates, how you checked it was right, and one more statistic you'd add.",
    "standards": [
      "2-AP-11"
    ],
    "skills": [
      "loops",
      "data"
    ],
    "title": "Catch Log: Lists and Averages",
    "summary": "Store a week of lobster counts in a list, then write code that finds the total, the average, and the best day.",
    "level": "intermediate",
    "duration": 45,
    "pathwayStage": 5,
    "keywords": [
      "variables",
      "lists",
      "loops",
      "average",
      "data",
      "lobster",
      "scratch",
      "grades 6-8"
    ],
    "time": {
      "prep": 5,
      "core": [
        30,
        40
      ],
      "verified": false
    },
    "bridge": {
      "from": "lab-space-blob",
      "text": "Feed the Space Blob had one variable, snacks. Now you'll keep many values in a list."
    },
    "stopAt": "Your program reports the correct total and average for your test numbers (step 8). Best day is a bonus.",
    "check": "Explain what the variable i does in your loop, and why it starts at 1.",
    "stuck": [
      "The list keeps growing each run? Put delete all of catch at the very top.",
      "Total too big? Set total to 0 before the loop, every time.",
      "Best day wrong? Set i back to 1 before the second loop."
    ],
    "next": "snowflake-functions",
    "mission": "A lobster crew wants to know how their week went. Build a catch log that stores each day's count in a list, then calculates the total, the average, and the best day.",
    "learn": [
      "Create a list and add items to it while a program runs.",
      "Use a loop with a counter variable to visit every item in a list.",
      "Calculate a total, an average, and a maximum from a list."
    ],
    "why": "A variable holds one value. A list holds many. Almost every real program works with lists: messages, songs, scores, or sensor readings.",
    "realWorld": "A fitness watch keeps a list of your steps for each day and loops through it to find your weekly total and best day, just like your catch log.",
    "vocab": [
      {
        "term": "List",
        "def": "A variable that holds many items in order."
      },
      {
        "term": "Item",
        "def": "One value in a list, found by its position number."
      },
      {
        "term": "Counter",
        "def": "A variable, like i, that keeps track of which item you're on."
      },
      {
        "term": "Average",
        "def": "The total divided by how many items there are."
      }
    ],
    "before": {
      "materials": [
        "Laptop or Chromebook with a keyboard"
      ],
      "setup": [
        "Open the Scratch editor in a browser tab."
      ],
      "prerequisites": "Can create a variable, change it, and reset it (Stage 5)."
    },
    "steps": [
      "Open Scratch. In Variables, choose Make a List and name it catch. Make variables called i, total, and best.",
      "When green flag clicked: delete all of catch, then repeat 5: ask \"How many lobsters today?\" and wait, then add (answer) to catch.",
      "Run it and type five numbers. Watch them appear in the list on the stage.",
      "Find the total: set total to 0, set i to 1, then repeat (length of catch): change total by (item (i) of catch), change i by 1.",
      "Say (join \"Total: \" (total)) for 2 seconds.",
      "Find the average: say (join \"Average: \" ((total) / (length of catch))) for 2 seconds.",
      "Find the best day: set best to (item 1 of catch) and set i to 1. Loop through the list again: if <(item (i) of catch) > (best)> then set best to (item (i) of catch). Change i by 1 each time.",
      "Test with numbers you can check in your head: 2, 4, 6, 8, 10. You should get total 30, average 6, and best 10."
    ],
    "reflect": "Why is a list better than making a separate variable for each day?",
    "extend": "Find the worst day too, and say which day number was best, not just the count.",
    "teacherNotes": [
      "Objective: lists plus a counter loop that visits every item, to compute a total, an average, and a maximum.",
      "Common mistake: not resetting total or i, so a second run gives wrong answers. This is the same reset bug from Feed the Space Blob and Score Keeper.",
      "Scratch lists start at item 1, not 0.",
      "Answers from ask are text. Scratch does math on typed numbers, but anything that isn't a number counts as 0, so test with numbers only.",
      "Ask afterward: “What would you change to log 30 days instead of 5?”"
    ]
  },
  {
    "area": "coding",
    "grades": [
      "6-8"
    ],
    "track": "6-8",
    "format": "independent",
    "equipment": [
      "computer"
    ],
    "source": "original",
    "access": {
      "account": "optional",
      "accountNote": "An account is only needed to save online. Students can use File → Save to your computer instead.",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "ready",
      "label": "Open the Scratch editor",
      "url": "https://scratch.mit.edu/projects/editor/",
      "provider": "Scratch (MIT)",
      "note": "Free. Works without signing in."
    },
    "id": "snowflake-functions",
    "group": "blocks",
    "primm": {
      "predict": "With snowflake (80) (6), how many arms will you see, and how far apart?",
      "investigate": [
        "How does the snowflake block use the arm block?",
        "Why does the turn equal 360 divided by arms?"
      ],
      "modify": "Try 5 and 8 arms. Predict the angle first.",
      "make": "Fill the sky with different flakes using random inputs."
    },
    "career": {
      "role": "Graphics programmer",
      "industry": "Maine game, media, and design studios",
      "what": "Builds functions with inputs that draw complex shapes and effects from simple pieces."
    },
    "explain": "In three sentences: how your snowflake is built from blocks, what the inputs control, and one bug you fixed.",
    "standards": [
      "2-AP-14"
    ],
    "skills": [
      "functions"
    ],
    "title": "Snowflake Studio: Custom Blocks with Inputs",
    "summary": "Make custom blocks with inputs, use one inside another, and draw a sky full of different snowflakes.",
    "level": "advanced",
    "duration": 45,
    "pathwayStage": 6,
    "keywords": [
      "functions",
      "custom blocks",
      "my blocks",
      "inputs",
      "parameters",
      "pen",
      "snowflake",
      "scratch",
      "grades 6-8"
    ],
    "time": {
      "prep": 5,
      "core": [
        35,
        45
      ],
      "verified": false
    },
    "bridge": {
      "from": "lab-rover",
      "text": "Harbor Code Lab's Make a Haul block had no inputs. Here your blocks take inputs, and one block uses another."
    },
    "stopAt": "One snowflake block draws flakes with different sizes and numbers of arms (step 6). Steps 7–8 are bonus.",
    "check": "Point to your two custom blocks and explain how snowflake uses arm. What do the inputs change?",
    "stuck": [
      "Lopsided flake? Each arm has to end back at the center, facing the way it started. Check that your turns add up to zero.",
      "Lines everywhere? Put pen up before go to random position, and pen down at the start of arm.",
      "Turn by (360 / arms) so the arms spread evenly all the way around."
    ],
    "next": "python-turtle-bridge",
    "mission": "No two snowflakes are alike. Build a snowflake machine from custom blocks: one block draws an arm, another uses it to draw a whole flake, and inputs make every flake different.",
    "learn": [
      "Create a custom block with more than one input.",
      "Use one custom block inside another to build a bigger part from smaller ones.",
      "Use inputs and Run without screen refresh to draw many different shapes quickly."
    ],
    "why": "Programmers build big things from small, named pieces, and inputs let one piece do many jobs. That's how huge programs stay easy to understand.",
    "realWorld": "Drawing and design apps reuse code like drawShape(size, sides) for every shape you make. Fix it once, and every shape gets the fix.",
    "vocab": [
      {
        "term": "Custom block (function)",
        "def": "A named set of steps you can reuse."
      },
      {
        "term": "Input (parameter)",
        "def": "A value you give a block each time you use it."
      },
      {
        "term": "Composition",
        "def": "Building a bigger block out of smaller blocks."
      },
      {
        "term": "Run without screen refresh",
        "def": "A setting that draws everything at once instead of step by step."
      }
    ],
    "before": {
      "materials": [
        "Laptop or Chromebook"
      ],
      "setup": [
        "Open the Scratch editor in a browser tab."
      ],
      "prerequisites": "Has made a custom block with one input (Pattern Studio with My Blocks), or confirmed Stage 5."
    },
    "steps": [
      "Open Scratch. Click Add Extension (bottom left) and choose Pen. Paint a small dot as your sprite.",
      "In My Blocks, click Make a Block. Name it arm, add a number input called size, and click OK.",
      "Under define arm (size), build: pen down, move ((size) / 2) steps, turn right 45, move ((size) / 3) steps, move ((0) - ((size) / 3)) steps, turn left 90, move ((size) / 3) steps, move ((0) - ((size) / 3)) steps, turn right 45, move ((size) / 2) steps, move ((0) - (size)) steps.",
      "Test it: click arm with 80 typed in. You should see one arm with a V of branches, and the sprite back at the center.",
      "Make a second block called snowflake with two number inputs, size and arms. Inside: repeat (arms): arm (size), then turn right ((360) / (arms)) degrees.",
      "When green flag clicked: erase all, go to x: 0 y: 0, snowflake (80) (6). Then try 8 arms and 5 arms.",
      "Speed it up: right-click define snowflake, choose Edit, check Run without screen refresh, and click OK.",
      "Fill the sky: repeat 12: pen up, go to random position, set pen color to (pick random 0 to 100), snowflake (pick random 20 to 60) (6)."
    ],
    "reflect": "You changed arm once, and every snowflake changed. Why is that useful?",
    "extend": "Add a third input to snowflake, like branch angle, and make flakes that change shape each time.",
    "teacherNotes": [
      "Objective: functions with more than one input, and composition (a custom block that uses another custom block).",
      "Common mistake: an arm that doesn't return to the center, so each arm starts in the wrong place. Every move out needs a move back, and the turns need to add up to zero.",
      "360 / arms is the key math: 6 arms means 60 degrees each.",
      "Run without screen refresh makes drawing instant. Leaving it off at first lets students watch each line, which helps with debugging.",
      "Ask afterward: “If you found a bug in arm, how many snowflakes would one fix repair?”"
    ]
  },
  {
    "area": "coding",
    "grades": [
      "6-8"
    ],
    "track": "6-8",
    "format": "independent",
    "equipment": [
      "computer"
    ],
    "source": "original",
    "access": {
      "account": "optional",
      "accountNote": "An account is only needed to save online. Students can use File → Save to your computer instead.",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "ready",
      "label": "Open the Scratch editor",
      "url": "https://scratch.mit.edu/projects/editor/",
      "provider": "Scratch (MIT)",
      "note": "Free. Works without signing in."
    },
    "id": "capstone-studio",
    "group": "games",
    "primm": {
      "predict": "Before each playtest, write where you think the player will struggle.",
      "investigate": [
        "What did your playtesters actually do that surprised you?",
        "Which changes made version 2 better?"
      ],
      "modify": "Fix the most important playtest problem and save version 2.",
      "make": "Ship version 2 with release notes, then demo it in 60 seconds."
    },
    "career": {
      "role": "Independent game developer",
      "industry": "Maine creative technology",
      "what": "Designs, builds, playtests, and ships games, and writes release notes for every update."
    },
    "explain": "In three sentences: what your game is, the most important change between version 1 and 2, and one part of your code you can explain.",
    "standards": [
      "2-AP-15",
      "2-AP-17",
      "2-AP-18"
    ],
    "skills": [
      "design-iteration",
      "communication"
    ],
    "next": "python-turtle-bridge",
    "title": "Capstone Studio: Design, Playtest, Ship",
    "summary": "Plan a game like a real studio: write a short design doc, build version 1, run two playtests, and ship version 2 with release notes. Across 2–3 class periods.",
    "level": "advanced",
    "duration": 45,
    "pathwayStage": 7,
    "keywords": [
      "capstone",
      "design",
      "playtest",
      "iterate",
      "release notes",
      "project",
      "scratch",
      "grades 6-8"
    ],
    "time": {
      "prep": 10,
      "core": [
        90,
        135
      ],
      "verified": false
    },
    "stopAt": "You have a design doc, a playable version 2, notes from two playtests, and release notes.",
    "check": "In your 60-second demo, explain one change you made because of a playtest, and the code behind it.",
    "stuck": [
      "Too big? Cut your idea to one level and one way to win. You can add more in version 3.",
      "During a playtest, don't explain. If the player is confused, that's what you're there to find out.",
      "Use File > Save to your computer after each version, with v1 or v2 in the file name."
    ],
    "mission": "You're a one-person game studio. Plan an original game, build it, test it with two players, fix what they find, and ship a better version with notes on what changed.",
    "learn": [
      "Write a design doc with a goal, the player's actions, and how you win or lose.",
      "Use at least two advanced skills: broadcasts, clones, compound conditions, lists, or custom blocks with inputs.",
      "Run playtests, record what players do, and use the results to improve version 2."
    ],
    "why": "Real software is never finished in one try. Studios plan, build a small version, test it with real people, and improve it. That cycle is how good games get made.",
    "realWorld": "Game studios run playtests before launch, and app updates come with release notes that say what changed and why.",
    "vocab": [
      {
        "term": "Design doc",
        "def": "A short plan that explains what you'll build and why."
      },
      {
        "term": "Playtest",
        "def": "Watching a real player try your game without helping."
      },
      {
        "term": "Version",
        "def": "A saved stage of your project, like v1 and v2."
      },
      {
        "term": "Release notes",
        "def": "A short list of what changed in a new version."
      }
    ],
    "before": {
      "materials": [
        "Laptop or Chromebook",
        "Paper or an allowed document for the design doc and playtest notes"
      ],
      "setup": [
        "Plan 2–3 class periods. Pair students as playtesters for each other."
      ],
      "prerequisites": "Stages 1–6 confirmed, ideally with at least two activities from the grades 6–8 track."
    },
    "steps": [
      "Write a design doc (one page): the game's name, its goal, what the player does, how you win or lose, and which two advanced skills you'll use.",
      "Sketch the main screen. List your sprites, variables, lists, and messages.",
      "Build version 1: the smallest game you can play from start to finish. Save it.",
      "Playtest 1: a classmate plays without your help. Watch quietly and write down where they get stuck, confused, or bored.",
      "Fix the most important problem from playtest 1. Save it as version 2.",
      "Playtest 2 with a different classmate. Did your fix work? Write down one more thing to improve.",
      "Write release notes for version 2: three short lines on what you added, fixed, or changed, and why.",
      "Demo it: in 60 seconds, show your game and explain one part of your code, like a loop over a list or a broadcast chain."
    ],
    "reflect": "What did your playtesters find that you didn't expect?",
    "extend": "Add a top-3 high score list that stays in order. Write release notes for version 3.",
    "teacherNotes": [
      "Objective: the full development cycle with evidence: plan, build, test with real users, improve, and document.",
      "Scope is the most common problem. Push for a playable version 1 by the end of the first period.",
      "Playtesters play; builders watch and write. Coaching during a playtest hides the problems it's meant to find.",
      "Assess the design doc, the playtest notes, the release notes, and the demo explanation, not how polished the game looks.",
      "Ask afterward: “What did a playtester show you that you never would have found on your own?”"
    ]
  },
  {
    "id": "python-turtle-bridge",
    "group": "python",
    "primm": {
      "predict": "Read def square(size). What will square(100) draw, and how big?",
      "investigate": [
        "What does the indentation tell Python?",
        "How is def like Make a Block in Scratch?"
      ],
      "modify": "Change the number of sides and the turn angle to draw a different shape.",
      "make": "Write shape(size, sides) and draw a pattern of your own with a loop."
    },
    "career": {
      "role": "Python developer",
      "industry": "Maine biotech and research labs",
      "what": "Writes Python functions that analyze data and draw charts that scientists use every day."
    },
    "explain": "In three sentences: what your function does, one error message you fixed and what it meant, and how your Python matches a Scratch block.",
    "standards": [
      "2-AP-12",
      "2-AP-14"
    ],
    "skills": [
      "loops",
      "functions"
    ],
    "next": "capstone-studio",
    "track": "6-8",
    "title": "From Blocks to Python: Turtle Patterns",
    "area": "coding",
    "summary": "Rewrite a Scratch custom block as a Python function, then use a loop to draw a turtle pattern. Your first step into typed code.",
    "level": "advanced",
    "grades": [
      "6-8"
    ],
    "duration": 45,
    "format": "independent",
    "equipment": [
      "computer"
    ],
    "source": "original",
    "pathwayStage": 6,
    "keywords": [
      "python",
      "text coding",
      "functions",
      "def",
      "for loop",
      "turtle",
      "indentation",
      "grades 6-8"
    ],
    "access": {
      "account": "optional",
      "accountNote": "Running code doesn't need an account. Saving online needs a Raspberry Pi Foundation account; follow your school's rules for student accounts. Without one, students can copy their code into an allowed document.",
      "cost": "free",
      "supervision": false,
      "hardware": []
    },
    "launch": {
      "status": "ready",
      "label": "Open the Code Editor",
      "url": "https://editor.raspberrypi.org/en/projects/blank-python-starter",
      "provider": "Raspberry Pi Foundation",
      "note": "Free Python editor in the browser. Turtle drawing works. Running code doesn't need an account; saving does."
    },
    "time": {
      "prep": 10,
      "core": [
        35,
        45
      ],
      "verified": false
    },
    "bridge": {
      "from": "snowflake-functions",
      "text": "Your Scratch custom blocks used inputs and loops. Python has the same ideas, written as text."
    },
    "board": {
      "title": "Scratch → Python",
      "code": true,
      "lines": [
        "define square (size)   →   def square(size):",
        "repeat 4   →   for i in range(4):",
        "move (size) steps   →   t.forward(size)",
        "turn right 90 degrees   →   t.right(90)",
        "square (100)   →   square(100)"
      ],
      "note": "In Python, the lines inside a function or a loop are indented with 4 spaces. The indent does the job of a Scratch C-shape."
    },
    "stopAt": "Your square function runs, and your loop draws a pattern of 36 squares (step 6). Steps 7–8 are bonus.",
    "check": "Point to your def line and your for line. Explain which Scratch block each one replaces.",
    "stuck": [
      "IndentationError? Lines inside def and for need the same number of spaces in front.",
      "NameError or AttributeError? Python cares about capitals: turtle.Turtle() has a capital T in Turtle, and nothing else does.",
      "Nothing drawn? Check that square(100) has no spaces in front and comes after the function.",
      "Drawing cut off? Scroll inside the Visual output box, or drag the bar above it up to make it bigger."
    ],
    "mission": "You've built custom blocks in Scratch. Now write the same idea in Python, a language programmers type every day. Your turtle will draw a pattern using a function you write.",
    "learn": [
      "Match Scratch blocks to Python code: define to def, repeat to for, and an input to a parameter.",
      "Write a Python function with an input, and call it from a loop.",
      "Read a Python error message and fix indentation and typing mistakes."
    ],
    "why": "Most professional code is typed, not built from blocks. The ideas are the same as in Scratch: functions, loops, and inputs. Only the way you write them changes.",
    "realWorld": "Python is one of the most used programming languages, in science, data, AI, and websites. Turtle drawing has taught people to code for a long time.",
    "vocab": [
      {
        "term": "Python",
        "def": "A programming language you type as text."
      },
      {
        "term": "Function (def)",
        "def": "Python's version of a custom block."
      },
      {
        "term": "Indentation",
        "def": "The spaces at the start of a line that show which code is inside a function or loop."
      },
      {
        "term": "Syntax error",
        "def": "A typing mistake that stops Python from running your code."
      }
    ],
    "before": {
      "materials": [
        "Laptop or Chromebook with a keyboard"
      ],
      "setup": [
        "Before class, open the Code Editor link on a student device and check that it loads and runs code without signing in."
      ],
      "prerequisites": "Has made a custom block with an input in Scratch (Pattern Studio with My Blocks or Snowflake Studio)."
    },
    "steps": [
      "Open the Code Editor. It starts with a blank Python project.",
      "At the top, type two lines: import turtle and then t = turtle.Turtle()",
      "Define your function, like Make a Block: type def square(size): and press Enter. On the next line, indented 4 spaces, type for i in range(4): and then, indented 8 spaces, type t.forward(size) and t.right(90) on two lines.",
      "Below the function, with no spaces in front, call it: square(100). Press Run. A square should appear.",
      "Got an error? Read the line number in the message. Check for the colon at the end of the def and for lines, and check that the indents line up.",
      "Make a pattern: replace square(100) with a loop, no spaces in front: for i in range(36): then, indented 4 spaces, square(100) and t.right(10). Run it.",
      "Speed it up: add t.speed(0) on the line after t = turtle.Turtle().",
      "Make a function with two inputs: def shape(size, sides): that moves forward size and turns right 360 / sides, repeated sides times. Draw a triangle, a hexagon, and a 12-sided shape."
    ],
    "reflect": "What's the same about your Scratch block and your Python function? What's different?",
    "extend": "Use t.color(\"blue\") to change colors inside your pattern loop, or draw your Snowflake Studio snowflake in Python.",
    "teacherNotes": [
      "Objective: transfer. Students rewrite a familiar Scratch idea (a custom block with an input, used inside a loop) in Python.",
      "Platform: the Raspberry Pi Foundation's free Code Editor runs Python in the browser, and its help pages list turtle as supported. Checked in October 2026: the blank Python project opens and runs this activity's turtle pattern without signing in. Saving online needs an account, and there is a download button. The editor doesn't add indents for you, so students type the spaces. Check once on your school devices before class.",
      "Common mistakes: a missing colon, uneven indentation, and turtle.turtle() instead of turtle.Turtle(). Have students read the error's line number aloud before asking for help.",
      "Ask afterward: “What's easier in Python than in Scratch, and what's harder?”"
    ]
  },

  /* ───────────────────────────── Virtual Reality ───────────────────────────── */
  {
    id: "ecosystem-field-trip",
    standards: [
      "2-LS4-1",
      "3-LS4-3"
    ],
    simple: {
      "mission": "You're a scientist visiting a new place. Find five clues about how living things survive there.",
      "steps": [
        "Look at the first place for one minute. Don't talk. Just look.",
        "Write three \"I see\" sentences.",
        "Write one \"I think\" sentence about how something survives.",
        "Go to the second place. Do it again.",
        "Talk with a partner. What's the same? What's different?",
        "Write one \"I wonder\" question."
      ]
    },
    skills: [
      "observation"
    ],
    delivery: "Browser (Google Earth); headset version not chosen",
    why: "Scientists start by looking carefully before they explain anything. Separating what you see from what you think it means keeps your ideas honest.",
    realWorld: "Ecologists use satellite views and field visits to study habitats around the world, including Maine's forests and coast, and how living things survive there.",
    vocab: [
      {
        "term": "Ecosystem",
        "def": "Living things and the place they live, working together."
      },
      {
        "term": "Observation",
        "def": "Something you notice with your senses."
      },
      {
        "term": "Inference",
        "def": "An idea about what an observation means."
      },
      {
        "term": "Adaptation",
        "def": "A feature that helps a living thing survive where it lives."
      }
    ],
    check: "Read one \"I see\" and one \"I think\" from the same place. Explain how the observation led to your idea.",
    stopAt: "You have five observations from two places, one \"I think\" statement, and one \"I wonder\" question.",
    stuck: [
      "\"I see\" is only what your eyes notice. Save the guesses for \"I think.\"",
      "Look at the ground, the water, the plants, and the light.",
      "Compare: what's in one place that isn't in the other?"
    ],
    next: "lab-field-station",
    time: {
      "prep": 10,
      "core": [
        35,
        45
      ],
      "verified": false
    },
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
    standards: [],
    simple: {
      "mission": "Look all around a 360° picture. Find details no one else sees.",
      "steps": [
        "The Spotter looks around and calls out what they see.",
        "The Recorder writes each detail and where it is.",
        "After 3 minutes, switch jobs.",
        "Share your details. Cross off ones other teams found too.",
        "Tell exactly where to look for your special details.",
        "Write one question the picture makes you wonder."
      ]
    },
    skills: [
      "observation"
    ],
    delivery: "Missing resource",
    why: "Careful observers notice details other people miss. Explaining exactly where to look is a skill scientists use to share what they found.",
    realWorld: "Scientists study 360° photos from the deep sea, forests, and even Mars to find details worth investigating.",
    vocab: [
      {
        "term": "Detail",
        "def": "A small thing you notice."
      },
      {
        "term": "Observe",
        "def": "Look carefully and notice what's really there."
      },
      {
        "term": "Wonder",
        "def": "A question something makes you curious about."
      }
    ],
    check: "Share a detail only your team found. Explain exactly where to look so someone else can find it.",
    stopAt: "Both partners have been the spotter, the class has shared details, and you've written one wonder question.",
    stuck: [
      "Turn slowly all the way around, including up and down.",
      "Say where it is: left of, above, behind, or next to something.",
      "Look for small things: shadows, colors, tracks, or text."
    ],
    next: "ecosystem-field-trip",
    time: {
      "prep": 15,
      "core": [
        25,
        30
      ],
      "verified": false
    },
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
    standards: [
      "1A-DA-07"
    ],
    simple: {
      "mission": "Pretend your team is a computer. Learn to sort fruit from examples. Then test your rule.",
      "steps": [
        "Look at the cards with your team. Find a rule for fruit.",
        "Write your rule down. That's your model.",
        "Look at one new card at a time. Fruit or not fruit?",
        "Check the answer. Count how many you got right.",
        "Talk about the misses. Why did the tomato trick you?",
        "Add the tricky cards. Change your rule."
      ]
    },
    skills: [
      "data",
      "training-data"
    ],
    why: "AI doesn't understand fruit. It finds a pattern in the examples it's given. When the examples leave something out, the AI's rule breaks, just like yours did.",
    realWorld: "Grocery self-checkouts and farm sorting machines learn to tell foods apart from thousands of labeled pictures.",
    vocab: [
      {
        "term": "Training data",
        "def": "The labeled examples you learn from."
      },
      {
        "term": "Model",
        "def": "The rule you made from the examples."
      },
      {
        "term": "Prediction",
        "def": "Your best guess about something new."
      }
    ],
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
      "Look at the training pile with your team. Each card is labeled. Find a rule, like \"Fruit is sweet\" or \"Fruit is round.\"",
      "Write down your rule. That's your \"model.\"",
      "Look at one test card at a time. Use only your rule to predict: Fruit or Not fruit?",
      "Check the answer. Keep score of how many you got right.",
      "Talk about the misses: why did the tomato fool your rule?",
      "Add the tricky cards to your training pile. Change your rule to fit them."
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
    standards: [
      "1B-DA-07",
      "2-DA-09"
    ],
    skills: [
      "training-data"
    ],
    why: "A model only knows what its training examples show it. Testing it with something new is how you find out what it really learned, and what it didn't.",
    realWorld: "Phones that unlock by recognizing a face and apps that identify plants from a photo were trained the same way: lots of labeled pictures, then lots of testing.",
    vocab: [
      {
        "term": "Class",
        "def": "One of the groups the model learns to tell apart."
      },
      {
        "term": "Training",
        "def": "Showing the model labeled examples so it can find patterns."
      },
      {
        "term": "Confidence",
        "def": "How sure the model's output says it is. High confidence can still be wrong."
      },
      {
        "term": "Limitation",
        "def": "Something the model can't do well."
      }
    ],
    check: "Name something the model got wrong. Explain what its training examples were missing, and how you'd fix it.",
    stopAt: "The class model recognizes all three objects, and you've tested one thing it has never seen.",
    stuck: [
      "Record each object from different sides, distances, and angles.",
      "Keep the background the same, or the model may learn the background instead of the object.",
      "If one object always wins, give the others more examples."
    ],
    next: "lab-pattern-machine",
    time: {
      "prep": 15,
      "core": [
        35,
        45
      ],
      "verified": false
    },
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
      "Hold up object 1 and record about 50 images. Talk about it: should you move it around while you record? Why?",
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
    standards: [
      "1B-DA-07",
      "2-DA-09"
    ],
    simple: {
      "mission": "Teach a computer two hand signals. It should also know when there's no signal.",
      "steps": [
        "Start a new Image Project. Make three groups: Open hand, Closed fist, and No signal.",
        "Click Webcam. Record short bursts. Give each group about the same number.",
        "Click Train Model. Guess what it will say.",
        "Test each signal. Write what happens in the table.",
        "Change one thing, like your hand angle. Test again.",
        "Add more kinds of pictures to every group. Train again.",
        "Test the same way. Compare Round 1 and Round 2.",
        "Challenge: fix a hand position it got wrong. Then close the tab."
      ]
    },
    skills: [
      "data",
      "training-data"
    ],
    why: "An AI's prediction score is a model output, not proof it understands. Balanced, varied examples make a model more dependable, and testing with new examples shows where it still fails.",
    realWorld: "Touch-free controls in hospitals, games that read hand gestures, and sign-language tools are trained with examples like yours and tested before people rely on them.",
    vocab: [
      {
        "term": "Training example",
        "def": "A labeled picture the model learns from."
      },
      {
        "term": "Test example",
        "def": "A new picture used to check what the model learned."
      },
      {
        "term": "Balanced",
        "def": "Each class has about the same number of examples."
      },
      {
        "term": "Prediction score",
        "def": "The model's output for how well an input matches a class. It isn't a guarantee."
      }
    ],
    check: "Compare Round 1 and Round 2 in your test table. Explain one change you made to the training examples and what it changed.",
    stopAt: "You've finished Round 2 of the test table and written one limitation of your model.",
    stuck: [
      "Record in short bursts, and keep the classes about the same size.",
      "Add examples where the model made mistakes: new angles, distances, or backgrounds.",
      "No signal needs examples too: an empty frame and a resting hand."
    ],
    next: "lab-pattern-machine",
    time: {
      "prep": 10,
      "core": [
        40,
        50
      ],
      "verified": false
    },
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
      note: "Free. Get Started → Image Project → Standard image model. Full student activity, low-reading version, test table, and teacher guide are in the STEM 207 repo under missions/ai/secret-signals."
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
      "A perfect detector isn't required. A clear before-and-after record and one limitation complete the activity.",
      "Full materials: missions/ai/secret-signals in the STEM 207 repo (student activity, low-reading version, teacher guide, test table, hints and extension)."
    ]
  },
  {
    id: "ai-for-oceans",
    standards: [
      "1B-DA-07",
      "2-IC-21"
    ],
    simple: {
      "mission": "Teach an AI robot to tell fish from trash in the ocean.",
      "steps": [
        "Watch the video with your class.",
        "Label fish and trash. Then watch the robot choose.",
        "Keep going. Read each direction carefully.",
        "Stop when it asks about words like \"angry.\"",
        "Did your AI choose the same as your partner's? Why?",
        "Talk as a class. What happens when people teach opinions?"
      ]
    },
    skills: [
      "data",
      "training-data",
      "responsible-use"
    ],
    why: "When people train an AI on facts, like fish versus trash, it can learn well. When they train it on opinions, it learns the trainers' opinions. The people who label the data shape what the AI does.",
    realWorld: "Ocean scientists use AI trained on labeled photos to count fish and spot trash, and people check its work.",
    vocab: [
      {
        "term": "Label",
        "def": "Telling the AI what something is, like fish or not fish."
      },
      {
        "term": "Training data",
        "def": "The labeled examples the AI learns from."
      },
      {
        "term": "Bias",
        "def": "When an AI learns someone's opinion or a lopsided pattern instead of the truth."
      }
    ],
    check: "Explain why your AI and a partner's AI made different choices about a word like \"angry.\" Who decided what was right?",
    stopAt: "You finish the levels where you train on words and compare your AI with a partner's.",
    stuck: [
      "Read each instruction before you start labeling.",
      "If the robot keeps making a mistake, label more examples of that thing.",
      "For words like \"delicious,\" there's no right answer. Notice that the AI copies your choices."
    ],
    next: "ai-secret-signals",
    time: {
      "prep": 5,
      "core": [
        35,
        45
      ],
      "verified": false
    },
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
    standards: [
      "2-IC-20",
      "2-IC-21"
    ],
    skills: [
      "responsible-use"
    ],
    why: "AI tools can sound sure and still be wrong, and their mistakes can affect real people. Knowing how to trace a mistake back to its training data is how you use AI wisely.",
    realWorld: "Companies and governments test AI systems for mistakes and unfairness, and some require a person to check important decisions an AI makes.",
    vocab: [
      {
        "term": "Training data",
        "def": "The examples an AI learned from."
      },
      {
        "term": "Bias",
        "def": "When gaps or lopsided examples make an AI unfair or wrong for some people."
      },
      {
        "term": "Human check",
        "def": "A person reviews the AI's answer before it's used."
      },
      {
        "term": "Limitation",
        "def": "Something a system can't do well or can't be trusted for."
      }
    ],
    check: "Present your case in one minute: what the AI got wrong, who it affects, what in its training explains it, and your fix.",
    stopAt: "Your team presents one case, and the class agrees on three rules for using AI at school.",
    stuck: [
      "Ask: what examples would the AI have needed to get this right?",
      "Think about who uses the tool and who could be harmed by a mistake.",
      "A fix can be better data, a person checking, or a warning label."
    ],
    next: "ai-secret-signals",
    time: {
      "prep": 10,
      "core": [
        25,
        30
      ],
      "verified": false
    },
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
    standards: [
      "1A-DA-07"
    ],
    simple: {
      "mission": "Guess what comes next in patterns. AI guesses the next word the same way.",
      "steps": [
        "Look at the first pattern. What comes next?",
        "How sure are you? Show 1 to 5 fingers.",
        "Do the same for each pattern.",
        "Finish \"Once upon a ___.\" Why do most people say \"time\"?",
        "Some AI tools guess the next word the same way.",
        "Try \"I like to eat ___.\" Can there be two good answers?"
      ]
    },
    skills: [
      "training-data"
    ],
    why: "Many AI tools work by predicting what usually comes next. A prediction can be very likely and still be wrong, so it's a guess, not a fact.",
    realWorld: "The word suggestions on a phone keyboard and the autocomplete in a search box predict the next word from patterns in lots of writing.",
    vocab: [
      {
        "term": "Pattern",
        "def": "Something that repeats in a way you can notice."
      },
      {
        "term": "Prediction",
        "def": "A guess about what comes next, based on a pattern."
      },
      {
        "term": "Likely",
        "def": "Probably true, but not certain."
      }
    ],
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
      "Look at the first pattern. Say or write what comes next.",
      "How sure are you? Show it with your fingers: 1 (guessing) to 5 (certain).",
      "Do the same for each pattern.",
      "Finish \"Once upon a ___.\" Most people say \"time.\" Why do you think that is?",
      "AI tools that suggest words do this too. They predict what usually comes next, from lots of examples.",
      "Try a pattern with two good answers, like \"I like to eat ___.\" Is either prediction wrong?"
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
    standards: [
      "K-2-ETS1-3",
      "3-5-ETS1-3",
      "MS-ETS1-3"
    ],
    simple: {
      "mission": "Build a paper bridge across a gap. Test it with coins. Make it better. Test again.",
      "steps": [
        "Lay flat paper across the gap. How many coins does it hold?",
        "Draw two bridge ideas. Circle one to try.",
        "Build Version 1. You have 10 minutes.",
        "Add coins one at a time. Write how many it held.",
        "How did it break? Did it bend, slide, or tear?",
        "Change one thing. Build Version 2.",
        "Test again. Did your change help?"
      ]
    },
    skills: [
      "data",
      "design-iteration"
    ],
    why: "Engineers don't just build. They test, look closely at how a design failed, and use that to improve it. Shape can make weak paper surprisingly strong.",
    realWorld: "Bridge engineers use strong shapes like arches, beams, and trusses, and they test models before building real bridges across Maine's rivers.",
    vocab: [
      {
        "term": "Design process",
        "def": "Plan, build, test, and improve, again and again."
      },
      {
        "term": "Load",
        "def": "The weight a structure has to hold up."
      },
      {
        "term": "Prototype",
        "def": "A first version you build to test an idea."
      }
    ],
    check: "Show both versions and your coin counts. Explain how Version 1 failed and what you changed because of it.",
    stopAt: "You've built and tested Version 2 and recorded whether your change helped.",
    stuck: [
      "Look at how it failed: did it bend, slide, or tear? Fix that first.",
      "Try folding, rolling, or pleating the paper to make it stiffer.",
      "Make one change at a time, so you know what helped."
    ],
    next: "lighthouse-beam",
    time: {
      "prep": 10,
      "core": [
        40,
        45
      ],
      "verified": false
    },
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
    alsoIn: [
      "coding"
    ],
    group: "robotics",
    standards: [
      "1A-AP-08",
      "1B-AP-10"
    ],
    simple: {
      "mission": "Be a robot! You can only react to what your sensors notice.",
      "steps": [
        "Some kids are robots. They react only to the colored cards.",
        "Watch for a card. Follow the rule for that color.",
        "New rule: if you see yellow, turn around.",
        "New rule: if someone taps your shoulder, freeze.",
        "Green card and a tap at once? What should you do?",
        "As a class, choose which rule wins. Write it down."
      ]
    },
    skills: [
      "logic"
    ],
    why: "Robots don't decide like people do. They follow rules: sense something, check a rule, then act. When two rules conflict, the robot needs a priority, or it gets stuck.",
    realWorld: "Robot vacuums sense a wall and turn, and self-driving cars have rules for which signal matters most when two happen at once.",
    vocab: [
      {
        "term": "Sensor",
        "def": "A part that lets a robot notice something, like light or touch."
      },
      {
        "term": "Rule",
        "def": "IF something happens, THEN do this."
      },
      {
        "term": "Priority",
        "def": "Which rule wins when two rules happen at the same time."
      }
    ],
    check: "Say one robot rule as IF–THEN. Then explain which rule should win when green goes up and someone taps your shoulder, and why.",
    stopAt: "The class has played all the rules and agreed on a priority for the conflict.",
    stuck: [
      "React only to what your sensor notices. No guessing.",
      "Say the rule out loud: IF I see ___, THEN I ___.",
      "For a conflict, ask: which rule keeps the robot safest?"
    ],
    next: "lab-line-follower",
    time: {
      "prep": 5,
      "core": [
        15,
        20
      ],
      "verified": false
    },
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
      "Watch for the colored cards. When a color goes up, follow the rule.",
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
      "Connect to conditionals in Coding Foundations (step 4)."
    ]
  },
  {
    id: "marble-run-iteration",
    standards: [
      "3-5-ETS1-3",
      "MS-ETS1-4"
    ],
    skills: [
      "data",
      "design-iteration"
    ],
    why: "Hitting an exact target takes careful testing. Changing one thing at a time and averaging three runs shows what each change really does.",
    realWorld: "Engineers tune roller coasters, conveyor belts, and water slides the same way: small changes, many measured tests.",
    vocab: [
      {
        "term": "Iteration",
        "def": "Testing, changing one thing, and testing again."
      },
      {
        "term": "Slope",
        "def": "How steep a path is."
      },
      {
        "term": "Average",
        "def": "The total of your times divided by how many runs."
      },
      {
        "term": "Target",
        "def": "The result you're aiming for, here 10 seconds."
      }
    ],
    check: "Show your version table. Point to the change that helped most and explain why it changed the time.",
    stopAt: "Your average time is within 1 second of 10, and every version is in your table.",
    stuck: [
      "Too fast? Make it flatter or longer. Too slow? Make it steeper.",
      "Time three runs every time and use the average.",
      "Change only one thing per version, or you won't know what worked."
    ],
    next: "float-a-turbine",
    time: {
      "prep": 15,
      "core": [
        40,
        45
      ],
      "verified": false
    },
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
    standards: [
      "2-PS1-1"
    ],
    simple: {
      "mission": "Test ten things in water. Guess first. Then explain what happened.",
      "steps": [
        "Guess: will it sink or float? Write one reason.",
        "Put it in the water gently. Don't drop it.",
        "Write what happened.",
        "Put a star next to surprises.",
        "Try flat foil and balled-up foil. What's different?",
        "With your team, write one rule that fits most results."
      ]
    },
    skills: [
      "fair-testing"
    ],
    why: "Scientists predict, test, and then change their ideas when the evidence surprises them. A surprise isn't a mistake. It's how you learn something new.",
    realWorld: "Boat builders in Maine shape heavy steel and wood so boats float, the same idea as your crumpled and flat foil.",
    vocab: [
      {
        "term": "Predict",
        "def": "Say what you think will happen, and why."
      },
      {
        "term": "Observe",
        "def": "Watch carefully and notice what really happens."
      },
      {
        "term": "Evidence",
        "def": "What you saw that supports an idea."
      }
    ],
    check: "Share one object that surprised you. Explain what happened and how it changed your idea about sinking and floating.",
    stopAt: "You've tested all ten objects and your team has written one rule that explains most of your results.",
    stuck: [
      "Place each object gently. Don't drop it or push it down.",
      "Look at your stars. What do the surprises have in common?",
      "Same material, different shape? Shape can matter, not just what it's made of."
    ],
    next: "melting-race",
    time: {
      "prep": 10,
      "core": [
        25,
        30
      ],
      "verified": false
    },
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
    standards: [
      "3-5-ETS1-3"
    ],
    skills: [
      "data",
      "fair-testing"
    ],
    why: "A fair test changes just one thing, measures one thing, and keeps everything else the same. Repeating trials and averaging them means one odd drop can't fool you.",
    realWorld: "Maple seeds spin like helicopters as they fall, and engineers study that spin when they design drones and parachutes.",
    vocab: [
      {
        "term": "Independent variable",
        "def": "The one thing you change on purpose, like wing length."
      },
      {
        "term": "Dependent variable",
        "def": "What you measure, like the fall time."
      },
      {
        "term": "Controlled variables",
        "def": "Everything you keep the same so the test is fair."
      },
      {
        "term": "Average",
        "def": "The total of your trials divided by how many there are."
      }
    ],
    check: "Share your claim about wing length. Support it with your averages, and name two things you kept the same.",
    stopAt: "You've timed three drops for each of the three helicopters, found the averages, and written your claim.",
    stuck: [
      "Drop every helicopter from the same height, the same way.",
      "Run three trials and average them. One drop can be a fluke.",
      "Only the wing length should change. Use the same paper and the same paper clip."
    ],
    next: "tide-watchers",
    time: {
      "prep": 10,
      "core": [
        35,
        45
      ],
      "verified": false
    },
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
    standards: [
      "4-PS3-2"
    ],
    simple: {
      "mission": "Race four ice cubes on four different things. Guess which melts first. Watch and explain.",
      "steps": [
        "Touch each surface. Which one feels coldest? Write it down.",
        "Guess which ice cube melts first, and which melts last.",
        "Put the ice cubes down at the same time. Start the timer.",
        "Every 3 minutes, draw or write how each cube looks.",
        "After 15 minutes, line up the cubes from most melted to least.",
        "Was your guess right? Did the coldest one melt the ice fastest?"
      ]
    },
    skills: [
      "observation",
      "fair-testing"
    ],
    why: "Some materials move heat quickly and some slowly. Metal feels cold because it pulls heat from your hand fast, and that same speed is what melts the ice.",
    realWorld: "Maine homes use insulation to keep heat in during winter, and cooks choose metal or wooden spoons depending on whether they want heat to move.",
    vocab: [
      {
        "term": "Heat",
        "def": "Energy that moves from something warmer to something colder."
      },
      {
        "term": "Conductor",
        "def": "A material that moves heat quickly, like metal."
      },
      {
        "term": "Insulator",
        "def": "A material that slows heat down, like foam or wool."
      }
    ],
    check: "Rank the four surfaces from fastest to slowest melting. Explain why the coldest-feeling surface melted the ice fastest.",
    stopAt: "You've ranked all four ice cubes after 15 minutes and compared the result with your prediction.",
    stuck: [
      "Put all four ice cubes down at the same moment.",
      "Feeling cold means a material is pulling heat from your hand quickly.",
      "Look at your 3-minute notes. Which cube changed first?"
    ],
    next: "lab-ramp-racers",
    time: {
      "prep": 10,
      "core": [
        20,
        25
      ],
      "verified": false
    },
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
    standards: [
      "1A-AP-09"
    ],
    simple: {
      "mission": "Pictures are made of tiny squares. Draw one on a grid. Write its code. Can a partner copy it?",
      "steps": [
        "Color squares on your grid to make a picture, like a heart.",
        "Write each row as letters. W is blank. B is colored.",
        "Hide your picture. Give your partner only the code.",
        "Your partner colors a grid using just the code.",
        "Compare the pictures. Do they match? Find the row that's different.",
        "Fix it until they match."
      ]
    },
    skills: [
      "data",
      "encoding-art"
    ],
    why: "Every picture on a screen is a grid of tiny squares, and a computer stores it as a code. If the code is exact, anyone can rebuild the picture perfectly.",
    realWorld: "Phones and TVs show pictures made of millions of pixels, and computers send pictures as codes, much like yours.",
    vocab: [
      {
        "term": "Pixel",
        "def": "One tiny square of color in a picture."
      },
      {
        "term": "Grid",
        "def": "Rows and columns of squares."
      },
      {
        "term": "Code",
        "def": "Letters or numbers that stand for something, like colors."
      }
    ],
    check: "Show your picture and your partner's copy side by side. If they didn't match, point to the row that was wrong and how you fixed it.",
    stopAt: "Your partner's copy matches your picture exactly.",
    stuck: [
      "Read the code one row at a time, from left to right.",
      "Count the squares in each row. Does the code have the same number?",
      "Find the first row that doesn't match. Fix that row first."
    ],
    next: "lab-pixel-studio",
    time: {
      "prep": 10,
      "core": [
        15,
        20
      ],
      "verified": false
    },
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
      "Connects to Coding Foundations' focus on precise instructions (step 1)."
    ]
  },
  {
    id: "animate-your-name",
    standards: [
      "1B-AP-10"
    ],
    simple: {
      "mission": "Make the letters of your name move! Each letter moves when you click it.",
      "steps": [
        "Delete the cat. Add a sprite for each letter of your initials.",
        "Pick a background.",
        "Make the first letter spin when it's clicked.",
        "Make the second letter change color 10 times.",
        "Make the third letter grow, then shrink back.",
        "Click each letter to test it. Change the speed if you want."
      ]
    },
    skills: [
      "encoding-art"
    ],
    why: "In code, an event like a click can start an action. Each sprite can have its own script, so many things can happen in one project.",
    realWorld: "Buttons on websites and apps run code when you click them, and animators use code to make letters move in movie titles and logos.",
    vocab: [
      {
        "term": "Sprite",
        "def": "A character or object in a Scratch project."
      },
      {
        "term": "Event",
        "def": "Something that happens, like a click, that starts code."
      },
      {
        "term": "Script",
        "def": "A stack of blocks that runs together."
      }
    ],
    check: "Click each letter for a partner. Point to the event block that starts each animation.",
    stopAt: "Each of your initials does its own animation when it's clicked.",
    stuck: [
      "Every letter needs its own when this sprite clicked block.",
      "Too fast to see? Add a wait block or use smaller numbers.",
      "Use repeat to make a change happen more than once."
    ],
    next: "loop-dance",
    time: {
      "prep": 5,
      "core": [
        25,
        30
      ],
      "verified": false
    },
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
    standards: [],
    simple: {
      "mission": "Make a short movie with toys or clay. Take lots of photos and move them a tiny bit each time.",
      "steps": [
        "Draw three boxes: beginning, middle, and end.",
        "Set up your scene. Keep the tablet still.",
        "Take a photo. Move your toy a tiny bit. Take another photo.",
        "Keep going until your story is done. Try for 30 photos.",
        "Play it fast. Does it move smoothly?",
        "If it jumps, take those photos again with smaller moves."
      ]
    },
    skills: [
      "encoding-art",
      "communication"
    ],
    why: "Animation is many still pictures shown quickly. Small, steady changes between frames make motion look smooth.",
    realWorld: "Studios make stop-motion movies by moving clay figures and puppets a tiny bit for every photo, thousands of times.",
    vocab: [
      {
        "term": "Frame",
        "def": "One photo in an animation."
      },
      {
        "term": "Storyboard",
        "def": "Simple sketches that plan a story, box by box."
      },
      {
        "term": "Frame rate",
        "def": "How many frames play each second."
      }
    ],
    check: "Play your animation. Point to one part where the motion looks smooth and explain how you made it smooth.",
    stopAt: "Your story has at least 30 photos and plays back with a beginning, middle, and end.",
    stuck: [
      "Keep the camera in the same spot. Don't bump the tablet.",
      "Move the character just a little between photos.",
      "If a part jumps, reshoot it with smaller moves."
    ],
    next: "maine-postcard",
    time: {
      "prep": 15,
      "core": [
        40,
        45
      ],
      "verified": false
    },
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
    group: "foundations",
    primm: {
      "predict": "Pick a lobster card. Before you follow your flowchart, say whether it's KEEP or BACK.",
      "investigate": [
        "Why does the order of your questions matter?",
        "Which cards does the size-only flowchart get wrong, and why?"
      ],
      "modify": "Add one more rule to your flowchart and test it on every card.",
      "make": "Write the rules as IF–ELSE IF–ELSE text, like a real program."
    },
    career: {
      "role": "Fisheries data scientist",
      "industry": "Maine fisheries and marine science",
      "what": "Writes rules and programs that check catch data against the laws that protect the lobster population."
    },
    explain: "In three sentences: what your rules do, why the eggs and V-notch checks come first, and one card your first flowchart got wrong.",
    standards: [
      "1A-AP-08",
      "2-AP-10"
    ],
    simple: {
      "mission": "You work on a lobster boat. Some lobsters must go back in the water. Make rules so everyone sorts them the same way.",
      "steps": [
        "Read the rules. Why does Maine protect some lobsters?",
        "Draw a flowchart. Each diamond asks one yes or no question.",
        "Try it with cards. One reads, one follows the arrows, one sorts.",
        "Trade with another team. Do both flowcharts sort the same way?",
        "Look at a flowchart that only checks size. Which lobsters does it get wrong?",
        "Write your rules like code: IF eggs, THEN back."
      ]
    },
    skills: [
      "sequencing",
      "logic"
    ],
    check: "Run two lobster cards through your flowchart out loud. Then show the rule the one-question flowchart was missing.",
    stopAt: "Your flowchart sorts every card the same way as another team's, and your rules are written as IF–ELSE text.",
    stuck: [
      "Ask only one yes/no question in each diamond.",
      "Check the eggs and the V-notch before the size.",
      "Follow the arrows out loud for a card that should go back. Where does it end up?"
    ],
    next: "interactive-story",
    time: {
      "prep": 15,
      "core": [
        25,
        30
      ],
      "verified": false
    },
    why: "Rules written as if–else let anyone, or any computer, make the same decision every time. That makes the decision fair and consistent.",
    realWorld: "Mail-sorting machines and ticket scanners use if–else rules too. On a lobster boat, clear rules help the whole crew sort the catch the same way.",
    vocab: [{"term": "Conditional", "def": "A check that decides what happens next."}, {"term": "Flowchart", "def": "A drawing of a decision, with boxes and arrows."}, {"term": "Rule order", "def": "Which check happens first. Changing the order can change the result."}],
    bridge: { from: "lab-moon-gate", text: "Moon Base Gatekeeper checked one rule. Here you'll put several rules in order and check that every lobster is sorted the same way." },
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
      prerequisites: "None. Students who have tried Robot Maze will recognize the step-by-step thinking."
    },
    steps: [
      "Read the rules together. Why might Maine protect small lobsters, very big lobsters, and females with eggs?",
      "In teams, draw a flowchart. Each diamond asks one yes/no question. Each arrow leads to another question or to KEEP or BACK.",
      "Run your flowchart: one teammate reads a card, another follows the arrows out loud, a third drops the card in a bin.",
      "Trade flowcharts with another team and run their cards through it. Did both flowcharts sort every lobster the same way?",
      "Debug: look at a flowchart that only checks “Is it at least 3¼ inches?” Find the lobster cards it gets wrong.",
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
    standards: [
      "1B-DA-06"
    ],
    skills: [
      "data"
    ],
    why: "Graphs turn a table of numbers into a picture you can read. A pattern that's hard to see in a list, like two tides a day, jumps out on a line graph.",
    realWorld: "Harbormasters, lobstermen, and ferry captains in Maine check tide predictions from NOAA every day to know when boats can safely come and go.",
    vocab: [
      {
        "term": "Tide",
        "def": "The daily rise and fall of the ocean's water level."
      },
      {
        "term": "Tidal range",
        "def": "The difference between high tide and low tide."
      },
      {
        "term": "Line graph",
        "def": "A graph that shows how something changes over time."
      },
      {
        "term": "Cycle",
        "def": "A pattern that repeats again and again."
      }
    ],
    check: "Use your graph to explain how the tides at Portland and Eastport are alike and how they're different. Give one reason Eastport's are so much bigger.",
    stopAt: "Both harbors are on your graph, you've measured both tidal ranges, and your team has an explanation for the difference.",
    stuck: [
      "Plot the high and low points first, then connect them with a smooth wave.",
      "Tidal range is high minus low. Do it for each harbor.",
      "Look at the map. Eastport is at the mouth of a long, narrowing bay."
    ],
    next: "sap-run-detectives",
    time: {
      "prep": 10,
      "core": [
        35,
        45
      ],
      "verified": false
    },
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
    standards: [
      "3-5-ETS1-3",
      "MS-ETS1-3"
    ],
    simple: {
      "mission": "Lighthouses shine light far out to sea. Make a shiny cover for a flashlight. Aim for a small, bright spot.",
      "steps": [
        "Shine the flashlight at the wall. Trace the spot. This is your start.",
        "Draw a shape idea: a cone, a bowl, or a tube. Which will work best?",
        "Build it with foil, shiny side in. Put the flashlight inside.",
        "Shine it again. Trace the new spot. Is it smaller? Brighter?",
        "Change one thing. Test again.",
        "Share your best one. Which shapes worked best?"
      ]
    },
    skills: [
      "data",
      "design-iteration"
    ],
    why: "Light reflects off shiny surfaces, and a curved reflector can gather scattered light into a strong beam. Measuring the spot tells you which design really works.",
    realWorld: "Maine's lighthouses, like Portland Head Light, used curved reflectors and glass lenses to send their beams many miles out to sea.",
    vocab: [
      {
        "term": "Reflect",
        "def": "When light bounces off a surface."
      },
      {
        "term": "Reflector",
        "def": "A shiny shape that bounces light in one direction."
      },
      {
        "term": "Beam",
        "def": "Light aimed in one direction."
      },
      {
        "term": "Baseline",
        "def": "Your first measurement, to compare your designs to."
      }
    ],
    check: "Compare your best spot with the baseline. Explain which reflector shape made it smaller or brighter, and why.",
    stopAt: "You've traced the baseline and at least two reflector designs from the launch line.",
    stuck: [
      "Keep the shiny side of the foil facing in, and smooth out the wrinkles.",
      "Test from the same launch line every time.",
      "Try a deeper bowl or a cone, and change one thing at a time."
    ],
    next: "marble-run-iteration",
    time: {
      "prep": 15,
      "core": [
        40,
        45
      ],
      "verified": false
    },
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
    standards: [
      "MS-ETS1-2",
      "MS-ETS1-3"
    ],
    skills: [
      "design-iteration"
    ],
    why: "Floating things stay upright when their weight sits low and their base is wide. Engineers test with the same waves each time so they can compare designs fairly.",
    realWorld: "The University of Maine designed a floating wind turbine base, VolturnUS, to put turbines in the deep water of the Gulf of Maine.",
    vocab: [
      {
        "term": "Buoyancy",
        "def": "The push of water that holds something up."
      },
      {
        "term": "Center of gravity",
        "def": "The point where an object's weight is balanced."
      },
      {
        "term": "Stability",
        "def": "How well something stays upright when it's pushed."
      },
      {
        "term": "Trade-off",
        "def": "Giving up some of one thing to get more of another, like cost for stability."
      }
    ],
    check: "Show your design table. Explain why your best platform stays upright, using buoyancy or center of gravity, and what it cost.",
    stopAt: "You've tested at least two platforms with the same 10 waves and picked your best design.",
    stuck: [
      "Hang weight low, below the base. A low center of gravity helps.",
      "A wider base tips less. Try spreading the floats apart.",
      "Make the same 10 waves every time so the test is fair."
    ],
    next: "lab-launcher",
    time: {
      "prep": 15,
      "core": [
        40,
        45
      ],
      "verified": false
    },
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
    standards: [
      "1A-DA-07",
      "1B-DA-07"
    ],
    simple: {
      "mission": "Machines help sort Maine blueberries. One kid is the sorting machine. The class teaches it with examples.",
      "steps": [
        "Learn the job. Berries go in KEEP. Leaves and twigs go in TOSS.",
        "Show the machine each card and say KEEP or TOSS.",
        "Now test it with new cards. Keep score on the board.",
        "Look at the mistakes. What did the machine never see?",
        "Teach it the tricky cards. Test again. Did it get better?"
      ]
    },
    skills: [
      "data",
      "training-data",
      "responsible-use"
    ],
    why: "A sorting machine only knows the examples it was trained on. If it never saw a dusty-blue leaf, it can't know to toss one, so people test it and check its work.",
    realWorld: "Plants that process Maine's wild blueberries use optical sorting machines with cameras to separate berries from leaves and stems, and workers check what the machines miss.",
    vocab: [
      {
        "term": "Training",
        "def": "Showing the machine labeled examples: KEEP or TOSS."
      },
      {
        "term": "Test",
        "def": "Checking the machine with new cards it hasn't seen."
      },
      {
        "term": "Retrain",
        "def": "Adding examples to fix the machine's mistakes."
      }
    ],
    check: "Name one card the machine sorted wrong. Explain what example it was missing and how retraining helped.",
    stopAt: "The machine is retrained once, and the class compares its score before and after.",
    stuck: [
      "Look at the mistakes. What do those cards have in common?",
      "The machine can only use the examples it saw. It can't ask why.",
      "Add just a few tricky cards when you retrain, then test with new ones."
    ],
    next: "ai-for-oceans",
    time: {
      "prep": 15,
      "core": [
        25,
        30
      ],
      "verified": false
    },
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
      "Learn the job: the machine sorts berries into KEEP, and leaves, twigs, and unripe berries into TOSS.",
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
    standards: [
      "1B-DA-07"
    ],
    skills: [
      "data"
    ],
    why: "Patterns in data can explain how nature works. Here, cold nights and warm days line up with sap running, and that's the clue to what's happening inside the tree.",
    realWorld: "Maine's maple producers watch the weather forecast for freezing nights and thawing days to know when to tap their trees and collect sap.",
    vocab: [
      {
        "term": "Pattern",
        "def": "Something in the data that repeats in a way you can predict."
      },
      {
        "term": "Freeze-thaw cycle",
        "def": "Below freezing at night, above freezing in the day."
      },
      {
        "term": "Ratio",
        "def": "A comparison of two amounts, like 40 gallons of sap to 1 gallon of syrup."
      }
    ],
    check: "State your rule for when sap runs. Point to two days in the table that prove it, and solve one sugaring math problem.",
    stopAt: "Your rule works for every day in the log, and you've finished the sugaring math.",
    stuck: [
      "Below freezing is under 32°F. Look at each night, then the day after it.",
      "Test your rule on every day, not just the busiest ones.",
      "For a quarter gallon of syrup, use a quarter of 40 gallons of sap."
    ],
    next: "lab-ramp-racers",
    time: {
      "prep": 5,
      "core": [
        25,
        30
      ],
      "verified": false
    },
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
    standards: [
      "4-ESS2-1",
      "4-ESS2-2"
    ],
    simple: {
      "mission": "Take a class trip to Acadia National Park on the computer. Visit four places and look for clues left by glaciers.",
      "steps": [
        "Fly to Cadillac Mountain. Turn all the way around. What do you see?",
        "Fly to Sand Beach. Which way is the ocean?",
        "Fly to Bass Harbor Head Light. Why is the lighthouse here?",
        "Fly to Somes Sound. What shape is it?",
        "At each stop, write something you see, an idea, and a question."
      ]
    },
    skills: [
      "observation"
    ],
    delivery: "Browser (Google Earth)",
    why: "Maps and 3D views let you explore places you can't visit, and landforms hold clues to the past. Acadia's smooth mountains and long sound were shaped by glaciers.",
    realWorld: "Park rangers, geologists, and search-and-rescue teams in Acadia use maps, compass directions, and 3D views to plan routes and study the land.",
    vocab: [
      {
        "term": "Landmark",
        "def": "A place that's easy to recognize and find."
      },
      {
        "term": "Compass direction",
        "def": "North, south, east, or west."
      },
      {
        "term": "Glacier",
        "def": "A huge sheet of ice that slowly moves and shapes the land."
      },
      {
        "term": "Fjard",
        "def": "A long, narrow bay carved by a glacier, like Somes Sound."
      }
    ],
    check: "Share one clue that glaciers once covered Acadia. Tell which stop it came from and what direction the ocean was from there.",
    stopAt: "Your trip log has an observation, an inference, and a question from all four stops.",
    stuck: [
      "Tilt to 3D and turn slowly all the way around.",
      "Find north first. The compass is in the corner of the screen.",
      "Look for smooth, rounded mountain tops and long, narrow valleys."
    ],
    next: "tide-watchers",
    time: {
      "prep": 10,
      "core": [
        25,
        30
      ],
      "verified": false
    },
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
    standards: [
      "1B-AP-10"
    ],
    skills: [
      "encoding-art",
      "communication"
    ],
    why: "A loop repeats code forever, so a small animation can keep going. Planning what stays still and what moves keeps a project simple.",
    realWorld: "Animated greeting cards, website banners, and app icons use short loops to catch your eye.",
    vocab: [
      {
        "term": "Backdrop",
        "def": "The background picture in Scratch."
      },
      {
        "term": "Costume",
        "def": "One look a sprite can switch to."
      },
      {
        "term": "Loop",
        "def": "Code that repeats again and again."
      },
      {
        "term": "Storyboard",
        "def": "Simple sketches that plan what happens."
      }
    ],
    check: "Show your postcard. Point to the forever loop and explain how changing the wait time changed the animation.",
    stopAt: "Your postcard has a backdrop, one thing moving on a loop, and your greeting.",
    stuck: [
      "Put the motion blocks inside forever.",
      "Too fast? Add a wait block inside the loop.",
      "Switching costumes? Use next costume, then wait."
    ],
    next: "lab-pixel-studio",
    time: {
      "prep": 5,
      "core": [
        40,
        45
      ],
      "verified": false
    },
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
    group: "labs",
    primm: {
      "predict": "Before you press Run, trace the program with your finger. Where will the boat end up?",
      "investigate": [
        "Which block did the most work in your program?",
        "How did a loop or a function let you use fewer blocks?"
      ],
      "modify": "Change one number in a repeat block. Predict where the boat ends up, then run it.",
      "make": "Solve a Create level with the fewest blocks you can."
    },
    career: {
      "role": "Autonomous systems engineer",
      "industry": "Maine ocean technology",
      "what": "Programs underwater and surface robots that map the Gulf of Maine and steer around hazards on their own."
    },
    explain: "In three sentences: how your program solves the level, which loop or function made it shorter, and one bug you fixed by stepping through it.",
    standards: [
      "1A-AP-10",
      "1B-AP-10",
      "2-AP-14"
    ],
    simple: {
      "mission": "You drive a lobster boat with code. Steer to the wharf, pull up traps, and stay off the rocks.",
      "steps": [
        "Open the lab. Read the goal.",
        "Tap blocks to add them to your program.",
        "Press Run to watch the boat. Or press Step to go one block at a time.",
        "Did the boat hit a rock? Find the lit-up block and fix it.",
        "When you finish, read what you learned. Then try the next level.",
        "When a voyage is done, pick the next one at the top."
      ]
    },
    skills: [
      "sequencing",
      "debugging",
      "loops",
      "logic",
      "data",
      "functions"
    ],
    why: "Real programmers rarely solve a problem in one try. They plan, run, watch what happens, and fix one thing at a time. The boat shows you every step, so you can see exactly where your plan and the program disagree.",
    realWorld: "Self-driving boats and ocean robots map the Gulf of Maine on their own, and the people who program them test each route in small steps first, just like you.",
    vocab: [
      {
        "term": "Sequence",
        "def": "Instructions that run one after another, in order."
      },
      {
        "term": "Loop",
        "def": "A block that repeats the steps inside it."
      },
      {
        "term": "Conditional",
        "def": "An if–else block that chooses what to do based on a check."
      },
      {
        "term": "Function",
        "def": "A block you build yourself that does a group of steps with one name."
      },
      {
        "term": "Debug",
        "def": "Find and fix the step that went wrong."
      }
    ],
    check: "Show a level you solved and point to the block that did the most work. Then say what would go wrong if you removed it.",
    stopAt: "You finish Voyage 1 (Casco Bay, levels 1–12). Penobscot Bay and Down East are for later sessions.",
    stuck: [
      "Press Step instead of Run, and watch the boat one block at a time.",
      "Find the first block where the boat goes the wrong way. Fix only that block.",
      "Turn your body the way the boat faces. Left and right are the boat's left and right."
    ],
    next: "lab-moon-gate",
    time: {
      "prep": 5,
      "core": [
        30,
        45
      ],
      "verified": false
    },
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
      prerequisites: "None. The lab starts at the very beginning and climbs through Coding Foundations."
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
      "Each voyage follows the Coding Foundations Learning Plan: levels 1–3 sequencing and debugging (step 1), 4–6 loops (step 3), 7–9 actions and conditionals (steps 2 and 4), 10 variables (step 5), 11 functions (step 6), 12 independent creation (step 7).",
      "Voyage 2 (Penobscot Bay) adds Set trap and If at a dashed spot. Voyage 3 (Down East) adds a simple rule: you can only set a trap you have already hauled. Both are actions and conditionals at the same skill level as Voyage 1.",
      "Debug levels vary the kind of bug: a wrong turn, an extra block, a wrong turn inside a loop, and a loop that repeats too few times.",
      "Block limits on later levels are intentional. They push students to find the pattern instead of brute-forcing with many Forward blocks.",
      "Step-through is the key debugging habit. Ask “Which block went wrong first?” before helping.",
      "Your dashboard shows each student's level progress, test runs, and hints used."
    ]
  },
  {
    id: "lab-dance-party",
    group: "foundations",
    primm: {
      "predict": "Read the three steps. What will the robot do first, and what will it do last?",
      "investigate": [
        "What changed when you swapped two steps?",
        "How does a Repeat block make the program shorter without changing the dance?"
      ],
      "modify": "Shorten a long dance with a Repeat block, without changing what the robot does.",
      "make": "Design a 12-move dance in 6 blocks or fewer (level 8), then rebuild it in Scratch."
    },
    career: {
      "role": "Animator and game developer",
      "industry": "Maine game and media studios",
      "what": "Programs characters' moves in exact sequences and loops to make them dance, run, and fight."
    },
    explain: "In three sentences: what your dance does, how a loop made it shorter, and one bug you fixed.",
    standards: [
      "1A-AP-10",
      "1A-AP-14"
    ],
    simple: {
      "mission": "The robot dances exactly what your program says, in order. Make it dance!",
      "steps": [
        "Level 1: Read the steps. Guess what the robot does first and last. Press Run.",
        "Level 2: Switch two steps. Run it again. What changed?",
        "Level 3: Make a dance with five or more steps.",
        "Level 4: Make the robot jump, spin, and end with a pose.",
        "Level 5: Use a Repeat block to make the dance.",
        "Level 6: Fix the dance that has a bug.",
        "Level 7: Make a long dance with only a few blocks.",
        "Level 8: Make your own long dance with only a few blocks.",
        "Remember: the computer does your steps in order."
      ]
    },
    skills: [
      "sequencing",
      "debugging"
    ],
    why: "Every program is a list of steps that run in order. Change the order and you change what happens, even when the steps are the same. That's true for a dance robot, a video game, and the apps on a phone.",
    realWorld: "Animators and game makers line up moves in exact order, and factory robots repeat the same sequence of moves thousands of times a day.",
    vocab: [
      {
        "term": "Sequence",
        "def": "Steps that happen one after another, in order."
      },
      {
        "term": "Program",
        "def": "A set of instructions a computer follows."
      },
      {
        "term": "Loop",
        "def": "A block that repeats the steps inside it."
      },
      {
        "term": "Bug",
        "def": "A mistake that makes a program do something you didn't want."
      }
    ],
    coreLevels: 2,
    pilot: true,
    time: { prep: 5, core: [10, 15], verified: false },
    stopAt: "You finish level 2 (Swap two steps). Levels 3 and 4 are bonus. Grades 4–6: go on to the Go deeper levels 5–8 (loops and debugging).",
    check: "Swap two steps in a program. Before you press Run, say what the robot will do differently. Then run it and explain what changed.",
    stuck: ["Read your program from the top. Step 1 happens first.", "Press Reset robot to start over. Your program stays.", "Use the ▲ and ▼ buttons to move a step. No dragging needed."],
    next: "robot-maze-mission",
    title: "Robot Dance Party",
    area: "coding",
    summary: "Build a dance from five moves, run it, and watch a robot follow your program one step at a time. Then go deeper: loop moves with Repeat blocks, fix a buggy dance, and make a long dance with a short program.",
    level: "beginner",
    grades: ["2-3", "4-5", "6-8"],
    duration: 20,
    format: "independent",
    equipment: ["computer", "tablet"],
    source: "original",
    keywords: ["lab", "sequence", "order", "algorithm", "robot", "dance", "predict", "debugging", "interactive", "first coding", "loops", "repeat", "efficiency"],
    access: { account: "none", cost: "free", supervision: false, hardware: [] },
    launch: { status: "lab", labId: "dance-party", label: "Open Robot Dance Party", note: "Runs inside STEM 207. About 10 minutes for the basics, plus about 25 for the Go deeper levels. No outside account or website needed." },
    mission: "The robot is ready to dance, but it only does exactly what your program says, in exactly that order. Predict, run, swap, and create, then take on the challenge: jump, spin, and finish with a pose.",
    learn: [
      "Explain that a sequence is a set of instructions a computer follows in order.",
      "Predict what a program will do first and last before running it.",
      "Show that changing the order of the same instructions changes the result.",
      "Go deeper (grades 4–6): use a loop to repeat moves, find and fix the first bug in a program, and make a program shorter without changing what it does."
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
      "Go deeper, level 5: Rebuild a target dance using a Repeat block.",
      "Level 6: Fix a buggy program so it matches the target dance.",
      "Level 7: Make the same 12-move dance with 5 blocks or fewer.",
      "Level 8: Design a 12-move dance with 6 blocks or fewer, then take it to Scratch.",
      "Remember: computers follow your instructions in the order you give them."
    ],
    reflect: "You used the same three moves in Level 1 and Level 2. Why did the robot dance differently?",
    extend: "Write a dance on paper first, then have a partner predict it before you run it. Did they get the first and last moves right?",
    teacherNotes: [
      "Learning objective: students understand that a sequence is a set of instructions run in order, and that changing the order changes the result.",
      "Common misconception: the computer \"knows\" what you meant, or does the important moves first. It doesn't. It runs step 1, then step 2, and so on, exactly as written. Students who put Strike a pose first are often surprised that the robot poses before dancing.",
      "Ask afterward: \"If two programs use exactly the same instructions, will the robot always do the same dance? Why or why not?\"",
      "The challenge is checked from the steps the robot actually ran, so students can't skip it by clicking. Feedback names what went wrong (a missing move, the wrong order, or not ending with the pose) without giving the answer. Each level has two hints that appear one at a time.",
      "The robot never leaves the dance floor: moving past an edge makes it wiggle in place. That's a good chance to ask students to predict where it will end up.",
      "Go deeper (levels 5–8, about 25 minutes, grades 4–6): a Repeat block runs 2–4 times and holds up to 4 moves. Level 5 checks the dance matches the target and uses a repeat. Level 6 starts from a buggy program and feedback names the first move that differs. Level 7 counts blocks the way Scratch does (a repeat is 1 block plus the moves inside). Level 8 hands off to Loop Dance Choreographers and its Dance Crew starter.",
      "Common misconception in the Go deeper levels: the repeat count is how many moves there are. It's how many times the moves inside run. Ask: \"Repeat 3 times with 2 moves inside makes how many moves?\""
    ]
  },
  {
    id: "lab-space-blob",
    group: "labs",
    primm: {
      "predict": "After 3 feeds, how many snacks will be stored? Say your number first.",
      "investigate": [
        "What happened when you turned off the starting value?",
        "Why does every run need a known starting value?"
      ],
      "modify": "Change how much each feed adds, and predict the new total before testing.",
      "make": "Make the blob reach exactly 14 snacks in 4 feeds."
    },
    career: {
      "role": "Game developer",
      "industry": "Maine game and app studios",
      "what": "Uses variables for scores, lives, and coins, and makes sure each game starts with the right values."
    },
    explain: "In three sentences: what the snacks variable stores, why it needs a starting value, and how you reached 14.",
    standards: [
      "1B-AP-09"
    ],
    simple: {
      "mission": "Feed the hungry Space Blob! Your code counts the snacks.",
      "steps": [
        "Level 1: Press Start. Feed the blob 3 times. How many snacks?",
        "Level 2: Make each feed add 2. Guess the total after 3 feeds. Test it.",
        "Level 3: Turn off \"set snacks to.\" Restart. What happens? Turn it back on.",
        "Level 4: Start with 2 snacks. Add 3 each feed. Get to 14 in 4 feeds."
      ]
    },
    skills: [
      "debugging",
      "events",
      "data"
    ],
    why: "Programs have to remember things: a score, a number of lives, how many snacks. A variable is a labeled box that holds that number, and the program can read it and change it.",
    realWorld: "Games keep your score in a variable, a step counter keeps your steps in one, and a store's website keeps the number of items in your cart.",
    vocab: [
      {
        "term": "Variable",
        "def": "A named place where a program stores a value it can change."
      },
      {
        "term": "Value",
        "def": "What is stored in the variable right now, like 5."
      },
      {
        "term": "Event",
        "def": "Something that happens, like a click, that makes code run."
      },
      {
        "term": "Initialize",
        "def": "Set a variable's starting value before the program uses it."
      }
    ],
    coreLevels: 3,
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
      setup: ["Best after students know sequences and click events (Robot Dance Party and Coding Foundations step 2).", "Plan about 15 minutes. Students can sign in to save progress or explore as guests."],
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
    group: "labs",
    primm: {
      "predict": "A Planet visitor arrives. Will the gate open? Decide before you test.",
      "investigate": [
        "Which branch ran, THEN or ELSE? How do you know?",
        "Why test a visitor who should NOT get in?"
      ],
      "modify": "Change the rule so a different badge gets in, and test both kinds of visitors.",
      "make": "Write a rule that lets in only Star visitors, and prove it with all three badges."
    },
    career: {
      "role": "Security systems developer",
      "industry": "Maine hospitals, schools, and offices",
      "what": "Writes the rules that decide which badges can open which doors, and tests every case."
    },
    explain: "In three sentences: what your rule does, how you tested it, and the bug in the broken rule you fixed.",
    standards: [
      "1B-AP-10",
      "1B-AP-15"
    ],
    simple: {
      "mission": "You guard the gate on the Moon. Your rule decides which robots get in.",
      "steps": [
        "Level 1: Will a Moon robot get in? Guess, then test.",
        "Level 2: Will a Star robot get in? Guess, then test.",
        "Level 3: Change who gets in. Test one who should and one who shouldn't.",
        "Level 4: The rule is broken. Find the bug. Fix it. Test again.",
        "Level 5: Let only Star robots in. Test all three badges."
      ]
    },
    skills: [
      "logic",
      "debugging"
    ],
    why: "A conditional lets a program make choices: IF something is true, do this, ELSE do that. To trust a rule, you have to test it with inputs that should pass and inputs that shouldn't.",
    realWorld: "Door badges at schools and hospitals use rules like yours: IF the badge matches, THEN unlock, ELSE stay locked.",
    vocab: [
      {
        "term": "Conditional",
        "def": "A rule that checks something and picks one of two actions."
      },
      {
        "term": "Branch",
        "def": "One of the two paths, THEN or ELSE, a conditional can take."
      },
      {
        "term": "Input",
        "def": "Information a program gets, like a visitor's badge."
      },
      {
        "term": "Test",
        "def": "Try the program with an input to see if it does the right thing."
      }
    ],
    check: "Tell which branch runs for a Planet visitor and why. Then name one visitor you'd test to prove your rule really works.",
    stopAt: "You finish level 5 and your rule lets in only Star visitors.",
    stuck: [
      "Read the IF line out loud. Does the visitor's badge match it? Yes means THEN. No means ELSE.",
      "Test one visitor who should get in and one who shouldn't.",
      "When a rule is broken, look at what the ELSE line does."
    ],
    next: "lobster-trap-logic",
    time: {
      "prep": 0,
      "core": [
        15,
        20
      ],
      "verified": false
    },
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
    standards: [
      "2-LS4-1",
      "3-LS4-3"
    ],
    simple: {
      "mission": "Be a scientist! Explore a Maine tide pool, a pond, and three faraway places. Look for clues.",
      "steps": [
        "Open the lab. Pick the first place.",
        "Look all the way around. Tap a marker when you find one.",
        "Read what you see. Pick the best idea about what it means.",
        "Turn to the compass direction you're given.",
        "After all five places, compare them."
      ]
    },
    skills: [
      "observation"
    ],
    delivery: "Browser 360° (not headset VR)",
    why: "Scientists are careful about the difference between what they see (an observation) and what they think it means (an inference). Keeping those apart is how science stays honest.",
    realWorld: "Field biologists in Maine study tide pools, ponds, and forests, write down exactly what they see, and use compass headings to find the same spot again next year.",
    vocab: [
      {
        "term": "Observation",
        "def": "Something you notice with your senses."
      },
      {
        "term": "Inference",
        "def": "An idea about what an observation means."
      },
      {
        "term": "Adaptation",
        "def": "A body part or behavior that helps a living thing survive where it lives."
      },
      {
        "term": "Habitat",
        "def": "The place where a plant or animal lives and finds what it needs."
      },
      {
        "term": "Heading",
        "def": "A direction in degrees: north is 0°, east is 90°."
      }
    ],
    check: "Share one observation and one inference from the same station. Explain how you know which is which.",
    stopAt: "You finish the Maine tide pool and the North Woods pond, including both compass checks. The other habitats are bonus.",
    stuck: [
      "Turn all the way around. Search markers can be behind you.",
      "Ask yourself: did I see it, or am I guessing what it means?",
      "For the compass: north is 0°, east is 90°, south is 180°, west is 270°."
    ],
    next: "acadia-from-above",
    time: {
      "prep": 5,
      "core": [
        25,
        40
      ],
      "verified": false
    },
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
    standards: [
      "2-DA-09",
      "2-IC-21"
    ],
    skills: [
      "data",
      "training-data",
      "responsible-use"
    ],
    why: "AI doesn't think. It finds patterns in the examples people give it. If the examples are too few or lopsided, the AI learns the wrong lesson, so people have to check its work.",
    realWorld: "Apps that sort photos, spam filters, and tools that help doctors read X-rays all learn from labeled examples, and all of them can make mistakes a person needs to catch.",
    vocab: [
      {
        "term": "Training data",
        "def": "The labeled examples an AI learns from."
      },
      {
        "term": "Label",
        "def": "The right answer attached to an example."
      },
      {
        "term": "Bias",
        "def": "When lopsided examples make an AI favor wrong answers."
      },
      {
        "term": "Confidence",
        "def": "How sure the model's output says it is. It can be confident and still wrong."
      }
    ],
    check: "Show a moment when the machine got something wrong. Explain what in its training examples caused it, and how you fixed it.",
    stopAt: "You finish level 6 and decide which uses of AI are responsible. Earning the certificate is a bonus.",
    stuck: [
      "Look at the training examples, not the new one. What do most of them have in common?",
      "Add examples that are different from each other, not more of the same.",
      "A high confidence score is a model output, not a guarantee. Ask: would a person need to check this?"
    ],
    next: "teachable-machine-classroom",
    time: {
      "prep": 5,
      "core": [
        35,
        45
      ],
      "verified": false
    },
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
    standards: [
      "3-5-ETS1-3",
      "MS-ETS1-4"
    ],
    skills: [
      "data",
      "fair-testing",
      "design-iteration"
    ],
    why: "Engineers rarely get a design right the first time. They test, look at the results, and change one thing at a time, so they know what made the difference.",
    realWorld: "Engineers test bridges, boats, and sports equipment the same way, and pumpkin-launching contests at fall fairs are real engineering challenges.",
    vocab: [
      {
        "term": "Iteration",
        "def": "Testing a design, improving it, and testing again."
      },
      {
        "term": "Variable",
        "def": "One thing you can change in a test, like the angle."
      },
      {
        "term": "Fair test",
        "def": "A test where you change only one thing at a time."
      },
      {
        "term": "Constraint",
        "def": "A limit your design must stay within, like a budget."
      }
    ],
    check: "Show your notebook. Point to two trials where you changed only one thing, and explain what that change did.",
    stopAt: "You finish levels 1–3 and land on the target. Levels 4–6 (over the bale wall, the budget build, and three targets) are the challenge.",
    stuck: [
      "Change just one setting between launches: angle, force, or load.",
      "Too short? Try more force or an angle closer to 45°. Too far? Do the opposite.",
      "Read your notebook. Which change got you closest so far?"
    ],
    next: "marble-run-iteration",
    time: {
      "prep": 5,
      "core": [
        30,
        45
      ],
      "verified": false
    },
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
    alsoIn: [
      "coding"
    ],
    group: "robotics",
    standards: [
      "1B-AP-10",
      "1B-AP-15"
    ],
    skills: [
      "debugging",
      "logic"
    ],
    why: "Robots don't see the world like we do. They sense one thing, decide with a rule, and act, over and over. Good rules cover every case the robot might sense.",
    realWorld: "Warehouse robots follow lines on the floor, and some plows and tractors use sensors and GPS to stay on course in bad weather.",
    vocab: [
      {
        "term": "Sensor",
        "def": "A part that lets a robot notice something, like light or dark."
      },
      {
        "term": "Rule",
        "def": "An if–then instruction: IF the sensor sees this, THEN do that."
      },
      {
        "term": "Sense → think → act",
        "def": "The loop robots repeat: notice, decide, move."
      },
      {
        "term": "Debug",
        "def": "Find the rule that made the robot go wrong, and fix it."
      }
    ],
    check: "Point to the rule that keeps the plow on the road when only the left sensor sees the line. Explain why it works.",
    stopAt: "Your plow finishes a full lap on levels 1 and 2. Sharp corners (level 3) and the speed trial (level 4) are the challenge.",
    stuck: [
      "Watch the sensor lights right before the plow leaves the road.",
      "Every sensor combination needs a rule. Is one missing?",
      "If it wobbles, try a gentler turn. If it misses corners, turn sharper."
    ],
    next: "lab-launcher",
    time: {
      "prep": 0,
      "core": [
        20,
        30
      ],
      "verified": false
    },
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
      prerequisites: "Comfortable with if–then ideas (Coding Foundations step 4 is a good match)."
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
    standards: [
      "3-PS2-1",
      "MS-PS2-2"
    ],
    skills: [
      "data",
      "fair-testing"
    ],
    why: "One test can fool you, because measurements vary. Scientists repeat trials, keep everything else the same, and let the data, not a guess, answer the question.",
    realWorld: "Ski and sled designers, and engineers who build safe ramps and roads, test slopes and surfaces with repeated trials before they trust a result.",
    vocab: [
      {
        "term": "Trial",
        "def": "One run of a test."
      },
      {
        "term": "Average",
        "def": "One number that sums up several trials."
      },
      {
        "term": "Variable",
        "def": "Something that can change in a test, like the hill's height."
      },
      {
        "term": "Claim",
        "def": "Your answer to the question."
      },
      {
        "term": "Evidence",
        "def": "The data that supports your claim."
      }
    ],
    check: "Make a claim about what makes the sled go farther. Back it up with the average from your trials, and say what you kept the same.",
    stopAt: "You finish level 5: a claim about what makes the sled go farther, backed by the averages from your own trials.",
    stuck: [
      "Change only one thing. Keep everything else the same.",
      "Run at least three trials. Use the average, not your best run.",
      "Look at the graph. Which bar or point is higher?"
    ],
    next: "paper-helicopter",
    time: {
      "prep": 5,
      "core": [
        30,
        45
      ],
      "verified": false
    },
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
    standards: [
      "1A-AP-09",
      "2-DA-07"
    ],
    simple: {
      "mission": "Learn how computers make pictures. Then make a moving picture.",
      "steps": [
        "Pick a color. Tap the grid to draw.",
        "Watch your picture turn into code.",
        "Turn a code back into a picture.",
        "Copy your picture, change it a little, and press Play.",
        "Try fast and slow. Save your best one."
      ]
    },
    skills: [
      "encoding-art"
    ],
    why: "Every picture on a screen is a grid of tiny colored squares called pixels. Computers store a picture as numbers, and an animation is just pictures shown fast, one after another.",
    realWorld: "Video game artists draw pixel art, and every cartoon, movie, and GIF you watch is a series of frames played quickly.",
    vocab: [
      {
        "term": "Pixel",
        "def": "One tiny square of color in a digital picture."
      },
      {
        "term": "Resolution",
        "def": "How many pixels a picture has. More pixels show more detail."
      },
      {
        "term": "Frame",
        "def": "One picture in an animation."
      },
      {
        "term": "Frames per second",
        "def": "How many frames play each second. More frames look smoother and faster."
      }
    ],
    check: "Play your animation. Tell how many frames it has and what changes from one frame to the next.",
    stopAt: "You decode the lighthouse picture and save one animation with at least three frames.",
    stuck: [
      "Draw your first frame, then use Copy frame and change just a little.",
      "To decode, read the code one row at a time, left to right.",
      "If it's too fast or too slow, change the frames per second."
    ],
    next: "animate-your-name",
    time: {
      "prep": 0,
      "core": [
        30,
        45
      ],
      "verified": false
    },
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
  },
  // ───── 3D Printing (Tinkercad). Tinkercad facts checked October 22, 2026 against school and district guides
  // (Classes with a class code and nickname, the Export → .STL path, Ruler, Align). Menu names can change, so each
  // record tells teachers to check the steps in Tinkercad before class. Steps are printer-agnostic (PLA).
  {
    id: "3d-buoy-charm",
    standards: [
      "3-5-ETS1-1",
      "MS-ETS1-1"
    ],
    title: "Lobster Buoy Charm",
    area: "3d-printing",
    summary: "Design a lobster buoy charm in Tinkercad: stack basic shapes, cut a hole for a key ring, and keep it under 40 mm so it prints fast.",
    level: "beginner",
    grades: ["4-5", "6-8"],
    duration: 90,
    time: { prep: 15, core: [80, 90], verified: false },
    format: "independent",
    equipment: ["computer", "printer3d"],
    source: "original",
    keywords: ["3d printing", "tinkercad", "design", "buoy", "lobster", "maine", "shapes", "hole", "group", "measurement", "cad"],
    access: { account: "required", accountNote: "Students join your Tinkercad Class with a class code and nickname, so they don't need an email. You need a free Tinkercad teacher account.", cost: "free", supervision: true, hardware: ["3D printer"] },
    launch: { status: "ready", label: "Open Tinkercad", url: "https://www.tinkercad.com/", provider: "Tinkercad (Autodesk)", note: "Free. Students join your Tinkercad Class with the class code and their nickname." },
    stopAt: "Your buoy charm is under 40 mm tall, has a ring hole all the way through, is grouped into one part, and is exported as an STL for printing.",
    check: "Show your design with the Ruler on it. Point to the hole and say how you made it go all the way through.",
    stuck: [
      "Lost a shape? Click the home button by the view cube to zoom back to the workplane.",
      "A hole only cuts when you select the hole and the solid together and press Group.",
      "Too big? Hold Shift and drag a corner handle to shrink it evenly."
    ],
    why: "Every product you own started as a 3D design on a computer. Designers build complex things from simple shapes, measure carefully, and make sure a part can actually be made.",
    realWorld: "Engineers in Maine design boat parts, medical devices, and tools in CAD programs like Tinkercad, then print prototypes before making the real thing.",
    vocab: [
      { term: "CAD", def: "Computer-aided design: drawing 3D objects on a computer." },
      { term: "Workplane", def: "The blue grid in Tinkercad where you build." },
      { term: "Hole", def: "A shape that cuts away from a solid when you group them." },
      { term: "STL", def: "The file type a 3D printer's software reads." }
    ],
    mission: "Every lobster family in Maine paints its buoys in its own colors, so everyone knows whose traps are whose. Design your own buoy as a charm you can clip to a backpack. It has to be small enough to print quickly and strong enough to hang from a ring.",
    learn: [
      "Build a 3D object by combining basic shapes on the workplane.",
      "Use a hole shape and Group to cut a hole all the way through.",
      "Measure in millimeters and keep a design inside a size limit."
    ],
    before: {
      materials: ["A laptop or Chromebook with a mouse, if you have one", "A 3D printer with PLA filament", "Optional: paint markers to color the printed buoy"],
      setup: [
        "Create a Tinkercad Class and add each student's nickname (a list can be pasted). Share the class code.",
        "Try the steps in Tinkercad yourself first. Menu names can change.",
        "Plan the print queue: one charm takes about 15–25 minutes on most printers."
      ],
      prerequisites: "None. This is a first 3D design activity."
    },
    steps: [
      "Sign in to Tinkercad with your class code and nickname, then create a new design.",
      "Drag a cylinder onto the workplane. Make it about 12 mm wide and 25 mm tall. This is the buoy body.",
      "Add shapes for the top and bottom, like a cone or a smaller cylinder. Raise them so they sit on the body.",
      "Select everything and use Align so the parts line up in the middle. Then Group them into one buoy.",
      "Make a small cylinder hole about 4 mm wide. Push it through the top of the buoy, so it goes all the way across.",
      "Select the buoy and the hole together and press Group. Check from two sides that the hole goes all the way through.",
      "Put the Ruler on the workplane. Is the charm under 40 mm tall? If not, shrink it evenly.",
      "Lay the buoy on its side so it prints without supports (skip this if you've been told to print it standing up). Press Export and choose .STL.",
      "Hand in your STL for printing. While it prints, sketch the colors for your family's buoy."
    ],
    reflect: "Which basic shapes did you combine to make your buoy? If you made it again, what would you change so it prints better or looks more like a real buoy?",
    extend: "Design a matching mini lobster trap or a buoy with your initials cut into the side. Keep it under 40 mm.",
    teacherNotes: [
      "Learning objective: students build an object from basic shapes, use a hole to cut away material, and work to a size limit in millimeters.",
      "Common misconception: a hole cuts as soon as it touches the solid. It only cuts after Group. Students also think the size boxes are in inches; Tinkercad uses millimeters by default.",
      "Print settings that work for most classroom printers: PLA, about 0.2 mm layer height, 10–15% infill, no supports if the buoy lies on its side. A 40 mm charm is roughly 15–25 minutes. Batch several charms on one plate.",
      "Safety: only adults handle the printer. The nozzle and bed are hot.",
      "Ask afterward: \"Why do designers use simple shapes to build complicated things?\"",
      "Tinkercad facts (Classes, the Export → .STL path, Ruler, Align) were checked October 22, 2026 against school guides. Check them in Tinkercad before class."
    ],
    next: "3d-trail-marker"
  },
  {
    id: "3d-trail-marker",
    standards: [
      "3-5-ETS1-1",
      "MS-ETS1-1"
    ],
    title: "Trail Blaze Marker",
    area: "3d-printing",
    summary: "Design a trail marker with raised letters, exactly 50 × 30 × 4 mm, and make sure it prints flat with no supports.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 90,
    time: { prep: 15, core: [80, 90], verified: false },
    format: "independent",
    equipment: ["computer", "printer3d"],
    source: "original",
    keywords: ["3d printing", "tinkercad", "measurement", "text", "trail", "katahdin", "appalachian trail", "maine", "scale", "millimeters", "supports"],
    access: { account: "required", accountNote: "Students join your Tinkercad Class with a class code and nickname, so they don't need an email. You need a free Tinkercad teacher account.", cost: "free", supervision: true, hardware: ["3D printer"] },
    launch: { status: "ready", label: "Open Tinkercad", url: "https://www.tinkercad.com/", provider: "Tinkercad (Autodesk)", note: "Free. Students join your Tinkercad Class with the class code and their nickname." },
    stopAt: "Your marker measures 50 × 30 × 4 mm with the Ruler, its text is raised and readable, the bottom is flat on the workplane, and it's exported as an STL.",
    check: "Put the Ruler on your design and read out its three measurements. Explain why the letters are raised and not floating.",
    stuck: [
      "Type exact numbers into the size boxes instead of dragging. Click a number to edit it.",
      "Text that floats above the plate won't print. Use the Ruler and set its height so it sits on the marker.",
      "Letters too thin to print? Make the text bigger or choose a bolder font."
    ],
    why: "Real parts have to fit exactly. Designers measure in millimeters, plan how a part will print, and check before they send it to the machine.",
    realWorld: "Trail crews in Maine mark the Appalachian Trail all the way to Katahdin. Sign makers, machinists, and product designers all work to exact measurements.",
    vocab: [
      { term: "Millimeter (mm)", def: "A tenth of a centimeter. 3D design uses millimeters." },
      { term: "Dimensions", def: "How long, wide, and tall something is." },
      { term: "Raised (embossed) text", def: "Letters that stick up from a surface." },
      { term: "Supports", def: "Extra plastic a printer adds under parts that hang in the air." }
    ],
    mission: "Hikers on Maine trails follow painted blazes and small markers, from the coast all the way to Katahdin. Design a marker for a trail near your school: exactly 50 mm long, 30 mm wide, and 4 mm thick, with raised letters that a hiker can read and a printer can print without supports.",
    learn: [
      "Set exact dimensions in millimeters and check them with the Ruler.",
      "Add raised text and attach it so it prints.",
      "Plan a design so it prints flat with no supports."
    ],
    before: {
      materials: ["A laptop or Chromebook with a mouse, if you have one", "A 3D printer with PLA filament", "A ruler with millimeters, to check the printed marker"],
      setup: [
        "Use the same Tinkercad Class as before, or create one and share the code.",
        "Try the steps in Tinkercad yourself first. Menu names can change.",
        "One 50 × 30 × 4 mm marker takes about 20–30 minutes on most printers."
      ],
      prerequisites: "Lobster Buoy Charm, or knowing how to move, size, and group shapes."
    },
    steps: [
      "Sign in with your class code and nickname and create a new design.",
      "Add a box. Type its size: 50 mm long, 30 mm wide, 2 mm tall. This is the base.",
      "Add a short word or trail initials with the Text shape. Make the letters 2 mm tall and at least 6 mm high, so they print clearly.",
      "Move the text so it sits on top of the base, not floating above it. Use the Ruler to check its height.",
      "Optional: add a blaze shape, like an arrow or a mountain, also 2 mm tall.",
      "Select everything and Group it. Put the Ruler on it. Is it 50 × 30 × 4 mm? Fix any number that's off.",
      "Check that the bottom is flat on the workplane, so nothing hangs in the air. Then Export as .STL.",
      "Hand in your STL. When it's printed, measure it with a real ruler. Did it come out 50 × 30?"
    ],
    reflect: "Your design said 50 × 30 mm. What did the real marker measure? If the numbers were different, why do you think that happened?",
    extend: "Design a set of three markers for a short trail at school: a start, a turn arrow, and a finish. Keep every one the same size so they match.",
    teacherNotes: [
      "Learning objective: students work to exact dimensions in millimeters, attach raised text so it prints, and plan for printing without supports.",
      "Common misconception: if it looks right on screen, it will print. Floating text, very thin letters, and parts hanging in the air are the usual failures. The Ruler check catches most of them.",
      "Print settings: PLA, about 0.2 mm layers, 10–15% infill, no supports, printed flat. About 20–30 minutes each. Real prints usually measure within about half a millimeter of the design, which makes a good discussion about tolerance.",
      "Safety: only adults handle the printer. The nozzle and bed are hot.",
      "Ask afterward: \"Why do designers type exact numbers instead of dragging?\"",
      "Tinkercad facts were checked October 22, 2026 against school guides. Check the Text shape and Export menu in Tinkercad before class."
    ],
    next: "3d-fix-it-clip"
  },
  {
    id: "3d-fix-it-clip",
    standards: [
      "3-5-ETS1-3",
      "MS-ETS1-4"
    ],
    next: "lab-launcher",
    title: "Fix It! Design a Clip",
    area: "3d-printing",
    summary: "Measure a real pencil or cable, design a clip with the right gap, print a quick test, and improve it until it holds.",
    level: "intermediate",
    grades: ["4-5", "6-8"],
    duration: 90,
    time: { prep: 15, core: [80, 90], verified: false },
    format: "collaborative",
    equipment: ["computer", "printer3d"],
    source: "original",
    keywords: ["3d printing", "tinkercad", "engineering design", "tolerance", "measurement", "prototype", "iteration", "test", "clip"],
    access: { account: "required", accountNote: "Students join your Tinkercad Class with a class code and nickname, so they don't need an email. You need a free Tinkercad teacher account.", cost: "free", supervision: true, hardware: ["3D printer"] },
    launch: { status: "ready", label: "Open Tinkercad", url: "https://www.tinkercad.com/", provider: "Tinkercad (Autodesk)", note: "Free. Students join your Tinkercad Class with the class code and their nickname." },
    stopAt: "Your team printed a test, measured what went wrong, changed the gap, and your second version holds the pencil or cable. You wrote down both gap sizes.",
    check: "Show both versions. Say the gap you tried first, what happened, the gap you changed it to, and why.",
    stuck: [
      "Measure the object across its widest part. That's the size your gap starts from.",
      "If the clip won't snap on, make the gap a little bigger. If it falls off, make it a little smaller.",
      "Print only the part you're testing: a small ring or C-shape prints in a few minutes."
    ],
    why: "Engineers rarely get a part right the first time. They measure, make a quick test, see what happened, and change one thing. That loop is how real products get good.",
    realWorld: "Engineers call the small extra space a fit needs \"tolerance.\" Phone cases, LEGO bricks, and boat parts all depend on getting it right.",
    vocab: [
      { term: "Prototype", def: "An early version you build to test an idea." },
      { term: "Tolerance", def: "The small extra space parts need so they fit together." },
      { term: "Iterate", def: "Test, change one thing, and test again." },
      { term: "Diameter", def: "The distance straight across a circle." }
    ],
    mission: "Cables get tangled and pencils roll off desks. Design a clip that solves one small problem in your classroom. The catch: you have to measure the real object, and your first print probably won't fit. Test it, figure out why, and fix it.",
    learn: [
      "Measure a real object and turn the measurement into a design.",
      "Explain tolerance: why a fit needs a small gap.",
      "Improve a design from test results, changing one thing at a time."
    ],
    before: {
      materials: ["Pencils, markers, or charging cables to clip", "A ruler with millimeters (calipers if you have them)", "A 3D printer with PLA filament", "A laptop or Chromebook per team"],
      setup: [
        "Use your Tinkercad Class. Teams of two share one design.",
        "Try a C-shaped clip in Tinkercad yourself first. Menu names can change.",
        "Plan two short print rounds: a quick test (about 5–10 minutes each) and the improved clip."
      ],
      prerequisites: "Lobster Buoy Charm or Trail Blaze Marker, or knowing how to size and group shapes."
    },
    steps: [
      "Pick a problem: a pencil that rolls, or a cable that tangles. Choose the object your clip will hold.",
      "Measure the object across its widest part in millimeters. Write it down.",
      "In Tinkercad, make a tube or a ring. Set the hole a little bigger than your measurement. Write down the gap you chose.",
      "Cut an opening on one side so it becomes a C-shape that can snap on. Keep the walls at least 2 mm thick.",
      "Add a flat base or a second C so it can stick to a desk edge or hold a second cable.",
      "Export the STL and print a quick test. Try it on the real object. Too tight, too loose, or just right?",
      "Change only the gap, by about half a millimeter at a time. Print version 2 and test again.",
      "Write down both gaps and what happened. Share which change made it work."
    ],
    reflect: "Your first clip used a gap of ___ mm and your second used ___ mm. What happened each time, and what does that tell you about tolerance?",
    extend: "Design a clip for a different object, using what you learned about gaps. Can you get it right on the first print?",
    teacherNotes: [
      "Learning objective: students measure a real object, design with a tolerance, and improve a design from test evidence.",
      "Common misconception: if the hole is the same size as the object, it will fit. Printed holes usually come out slightly smaller, so a gap about 0.3–0.5 mm larger works on most printers. Let students discover this from their first test.",
      "Print settings: PLA, about 0.2 mm layers, 15–20% infill, walls at least 2 mm so the C can flex without snapping. Test rings print in about 5–10 minutes.",
      "Safety: only adults handle the printer. The nozzle and bed are hot.",
      "Ask afterward: \"Why do engineers make quick test prints instead of printing the final part right away?\"",
      "Tinkercad facts were checked October 22, 2026 against school guides. Check the tube and hole tools in Tinkercad before class."
    ]
  }
];
