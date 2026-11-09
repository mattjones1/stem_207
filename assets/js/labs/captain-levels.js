/*
 * Captain Code — the 34 levels (Casco Bay 10, Penobscot Bay 12, Down East 12). Data only; lab-captain.js plays them.
 * Every level carries a reference solution in mini-Python. tests/tools/test_captain_levels.js compiles each one,
 * sails it through the real engine (SE.harbor.sail) on every channel, and checks the budget and par.
 *
 * Map squares: # granite ledge   . open water   S your boat (the dock)   G your mooring   * trap buoy
 *              o dashed spot (set a trap here)   x search mark (sail over it)
 * A level:
 *   id, title, concept, briefing (the harbor master), goal, hints: [notice, idea, scaffold], learned
 *   grids: [map, map…] (two or more = channels the same program must handle), worlds: names for them
 *   dir, blocks, fog (squares the captain can see), needGems, needDrops, carry, minCalls, fnName, varName
 *   budget (most blocks allowed), par (the reference's block count), stretch: { blocks?, text } (no blocks = a first-run win)
 *   stretchRef (Python): a program that meets stretch.blocks, so the Compass is reachable (tests)
 *   predict (guess where the boat stops first), plan (plot your course), starter (a broken program, in Python)
 *   legs: [{ at: "x,y", name, where }] the trap letters on level 10; lesson: set from LESSONS at the bottom of this file
 *   reference (Python), wrong: [{ src, reason }] programs that must fail, and why (tests)
 * Block count: every block counts once, nested ones too, and the blocks inside your own block. Calling it is 1.
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});
  const MOVE = ["move", "left", "right"];

  const CASCO = [
    {
      id: "cb-1", title: "Leaving the Dock", concept: "Sequence", predict: true,
      briefing: "Morning, Captain! Your boat only goes where your code tells it. Let's start easy: steer out to your mooring buoy.",
      goal: "Steer from the dock to your mooring.",
      hints: ["Look at the map. How many squares is it from your boat to the mooring?", "Each Forward block moves the boat one square.", "Add one Forward for each square, then press Run."],
      learned: "A program is a sequence: steps the computer follows in order, one at a time. Your boat did exactly what you told it.",
      grids: [["#######", "#S...G#", "#######"]], dir: "E", blocks: MOVE,
      reference: "move()\nmove()\nmove()\nmove()",
      wrong: [{ src: "move()\nmove()\nmove()", reason: "short" }]
    },
    {
      id: "cb-2", title: "The First Trap Haul", concept: "Planning", plan: true,
      briefing: "There's a trap buoy just out past the dock. Plan your route first: tap the squares the boat will sail through.",
      goal: "Haul the trap, then head to your mooring.",
      hints: ["Haul trap only works when the boat is right on the buoy.", "Planning the route first shows you where each turn goes.", "Forward, Forward, Haul trap, then turn toward the mooring."],
      learned: "Planning before you code saves time. And order matters: hauling only works after the boat reaches the trap.",
      grids: [["#######", "#S.*###", "###.###", "###G###", "#######"]], dir: "E", blocks: [...MOVE, "pick"], needGems: true,
      reference: "move()\nmove()\nhaul()\nturn_right()\nmove()\nmove()",
      wrong: [{ src: "move()\nhaul()\nmove()\nturn_right()\nmove()\nmove()", reason: "nogem" }, { src: "move()\nmove()\nturn_right()\nmove()\nmove()", reason: "traps" }]
    },
    {
      id: "cb-3", title: "Another Captain's Mistake", concept: "Debugging", predict: true,
      briefing: "Captain Dot sent us her route, but her boat keeps bumping a ledge. Don't guess. Step through it and find the first block that goes wrong.",
      goal: "Fix Captain Dot's program so the boat reaches the mooring.",
      steps: ["Press Step to run one block at a time.", "Watch for the first block that goes the wrong way.", "Fix that block, then run again."],
      hints: ["Step slowly. Where does the boat leave the channel?", "The bug is a turn. Turns don't move the boat; they change which way it faces.", "The first turn should point the boat down the channel. Is it left or right?"],
      learned: "Debugging is investigating: find the first step that goes wrong, fix it, and test again. Stepping through is how programmers do it.",
      grids: [["########", "#S..####", "###.####", "###...G#", "########"]], dir: "E", blocks: MOVE,
      starter: "move()\nmove()\nturn_left()\nmove()\nmove()\nturn_left()\nmove()\nmove()\nmove()",
      reference: "move()\nmove()\nturn_right()\nmove()\nmove()\nturn_left()\nmove()\nmove()\nmove()",
      wrong: [{ src: "move()\nmove()\nturn_left()\nmove()\nmove()\nturn_left()\nmove()\nmove()\nmove()", reason: "crash" }]
    },
    {
      id: "cb-4", title: "Granite Ledge Passage", concept: "Precision",
      briefing: "This passage is narrow, with granite on both sides. Keep track of which way your bow points before every turn.",
      goal: "Thread the passage to your mooring without touching a ledge.",
      hints: ["Before each turn, picture yourself at the wheel facing the way the boat faces.", "The passage steps down like stairs: forward, turn, forward, turn back.", "Count each straight stretch. Write the route down: 1 east, 2 south, 2 east, 2 south, 3 east."],
      learned: "Precise programs track state. The boat's direction is part of its state, and every turn changes it.",
      grids: [["#########", "#S.######", "##.######", "##...####", "####.####", "####...G#", "#########"]], dir: "E", blocks: MOVE, par: 14,
      stretch: { text: "Solve it on your first run." },
      reference: "move()\nturn_right()\nmove()\nmove()\nturn_left()\nmove()\nmove()\nturn_right()\nmove()\nmove()\nturn_left()\nmove()\nmove()\nmove()",
      wrong: [{ src: "move()\nturn_left()\nmove()", reason: "crash" }]
    },
    {
      id: "cb-5", title: "The Lobster Trap Line", concept: "Loops", predict: true,
      briefing: "Here's a string of traps, evenly spaced. You could write a long program, but a good captain spots the pattern.",
      goal: "Haul all 4 traps and reach your mooring using 5 blocks or fewer.",
      hints: ["Say the route out loud. What do you keep saying again and again?", "A Repeat block runs the blocks inside it as many times as you choose.", "Repeat 4 times: Forward, Forward, Haul trap. Then one more Forward."],
      learned: "A loop repeats a pattern. Your program went from 13 blocks to 5, and it's easier to read and fix.",
      grids: [["############", "#S.*.*.*.*G#", "############"]], dir: "E", blocks: [...MOVE, "pick", "repeat"], needGems: true, budget: 5, par: 5,
      reference: "for i in range(4):\n    move()\n    move()\n    haul()\nmove()",
      wrong: [{ src: "for i in range(3):\n    move()\n    move()\n    haul()\nmove()", reason: "short" }]
    },
    {
      id: "cb-6", title: "Fog on the Water", concept: "If / else", fog: 1,
      briefing: "Thick fog! You can only see one square around the boat. You can't plan the whole route, so teach the boat to decide for itself.",
      goal: "Find your mooring in the fog using 4 blocks or fewer.",
      steps: ["Use Repeat until at mooring.", "Inside it: If ledge ahead → turn. Else → Forward."],
      hints: ["You can't see the route, but the boat can sense a ledge right in front of it.", "An if / else block picks one of two actions every time it runs.", "Repeat until at mooring: If ledge ahead → Turn right, else → Forward."],
      learned: "If / else lets a program make decisions from what it senses. One rule found a route you couldn't even see.",
      grids: [["#########", "#S......#", "#######.#", "#.G####.#", "#.#####.#", "#.......#", "#########"]], dir: "E",
      blocks: [...MOVE, "untilGoal", "ifWall"], budget: 4, par: 4,
      reference: "while not at_mooring():\n    if ledge_ahead():\n        turn_right()\n    else:\n        move()",
      wrong: [{ src: "while not at_mooring():\n    if ledge_ahead():\n        turn_left()\n    else:\n        move()", reason: "loop" }]
    },
    {
      id: "cb-7", title: "The Changing Channel", concept: "Loops + if / else",
      worlds: ["High tide", "Low tide"],
      briefing: "The tide moves sandbars, so this channel bends a different way at high tide and at low tide. One program has to handle both.",
      goal: "Write one program that reaches the mooring at high tide and at low tide, with 6 blocks or fewer.",
      steps: ["Try your program on both tabs, or press Test both tides.", "When there's a ledge ahead, check which side is open."],
      hints: ["Run your program on each tide. Where does it go wrong?", "At a ledge, the boat can check: is there a ledge on the right?", "Repeat until at mooring: If ledge ahead → (If ledge on the right → Turn left, else → Turn right), else → Forward."],
      learned: "A program that senses and decides works in situations it has never seen. That's why real programs are tested on many cases, not just one.",
      grids: [
        ["#########", "#S..#####", "###.#####", "###....G#", "#########"],
        ["#########", "###....G#", "###.#####", "#S..#####", "#########"]
      ], dir: "E", blocks: [...MOVE, "untilGoal", "ifWall", "ifLedgeRight"], budget: 6, par: 6,
      reference: "while not at_mooring():\n    if ledge_ahead():\n        if ledge_right():\n            turn_left()\n        else:\n            turn_right()\n    else:\n        move()",
      wrong: [{ src: "move()\nmove()\nturn_right()\nmove()\nmove()\nturn_left()\nmove()\nmove()\nmove()\nmove()", reason: "crash" }]
    },
    {
      id: "cb-8", title: "The Growing Spiral", concept: "Variables", varName: "distance",
      briefing: "A buoy broke loose. Search in a growing square spiral: 1 square, turn, 2 squares, turn, 3… Sail over every search mark (✕).",
      goal: "Spiral out over all 3 search marks to your mooring using 6 blocks or fewer.",
      steps: ["Each side is one square longer than the last: 1, 2, 3, 4, 5.", "A variable called distance can remember a number and change it."],
      hints: ["Write down the length of each side. What changes each time?", "A variable holds a number. Repeat distance times uses it, and Change distance makes it grow.", "Set distance to 1. Repeat 5: { Repeat distance times: Forward. Turn right. Change distance by 1. }"],
      learned: "A variable stores a value that changes while the program runs. The same loop sailed a longer side each time because distance grew.",
      grids: [["########", "#x....G#", "#......#", "#..S..##", "#....#.#", "#x..x..#", "########"]], dir: "E",
      blocks: [...MOVE, "repeat", "setVar", "repeatVar", "changeVar"], budget: 6, par: 6,
      reference: "distance = 1\nfor i in range(5):\n    for i in range(distance):\n        move()\n    turn_right()\n    distance += 1",
      wrong: [{ src: "distance = 1\nfor i in range(5):\n    for i in range(distance):\n        move()\n    turn_right()", reason: "short" }]
    },
    {
      id: "cb-9", title: "The Captain's Custom Maneuver", concept: "Functions", fnName: "Haul and Turn", minCalls: 2,
      briefing: "Around this island you do the same job at every corner: run the side, haul, turn. Teach the boat that job once, as your own block.",
      goal: "Build a Haul and Turn block, use it at least twice, and reach the mooring with 9 blocks or fewer (your block's blocks count too).",
      steps: ["In the Haul and Turn box, build one side: sail it, haul, and turn.", "In your main program, use Haul and Turn like any other block."],
      hints: ["Look at the three sides. What's the same about each one?", "Defining a block means building it once. Calling it means using it in your program.", "Haul and Turn = Forward, Forward, Forward, Haul trap, Turn right. Main: Haul and Turn three times, then Forward."],
      learned: "A function is a named group of steps. You define it once and call it again and again, so big programs stay short and easy to fix.",
      grids: [["######", "#S..*#", "#.##.#", "#G##.#", "#*..*#", "######"]], dir: "E",
      blocks: [...MOVE, "pick", "call"], usesFn: true, needGems: true, budget: 9, par: 9,
      reference: "def haul_and_turn():\n    move()\n    move()\n    move()\n    haul()\n    turn_right()\n\nhaul_and_turn()\nhaul_and_turn()\nhaul_and_turn()\nmove()",
      wrong: [{ src: "def haul_and_turn():\n    move()\n\nmove()\nmove()\nmove()\nhaul()\nturn_right()\nmove()\nmove()\nmove()\nhaul()\nturn_right()\nmove()\nmove()\nmove()\nhaul()\nturn_right()\nmove()", reason: "calls" }]
    },
    {
      id: "cb-10", title: "Captain's Challenge: Design Your Voyage", concept: "Create", design: true,
      briefing: "You've learned it all, Captain. Part 1: four traps, A to D, are waiting across the bay. Haul them all and bring the boat home. Part 2: design a voyage of your own.",
      goal: "Part 1: haul traps A, B, C, and D, then reach your mooring. Part 2: design your own chart and sail it.",
      steps: ["Plan: press Plot your course. Mark your route and the traps you'll haul.", "Build leg 1 only: the blocks to reach your first trap and haul it. Press Run.", "When a leg works, add the next one. The trap letters tick off as you haul them.", "Improve: can a loop or your own block beat par?", "Part 2: press Design my chart and follow its four steps."],
      hints: ["Pick an order for the traps. Which one is closest to the dock?", "Get one leg working before you write the next. Step through to find where a leg goes wrong.", "Look for stretches that repeat. A Repeat block or your own block can sail them in fewer blocks."],
      // legs: the traps by letter, so the chart, the run, and the feedback can say which leg is done (any order counts).
      legs: [{ at: "4,1", name: "A", where: "by the dock" }, { at: "2,3", name: "B", where: "in the west cove" }, { at: "4,5", name: "C", where: "on the south shore" }, { at: "7,4", name: "D", where: "by the mooring" }],
      learned: "You planned, built, tested, debugged, and improved your own program. That's what programmers do every day.",
      grids: [["#########", "#S..*...#", "#.##.##.#", "#.*.....#", "#.##.##*#", "#...*..G#", "#########"]], dir: "E",
      blocks: [...MOVE, "pick", "repeat", "untilGoal", "ifGem", "ifWall", "setVar", "repeatVar", "changeVar", "call"], usesFn: true, needGems: true,
      fnName: "My Move", par: 27, stretch: { blocks: 26, text: "Finish in 26 blocks or fewer." },
      stretchRef: `turn_right()
for i in range(2):
    move()
turn_left()
move()
haul()
for i in range(2):
    move()
turn_left()
for i in range(2):
    move()
haul()
turn_left()
turn_left()
for i in range(4):
    move()
haul()
turn_left()
for i in range(3):
    move()
turn_left()
move()
haul()
turn_left()
turn_left()
move()`,
      reference: `for i in range(3):
    move()
haul()
turn_right()
move()
move()
turn_right()
move()
move()
haul()
turn_left()
turn_left()
move()
move()
turn_right()
move()
move()
haul()
turn_left()
for i in range(3):
    move()
turn_left()
move()
haul()
turn_left()
turn_left()
move()`,
      wrong: [{ src: "move()", reason: "short" }, { src: `for i in range(3):
    move()
turn_right()
for i in range(4):
    move()
turn_left()
for i in range(3):
    move()`, reason: "traps" }]
    }
  ];

  /* ═════════ Penobscot Bay: the same ideas, combined in new ways ═════════ */
  const PENOBSCOT = [
    {
      id: "pb-1", title: "Rockland Harbor Departure", concept: "Sequence", predict: true,
      briefing: "Welcome to Rockland! This time your boat starts facing north, toward the breakwater. Read your program before you run it.",
      goal: "Steer out of Rockland Harbor to your mooring.",
      hints: ["Which way does the boat face at the start? Look at its bow.", "Turning right from north points the boat east.", "Forward 2, Turn right, Forward 3, Turn left, Forward 1."],
      learned: "Where the boat starts, and which way it faces, changes every step after. Programmers always check the starting state.",
      grids: [["#######", "####G##", "#....##", "#.#####", "#S#####", "#######"]], dir: "N", blocks: MOVE, par: 8,
      reference: `move()
move()
turn_right()
move()
move()
move()
turn_left()
move()`,
      wrong: [{ src: "move()\nmove()\nturn_left()\nmove()", reason: "crash" }]
    },
    {
      id: "pb-2", title: "The Island Supply Run", concept: "Planning", plan: true, carry: true,
      briefing: "A fisherman on the island needs a trap. Haul one from the buoy, carry it around, and set it on the dashed circle by the island. Plan the route first.",
      goal: "Haul the trap, set it on the dashed circle, then reach your mooring.",
      hints: ["You can only set a trap you're carrying. What has to happen first?", "Plot the whole route: buoy, then circle, then mooring.", "Haul at the buoy, go down and west to the circle, set the trap, then turn around and head east."],
      learned: "Some steps depend on others: you can't set a trap you haven't hauled. Planning the order of the jobs is part of the algorithm.",
      grids: [["########", "#S.*####", "###.####", "#o....G#", "########"]], dir: "E", blocks: [...MOVE, "pick", "drop"], needGems: true, needDrops: true,
      reference: `move()
move()
haul()
turn_right()
move()
move()
turn_right()
move()
move()
set_trap()
turn_left()
turn_left()
for_east()`.replace("for_east()", "move()\nmove()\nmove()\nmove()\nmove()"),
      wrong: [{ src: "move()\nmove()\nturn_right()\nmove()\nmove()\nturn_right()\nmove()\nmove()\nset_trap()", reason: "empty" }]
    },
    {
      id: "pb-3", title: "The Lost Trap Coordinates", concept: "Debugging",
      briefing: "Captain Lou wrote down the wrong count, and now his boat tries to haul in empty water. Find the bug before you change anything.",
      goal: "Fix Captain Lou's program so the boat hauls the trap and reaches the mooring.",
      steps: ["Step through and watch the counter on the Repeat block.", "Where is the boat when it tries to haul?"],
      hints: ["The boat tries to haul one square too early.", "The loop's count decides how far the boat sails.", "Change the Repeat from 3 to 4 times."],
      learned: "An off-by-one bug is the most common bug in programming: a loop that runs one time too few or too many.",
      grids: [["########", "#S...*##", "#####.##", "#####G##", "########"]], dir: "E", blocks: [...MOVE, "pick", "repeat"], needGems: true,
      starter: "for i in range(3):\n    move()\nhaul()\nturn_right()\nmove()\nmove()",
      reference: `for i in range(4):
    move()
haul()
turn_right()
move()
move()`,
      wrong: [{ src: "for i in range(3):\n    move()\nhaul()\nturn_right()\nmove()\nmove()", reason: "nogem" }]
    },
    {
      id: "pb-4", title: "Around the Granite Point", concept: "Precision",
      briefing: "Owls Head has a granite point that sticks out into the bay. You'll go all the way around it and come back the other way.",
      goal: "Round the granite point to your mooring.",
      hints: ["You end up sailing the opposite way you started. How many turns does that take?", "Two turns the same way make a U-turn.", "Forward 3, Turn right, Forward 2, Turn right, Forward 3."],
      learned: "Two right turns face the boat backward. Keeping track of direction through every turn is how you write a precise route.",
      grids: [["#######", "#S...##", "####.##", "#G...##", "#######"]], dir: "E", blocks: MOVE, par: 10,
      stretch: { text: "Solve it on your first run." },
      reference: `move()
move()
move()
turn_right()
move()
move()
turn_right()
move()
move()
move()`,
      wrong: [{ src: "move()\nmove()\nmove()\nturn_right()\nmove()\nmove()\nturn_left()\nmove()", reason: "crash" }]
    },
    {
      id: "pb-5", title: "The Long Trap Line", concept: "Loops",
      briefing: "Vinalhaven's trap line runs east, then turns south. Same spacing the whole way, so two loops can haul it all.",
      goal: "Haul all 5 traps and reach your mooring using 11 blocks or fewer.",
      hints: ["The line has two straight parts. Each one has a repeating pattern.", "A program can have more than one loop, with steps between them.", "Repeat 3: Forward, Forward, Haul. Forward. Turn right. Repeat 2: Forward, Forward, Haul. Forward."],
      learned: "Two loops, joined by the steps between them, can handle a route that changes direction. Find each pattern, then connect them.",
      grids: [["##########", "#S.*.*.*.#", "########.#", "########*#", "########.#", "########*#", "########G#", "##########"]], dir: "E",
      blocks: [...MOVE, "pick", "repeat"], needGems: true, budget: 11, par: 11,
      reference: `for i in range(3):
    move()
    move()
    haul()
move()
turn_right()
for i in range(2):
    move()
    move()
    haul()
move()`,
      wrong: [{ src: "for i in range(3):\n    move()\n    move()\n    haul()\nmove()\nturn_right()\nfor i in range(3):\n    move()", reason: "short" }]
    },
    {
      id: "pb-6", title: "Twin Fishing Grounds", concept: "Loops",
      briefing: "Each granite step has twin traps: one east, one south. The pattern has turns in it, but it still repeats.",
      goal: "Haul all 6 traps and reach your mooring using 8 blocks or fewer.",
      hints: ["Trace one step of the stairs with your finger. What does the boat do?", "A loop can repeat turns as well as moves.", "Repeat 3: Forward, Haul, Turn right, Forward, Haul, Turn left. Then Forward."],
      learned: "A loop body can be a whole maneuver, turns and all. Spotting a bigger pattern makes the program even shorter.",
      grids: [["#######", "#S*####", "##**###", "###**##", "####*G#", "#######"]], dir: "E",
      blocks: [...MOVE, "pick", "repeat"], needGems: true, budget: 8, par: 8,
      reference: `for i in range(3):
    move()
    haul()
    turn_right()
    move()
    haul()
    turn_left()
move()`,
      wrong: [{ src: "for i in range(2):\n    move()\n    haul()\n    turn_right()\n    move()\n    haul()\n    turn_left()\nmove()", reason: "short" }]
    },
    {
      id: "pb-7", title: "The Foggy Channel", concept: "If / else", fog: 1,
      briefing: "Fog in the Fox Islands Thoroughfare. This channel bends the other way from the one in Casco Bay. Can your rule handle it?",
      goal: "Find your mooring in the fog using 4 blocks or fewer.",
      hints: ["Watch which way the open water is when the boat meets a ledge.", "If ledge ahead, turn. The question is which way.", "Repeat until at mooring: If ledge ahead → Turn left, else → Forward."],
      learned: "The same if / else idea works for a new channel when you change one decision. Good rules are easy to adapt.",
      grids: [["##########", "#G.......#", "########.#", "########.#", "#S.......#", "##########"]], dir: "E",
      blocks: [...MOVE, "untilGoal", "ifWall"], budget: 4, par: 4,
      reference: `while not at_mooring():
    if ledge_ahead():
        turn_left()
    else:
        move()`,
      wrong: [{ src: "while not at_mooring():\n    if ledge_ahead():\n        turn_right()\n    else:\n        move()", reason: "loop" }]
    },
    {
      id: "pb-8", title: "Shifting Safe Passage", concept: "Loops + if / else",
      worlds: ["Flood tide", "Ebb tide"],
      briefing: "The safe passage past Islesboro shifts with the tide. At every ledge, the boat has to look to the side before it turns.",
      goal: "Write one program that reaches the mooring on the flood tide and the ebb tide, with 6 blocks or fewer.",
      hints: ["At each ledge, one side is open and one side is granite.", "Check one side. If it's granite, turn the other way.", "Repeat until at mooring: If ledge ahead → (If ledge on the left → Turn right, else → Turn left), else → Forward."],
      learned: "Nested decisions, an if inside an if, let a program handle choices that depend on more than one fact.",
      grids: [
        ["########", "###....#", "###.##.#", "#S..##G#", "########"],
        ["########", "#S..####", "###.##G#", "###....#", "########"]
      ], dir: "E", blocks: [...MOVE, "untilGoal", "ifWall", "ifLedgeLeft"], budget: 6, par: 6,
      reference: `while not at_mooring():
    if ledge_ahead():
        if ledge_left():
            turn_right()
        else:
            turn_left()
    else:
        move()`,
      wrong: [{ src: "move()\nmove()\nturn_left()\nmove()\nmove()\nturn_right()\nmove()\nmove()\nmove()\nturn_right()\nmove()\nmove()", reason: "crash" }]
    },
    {
      id: "pb-9", title: "Spiral Search Mission", concept: "Variables", varName: "distance",
      briefing: "A sea kayaker reported a drifting buoy. Search inward: each side of your square is one shorter than the last, 5, 4, 3, 2, 1.",
      goal: "Spiral in over all 3 search marks to your mooring using 6 blocks or fewer.",
      hints: ["Write the side lengths down. How does the number change each time?", "A variable can go down as well as up: Change distance by −1.", "Set distance to 5. Repeat 5: { Repeat distance times: Forward. Turn right. Change distance by −1. }"],
      learned: "A variable can count down as well as up. The program stayed the same size while the route shrank.",
      grids: [["########", "#S....x#", "#......#", "#...G..#", "#......#", "#..x..x#", "########"]], dir: "E",
      blocks: [...MOVE, "repeat", "setVar", "repeatVar", "changeVar"], budget: 6, par: 6,
      reference: `distance = 5
for i in range(5):
    for i in range(distance):
        move()
    turn_right()
    distance -= 1`,
      wrong: [{ src: "distance = 5\nfor i in range(5):\n    for i in range(distance):\n        move()\n    turn_right()", reason: "crash" }]
    },
    {
      id: "pb-10", title: "Repeating Harbor Maneuver", concept: "Functions", fnName: "Go Around", minCalls: 3,
      briefing: "Three ledges block the channel into Stonington. Each one needs the same move: duck south, pass it, and come back up.",
      goal: "Build a Go Around block, use it for all 3 ledges, and reach the mooring with 15 blocks or fewer.",
      steps: ["In the Go Around box, build the path around one ledge.", "Use Go Around each time you reach a ledge."],
      hints: ["Trace the path around the first ledge. Where does the boat end up, and which way is it facing?", "Your block should end with the boat facing east again, ready for the next part.", "Go Around = Turn right, Forward, Turn left, Forward, Forward, Turn left, Forward, Turn right. Main: Forward, then Go Around and Forward for each ledge."],
      learned: "Decomposition: you named one tricky maneuver, built it once, and reused it three times. If it had a bug, you'd fix it in one place.",
      grids: [["#############", "#S.#..#..#.G#", "#..........##", "#############"]], dir: "E",
      blocks: [...MOVE, "call"], usesFn: true, budget: 15, par: 15,
      reference: `def go_around():
    turn_right()
    move()
    turn_left()
    move()
    move()
    turn_left()
    move()
    turn_right()

move()
go_around()
move()
go_around()
move()
go_around()
move()`,
      wrong: [{ src: "def go_around():\n    move()\n\nturn_right()\nmove()\nturn_left()\nfor_x()".replace("for_x()", "move()\nmove()\nmove()\nmove()\nmove()\nmove()\nmove()\nmove()\nmove()\nturn_left()\nmove()\nturn_right()\nmove()"), reason: "calls" }]
    },
    {
      id: "pb-11", title: "The Efficient Lobster Run", concept: "Loops + if / else",
      briefing: "The traps around this cove are spaced every which way. Don't count squares: let the boat check every square and decide.",
      goal: "Haul all 4 traps and reach your mooring using 6 blocks or fewer.",
      hints: ["The boat could check every square it reaches for a buoy.", "Two decisions go in the loop: is there a trap here, and is there a ledge ahead?", "Repeat until at mooring: If at a buoy → Haul trap. If ledge ahead → Turn right, else → Forward."],
      learned: "Combining a loop with two decisions handled a route with no regular pattern. That's how real programs handle messy data.",
      grids: [["########", "#S.*..*#", "######.#", "#G*.*..#", "########"]], dir: "E",
      blocks: [...MOVE, "pick", "untilGoal", "ifGem", "ifWall"], needGems: true, budget: 6, par: 6,
      reference: `while not at_mooring():
    if at_buoy():
        haul()
    if ledge_ahead():
        turn_right()
    else:
        move()`,
      wrong: [{ src: "while not at_mooring():\n    if ledge_ahead():\n        turn_right()\n    else:\n        move()", reason: "traps" }]
    },
    {
      id: "pb-12", title: "Penobscot Captain's Trial", concept: "Functions",
      fnName: "Check and Go", minCalls: 2, worlds: ["Monday's string", "Tuesday's string"],
      briefing: "Your final Penobscot trial: the traps move every day, but the route doesn't. Build one block that checks each square, and use it with loops.",
      goal: "Haul every trap on Monday's and Tuesday's strings with one program, 8 blocks or fewer.",
      hints: ["The route is the same both days. Only the traps change.", "Your block can move one square, then check for a buoy.", "Check and Go = Forward, If at a buoy → Haul trap. Main: Repeat 5: Check and Go. Turn right. Repeat 4: Check and Go."],
      learned: "You combined a function, loops, and a decision. One program handled two different days, because it checked instead of assuming.",
      grids: [
        ["########", "#S.**.*#", "######.#", "######*#", "######.#", "######G#", "########"],
        ["########", "#S*..*.#", "######*#", "######.#", "######*#", "######G#", "########"]
      ], dir: "E", blocks: [...MOVE, "pick", "repeat", "ifGem", "call"], usesFn: true, needGems: true, budget: 8, par: 8,
      reference: `def check_and_go():
    move()
    if at_buoy():
        haul()

for i in range(5):
    check_and_go()
turn_right()
for i in range(4):
    check_and_go()`,
      wrong: [{ src: "def check_and_go():\n    move()\n    haul()\n\nfor i in range(5):\n    check_and_go()", reason: "nogem" }]
    }
  ];

  /* ═════════ Down East: harder combinations and optimization ═════════ */
  const DOWNEAST = [
    {
      id: "de-1", title: "Downeast Departure", concept: "Sequence",
      briefing: "Out of Jonesport on a long run. You could write fifteen blocks, but a Down East captain wastes nothing. Use loops for the long stretches.",
      goal: "Reach your mooring. Par is 8 blocks.",
      hints: ["There are three straight stretches.", "Each straight stretch can be one Repeat with Forward inside.", "Repeat 5: Forward. Turn right. Repeat 3: Forward. Turn left. Repeat 4: Forward."],
      learned: "Efficient code says the same thing with fewer blocks. Loops turned 15 blocks into 8.",
      grids: [["############", "#S.....#####", "######.#####", "######.#####", "######....G#", "############"]], dir: "E",
      blocks: [...MOVE, "repeat"], par: 8,
      reference: `for i in range(5):
    move()
turn_right()
for i in range(3):
    move()
turn_left()
for i in range(4):
    move()`,
      wrong: [{ src: "for i in range(5):\n    move()\nturn_right()\nfor i in range(3):\n    move()\nturn_left()\nfor i in range(3):\n    move()", reason: "short" }]
    },
    {
      id: "de-2", title: "The Narrow Waterway", concept: "Planning",
      briefing: "Two ways to the mooring: the long way around, or the narrow cut through the ledges. Both work. Only one makes par.",
      goal: "Reach your mooring. Par is 7 blocks.",
      hints: ["Plot both routes. Which one is shorter?", "The narrow cut has a little jog. Count each straight part.", "Repeat 3: Forward. Turn left. Forward. Turn right. Repeat 4: Forward."],
      learned: "Optimizing means comparing solutions. Both routes worked, but planning showed the shorter one before you wrote any code.",
      grids: [["##########", "#........#", "#.######.#", "#.##....G#", "#S...#####", "##########"]], dir: "E",
      blocks: [...MOVE, "repeat"], par: 7, plan: true,
      reference: `for i in range(3):
    move()
turn_left()
move()
turn_right()
for i in range(4):
    move()`,
      wrong: [{ src: "for i in range(4):\n    move()", reason: "crash" }]
    },
    {
      id: "de-3", title: "Repair the Fleet's Code", concept: "Debugging",
      briefing: "The whole fleet shares this route, and it has two bugs. Fix one, test, then find the next. Real debugging often goes this way.",
      goal: "Fix both bugs so the boat reaches the mooring.",
      steps: ["Step through until the first problem.", "Fix it, run again, and find the second one."],
      hints: ["Watch the first turn inside the loop.", "After that bug is fixed, count how many times the stairs repeat.", "The turn after Forward ×3 should be Turn right, and the loop should repeat 2 times."],
      learned: "Programs can have more than one bug. Fix the first one, test again, and keep going. Each fix shows you the next problem.",
      grids: [["##########", "#S...#####", "####.#####", "####....##", "#######.##", "#######.G#", "##########"]], dir: "E",
      blocks: [...MOVE, "repeat"],
      starter: "for i in range(1):\n    move()\n    move()\n    move()\n    turn_left()\n    move()\n    move()\n    turn_left()\nmove()",
      reference: `for i in range(2):
    move()
    move()
    move()
    turn_right()
    move()
    move()
    turn_left()
move()`,
      wrong: [{ src: "for i in range(1):\n    move()\n    move()\n    move()\n    turn_right()\n    move()\n    move()\n    turn_left()\nmove()", reason: "short" }]
    },
    {
      id: "de-4", title: "The Long Coastal Run", concept: "Loops",
      briefing: "Granite headlands stick out from the shore all along this coast. The boat has to swing out around each one.",
      goal: "Reach your mooring past all 4 headlands using 10 blocks or fewer.",
      hints: ["Trace the boat around one headland. Where does it end up?", "Each headland is the same maneuver. That's your loop body.", "Repeat 4: Turn left, Forward, Turn right, Forward, Forward, Turn right, Forward, Turn left. Then Forward."],
      learned: "A long route can hide a short pattern. Finding the maneuver that repeats turned a long program into a short one.",
      grids: [["############", "#.........##", "#S#.#.#.#.G#", "############"]], dir: "E",
      blocks: [...MOVE, "repeat"], budget: 10, par: 10,
      reference: `for i in range(4):
    turn_left()
    move()
    turn_right()
    move()
    move()
    turn_right()
    move()
    turn_left()
move()`,
      wrong: [{ src: "for i in range(9):\n    move()", reason: "crash" }]
    },
    {
      id: "de-5", title: "Three Trap Patterns", concept: "Nested loops",
      briefing: "Three sides of this island, three traps on each side. A loop for the traps, inside a loop for the sides.",
      goal: "Haul all 9 traps and reach your mooring using 6 blocks or fewer.",
      hints: ["What's the pattern on one side? What's the pattern for all three sides?", "A loop can go inside another loop.", "Repeat 3: { Repeat 3: Forward, Haul trap. Turn right. } Then Forward."],
      learned: "Nested loops repeat a pattern of patterns. The inner loop hauls one side; the outer loop does it for every side.",
      grids: [["######", "#S***#", "#.##*#", "#G##*#", "#****#", "######"]], dir: "E",
      blocks: [...MOVE, "pick", "repeat"], needGems: true, budget: 6, par: 6,
      reference: `for i in range(3):
    for i in range(3):
        move()
        haul()
    turn_right()
move()`,
      wrong: [{ src: "for i in range(3):\n    move()\n    haul()\nturn_right()", reason: "short" }]
    },
    {
      id: "de-6", title: "The Fog Bank", concept: "If / else", fog: 1,
      briefing: "A fog bank off Petit Manan, and traps hidden in it. The boat has to find the channel and the traps by itself.",
      goal: "Haul every trap and find your mooring in the fog using 6 blocks or fewer.",
      hints: ["You can't see the traps until the boat is next to them. What can the boat check?", "Put two decisions in the loop: one for traps, one for ledges.", "Repeat until at mooring: If at a buoy → Haul trap. If ledge ahead → Turn left, else → Forward."],
      learned: "Sensing and deciding let the boat do two jobs in fog: steer and haul. Self-driving machines combine sensors the same way.",
      grids: [["#######", "#S###G#", "#*###.#", "#.###*#", "#..*..#", "#######"]], dir: "S",
      blocks: [...MOVE, "pick", "untilGoal", "ifGem", "ifWall"], needGems: true, budget: 6, par: 6,
      reference: `while not at_mooring():
    if at_buoy():
        haul()
    if ledge_ahead():
        turn_left()
    else:
        move()`,
      wrong: [{ src: "while not at_mooring():\n    if ledge_ahead():\n        turn_left()\n    else:\n        move()", reason: "traps" }]
    },
    {
      id: "de-7", title: "Safe Passage Challenge", concept: "Loops + if / else",
      worlds: ["Low tide", "Half tide", "High tide"],
      briefing: "Three tides, three different passages through the ledges. Real captains use a rule: keep the granite on your right. Teach it to your boat.",
      goal: "Write one program that reaches the mooring at all three tides, with 7 blocks or fewer.",
      steps: ["The rule: if the right side is open, turn right and go.", "If the right is granite, go forward, or turn left when you can't."],
      hints: ["Run your program on each tide. Which one breaks it?", "Check the right side first. Open water on the right means turn right.", "Repeat until at mooring: If ledge on the right → (If ledge ahead → Turn left, else → Forward), else → Turn right, Forward."],
      learned: "You programmed a real algorithm: the right-hand rule, used to get through mazes. One rule worked on three passages it had never seen.",
      grids: [
        ["#########", "#S..#####", "###.#####", "###....##", "######.##", "######G##", "#########"],
        ["#########", "######G##", "######.##", "###....##", "###.#####", "#S..#####", "#########"],
        ["#########", "#S.#...G#", "##.#.####", "##...####", "#########"]
      ], dir: "E", blocks: [...MOVE, "untilGoal", "ifWall", "ifLedgeRight"], budget: 7, par: 7,
      reference: `while not at_mooring():
    if ledge_right():
        if ledge_ahead():
            turn_left()
        else:
            move()
    else:
        turn_right()
        move()`,
      wrong: [{ src: "while not at_mooring():\n    if ledge_ahead():\n        turn_right()\n    else:\n        move()", reason: "loop" }]
    },
    {
      id: "de-8", title: "Search the Outer Harbor", concept: "Variables",
      briefing: "Out past Eastport, the traps get farther apart: 1 square, then 2, then 3, then 4. One loop and a variable can haul them all.",
      goal: "Haul all 4 traps and reach your mooring using 7 blocks or fewer.",
      hints: ["How far is it to each trap? Write the gaps down.", "A variable can hold the gap, and grow by 1 after each trap.", "Set steps to 1. Repeat 4: { Repeat steps times: Forward. Haul trap. Change steps by 1. } Forward."],
      learned: "The variable changed how far the boat sailed each time through the loop. One loop, four different distances.",
      grids: [["##############", "#S*.*..*...*G#", "##############"]], dir: "E",
      blocks: [...MOVE, "pick", "repeat", "setVar", "repeatVar", "changeVar"], needGems: true, budget: 7, par: 7,
      reference: `steps = 1
for i in range(4):
    for i in range(steps):
        move()
    haul()
    steps += 1
move()`,
      wrong: [{ src: "steps = 1\nfor i in range(4):\n    for i in range(steps):\n        move()\n    haul()\nmove()", reason: "nogem" }]
    },
    {
      id: "de-9", title: "Expanding Search Pattern", concept: "Variables", varName: "distance",
      briefing: "The Coast Guard search pattern: 1, 1, 2, 2, 3, 3, 4, 4. The side only grows after every second turn. Sail over all 3 search marks.",
      goal: "Search outward over all 3 marks to your mooring using 7 blocks or fewer.",
      hints: ["Each length happens twice. What repeats two times?", "Put a Repeat 2 inside the main loop, and change distance after it.", "Set distance to 1. Repeat 4: { Repeat 2: { Repeat distance times: Forward. Turn right. } Change distance by 1. }"],
      learned: "A variable inside nested loops controlled the whole search. This is close to the real expanding-square search rescuers use.",
      grids: [["#######", "#G....#", "#.x...#", "#..S..#", "#.....#", "#x...x#", "#######"]], dir: "E",
      blocks: [...MOVE, "repeat", "setVar", "repeatVar", "changeVar"], budget: 7, par: 7,
      reference: `distance = 1
for i in range(4):
    for i in range(2):
        for i in range(distance):
            move()
        turn_right()
    distance += 1`,
      wrong: [{ src: "distance = 1\nfor i in range(8):\n    for i in range(distance):\n        move()\n    turn_right()\n    distance += 1", reason: "crash" }]
    },
    {
      id: "de-10", title: "Build a Navigation Toolkit", concept: "Functions", fnName: "Check Inlet", minCalls: 3,
      briefing: "Three narrow inlets, a trap at the end of each. Build one tool that checks an inlet and comes back out, with a loop inside it.",
      goal: "Build a Check Inlet block, haul all 3 traps, and reach your mooring with 13 blocks or fewer.",
      steps: ["Check Inlet: turn into the inlet, sail to the trap, haul it, turn around, sail back, and face east.", "Your block can use a Repeat inside it."],
      hints: ["What does the boat do in every inlet? It ends where it started, facing east.", "Inside your block, a Repeat can sail in and back out.", "Check Inlet = Turn left, Repeat 2: Forward, Haul, Turn left, Turn left, Repeat 2: Forward, Turn left. Main: Repeat 3: Forward, Check Inlet, Forward."],
      learned: "Your own block can contain loops, and loops can call your block. Combining tools like this is how big programs are built.",
      grids: [["#########", "##*#*#*##", "##.#.#.##", "#S.....G#", "#########"]], dir: "E",
      blocks: [...MOVE, "pick", "repeat", "call"], usesFn: true, needGems: true, budget: 13, par: 13,
      reference: `def check_inlet():
    turn_left()
    for i in range(2):
        move()
    haul()
    turn_left()
    turn_left()
    for i in range(2):
        move()
    turn_left()

for i in range(3):
    move()
    check_inlet()
    move()`,
      wrong: [{ src: "def check_inlet():\n    turn_left()\n    move()\n    move()\n    haul()\n\nmove()\ncheck_inlet()", reason: "short" }]
    },
    {
      id: "de-11", title: "The Master Lobster Route", concept: "Loops + if / else", carry: true,
      briefing: "Haul the old traps on the way out, and set them again on the dashed circles on the way back. A master captain does it in a handful of blocks.",
      goal: "Haul all 3 traps, set all 3 circles, and reach your mooring. Par is 8 blocks.",
      hints: ["You pass every trap before every circle. So the boat always has a trap to set.", "Three questions in one loop: a buoy here? a circle here? a ledge ahead?", "Repeat until at mooring: If at a buoy → Haul. If at a dashed spot → Set trap. If ledge ahead → Turn right, else → Forward."],
      learned: "Three decisions in one loop did a whole day's work. Short, general programs are what master programmers aim for.",
      grids: [["#########", "#S*.*.*.#", "#######o#", "#G.o..o.#", "#########"]], dir: "E",
      blocks: [...MOVE, "pick", "drop", "untilGoal", "ifGem", "ifSpot", "ifWall"], needGems: true, needDrops: true, par: 8,
      stretch: { text: "Solve it on your first run." },
      reference: `while not at_mooring():
    if at_buoy():
        haul()
    if at_spot():
        set_trap()
    if ledge_ahead():
        turn_right()
    else:
        move()`,
      wrong: [{ src: "while not at_mooring():\n    if at_buoy():\n        haul()\n    if ledge_ahead():\n        turn_right()\n    else:\n        move()", reason: "spots" }]
    },
    {
      id: "de-12", title: "Down East Grand Challenge", concept: "Functions", fog: 1,
      fnName: "Search Side", varName: "distance", minCalls: 2, worlds: ["First light", "Afternoon"],
      briefing: "The grand challenge: a spiral search in fog, with traps in different places morning and afternoon. You'll need a function, a loop, a variable, and a decision.",
      goal: "Spiral out (1, 2, 3, 4, 5), haul every trap at both times of day, and reach the mooring with 9 blocks or fewer.",
      hints: ["The spiral turns left, and each side is one longer. The traps change; the spiral doesn't.", "Your block can sail one side and check every square for a buoy.", "Search Side = Repeat distance times: Forward, If at a buoy → Haul. Main: Set distance to 1. Repeat 5: Search Side, Turn left, Change distance by 1."],
      learned: "You used every idea at once: a function, loops, a variable, and decisions, in fog, on two different days. That's real computer science.",
      grids: [
        ["#######", "#....G#", "#.....#", "#**...#", "#..S..#", "#.....#", "#*..*.#", "#######"],
        ["#######", "#....G#", "#....*#", "#..*..#", "#..S..#", "#*....#", "#..*..#", "#######"]
      ], dir: "N", blocks: [...MOVE, "pick", "repeat", "ifGem", "setVar", "repeatVar", "changeVar", "call"], usesFn: true, needGems: true, budget: 9, par: 9,
      reference: `def search_side():
    for i in range(distance):
        move()
        if at_buoy():
            haul()

distance = 1
for i in range(5):
    search_side()
    turn_left()
    distance += 1`,
      wrong: [{ src: "def search_side():\n    for i in range(distance):\n        move()\n\ndistance = 1\nfor i in range(5):\n    search_side()\n    turn_left()\n    distance += 1", reason: "traps" }]
    }
  ];

  /* ═════════ Lessons: learn first, then try ═════════
   * A level with a lesson opens on it the first time (lab-captain.js), before the student writes any code.
   * A lesson is { title, cards: [card] }. A card has a heading (h) and short paragraphs (say), plus at most one of:
   *   show:    lines of blocks to look at, like ["Repeat 4 times", "  Forward"] (two spaces = inside)
   *   example: { grid, dir, src (Python), fnName?, varName?, tip }: a tiny map the student steps through
   *   check:   { q, options: [[answer, right?, why]] }: one question; the student needs the right answer to go on
   * tests/tools/test_captain_levels.js sails every example to the mooring and checks each question has one right answer.
   */
  const LESSONS = {
    loops: {
      title: "Meet the Repeat block",
      cards: [
        { h: "Say it once, do it many times", say: ["When you brush your teeth, you don't think \"brush, brush, brush\" 20 times.", "You think \"brush 20 times.\" That's a loop: one pattern, repeated."] },
        { h: "A loop holds a pattern", say: ["A Repeat block holds blocks inside it. It runs them, then runs them again, as many times as its number says.", "Everything inside the Repeat is the pattern. Blocks after it run once, when the loop is done."],
          show: ["Repeat 2 times", "  Forward", "  Forward", "  Haul trap", "Forward"] },
        { h: "Watch a loop run", say: ["Press Step. Watch the lap counter: lap 1 of 2, then lap 2 of 2. Then the last Forward runs once."],
          example: { grid: ["########", "#S.*.*G#", "########"], dir: "E", src: "for i in range(2):\n    move()\n    move()\n    haul()\nmove()", tip: "Each lap does the whole pattern: Forward, Forward, Haul trap." } },
        { h: "Check your thinking", check: { q: "A Repeat 3 times holds Forward and Haul trap. How many times does Forward run?", options: [
          ["1 time", false, "Not quite. The loop runs everything inside it once per lap. How many laps are there?"],
          ["3 times", true, "Yes! 3 laps, and each lap runs Forward once."],
          ["6 times", false, "Close, but that counts both blocks. Forward is only one of the two blocks inside."]] } }
      ]
    },
    ifElse: {
      title: "Meet if / else",
      cards: [
        { h: "You make choices all day", say: ["If it's raining, you take a coat. Else, you wear a T-shirt.", "You check one question, and the answer picks what you do. That's an if / else."] },
        { h: "The boat can check too", say: ["In fog, you can't see the route. But the boat can sense a ledge right in front of it.", "Every time the if / else runs, the boat asks: is there a ledge ahead? Yes runs the if part. No runs the else part. Only one part runs."],
          show: ["If ledge ahead", "  Turn right", "else", "  Forward"] },
        { h: "Ask again and again", say: ["One question isn't enough for a whole trip. So we put the if / else inside Repeat until at mooring.", "The boat asks, acts, and asks again, until it reaches the mooring."],
          show: ["Repeat until at mooring", "  If ledge ahead", "    Turn right", "  else", "    Forward"] },
        { h: "Watch the boat decide", say: ["Press Step. Each time the boat checks, you'll see the answer: yes or no. Then watch which part runs."],
          example: { grid: ["#####", "#S..#", "###.#", "###G#", "#####"], dir: "E", src: "while not at_mooring():\n    if ledge_ahead():\n        turn_right()\n    else:\n        move()", tip: "No ledge: Forward. Ledge: Turn right. The same rule, every time." } },
        { h: "Check your thinking", check: { q: "The boat faces open water. Which part of the if / else runs?", options: [
          ["The if part: Turn right", false, "The if part runs only when the answer is yes. Is there a ledge ahead?"],
          ["The else part: Forward", true, "Yes! No ledge ahead, so the answer is no, and the else part runs."],
          ["Both parts", false, "An if / else always picks just one part. Which one fits open water?"]] } }
      ]
    },
    ifInIf: {
      title: "A question inside a question",
      cards: [
        { h: "Two maps, one program", say: ["The tide moves the channel. At high tide it bends one way, and at low tide the other.", "A route you memorize works on one map only. A program that checks and decides works on both."] },
        { h: "Ask a second question", say: ["When there's a ledge ahead, the boat has to turn. But which way?", "It can ask a second question: is there a ledge on my right? If yes, turn left. If no, turn right. That's an if inside an if."],
          show: ["If ledge ahead", "  If ledge on the right", "    Turn left", "  else", "    Turn right", "else", "  Forward"] },
        { h: "Watch it choose a side", say: ["Press Step. At the ledge, watch both questions get answered."],
          example: { grid: ["#####", "###G#", "#S..#", "#####"], dir: "E", src: "while not at_mooring():\n    if ledge_ahead():\n        if ledge_right():\n            turn_left()\n        else:\n            turn_right()\n    else:\n        move()", tip: "Ledge ahead: yes. Ledge on the right: yes. So the boat turns left." } },
        { h: "Check your thinking", check: { q: "There's a ledge ahead, and open water on the boat's right. What does the boat do?", options: [
          ["Turn left", false, "That's what it does when the right side is blocked too. Here, the right is open."],
          ["Turn right", true, "Yes! The second answer is no, so the else part runs: Turn right."],
          ["Forward", false, "Forward runs only when there's no ledge ahead. Here there is one."]] } }
      ]
    },
    variables: {
      title: "Meet variables",
      cards: [
        { h: "A box with a name", say: ["A variable is like a box with a label on it. The box holds a number.", "Your score in a game is a variable. It changes while you play."] },
        { h: "Three blocks for the box", say: ["Set distance to 1 puts 1 in the box.", "Change distance by 1 adds 1 to whatever is in the box.", "Repeat distance times looks in the box right now, and repeats that many times."],
          show: ["Set distance to 1", "Repeat 3 times", "  Repeat distance times", "    Forward", "  Turn right", "  Change distance by 1"] },
        { h: "Watch the box grow", say: ["Press Step. Watch distance on the chart: 1, then 2, then 3. Each side gets one square longer."],
          example: { grid: ["######", "#..S.#", "#....#", "#G...#", "######"], dir: "E", varName: "distance", src: "distance = 1\nfor i in range(3):\n    for i in range(distance):\n        move()\n    turn_right()\n    distance += 1", tip: "The same loop sails 1, then 2, then 3 squares, because distance grows." } },
        { h: "Check your thinking", check: { q: "distance is 2. Then Change distance by 1 runs. What is distance now?", options: [
          ["1", false, "Change by 1 adds 1. It doesn't start over."],
          ["2", false, "The box changed. What's 2 plus 1?"],
          ["3", true, "Yes! 2 plus 1 is 3. The next loop sails 3 squares."]] } }
      ]
    },
    functions: {
      title: "Meet your own block",
      cards: [
        { h: "A name for many steps", say: ["\"Make toast\" is short for a lot of steps: get bread, put it in, push the lever, wait.", "Your own block works the same way. You give a group of steps a name."] },
        { h: "Define it, then call it", say: ["Define: build the steps once, in your block's own box.", "Call: put your block in the main program. Every time it runs, all of its steps run."],
          show: ["Two Forward =", "  Forward", "  Forward", "Main program:", "  Two Forward", "  Turn right", "  Two Forward"] },
        { h: "Watch a call run", say: ["Press Step. When the program reaches Two Forward, watch it run the steps inside."],
          example: { grid: ["#####", "#S..#", "###.#", "###G#", "#####"], dir: "E", fnName: "Two Forward", src: "def two_forward():\n    move()\n    move()\n\ntwo_forward()\nturn_right()\ntwo_forward()", tip: "One definition, used twice. Change it once, and both calls change." } },
        { h: "Check your thinking", check: { q: "Your block has 3 blocks inside. Your program calls it 2 times. How many blocks run from inside it?", options: [
          ["3", false, "That's one call. Each call runs all 3 again."],
          ["5", false, "Not quite. Each call runs all 3 blocks inside."],
          ["6", true, "Yes! 2 calls, and each one runs 3 blocks."]] } }
      ]
    },
    nested: {
      title: "A loop inside a loop",
      cards: [
        { h: "A pattern of patterns", say: ["Think of rows of seats. You check every seat in a row, then go to the next row.", "One loop does a row. Another loop around it does every row."],
          show: ["Repeat 3 times", "  Repeat 4 times", "    Forward", "  Turn right"] },
        { h: "Check your thinking", check: { q: "Repeat 3 times holds Repeat 2 times, which holds Forward. How many times does Forward run?", options: [
          ["2", false, "That's one lap of the outer loop. It runs 3 laps."],
          ["5", false, "Loops multiply, they don't add. Try 3 groups of 2."],
          ["6", true, "Yes! 3 laps of the outer loop, and 2 Forwards in each."]] } }
      ]
    },
    voyage: {
      title: "The captain's routine",
      cards: [
        { h: "Big voyages are made of legs", say: ["This chart is the biggest yet: three traps, and lots of turns.", "Real programmers don't write a big program all at once. They split it into parts and get each part working."] },
        { h: "Plan, build, test, improve", say: ["Plan: use Plot your course to mark your route and the traps you'll haul.", "Build: write blocks for leg 1 only.", "Test: press Run. When leg 1 works, add leg 2. Then leg 3.", "Improve: look for patterns. A loop or your own block can make it shorter."] },
        { h: "Check your thinking", check: { q: "Your boat hauls trap 1, then bumps a ledge on the way to trap 2. What should you do first?", options: [
          ["Clear everything and start over", false, "Leg 1 works! Keep it. The bug is somewhere after trap 1."],
          ["Step through and find the first block after trap 1 that goes wrong", true, "Yes! Keep what works, and fix the first thing that doesn't."],
          ["Add more blocks to the end", false, "The boat never gets to the end. Fix the bug where it happens first."]] } }
      ]
    }
  };
  /* Short recaps when an idea comes back later on the coast: the idea in one card, then the check. */
  const recap = (L, h, say) => ({ title: `Remember: ${L.title.replace(/^Meet /, "")}`, cards: [{ h, say }, L.cards[L.cards.length - 1]] });
  const lessonFor = {
    "cb-5": LESSONS.loops, "cb-6": LESSONS.ifElse, "cb-7": LESSONS.ifInIf, "cb-8": LESSONS.variables, "cb-9": LESSONS.functions, "cb-10": LESSONS.voyage,
    "de-5": LESSONS.nested,
    "pb-7": recap(LESSONS.ifElse, "The boat asks, then acts", ["An if / else asks one question, like \"Is there a ledge ahead?\"", "Yes runs the if part. No runs the else part. Inside Repeat until at mooring, the boat asks again after every move."]),
    "de-6": recap(LESSONS.ifElse, "The boat asks, then acts", ["In fog, the boat can't see far, but it can sense what's right next to it.", "An if / else turns what it senses into a choice: one part for yes, one for no."]),
    "pb-9": recap(LESSONS.variables, "A box that holds a number", ["A variable holds a number that can change. Set puts a number in. Change adds to it.", "Repeat distance times uses the number in the box right now."]),
    "de-8": recap(LESSONS.variables, "A box that holds a number", ["A variable remembers a number while the program runs.", "Change it inside a loop, and each lap can do a little more."]),
    "pb-10": recap(LESSONS.functions, "Define once, call many times", ["Your own block is a name for a group of steps.", "Build it once in its box. Each time you call it, all of its steps run."]),
    "de-10": recap(LESSONS.functions, "Define once, call many times", ["A toolkit is a set of your own blocks.", "Name each job once, then use the names to write a short main program."])
  };
  [...CASCO, ...PENOBSCOT, ...DOWNEAST].forEach((L) => { if (lessonFor[L.id]) L.lesson = lessonFor[L.id]; });

  SE.captainLevels = { CASCO, PENOBSCOT, DOWNEAST, LESSONS };
})();
