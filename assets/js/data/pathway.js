/*
 * STEM 207 — coding pathway.
 *
 * Stages are ordered by readiness, not grade. `suggestedStart` helps teachers
 * pick an entry point; it never limits who can move on.
 * `activities` lists activity ids from activities.js that practice the stage.
 */
window.STEM = window.STEM || {};

window.STEM.pathway = [
  {
    stage: 1,
    teach: { lookFor: "They write or arrange steps in order and, when a step fails, point to the exact step and fix it.", misconception: "Thinking the computer will “know what I mean.” Precise steps matter more than the right idea." },
    title: "Giving clear instructions",
    concepts: "Sequencing and algorithms",
    suggestedStart: "A common starting point for grades 2–3, and a quick warm-up for any new coder.",
    prerequisite: "None. Everyone can start here.",
    goal: "Write a sequence of exact steps that someone or something else can follow to reach a goal.",
    project: "Guide a robot through a floor maze with arrow cards, then solve the same kind of maze with code blocks.",
    debugging: "Run the program one step at a time and point to the first step that goes wrong.",
    iCan: "I can write step-by-step instructions in the right order, and fix the step that goes wrong.",
    activities: ["fix-the-recipe", "lab-robot-chef", "lab-dance-party", "robot-maze-mission", "pixel-art-code", "sort-the-catch"]
  },
  {
    stage: 2,
    teach: { lookFor: "They show a sprite that reacts to at least two different events and say which event starts which action.", misconception: "Believing every program needs the green flag. Event blocks wait on their own." },
    title: "Making things happen",
    concepts: "Events and input",
    suggestedStart: "Often a good next step for grades 2–4.",
    prerequisite: "Can put instructions in the right order (Stage 1).",
    goal: "Make a program that waits for input, like a click or a key press, and responds.",
    project: "Build a character that reacts differently to clicks and key presses.",
    debugging: "Test each event on its own. Check which key or click the program is actually listening for.",
    iCan: "I can make a program respond when someone clicks, taps, or presses a key.",
    activities: ["event-party", "animate-your-name", "lighthouse-network"]
  },
  {
    stage: 3,
    teach: { lookFor: "They use a repeat loop and say how many times it will run before they run it.", misconception: "Putting steps that should run once inside the loop, or miscounting the repeats." },
    title: "Finding patterns",
    concepts: "Repetition and loops",
    suggestedStart: "Many grade 3–5 classes start here after a quick Stage 1–2 review.",
    prerequisite: "Can make a program respond to an event (Stage 2).",
    goal: "Spot repeated steps and replace them with a loop that produces the same result.",
    project: "Shorten a long dance with loops, then fix a broken animation that uses the wrong kind of loop.",
    debugging: "Compare what the loop should repeat with what it actually repeats. Change one thing, then test.",
    iCan: "I can use a loop to repeat steps, and explain how many times it will run.",
    activities: ["loop-dance", "debug-animation", "snowstorm-clones", "lab-rover"]
  },
  {
    stage: 4,
    teach: { lookFor: "They test both paths of an if–else, one input that matches and one that doesn't, and explain which branch ran.", misconception: "Testing only the case they expect, or thinking “else” means the wrong answer." },
    title: "Making choices",
    concepts: "Conditions and logical reasoning",
    suggestedStart: "A frequent entry point for grades 4–6 with some block-coding experience.",
    prerequisite: "Can use a loop (Stage 3).",
    goal: "Use if–then–else so a program makes different decisions based on what's happening.",
    project: "Build an interactive story where the reader's choice changes the ending.",
    debugging: "Test every branch, including answers you didn't plan for.",
    iCan: "I can use if–then–else to make a program choose what to do, and test every path.",
    activities: ["interactive-story", "sense-think-act", "lab-moon-gate", "lobster-trap-logic", "noreaster-alerts"]
  },
  {
    stage: 5,
    teach: { lookFor: "They point to a variable, say what it stores, and show where it changes and where it resets.", misconception: "Forgetting to reset a variable, so the next run starts with the old value." },
    title: "Remembering information",
    concepts: "Variables and basic data",
    suggestedStart: "Often a fit for grades 5–7.",
    prerequisite: "Can use if–then blocks (Stage 4).",
    goal: "Create a variable to store a value, change it as the program runs, and reset it when needed.",
    project: "Build a catching game that keeps score.",
    debugging: "Watch the variable's value while the program runs. Check where it's set, changed, and reset.",
    iCan: "I can create a variable, change it while my program runs, and explain what it stores.",
    activities: ["score-keeper", "lab-space-blob", "catch-log-lists"]
  },
  {
    stage: 6,
    teach: { lookFor: "They show a custom block they made, explain what its input changes, and use it more than once.", misconception: "Copying the same code instead of reusing a block, or making a block that only works for one size." },
    title: "Organizing solutions",
    concepts: "Decomposition and reusable functions",
    suggestedStart: "Often a fit for grades 6–8.",
    prerequisite: "Has used a variable in a project (Stage 5).",
    goal: "Break a problem into parts and build a custom block that can be reused with different inputs.",
    project: "Make a custom shape block and reuse it to draw a large pattern.",
    debugging: "Test the custom block on its own before using it in the bigger program.",
    iCan: "I can break a problem into smaller parts and make a reusable block for one of them.",
    activities: ["my-blocks-patterns", "snowflake-functions", "lab-harbor-python", "python-turtle-bridge"]
  },
  {
    stage: 7,
    teach: { lookFor: "They show a project of their own and explain one bug they found and how they fixed it.", misconception: "Choosing a project too big to finish. A small version 1 that works comes first." },
    title: "Creating independently",
    concepts: "Plan, build, test, debug, and explain",
    suggestedStart: "For any student who is confident with Stages 1–6, usually grades 6–8.",
    prerequisite: "Has made and reused a custom block (Stage 6).",
    goal: "Plan and build an original project, use tester feedback to improve it, and explain how it works.",
    project: "Design your own game or interactive project over two or more sessions.",
    debugging: "Ask a tester to play without help. Their confusion and bugs become your fix list.",
    iCan: "I can plan, build, test, debug, and explain a project of my own.",
    activities: ["capstone-game", "capstone-studio"]
  }
];

/* "New to coding? Start here": short entry tracks by grade band. Same ideas, framed for the age. */
window.STEM.startHere = [
  { band: "2-3", title: "Grades 2–3", frame: "Learn to give a computer exact instructions, one step at a time.",
    activities: ["fix-the-recipe", "lab-dance-party", "robot-maze-mission"] },
  { band: "4-5", title: "Grades 4–5", frame: "Order, events, and debugging: the three habits every coder uses.",
    activities: ["lab-dance-party", "robot-maze-mission", "event-party"] },
  { band: "6-8", title: "Grades 6–8 (new to coding)", frame: "These activities look playful, but the thinking is what working programmers do: write an exact sequence, predict the result, and debug the first thing that goes wrong. Move fast through them, then head to Stage 3.",
    activities: ["lab-dance-party", "robot-maze-mission", "animate-your-name"] }
];

/* The AI learning route: one idea builds on the next. Every step uses activities that already exist. */
window.STEM.aiRoute = [
  { step: 1, title: "Patterns and predictions", idea: "Computers that “guess” are finding patterns in examples. A likely answer can still be wrong.",
    activities: ["pattern-predictors"] },
  { step: 2, title: "Labels and examples", idea: "A model learns from labeled examples. Missing or unusual examples lead to mistakes.",
    activities: ["how-ai-sorts", "blueberry-sorter"] },
  { step: 3, title: "Training a real model", idea: "Train a model, then check it on examples it has never seen.",
    activities: ["lab-pattern-machine", "ai-for-oceans"] },
  { step: 4, title: "Testing with new examples", idea: "Training examples and test examples are different. Variety in the data matters more than amount.",
    activities: ["teachable-machine-classroom", "ai-secret-signals"] },
  { step: 5, title: "Uncertainty and limits", idea: "A confidence score is the model's own number, and it can be high when the model is wrong. Some answers should go to a person.",
    activities: ["lab-pattern-machine"], note: "Pattern Machine Lab levels 5 and 6." },
  { step: 6, title: "Checking and responsibility", idea: "People decide when to use AI, check its work, and fix the data when it's unfair.",
    activities: ["ai-limits-detectives"] }
];
