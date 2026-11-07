# Captain Code: instructor guide

**STEM 207 coding workshop · Grades 2–8 · 90 minutes · A laptop, Chromebook, or tablet per student or pair · Open it at `#/lab/captain-code`**
An original STEM 207 workshop, built on the Harbor Code engine (2026).

## At a glance

| | |
| --- | --- |
| **Big idea** | A computer does exactly what the code says. Programmers plan, predict, test, and fix one thing at a time. |
| **What students do** | Program a Maine lobster boat through the 10 Casco Bay levels, then design their own chart and see their code in Python. |
| **What they make** | A Voyage Card (level 10) with their chart and program, printable. |
| **What they earn** | The **Casco Bay Certified Captain** certificate and the Certified Captain patch, for finishing all 10 levels. |
| **Grades 2–3** | Aim for level 5 with Extra help on. |
| **Early finishers** | Penobscot Bay (12 levels) and Down East (12 levels), then Harbor Python. |
| **Prep** | About 10 minutes. |

## Learning objectives
Students will:
- Build a program as an exact sequence of steps, and predict what it will do before running it.
- Debug by stepping through a program to find the first block that goes wrong.
- Use loops, if / else, a variable, and their own blocks to write shorter programs that work in more than one situation.
- Connect block code to the same program written in Python.

**Standards (CSTA):**

| Code | In this workshop |
| --- | --- |
| 1A-AP-10 | Sequences and simple loops |
| 1A-AP-14 | Debugging |
| 1B-AP-10 | Programs with sequences, events, loops, and conditionals |
| 2-AP-17 | Systematic testing and refinement |

## Course map

Every level has a briefing from the harbor master, a goal, three hints (notice, then an idea, then a small example), and a "What you learned" line. The lab checks the boat's real run, so students can't finish a level just by clicking Done. Any program that meets the goal passes; there is no single right answer.

| # | Level | Concept | What students do | Block budget | Minutes |
| --- | --- | --- | --- | --- | --- |
| | **Part 1: First steps** | | | | **22** |
| 1 | Leaving the Dock | Sequence | Tap the square where the boat will stop, then sail 4 squares to the mooring. | none | |
| 2 | The First Trap Haul | Planning | Plot the course on the map first, then haul the trap and reach the mooring. | none | |
| 3 | Another Captain's Mistake | Debugging | Step through Captain Dot's broken program and fix the first wrong turn. | none | |
| 4 | Granite Ledge Passage | Precision | Thread a stair-step passage, tracking which way the boat faces. | par 14 | |
| | **Part 2: Smarter code** | | | | **20** |
| 5 | The Lobster Trap Line | Loops | Haul 4 evenly spaced traps with a Repeat. | 5 | |
| 6 | Fog on the Water | If / else | Find the mooring when only one square around the boat is visible. | 4 | |
| 7 | The Changing Channel | Loops + if / else | Write one program that works at high tide **and** low tide. | 6 | |
| | **Part 3: Captain's tools** | | | | **18** |
| 8 | The Growing Spiral | Variables | Search in a spiral whose sides grow 1, 2, 3, 4, 5, using a variable called distance. | 6 | |
| 9 | The Captain's Custom Maneuver | Functions | Build a Haul and Turn block and use it at least twice. | 9 | |
| | **Part 4: Your voyage** | | | | **15** |
| 10 | Captain's Challenge: Design Your Voyage | Create | Haul every trap, try to beat par (27), then press Design my chart and make a new voyage. | par 27 | |

**How the block budget works:** every block counts once, including nested ones and the blocks inside the student's own block. A call to their own block counts as 1. A route that works but runs over the budget **still runs**, but it doesn't win. The feedback then asks for a loop, a variable, or the student's own block.

**Marks on each win** (none depends on speed):
- **Made it:** the boat reached the goal.
- **Par:** at or under the level's par.
- **Compass:** a correct prediction, a stretch target, or no failed runs.

## Before class

**Setup checklist**
- [ ] Make a class and print login cards. Students sign in with the class code and their picture code, so progress saves. Guests can play, but their progress isn't saved.
- [ ] Sign in as an educator on the projector computer. Open level 6 (Fog on the Water) and level 7 (The Changing Channel).
- [ ] Find **Demo the solution** on a level. It's educator-only: students and guests never see it.
- [ ] Clear a strip of floor for the human-boat warm-up, about 4 × 4 floor tiles.
- [ ] Print the cards in [02-printable-cards.md](02-printable-cards.md): the warm-up card, the Plot your course sheet, and the exit ticket.
- [ ] Optional: grid paper for planning level 10.

**STEM 207 privacy rule:** no outside accounts or websites. Students use only a display name and a picture code. The Voyage Card and certificate show the display name only.

## 90-minute plan

| Time | Activity | What happens |
| --- | --- | --- |
| 0:00–0:08 | Welcome and captain briefing | **Human-boat warm-up:** one student is the boat, and the class calls out Forward, Turn left, and Turn right. The boat follows exactly, even when it's wrong. Point out that left and right are the boat's left and right. |
| 0:08–0:30 | Levels 1–4 | Students work. Demo Step on level 3 if many get stuck. **Checkpoint:** most students finish level 4 by about 0:30. |
| 0:30–0:50 | Levels 5–7 | **Group moment before level 6:** step through the fog program on the projector. **Checkpoint:** level 7 by about 0:50. |
| 0:50–1:08 | Levels 8–9 | **Group moment at level 7:** why does a memorized route fail at the other tide? **Checkpoint:** level 9 by about 1:08. |
| 1:08–1:23 | Captain's Challenge (level 10) | Students beat par or design their own chart. Pairs trade charts and try to beat each other's block count. |
| 1:23–1:30 | Python reveal and reflection | Show one level 10 program in the Python view. Ask: your boat followed your code exactly. Who did the thinking? Exit tickets. |

Times are targets and haven't been tested with classes yet. Nothing times students out. Check the checkpoints on your dashboard.

## Running it
- **Start the habit of predicting.** Levels 1, 3, and 5 ask students to tap where the boat will stop before the first run. Praise good predictions even when the program is wrong.
- **"It doesn't work."** Ask the student to press **Step** instead of Run, and to tell you the first block where the boat does something they didn't expect. Fix only that block.
- **Turning confusion.** Have the student stand up and face the way the boat faces, then turn.
- **Over the budget.** Ask the student to say the route out loud: "Forward, forward, haul; forward, forward, haul…" and listen for the part that repeats.
- **Demo the solution** loads a verified reference solution. Use it on the projector to step through levels 6, 7, and 8 before students try them. Don't use it to rescue one student: a conversation does more.
- **Dashboard.** A student with many test runs and no progress needs a conversation, not the answer.
- **Level 7 has two tabs,** High tide and Low tide. **Test both tides** runs the same program on both.

## Answer guide

One working approach for each level. Any program that meets the goal passes. Python names are as shown in the lab's Python view.

| # | One solution (blocks) | Budget |
| --- | --- | --- |
| 1 | Forward ×4 | none |
| 2 | Forward, Forward, Haul trap, Turn right, Forward, Forward | none |
| 3 | Captain Dot's first turn is wrong: change the first **Turn left** to **Turn right**. | none |
| 4 | Forward, Turn right, Forward ×2, Turn left, Forward ×2, Turn right, Forward ×2, Turn left, Forward ×3 (14 blocks) | par 14 |
| 5 | Repeat 4 { Forward, Forward, Haul trap }, then Forward | 5 |
| 6 | Repeat until at mooring { If ledge ahead → Turn right, else → Forward } | 4 |
| 7 | Repeat until at mooring { If ledge ahead → (If ledge on the right → Turn left, else → Turn right), else → Forward } | 6 |
| 8 | Set distance to 1. Repeat 5 { Repeat distance times { Forward }, Turn right, Change distance by 1 } | 6 |
| 9 | Haul and Turn = Forward ×3, Haul trap, Turn right. Main: Haul and Turn ×3, then Forward | 9 |
| 10 | A 27-block reference route hauls all four traps. Students can beat par with loops and their own block. | par 27 |

## Common mistakes and misconceptions

| What you see | What's going on | What to say |
| --- | --- | --- |
| The boat turns the wrong way | The student used their own left and right, not the boat's. | "Stand up and face where the boat faces. Now turn." |
| "Haul trap didn't work" (level 2) | They hauled before the boat reached the buoy. | "Step through it. Where is the boat when Haul runs?" |
| One trap is left over (level 5) | The repeat count is off by one, like 3 instead of 4. | "Count the traps. How many times does the pattern happen?" |
| The boat circles forever in the fog (level 6) | Turn left goes around the loop the wrong way. | "Watch one full lap. Which turn keeps it in open water?" |
| It works at high tide only (level 7) | A memorized route. | "Real programs are tested on many cases. What does the boat need to check?" |
| Each side is the same length (level 8) | The student forgot Change distance. | "Which number should grow each time?" |
| Over budget on level 9 | They wrote the steps out instead of calling their own block. | "What job happens at every corner? Build it once." |
| Forward outside the loop | It should be inside. | "Step through. What repeats, and what happens only once?" |

**Misconception to listen for:** "The computer knew what I meant." It never does. The boat did exactly what the code said, so the thinking was the captain's.

## Differentiation
- **Extra help** (a button on the landing screen and every level; it lasts only for the session):
  - bigger blocks;
  - par and stretch targets hidden;
  - a nudge toward Need a hint? after two failed runs.

  Turn it on for grades 2–3 and for any student who needs it.
- **Grades 2–3:** aim for level 5. Read the briefings aloud. Pairs work well: one taps, one predicts.
- **Grades 6–8:** chase Par and the Compass mark on every level, and finish level 10 under 27 blocks.
- **Early finishers:**
  - Penobscot Bay (12 levels) and Down East (12 levels): the same ideas, combined in new ways, including nested loops and a foggy grand challenge.
  - Harbor Python: type real Python.
- **Pairs and timing:** a pair can share a device. Switch drivers at each level.

## Assessment
- **Check (from the library entry):** "Show your Captain's Challenge program. Point to the block that does the most work, and explain one bug you fixed and how you found it."
- **Explain prompt:** "In three sentences: how your Captain's Challenge program works, which loop, variable, or block of your own made it shorter, and one bug you found by stepping through it."
- **Evidence:** the dashboard shows levels finished. The printed Voyage Card shows the student's level 10 chart and program.
- **Quick rubric:**

  | Area | What to look for |
  | --- | --- |
  | Sequence | Predicts where the boat stops |
  | Debugging | Uses Step to find the first wrong block |
  | Abstraction | Explains how a loop, if / else, variable, or their own block shortened the program |
  | Testing | Explains why level 7 needs two tides |

- **Certificate vs XP:** the certificate and patch come from finishing Casco Bay. Activity XP still comes from your teacher check (Pass / Try again).

## Troubleshooting
1. **A student's progress is gone.** They were probably a guest. Sign them in with the class code and picture code. Guest progress isn't saved.
2. **A student can't see the Run button or the map.** Reset the Chromebook zoom to 100% (Ctrl + 0).
3. **The boat seems to ignore a block.** It's probably outside the loop or if block. Tap a gap to choose where new blocks go, and use Undo (Ctrl + Z) to back up.
4. **There's no printer.** Print the Voyage Card or certificate to "Save as PDF".
5. **A student is stuck after all three hints.** Do the human-boat warm-up with just that student, using the level's map drawn on paper.

## Materials
A device per student or pair · a projector · login cards · the printed warm-up card, Plot your course sheet, and exit tickets · pencils · optional grid paper

## Things to check before the first run
- **Timing.** The 90-minute plan hasn't been timed in a STEM 207 class yet.
- **The workshop template** (Captain Code Workshop, `tpl-ws-captain-code`) is marked not yet reviewed. Look it over before you assign it as a Learning Plan.
- **Tablets.** The blocks are tap-only, but test the level 10 chart designer on your tablets before class.
