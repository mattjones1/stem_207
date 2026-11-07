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
      briefing: "You've learned it all. Sail this chart, then make it yours: change the ledges and traps, and design a voyage nobody has sailed before.",
      goal: "Haul every trap and reach your mooring. Then try to beat par, or design your own chart.",
      steps: ["Plan on paper or with Plot your course.", "Build, run, and debug.", "Beat par with loops and your own block.", "Press Design my chart to change the map."],
      hints: ["Break the voyage into parts: which trap first?", "Look for stretches that repeat. A loop or your own block can sail them.", "Test one part at a time: get to the first trap, then add the next part."],
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

  SE.captainLevels = { CASCO, PENOBSCOT, DOWNEAST };
})();
