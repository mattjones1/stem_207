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
    title: "Giving clear instructions",
    concepts: "Sequencing and algorithms",
    suggestedStart: "A common starting point for grades 2–3, and a quick warm-up for any new coder.",
    prerequisite: "None. Everyone can start here.",
    goal: "Write a sequence of exact steps that someone or something else can follow to reach a goal.",
    project: "Guide a robot through a floor maze with arrow cards, then solve the same kind of maze with code blocks.",
    debugging: "Run the program one step at a time and point to the first step that goes wrong.",
    iCan: "I can write step-by-step instructions in the right order, and fix the step that goes wrong.",
    activities: ["fix-the-recipe", "lab-dance-party", "robot-maze-mission", "pixel-art-code"]
  },
  {
    stage: 2,
    title: "Making things happen",
    concepts: "Events and input",
    suggestedStart: "Often a good next step for grades 2–4.",
    prerequisite: "Can put instructions in the right order (Stage 1).",
    goal: "Make a program that waits for input, like a click or a key press, and responds.",
    project: "Build a character that reacts differently to clicks and key presses.",
    debugging: "Test each event on its own. Check which key or click the program is actually listening for.",
    iCan: "I can make a program respond when someone clicks, taps, or presses a key.",
    activities: ["event-party", "animate-your-name"]
  },
  {
    stage: 3,
    title: "Finding patterns",
    concepts: "Repetition and loops",
    suggestedStart: "Many grade 3–5 classes start here after a quick Stage 1–2 review.",
    prerequisite: "Can make a program respond to an event (Stage 2).",
    goal: "Spot repeated steps and replace them with a loop that produces the same result.",
    project: "Shorten a long dance with loops, then fix a broken animation that uses the wrong kind of loop.",
    debugging: "Compare what the loop should repeat with what it actually repeats. Change one thing, then test.",
    iCan: "I can use a loop to repeat steps, and explain how many times it will run.",
    activities: ["loop-dance", "debug-animation"]
  },
  {
    stage: 4,
    title: "Making choices",
    concepts: "Conditions and logical reasoning",
    suggestedStart: "A frequent entry point for grades 4–6 with some block-coding experience.",
    prerequisite: "Can use a loop (Stage 3).",
    goal: "Use if–then–else so a program makes different decisions based on what's happening.",
    project: "Build an interactive story where the reader's choice changes the ending.",
    debugging: "Test every branch, including answers you didn't plan for.",
    iCan: "I can use if–then–else to make a program choose what to do, and test every path.",
    activities: ["interactive-story", "sense-think-act"]
  },
  {
    stage: 5,
    title: "Remembering information",
    concepts: "Variables and basic data",
    suggestedStart: "Often a fit for grades 5–7.",
    prerequisite: "Can use if–then blocks (Stage 4).",
    goal: "Create a variable to store a value, change it as the program runs, and reset it when needed.",
    project: "Build a catching game that keeps score.",
    debugging: "Watch the variable's value while the program runs. Check where it's set, changed, and reset.",
    iCan: "I can create a variable, change it while my program runs, and explain what it stores.",
    activities: ["score-keeper", "lab-space-blob"]
  },
  {
    stage: 6,
    title: "Organizing solutions",
    concepts: "Decomposition and reusable functions",
    suggestedStart: "Often a fit for grades 6–8.",
    prerequisite: "Has used a variable in a project (Stage 5).",
    goal: "Break a problem into parts and build a custom block that can be reused with different inputs.",
    project: "Make a custom shape block and reuse it to draw a large pattern.",
    debugging: "Test the custom block on its own before using it in the bigger program.",
    iCan: "I can break a problem into smaller parts and make a reusable block for one of them.",
    activities: ["my-blocks-patterns"]
  },
  {
    stage: 7,
    title: "Creating independently",
    concepts: "Plan, build, test, debug, and explain",
    suggestedStart: "For any student who is confident with Stages 1–6, usually grades 6–8.",
    prerequisite: "Has made and reused a custom block (Stage 6).",
    goal: "Plan and build an original project, use tester feedback to improve it, and explain how it works.",
    project: "Design your own game or interactive project over two or more sessions.",
    debugging: "Ask a tester to play without help. Their confusion and bugs become your fix list.",
    iCan: "I can plan, build, test, debug, and explain a project of my own.",
    activities: ["capstone-game"]
  }
];
