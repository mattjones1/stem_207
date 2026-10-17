/*
 * Harbor Code Lab — Coding & Computer Science
 * Students build block programs that steer a lobster boat around a Maine harbor:
 * haul traps, dodge granite ledges, and get home to the wharf.
 * Three voyages of 12 levels each (Casco Bay, Penobscot Bay, Down East). Each voyage climbs
 * the same pathway at the same skill level with new harbors, so students get more practice
 * with every idea before they're asked to stretch.
 * (The lab id stays "rover" so saved progress carries over.)
 * Levels climb the coding pathway: sequences → debugging → loops →
 * conditionals → variables → functions → creating independently.
 */
(function () {
  "use strict";
  const SE = window.SE;
  const { icon, esc } = SE;

  /* ───────── Block catalog ───────── */
  const BLOCKS = {
    move: { label: "Forward", kind: "motion", glyph: "arrowRight" },
    left: { label: "Turn left", kind: "motion", glyph: "refresh", flip: true },
    right: { label: "Turn right", kind: "motion", glyph: "refresh" },
    pick: { label: "Haul trap", kind: "action", glyph: "buoy" },
    drop: { label: "Set trap", kind: "action", glyph: "plus" },
    repeat: { label: "Repeat", kind: "control", glyph: "refresh", container: true, count: true },
    untilGoal: { label: "Repeat until at wharf", kind: "control", glyph: "flag", container: true },
    ifGem: { label: "If at a buoy", kind: "control", glyph: "question", container: true },
    ifSpot: { label: "If at a dashed spot", kind: "control", glyph: "question", container: true },
    ifWall: { label: "If ledge ahead", kind: "control", glyph: "question", container: true, hasElse: true },
    setVar: { label: "Set steps to", kind: "variable", glyph: "box", count: true },
    changeVar: { label: "Change steps by", kind: "variable", glyph: "plus", count: true },
    repeatVar: { label: "Repeat steps times", kind: "control", glyph: "refresh", container: true },
    call: { label: "Zig", kind: "function", glyph: "star" }
  };
  let nextId = 1;
  const make = (type, extra = {}) => {
    const b = { id: `b${nextId++}`, type, ...extra };
    if (BLOCKS[type].container) b.body = b.body || [];
    if (BLOCKS[type].hasElse) b.else = b.else || [];
    if (BLOCKS[type].count && b.n == null) b.n = type === "changeVar" ? 1 : type === "setVar" ? 1 : 2;
    return b;
  };
  const clone = (list) => list.map((b) => {
    const c = { ...b, id: `b${nextId++}` };
    if (b.body) c.body = clone(b.body);
    if (b.else) c.else = clone(b.else);
    return c;
  });
  const countBlocks = (list) => list.reduce((n, b) => n + 1 + (b.body ? countBlocks(b.body) : 0) + (b.else ? countBlocks(b.else) : 0), 0);

  /* Starter programs written in a tiny shorthand: F L R P D, [n ...] for repeat. */
  function parse(src) {
    const tokens = src.match(/\[\d+|\]|F|L|R|P|D/g) || [];
    let i = 0;
    const read = () => {
      const out = [];
      while (i < tokens.length) {
        const t = tokens[i++];
        if (t === "]") return out;
        if (t[0] === "[") out.push(make("repeat", { n: Number(t.slice(1)), body: read() }));
        else out.push(make({ F: "move", L: "left", R: "right", P: "pick", D: "drop" }[t]));
      }
      return out;
    };
    return read();
  }

  /* ───────── Levels ───────── */
  const BASIC = ["move", "left", "right"];
  const LEVELS = [
    {
      title: "First steps", concept: "Sequence", stage: 1,
      goal: "Steer the boat out of the cove to the wharf.",
      steps: ["Tap Forward to add it to your program.", "Add as many as you need.", "Press Run and watch."],
      hint: "Count the squares between the boat and the wharf (the flag). That's how many Forward blocks you need.",
      learned: "A program is a sequence: a list of instructions the computer follows in order, one at a time.",
      grid: ["######", "#S..G#", "######"], dir: "E", blocks: BASIC
    },
    {
      title: "Turn the corner", concept: "Sequence", stage: 1,
      goal: "Reach the wharf. The channel turns a corner.",
      hint: "Turns don't move the boat. They only change which way it faces. Imagine you are at the wheel: which way is right?",
      learned: "Order matters. The same blocks in a different order give a different result. Turning and moving are separate steps.",
      grid: ["######", "#S..##", "###.##", "###G##", "######"], dir: "E", blocks: BASIC
    },
    {
      title: "Bug hunt", concept: "Debugging", stage: 1, debug: true,
      goal: "Another captain wrote this program, and it runs the boat onto a ledge. Find the bug and fix it so the boat reaches the wharf.",
      steps: ["Press Step to run one block at a time.", "Watch for the first block that goes wrong.", "Delete it or change it, then run again."],
      hint: "Step through slowly. The boat bumps a ledge right after the bug. Look at the turn just before the crash.",
      learned: "Debugging means finding the first step that goes wrong. Stepping through a program one block at a time is how programmers find bugs.",
      grid: ["#######", "#S.####", "##..###", "###..##", "####G##", "#######"], dir: "E", blocks: BASIC,
      starter: "F R F L F L F L F R F"
    },
    {
      title: "Loop it", concept: "Loops", stage: 3,
      goal: "Run straight down the harbor to the wharf using only 2 blocks.",
      hint: "Put a Repeat block in your program, then add Forward inside it. Use + and − to change how many times it repeats.",
      learned: "A loop repeats instructions. Instead of writing Forward 7 times, you can say Repeat 7: Forward. Shorter programs are easier to read and fix.",
      grid: ["##########", "#S......G#", "##########"], dir: "E", blocks: [...BASIC, "repeat"], maxBlocks: 2
    },
    {
      title: "Zigzag channel", concept: "Loops", stage: 3,
      goal: "Zigzag up the channel between the ledges to the wharf using 5 blocks or fewer.",
      hint: "Find the pattern for one zig: Forward, Turn left, Forward, Turn right. How many zigs are there?",
      learned: "Spotting a pattern is the key to using loops. Figure out the part that repeats, then loop it.",
      grid: ["######", "####G#", "###..#", "##..##", "#S.###", "######"], dir: "E", blocks: [...BASIC, "repeat"], maxBlocks: 5
    },
    {
      title: "Loop bug", concept: "Debugging loops", stage: 3, debug: true,
      goal: "The boat should circle around the little island to the wharf. Fix the bug.",
      hint: "One trip through the loop should be one side of the square. Which way does the path turn at each corner?",
      learned: "A bug inside a loop happens every time the loop runs. Fix it once, and every repeat is fixed.",
      grid: ["#####", "#S..#", "#.#.#", "#G..#", "#####"], dir: "E", blocks: [...BASIC, "repeat"],
      starter: "[3 F F L]"
    },
    {
      title: "Haul the traps", concept: "Actions", stage: 2,
      goal: "Haul both traps (the buoys), then tie up at the wharf.",
      hint: "Haul trap only works when the boat is right at a buoy. Move onto the buoy first.",
      learned: "Programs can do more than move. Actions like hauling a trap change the world, and they only work at the right moment.",
      grid: ["########", "#S*.*.G#", "########"], dir: "E", blocks: [...BASIC, "pick", "repeat"], needGems: true
    },
    {
      title: "Maybe a trap", concept: "Conditionals", stage: 4,
      goal: "Haul every trap on the string and reach the wharf using 4 blocks or fewer.",
      hint: "Repeat: move forward, then IF the boat is at a buoy, haul the trap. The boat checks each square for you.",
      learned: "A conditional (if) lets a program make a choice. The boat checks a condition, and only acts when it's true.",
      grid: ["###########", "#S*.**.*.G#", "###########"], dir: "E", blocks: [...BASIC, "pick", "repeat", "ifGem"], maxBlocks: 4, needGems: true
    },
    {
      title: "Fog sensor", concept: "Conditionals", stage: 4,
      goal: "Thick fog rolled in, so you can only see one square ahead. Reach the mooring in the middle of the ledges using 4 blocks or fewer.",
      steps: ["Use Repeat until at wharf.", "Inside it, check: If ledge ahead → turn right. Otherwise (else) → forward."],
      hint: "Put If ledge ahead inside the Repeat until block. Put Turn right in the top part and Forward in the else part.",
      learned: "If–else picks between two actions. With a sensor and one rule, the boat found its way through ledges it had never seen. Real boats use radar and sonar the same way, and so do many robots.",
      grid: ["#######", "#S....#", "#####.#", "#..G#.#", "#.###.#", "#.....#", "#######"], dir: "E", blocks: ["move", "left", "right", "untilGoal", "ifWall"], maxBlocks: 4
    },
    {
      title: "Growing spiral", concept: "Variables", stage: 5,
      goal: "Spiral out of the harbor to the wharf using 6 blocks or fewer.",
      steps: ["Each side of the spiral is one step longer than the last: 1, 2, 3, 4.", "A variable called steps can remember a number and change it."],
      hint: "Set steps to 1. Repeat 4: { Repeat steps times: Forward. Turn right. Change steps by 1. }",
      learned: "A variable stores a value that can change while the program runs. Here, steps grew by 1 each time, so the same loop drew longer and longer sides.",
      grid: ["#######", "#G#####", "#.#####", "#.#S.##", "#.##.##", "#....##", "#######"], dir: "E",
      blocks: ["move", "left", "right", "repeat", "setVar", "repeatVar", "changeVar"], maxBlocks: 6, usesVar: true
    },
    {
      title: "Make your own block", concept: "Functions", stage: 6,
      goal: "Build a Zig block, then use it to reach the wharf with 6 blocks or fewer in your main program.",
      steps: ["In the Zig box, build one zig of the channel.", "In your main program, use Zig like any other block."],
      hint: "Zig = Forward, Turn left, Forward, Turn right. Main program: Zig, Zig, Forward, Forward, Zig, Zig.",
      learned: "A function is a named group of instructions you can reuse. Breaking a problem into named parts (decomposition) makes big programs manageable.",
      grid: ["#########", "#########", "#######G#", "######..#", "###....##", "##..#####", "#S.######", "#########"], dir: "E",
      blocks: ["move", "left", "right", "repeat", "call"], maxBlocks: 6, usesFn: true
    },
    {
      title: "Free build", concept: "Create", stage: 7,
      goal: "Haul all 4 traps and finish at the wharf. Use any blocks you like.",
      hint: "Plan your route on paper first. Look for patterns you can loop. Test small parts as you go.",
      learned: "You planned, built, tested, and debugged a program on your own, like a captain planning a day on the water. That's what programmers do every day.",
      grid: ["#########", "#S..#..*#", "#.*.#.#.#", "#...*...#", "#.#.#.#.#", "#*..#..G#", "#########"], dir: "E",
      blocks: ["move", "left", "right", "pick", "repeat", "untilGoal", "ifGem", "ifWall"], needGems: true, par: 24
    },
    /* ═════════ Voyage 2: Penobscot Bay ═════════ */
    {
      title: "Stonington morning", concept: "Sequence", stage: 1,
      goal: "It's 5 a.m. in Stonington, the busiest lobster port in Maine. Steer out past the ledges to the wharf on the far side of the harbor.",
      hint: "Plan it one stretch at a time: how many squares east, then which way do you turn? Say the route out loud before you build it.",
      learned: "Long programs are just short sequences stuck together. Breaking a route into stretches makes it easier to build and check.",
      grid: ["#######", "#S..###", "###.###", "###...#", "#####G#", "#######"], dir: "E", blocks: BASIC
    },
    {
      title: "Around the lobster car", concept: "Sequence", stage: 1,
      goal: "A lobster car (a floating crate that keeps lobsters fresh) is tied up in the middle of the harbor. Go all the way around it to reach the wharf.",
      hint: "You'll turn the same way twice. After the second turn the boat faces back the way it came.",
      learned: "Two right turns make a U-turn. Thinking about which way the boat faces after each turn is a big part of writing a correct sequence.",
      grid: ["######", "#S...#", "####.#", "#G...#", "######"], dir: "E", blocks: BASIC
    },
    {
      title: "Wrong turn at Deer Isle", concept: "Debugging", stage: 1, debug: true,
      goal: "A visiting captain wrote this route under the Deer Isle bridge, but the boat bumps a ledge. Find the bug and fix it.",
      steps: ["Press Step to run one block at a time.", "Stop at the first block where the boat goes the wrong way.", "Fix just that block, then run it again."],
      hint: "Everything is right until the boat comes out of the narrow part. Which way should it turn there: toward the open water or away from it?",
      learned: "One wrong block can wreck a whole program. Programmers fix the first mistake, then test again, because one fix often solves everything after it.",
      grid: ["########", "#S.#####", "##.#####", "##....##", "#####.##", "#####G##", "########"], dir: "E", blocks: BASIC,
      starter: "F R F F R F F F R F F"
    },
    {
      title: "Down the thoroughfare", concept: "Loops", stage: 3,
      goal: "Run the Fox Islands Thoroughfare to North Haven's wharf using 5 blocks or fewer.",
      hint: "There are two long, straight stretches. Each one can be a Repeat block with Forward inside. What goes between them?",
      learned: "A program can have more than one loop. Each loop handles one repeating part, and the steps between them connect the parts.",
      grid: ["#######", "#S....#", "#####.#", "#####.#", "#####.#", "#####G#", "#######"], dir: "E", blocks: [...BASIC, "repeat"], maxBlocks: 5
    },
    {
      title: "Down the ledges", concept: "Loops", stage: 3,
      goal: "Step down between the ledges off Vinalhaven to the wharf using 5 blocks or fewer.",
      hint: "One step down is: Forward, Turn right, Forward, Turn left. Count the steps, then loop that pattern.",
      learned: "The same pattern can go up or down, left or right. Once you find the part that repeats, a loop does the rest.",
      grid: ["#######", "#S.####", "##..###", "###..##", "####..#", "#####G#", "#######"], dir: "E", blocks: [...BASIC, "repeat"], maxBlocks: 5
    },
    {
      title: "Around Hurricane Island", concept: "Debugging loops", stage: 3, debug: true,
      goal: "This loop should take the boat around Hurricane Island to the wharf, but it bumps a ledge right away. Fix the bug.",
      hint: "Run it once. After the first side of the island, which way does the boat turn? Which way should it turn?",
      learned: "When a loop goes wrong, check one trip through it. If one trip is right, every repeat will be right too.",
      grid: ["######", "#S...#", "#.##.#", "#.##.#", "#G...#", "######"], dir: "E", blocks: [...BASIC, "repeat"],
      starter: "[3 F F F L]"
    },
    {
      title: "Set a string of traps", concept: "Actions", stage: 2,
      goal: "Lobstermen set traps in a line called a string. Set a trap on both dashed circles, then tie up at the wharf.",
      steps: ["Drive onto a dashed circle.", "Use Set trap to drop a trap there.", "Keep going to the wharf."],
      hint: "Set trap only works when the boat is right on a dashed circle. Move first, then set.",
      learned: "Some actions put something new into the world. Like hauling, setting a trap only works in the right spot, so the order of your blocks matters.",
      grid: ["#########", "#S.o.o.G#", "#########"], dir: "E", blocks: [...BASIC, "drop", "repeat"], needDrops: true
    },
    {
      title: "Maybe a spot", concept: "Conditionals", stage: 4,
      goal: "Set a trap on every dashed circle and reach the wharf using 4 blocks or fewer. The circles aren't evenly spaced.",
      hint: "Repeat: move forward, then IF the boat is at a dashed spot, set a trap. How many squares to the wharf?",
      learned: "A conditional lets one loop handle an uneven pattern. The boat checks every square and only acts where the condition is true.",
      grid: ["###########", "#S.oo.o.oG#", "###########"], dir: "E", blocks: [...BASIC, "drop", "repeat", "ifSpot"], maxBlocks: 4, needDrops: true
    },
    {
      title: "Fog off Owls Head", concept: "Conditionals", stage: 4,
      goal: "Fog again! This time the channel curls the other way. Reach the wharf using 4 blocks or fewer.",
      steps: ["Use Repeat until at wharf.", "Inside it: If ledge ahead → turn left. Otherwise (else) → forward."],
      hint: "It's the same idea as Fog sensor, but the channel turns left at every ledge. Which turn goes in the top part of the If?",
      learned: "The same rule shape works in a new place if you change one part. Choosing the right action for each case is the heart of if–else.",
      grid: ["#######", "#.....#", "#.###.#", "#..G#.#", "#####.#", "##S...#", "#######"], dir: "E", blocks: ["move", "left", "right", "untilGoal", "ifWall"], maxBlocks: 4
    },
    {
      title: "Shrinking spiral", concept: "Variables", stage: 5,
      goal: "Spiral in toward the wharf in the middle of the cove using 6 blocks or fewer. Each side is one shorter than the last: 4, 3, 2, 1.",
      steps: ["Start steps at 4.", "After each side, change steps by −1 so the next side is shorter."],
      hint: "Set steps to 4. Repeat 4: { Repeat steps times: Forward. Turn right. Change steps by −1. }",
      learned: "A variable can go down as well as up. Changing it by a negative number made each side shorter, so the same loop drew a spiral inward.",
      grid: ["#######", "#S....#", "#####.#", "###G#.#", "###...#", "#######"], dir: "E",
      blocks: ["move", "left", "right", "repeat", "setVar", "repeatVar", "changeVar"], maxBlocks: 6, usesVar: true
    },
    {
      title: "Make a Haul block", concept: "Functions", stage: 6, fnName: "Haul",
      goal: "Build a Haul block that moves to the next trap and hauls it. Then haul all 4 traps and reach the wharf with 6 blocks or fewer in your main program.",
      steps: ["In the Haul box, build: Forward, Forward, Haul trap.", "In your main program, use Haul like any other block."],
      hint: "The traps are 2 squares apart. Main program: Haul, Haul, Turn right, Haul, Haul, Forward.",
      learned: "A function can include actions, not just moves. Naming a job (Haul) lets you think about what the boat does instead of every single step.",
      grid: ["#######", "#S.*.*#", "#####.#", "#####*#", "#####.#", "#####*#", "#####G#", "#######"], dir: "E",
      blocks: ["move", "left", "right", "pick", "repeat", "call"], maxBlocks: 6, usesFn: true, needGems: true
    },
    {
      title: "Penobscot free build", concept: "Create", stage: 7,
      goal: "Haul all 3 traps, set new traps on both dashed circles, and finish at the wharf. Use any blocks you like.",
      hint: "Haul first, set second: you can only set traps you have aboard. Plan the route on paper, then build and test it in parts.",
      learned: "You combined moving, hauling, setting, and checking into one plan. Big programs are made of small ideas you already know.",
      grid: ["########", "#S..*..#", "#.##.#.#", "#o.....#", "#.#.##*#", "#*..o.G#", "########"], dir: "E",
      blocks: ["move", "left", "right", "pick", "drop", "repeat", "untilGoal", "ifGem", "ifSpot", "ifWall"], needGems: true, needDrops: true, carry: true, par: 26
    },

    /* ═════════ Voyage 3: Down East ═════════ */
    {
      title: "Schoodic Point", concept: "Sequence", stage: 1,
      goal: "Waves crash on the granite at Schoodic Point. Weave between the ledges to the wharf.",
      hint: "This route turns left, then right, then left. Check which way the boat faces before each turn.",
      learned: "Left and right depend on which way the boat is facing, not which way you're facing. Picturing yourself at the wheel helps.",
      grid: ["#######", "#####G#", "#####.#", "###...#", "###.###", "#S..###", "#######"], dir: "E", blocks: BASIC
    },
    {
      title: "Lubec Narrows", concept: "Sequence", stage: 1,
      goal: "The tide rips through Lubec Narrows, right on the border with Canada. Make it through the twists to the wharf.",
      hint: "Break it into stretches: 1 east, 2 south, 4 east, 2 south, then all the way west.",
      learned: "Careful counting and planning make even a long sequence work on the first try. Programmers often sketch the route before they code it.",
      grid: ["########", "#S.#####", "##.#####", "##.....#", "######.#", "#G.....#", "########"], dir: "E", blocks: BASIC
    },
    {
      title: "Fog at West Quoddy", concept: "Debugging", stage: 1, debug: true,
      goal: "West Quoddy Head is the easternmost point in the United States. This program to get past it has one extra block. Find it and remove it.",
      hint: "Step through it. The boat bumps a ledge right away. Count how many squares it can really go before the first turn.",
      learned: "Bugs aren't always wrong blocks. Sometimes there's one block too many. Stepping through and counting finds it.",
      grid: ["#######", "#S..###", "###.###", "###.###", "###...#", "#####G#", "#######"], dir: "E", blocks: BASIC,
      starter: "F F F R F F F L F F R F"
    },
    {
      title: "Breakwater run", concept: "Loops", stage: 3,
      goal: "Run the whole length of the Eastport breakwater to the wharf using only 2 blocks.",
      hint: "It's one long straight line. Use a Repeat block with Forward inside, and count the squares.",
      learned: "A loop doesn't care how long the job is. Changing one number makes it go 3 squares or 9.",
      grid: ["############", "#S........G#", "############"], dir: "E", blocks: [...BASIC, "repeat"], maxBlocks: 2
    },
    {
      title: "Ledge ladder", concept: "Loops", stage: 3,
      goal: "Work down the ledges off Jonesport to the wharf using 6 blocks or fewer.",
      hint: "One rung of the ladder is: Forward, Forward, Turn right, Forward, Turn left. How many rungs are there?",
      learned: "Loops can hold longer patterns. The trick is finding exactly where one repeat ends and the next begins.",
      grid: ["#########", "#S..#####", "###...###", "#####...#", "#######G#", "#########"], dir: "E", blocks: [...BASIC, "repeat"], maxBlocks: 6
    },
    {
      title: "Around Roque Island", concept: "Debugging loops", stage: 3, debug: true,
      goal: "This loop takes the boat partway around Roque Island, then stops short of the wharf. Fix the bug.",
      hint: "The blocks inside the loop are right. Watch how far it gets. How many times does the loop need to repeat?",
      learned: "Sometimes the bug is the number, not the blocks. Loops that run too few or too many times are one of the most common bugs there is.",
      grid: ["#####", "#G..#", "###.#", "#S..#", "#####"], dir: "E", blocks: [...BASIC, "repeat"],
      starter: "[2 F F L]"
    },
    {
      title: "Haul and reset", concept: "Actions", stage: 2,
      goal: "Haul the 2 old traps, then set them again on the dashed circles before you tie up at the wharf.",
      hint: "You can only set a trap you've already hauled. Haul both traps first, then set them on the circles.",
      learned: "Actions can depend on each other. You can't set a trap you don't have, so the order of actions matters, not just where the boat is.",
      grid: ["###########", "#S*.*.o.oG#", "###########"], dir: "E", blocks: [...BASIC, "pick", "drop", "repeat"], needGems: true, needDrops: true, carry: true
    },
    {
      title: "Haul or set?", concept: "Conditionals", stage: 4,
      goal: "Haul every trap, set a trap on every dashed circle, and reach the wharf using 6 blocks or fewer.",
      hint: "Repeat: Forward, then IF at a buoy → haul the trap, then IF at a dashed spot → set a trap. Two If blocks can sit side by side in one loop.",
      learned: "A loop can check more than one condition each time. Each If handles its own case, so the boat does the right thing on every square.",
      grid: ["############", "#S*.o*.o*oG#", "############"], dir: "E", blocks: [...BASIC, "pick", "drop", "repeat", "ifGem", "ifSpot"], maxBlocks: 6, needGems: true, needDrops: true, carry: true
    },
    {
      title: "Spiral out of Cobscook", concept: "Variables", stage: 5,
      goal: "Spiral out of Cobscook Bay to the wharf using 6 blocks or fewer. This spiral turns left, and the sides grow: 1, 2, 3, 4.",
      hint: "Set steps to 1. Repeat 4: { Repeat steps times: Forward. Turn left. Change steps by 1. }",
      learned: "You reused the variable idea in a new shape. The variable keeps track of a number for you, so one loop can make every side a different length.",
      grid: ["#######", "#....##", "#.##.##", "#.#S.##", "#.#####", "#G#####", "#######"], dir: "E",
      blocks: ["move", "left", "right", "repeat", "setVar", "repeatVar", "changeVar"], maxBlocks: 6, usesVar: true
    },
    {
      title: "Wider and wider", concept: "Variables", stage: 5,
      goal: "The traps get farther apart: 2 squares, then 3, then 4. Haul all 3 and reach the wharf using 7 blocks or fewer.",
      steps: ["Start steps at 2.", "Each time: move steps squares, haul, then add 1 to steps."],
      hint: "Set steps to 2. Repeat 3: { Repeat steps times: Forward. Haul trap. Change steps by 1. } Then one more Forward.",
      learned: "A variable can count distance. Because steps grew each time, the same three blocks reached traps that were farther and farther apart.",
      grid: ["#############", "#S.*..*...*G#", "#############"], dir: "E",
      blocks: ["move", "left", "right", "pick", "repeat", "setVar", "repeatVar", "changeVar"], maxBlocks: 7, usesVar: true, needGems: true
    },
    {
      title: "Make a Dodge block", concept: "Functions", stage: 6, fnName: "Dodge",
      goal: "Three ledges sit in the channel. Build a Dodge block that goes up and over one ledge, then reach the wharf with 7 blocks or fewer in your main program.",
      steps: ["In the Dodge box, build the path up, across, and back down around one ledge.", "In your main program, use Dodge each time you reach a ledge."],
      hint: "Dodge = Turn left, Forward, Turn right, Forward, Forward, Turn right, Forward, Turn left. Main program: Forward, Dodge, Forward, Dodge, Forward, Dodge, Forward.",
      learned: "A function packs a tricky move into one block. Once Dodge worked, you could use it again and again without rebuilding it.",
      grid: ["#############", "#...........#", "#S.#..#..#.G#", "#############"], dir: "E",
      blocks: ["move", "left", "right", "call"], maxBlocks: 7, usesFn: true
    },
    {
      title: "Down East free build", concept: "Create", stage: 7,
      goal: "Your last voyage: haul all 4 traps, set traps on both dashed circles, and finish at the wharf. Use any blocks you like.",
      hint: "Haul before you set. Look for stretches you can loop, and test each part before you add the next.",
      learned: "You planned, built, tested, and debugged a long program on your own, across three voyages of the Maine coast. That's real programming.",
      grid: ["#########", "#S...#.o#", "#.#*.#..#", "#.#..*..#", "#*.#.##.#", "#o...*.G#", "#########"], dir: "E",
      blocks: ["move", "left", "right", "pick", "drop", "repeat", "untilGoal", "ifGem", "ifSpot", "ifWall"], needGems: true, needDrops: true, carry: true, par: 36
    }

  ];

  const VOYAGES = [
    { title: "Voyage 1: Casco Bay", short: "Casco Bay", from: 0, to: 11, blurb: "Learn the ropes around Portland: sequences, debugging, loops, actions, conditionals, variables, and functions." },
    { title: "Voyage 2: Penobscot Bay", short: "Penobscot Bay", from: 12, to: 23, blurb: "Same ideas, new harbor: Stonington, Vinalhaven, and Owls Head, plus setting traps of your own." },
    { title: "Voyage 3: Down East", short: "Down East", from: 24, to: 35, blurb: "Out to Schoodic, Lubec, and Eastport, where the tides are huge and every trap counts." }
  ];

  const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  const RIGHT = { N: "E", E: "S", S: "W", W: "N" };
  const LEFT = { N: "W", W: "S", S: "E", E: "N" };
  const ROT = { N: -90, E: 0, S: 90, W: 180 };

  function parseGrid(rows) {
    let start = null, goal = null;
    const gems = [], spots = [];
    rows.forEach((r, y) => [...r].forEach((ch, x) => {
      if (ch === "S") start = [x, y];
      if (ch === "G") goal = [x, y];
      if (ch === "*") gems.push(`${x},${y}`);
      if (ch === "o") spots.push(`${x},${y}`);
    }));
    return { rows, w: rows[0].length, h: rows.length, start, goal, gems, spots };
  }
  const isWall = (g, x, y) => x < 0 || y < 0 || x >= g.w || y >= g.h || g.rows[y][x] === "#";

  /* ───────── Interpreter (a generator, so we can step one block at a time) ───────── */
  function* run(list, st, ctx) {
    for (const b of list) {
      if (st.ops++ > 400) { st.error = "loop"; return; }
      switch (b.type) {
        case "move": {
          const [dx, dy] = DIRS[st.dir];
          const nx = st.x + dx, ny = st.y + dy;
          if (isWall(ctx.g, nx, ny)) { st.error = "crash"; yield b; return; }
          st.x = nx; st.y = ny; yield b; break;
        }
        case "left": st.dir = LEFT[st.dir]; yield b; break;
        case "right": st.dir = RIGHT[st.dir]; yield b; break;
        case "pick": {
          const k = `${st.x},${st.y}`;
          if (st.gems.has(k) && !st.got.has(k)) { st.got.add(k); yield b; }
          else { st.error = "nogem"; yield b; return; }
          break;
        }
        case "drop": {
          const k = `${st.x},${st.y}`;
          if (!st.spots.has(k) || st.dropped.has(k)) { st.error = "nospot"; yield b; return; }
          if (ctx.carry && st.got.size - st.dropped.size <= 0) { st.error = "empty"; yield b; return; }
          st.dropped.add(k); yield b;
          break;
        }
        case "repeat":
          for (let i = 0; i < b.n; i++) { yield* run(b.body, st, ctx); if (st.error || st.done) return; }
          break;
        case "repeatVar": {
          const n = st.vars.steps || 0;
          for (let i = 0; i < n; i++) { yield* run(b.body, st, ctx); if (st.error || st.done) return; }
          break;
        }
        case "untilGoal": {
          let guard = 0;
          while (!(st.x === ctx.g.goal[0] && st.y === ctx.g.goal[1])) {
            if (guard++ > 120) { st.error = "loop"; return; }
            const before = st.ops;
            yield* run(b.body, st, ctx);
            if (st.error || st.done) return;
            if (st.ops === before) { st.error = "loop"; return; }
          }
          break;
        }
        case "ifGem": {
          const k = `${st.x},${st.y}`;
          yield { ...b, checking: true };
          if (st.gems.has(k) && !st.got.has(k)) yield* run(b.body, st, ctx);
          if (st.error) return;
          break;
        }
        case "ifSpot": {
          const k = `${st.x},${st.y}`;
          yield { ...b, checking: true };
          if (st.spots.has(k) && !st.dropped.has(k)) yield* run(b.body, st, ctx);
          if (st.error) return;
          break;
        }
        case "ifWall": {
          const [dx, dy] = DIRS[st.dir];
          yield { ...b, checking: true };
          if (isWall(ctx.g, st.x + dx, st.y + dy)) yield* run(b.body, st, ctx);
          else yield* run(b.else, st, ctx);
          if (st.error) return;
          break;
        }
        case "setVar": st.vars.steps = b.n; yield b; break;
        case "changeVar": st.vars.steps = (st.vars.steps || 0) + b.n; yield b; break;
        case "call":
          if (ctx.depth > 5) { st.error = "loop"; return; }
          ctx.depth++;
          yield { ...b, checking: true };
          yield* run(ctx.fn, st, ctx);
          ctx.depth--;
          if (st.error) return;
          break;
      }
    }
  }

  /* ───────── Drawing ───────── */
  /* Top-down lobster boat, bow pointing east. */
  const ROVER = `<svg viewBox="0 0 40 40" class="rover__svg" aria-hidden="true">
      <path d="M2 30 Q-1 20 2 10" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="2" stroke-linecap="round"/>
      <path d="M5 11 H25 Q36 13 39 20 Q36 27 25 29 H5 Q3.5 20 5 11 Z" fill="#f7f6f0" stroke="#1d1647" stroke-width="2" stroke-linejoin="round"/>
      <path d="M6 14.5 H25 Q32 16 35 20 Q32 24 25 25.5 H6" fill="none" stroke="#8cc832" stroke-width="2"/>
      <rect x="15" y="14" width="10" height="12" rx="2" fill="#302568"/>
      <rect x="22" y="15.5" width="2.5" height="9" rx="1" fill="#b9e2f5"/>
      <rect x="7" y="16" width="5" height="8" rx="1" fill="#e9603f" stroke="#1d1647" stroke-width="1"/>
    </svg>`;

  function mount(el, idx, api) {
    const L = LEVELS[idx];
    const fnName = L.fnName || "Zig";
    const labelOf = (type) => (type === "call" ? fnName : BLOCKS[type].label);
    const g = parseGrid(L.grid);
    const saved = api.saved();
    let program = L.starter ? parse(L.starter) : [];
    let fn = [];
    let cursor = { owner: "root", branch: "body", index: program.length };
    let timer = null, gen = null, st = null, running = false, finished = false;
    let speed = 380;

    el.innerHTML = `
      <div class="rover">
        <div class="rover__world">
          <div class="rover__grid" style="--cols:${g.w};--rows:${g.h}" role="img" aria-label="Harbor chart: the boat starts at the left; reach the wharf${g.gems.length ? `, hauling ${g.gems.length} traps` : ""}${g.spots.length ? `, setting traps on ${g.spots.length} dashed circles` : ""}. Dark squares are granite ledges.">
            ${g.rows.map((r, y) => [...r].map((ch, x) => `<div class="cell ${ch === "#" ? "cell--wall" : ""}" data-x="${x}" data-y="${y}">
              ${ch === "G" ? `<span class="cell__flag">${icon("flag")}</span>` : ""}${ch === "*" ? `<span class="cell__gem" data-gem="${x},${y}">${icon("buoy")}</span>` : ""}${ch === "o" ? `<span class="cell__spot" data-spot="${x},${y}"><i></i>${icon("buoy")}</span>` : ""}</div>`).join("")).join("")}
            <div class="rover__bot" id="rover-bot">${ROVER}</div>
          </div>
          <div class="rover__readout" aria-live="polite">
            <span id="rover-status">Ready</span>
            ${L.usesVar ? `<span class="var-chip">steps = <b id="var-steps">0</b></span>` : ""}
            ${g.gems.length ? `<span class="var-chip">hauled <b id="gem-count">0</b>/${g.gems.length}</span>` : ""}
            ${g.spots.length ? `<span class="var-chip">set <b id="spot-count">0</b>/${g.spots.length}</span>` : ""}
          </div>
          <div class="rover__controls">
            <button type="button" class="btn btn--launch" id="rv-run">${icon("rocket")}Run</button>
            <button type="button" class="btn btn--ghost" id="rv-step">${icon("arrowRight")}Step</button>
            <button type="button" class="btn btn--ghost" id="rv-reset">${icon("refresh")}Reset</button>
            <label class="speed"><span>Speed</span>
              <select id="rv-speed" class="input input--small"><option value="700">Slow</option><option value="380" selected>Normal</option><option value="140">Fast</option></select>
            </label>
          </div>
        </div>
        <div class="rover__code">
          <div class="palette" role="group" aria-label="Blocks you can use">
            ${L.blocks.map((t) => `<button type="button" class="blk blk--${BLOCKS[t].kind} blk--btn" data-add="${t}">${icon(BLOCKS[t].glyph, BLOCKS[t].flip ? 'style="transform:scaleX(-1)"' : "")}${esc(labelOf(t))}${BLOCKS[t].count ? " #" : ""}</button>`).join("")}
          </div>
          ${L.usesFn ? `<div class="prog prog--fn"><div class="prog__head"><strong>${icon("star", 'class="inline-icon"')}${esc(fnName)} =</strong><span class="muted" id="fn-count"></span></div><div id="fn-list"></div></div>` : ""}
          <div class="prog">
            <div class="prog__head"><strong>Your program</strong><span id="blk-count" class="blk-count"></span>
              <button type="button" class="linkish" id="rv-clear">${icon("trash")}Clear</button></div>
            <div id="prog-list"></div>
          </div>
          <p class="field-help">Tap a gap (the dashed line) to choose where new blocks go. Tap ✕ to remove a block.</p>
        </div>
      </div>`;

    const bot = el.querySelector("#rover-bot");
    const cellSize = () => el.querySelector(".cell").getBoundingClientRect().width;

    function place(x, y, dir, animate = true) {
      bot.style.transition = animate ? `transform ${Math.min(speed, 350)}ms ease` : "none";
      bot.style.transform = `translate(${x * 100}%, ${y * 100}%)`;
      bot.firstElementChild.style.transition = animate ? `transform ${Math.min(speed, 350)}ms ease` : "none";
      bot.firstElementChild.style.transform = `rotate(${ROT[dir]}deg)`;
    }
    bot.style.width = `calc(100% / ${g.w})`;
    bot.style.height = `calc(100% / ${g.h})`;

    function resetWorld() {
      stop();
      st = { x: g.start[0], y: g.start[1], dir: L.dir, gems: new Set(g.gems), got: new Set(), spots: new Set(g.spots), dropped: new Set(), vars: { steps: 0 }, ops: 0, error: null, done: false };
      gen = null;
      finished = false;
      place(st.x, st.y, st.dir, false);
      el.querySelectorAll("[data-gem]").forEach((n) => n.classList.remove("is-got"));
      el.querySelectorAll("[data-spot]").forEach((n) => n.classList.remove("is-set"));
      el.querySelectorAll(".blk.is-active").forEach((n) => n.classList.remove("is-active"));
      el.querySelectorAll(".cell.is-crash").forEach((n) => n.classList.remove("is-crash"));
      setStatus("Ready");
      readouts();
    }
    function readouts() {
      const v = el.querySelector("#var-steps"); if (v) v.textContent = st.vars.steps;
      const gc = el.querySelector("#gem-count"); if (gc) gc.textContent = st.got.size;
      const sc = el.querySelector("#spot-count"); if (sc) sc.textContent = st.dropped.size;
    }
    const setStatus = (t) => { el.querySelector("#rover-status").textContent = t; };

    /* ───────── Program editor ───────── */
    function listFor(owner, branch) {
      if (owner === "root") return program;
      if (owner === "fn") return fn;
      const find = (list) => {
        for (const b of list) {
          if (b.id === owner) return b[branch];
          for (const k of ["body", "else"]) if (b[k]) { const r = find(b[k]); if (r) return r; }
        }
        return null;
      };
      return find(program) || find(fn);
    }
    function renderList(list, owner, branch) {
      const slot = (i) => `<button type="button" class="slot ${cursor.owner === owner && cursor.branch === branch && cursor.index === i ? "is-cursor" : ""}" data-owner="${owner}" data-branch="${branch}" data-index="${i}" aria-label="Put new blocks here${cursor.owner === owner && cursor.branch === branch && cursor.index === i ? " (selected)" : ""}"></button>`;
      let html = `<ol class="blocks">${slot(0)}`;
      list.forEach((b, i) => {
        const def = BLOCKS[b.type];
        html += `<li class="blk blk--${def.kind}" data-bid="${b.id}">
          <div class="blk__row">
            ${icon(def.glyph, def.flip ? 'style="transform:scaleX(-1)"' : "")}
            <span class="blk__label">${esc(labelOf(b.type))}</span>
            ${def.count ? `<span class="blk__count"><button type="button" data-dec="${b.id}" aria-label="Decrease">−</button><b>${b.n}</b><button type="button" data-inc="${b.id}" aria-label="Increase">+</button>${b.type === "repeat" ? "<span>times</span>" : ""}</span>` : ""}
            <button type="button" class="blk__del" data-del="${b.id}" aria-label="Remove ${esc(labelOf(b.type))}">✕</button>
          </div>
          ${def.container ? `<div class="blk__body">${renderList(b.body, b.id, "body")}</div>` : ""}
          ${def.hasElse ? `<div class="blk__else"><span>else</span></div><div class="blk__body">${renderList(b.else, b.id, "else")}</div>` : ""}
        </li>${slot(i + 1)}`;
      });
      return html + "</ol>";
    }
    function renderProgram() {
      el.querySelector("#prog-list").innerHTML = program.length || cursor.owner !== "root" ? renderList(program, "root", "body") : `${renderList(program, "root", "body")}<p class="prog__empty">Tap a block above to add it here.</p>`;
      if (L.usesFn) {
        el.querySelector("#fn-list").innerHTML = renderList(fn, "fn", "body");
        el.querySelector("#fn-count").textContent = `${countBlocks(fn)} blocks`;
      }
      const n = countBlocks(program);
      const bc = el.querySelector("#blk-count");
      bc.textContent = L.maxBlocks ? `${n} / ${L.maxBlocks} blocks` : `${n} blocks${L.par ? ` · par ${L.par}` : ""}`;
      bc.classList.toggle("is-over", !!(L.maxBlocks && n > L.maxBlocks));
    }
    function findAndRemove(list, id) {
      const i = list.findIndex((b) => b.id === id);
      if (i >= 0) { list.splice(i, 1); return true; }
      return list.some((b) => (b.body && findAndRemove(b.body, id)) || (b.else && findAndRemove(b.else, id)));
    }
    function findBlock(list, id) {
      for (const b of list) {
        if (b.id === id) return b;
        for (const k of ["body", "else"]) if (b[k]) { const r = findBlock(b[k], id); if (r) return r; }
      }
      return null;
    }

    el.querySelector(".rover__code").addEventListener("click", (e) => {
      const t = e.target.closest("button");
      if (!t || running) return;
      if (t.dataset.add) {
        const type = t.dataset.add;
        const list = listFor(cursor.owner, cursor.branch) || program;
        const b = make(type);
        list.splice(cursor.index, 0, b);
        // After adding a container, put the cursor inside it so the next block nests.
        cursor = BLOCKS[type].container ? { owner: b.id, branch: "body", index: 0 } : { ...cursor, index: cursor.index + 1 };
      } else if (t.dataset.owner) {
        cursor = { owner: t.dataset.owner, branch: t.dataset.branch, index: Number(t.dataset.index) };
      } else if (t.dataset.del) {
        findAndRemove(program, t.dataset.del) || findAndRemove(fn, t.dataset.del);
        if (!listFor(cursor.owner, cursor.branch)) cursor = { owner: "root", branch: "body", index: program.length };
        cursor.index = Math.min(cursor.index, (listFor(cursor.owner, cursor.branch) || []).length);
      } else if (t.dataset.inc || t.dataset.dec) {
        const b = findBlock(program, t.dataset.inc || t.dataset.dec) || findBlock(fn, t.dataset.inc || t.dataset.dec);
        const min = b.type === "changeVar" ? -3 : 1;
        b.n = Math.max(min, Math.min(12, b.n + (t.dataset.inc ? 1 : -1)));
      } else if (t.id === "rv-clear") {
        program = []; fn = L.usesFn ? [] : fn; cursor = { owner: "root", branch: "body", index: 0 };
      } else return;
      resetWorld();
      renderProgram();
      api.say("");
    });

    /* ───────── Running ───────── */
    function stop() { clearInterval(timer); timer = null; running = false; el.classList.remove("is-running"); }
    function highlight(b) {
      el.querySelectorAll(".blk.is-active").forEach((n) => n.classList.remove("is-active"));
      const node = el.querySelector(`[data-bid="${b.id}"]`);
      if (node) node.classList.add("is-active");
    }
    function stepOnce() {
      if (!gen) {
        if (L.maxBlocks && countBlocks(program) > L.maxBlocks) {
          api.say(`Your program has ${countBlocks(program)} blocks, but this level allows ${L.maxBlocks}. Look for a pattern you can loop or reuse.`, "warn");
          stop(); return false;
        }
        if (!program.length) { api.say("Your program is empty. Tap a block to add it.", "warn"); stop(); return false; }
        gen = run(program, st, { g, fn, depth: 0, carry: !!L.carry });
        api.log("lab_test_run", { blocks: countBlocks(program) });
      }
      const r = gen.next();
      if (!r.done) {
        highlight(r.value);
        place(st.x, st.y, st.dir);
        readouts();
        el.querySelectorAll("[data-gem]").forEach((n) => n.classList.toggle("is-got", st.got.has(n.dataset.gem)));
        el.querySelectorAll("[data-spot]").forEach((n) => n.classList.toggle("is-set", st.dropped.has(n.dataset.spot)));
        if (st.error) { finish(); return false; }
        setStatus(r.value.checking ? `Checking: ${labelOf(r.value.type)}` : labelOf(r.value.type));
        return true;
      }
      finish();
      return false;
    }
    function finish() {
      stop();
      finished = true;
      const atGoal = st.x === g.goal[0] && st.y === g.goal[1];
      const allGems = st.got.size === g.gems.length;
      const allSpots = st.dropped.size === g.spots.length;
      if (st.error === "crash") {
        const [dx, dy] = DIRS[st.dir];
        const c = el.querySelector(`.cell[data-x="${st.x + dx}"][data-y="${st.y + dy}"]`);
        if (c) c.classList.add("is-crash");
        setStatus("Bump!");
        api.say("Bump! The boat hit a granite ledge. The highlighted block is where it went wrong. What should it have done instead?", "warn");
        api.log("lab_bug", { kind: "crash" });
      } else if (st.error === "nogem") {
        setStatus("No trap here");
        api.say("The boat tried to haul a trap, but there isn't a buoy on this square. Move onto a buoy first.", "warn");
      } else if (st.error === "nospot") {
        setStatus("No trap spot here");
        api.say("The boat tried to set a trap, but this square isn't an empty dashed circle. Move onto a dashed circle first.", "warn");
      } else if (st.error === "empty") {
        setStatus("No traps aboard");
        api.say("There are no traps on the boat to set. Haul a trap first, then set it on a dashed circle.", "warn");
      } else if (st.error === "loop") {
        setStatus("Stuck in a loop");
        api.say("The boat got stuck going in circles forever. Make sure something inside the loop moves the boat closer to the wharf.", "warn");
      } else if (atGoal && (!L.needGems || allGems) && (!L.needDrops || allSpots)) {
        setStatus("Mission complete");
        const n = countBlocks(program);
        api.say(L.par ? `You did it in ${n} blocks${n <= L.par ? ". That's at or under par!" : `. Par is ${L.par}. Can you find a shorter program?`}` : "The boat made it home to the wharf!", "good");
        api.win({ blocks: n, program: summarize(program) });
      } else if (atGoal && L.needGems && !allGems) {
        setStatus("Traps missing");
        api.say(`The boat reached the wharf, but it only hauled ${st.got.size} of ${g.gems.length} traps.`, "warn");
      } else if (atGoal) {
        setStatus("Traps not set");
        api.say(`The boat reached the wharf, but it only set ${st.dropped.size} of ${g.spots.length} traps. Every dashed circle needs one.`, "warn");
      } else {
        setStatus("Stopped");
        api.say("The program ended, but the boat isn't at the wharf yet. Add more blocks or check your turns.", "warn");
      }
    }
    const summarize = (list) => list.map((b) => b.type + (b.n != null ? b.n : "") + (b.body ? `[${summarize(b.body)}]` : "") + (b.else ? `{${summarize(b.else)}}` : "")).join(",");

    el.querySelector("#rv-run").addEventListener("click", () => {
      if (running) { stop(); return; }
      if (finished || st.error) resetWorld();
      running = true;
      el.classList.add("is-running");
      api.say("");
      if (!stepOnce()) return;
      timer = setInterval(() => { if (!stepOnce()) stop(); }, speed);
    });
    el.querySelector("#rv-step").addEventListener("click", () => {
      if (running) stop();
      if (finished || st.error) resetWorld();
      stepOnce();
    });
    el.querySelector("#rv-reset").addEventListener("click", () => { resetWorld(); api.say(""); });
    el.querySelector("#rv-speed").addEventListener("change", (e) => { speed = Number(e.target.value); });

    resetWorld();
    renderProgram();
    if (L.debug) api.say("This program was written by another captain. Run it to see what goes wrong.", "info");
    if (saved && saved.blocks) api.say(`Last time you solved this with ${saved.blocks} blocks.`, "info");
    return () => stop();
  }

  SE.labs.register({
    id: "rover",
    area: "coding",
    title: "Harbor Code Lab",
    tagline: "Program a lobster boat with code blocks: haul and set traps, dodge ledges, and make it home. Three voyages and 36 levels, from first steps to your own functions.",
    levels: LEVELS,
    chapters: VOYAGES,
    mount
  });
  SE.harbor = { LEVELS, BLOCKS, parseGrid, run }; // exposed for tests and teacher tools
  SE.roverLevels = LEVELS; // used by the pathway page to link stages to levels
})();
