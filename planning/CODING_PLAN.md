# Coding 2.0: from blocks to real Python, workforce crews, and Maine careers

_Approved October 28, 2026. This is also the six-item planning pass that `planning/CODING_CATEGORIES.md` requires._

**Status (October 28, 2026):** Steps 1–3 shipped: Foundations (PRIMM, careers, portfolios, groups, grades 2–3 template), the Python ramp (mini-Python, Harbor Python Lab, See it in Python), and the AI Engineer crew (AI Code Review Lab, Prompt Precision, Trust but Verify, crew template and patch). The Game Dev crew shipped next (Harbor Level Designer, Playtest Lab, crew template and patch). Next: Cyber Defender. Templates `tpl-coding-foundations-23`, `tpl-crew-ai-engineer`, and `tpl-crew-game-dev` wait for review.

## Context
The coding category is broad (23 activities, 5 in-site labs, a 7-stage Coding Foundations plan) and strong on debugging and game design. But:
- **Students never type code.** Python appears once, as a static card.
- **Nothing connects to a job.** Each activity has a single "real world" sentence.
- **Grades 2–3 drop off** after loops. Stages 4–7 have no grades 2–3 anchors.
- **13 of 23 activities depend on Scratch.**
- There's no web, cybersecurity, or AI-code content in coding.

The user wants coding content better than anything out there: cooler, more relevant, and aligned with workforce skills.

**Research (October 28, 2026; sources in `planning/MARKET_RESEARCH.md`):**
- Competitors:
  - Code.org stays in blocks (CS Discoveries is becoming AI Discoveries).
  - CodeHS has the best blocks-to-Python ramp, but it's paid.
  - Google CS First shut down in June 2025.
  - No one localizes, links lessons to careers, or teaches **critiquing AI-written code**, the gap a 2025 study found: kids using AI tools test but don't read code.
- Frameworks:
  - CSTA's revision (Draft 3.0) weaves in AI and cybersecurity.
  - AI4K12's Five Big Ideas.
  - The skills employers want: reading others' code, testing, debugging, explaining your work, and judging AI output.
- **Maine:** no statewide CS standard (districts choose), MMSA's $8.2M rural computational-thinking push for pre-K–8, the Maine App Challenge (ages 13+), and a blue economy with about 88,700 jobs.
- **What works:** PRIMM (Predict, Run, Investigate, Modify, Make), Parsons problems (put scrambled lines in order), and use-modify-create.

**Decisions (the user):**

| Topic | Decision |
|---|---|
| Typed code | **Our own mini-Python**, built on Harbor Code's engine: no new library, works offline, no account, Chromebook-ready |
| Crews | **Game Dev**, **Cyber Defender**, **AI Engineer**. The first release ships **one**: AI Engineer (the room's pick, because it runs on mini-Python) |
| Careers | **Roles and industries only.** No company is named without permission |
| First release | **Foundations, then the Python ramp, then one crew.** Game Dev and Cyber Defender follow, one per release |

**The room's principle:** every coding activity teaches the way the research says works (PRIMM), ends in something students can show (a portfolio), and points to a real kind of Maine job.

## The six planning items (CODING_CATEGORIES.md)
1. **The content model today:**
   - 23 activities in `assets/js/data/activities.js` (area `coding`);
   - `STEM.pathway`, which has 7 stages and builds `tpl-coding-foundations` (26 steps);
   - the 6-8 track (8 activities);
   - 5 labs (`lab-coding.js` Harbor Code with 36 levels, `lab-dance.js`, `lab-chef.js`, `lab-gate.js`, `lab-blob.js`);
   - the linter `tests/tools/test_content.js`.
2. **Inventory:** verified on October 28, 2026 (see the table at the end of this file).
3. **Browsing groups** (a new `group` field on coding activities; one record per activity; overlap through `alsoIn`):
   - **Foundations:** Robot Chef, Bug Hunt, Robot Maze, Sort the Catch, Dance Party, Lobster Trap Logic.
   - **Block Coding (Scratch):** Event Party, Loop Dance, Debug Animation, Lighthouse Network, Snowstorm, Nor'easter, My Blocks, Snowflake.
   - **Games & Stories:** Interactive Story, Score Keeper, Capstone Game, Capstone Studio.
   - **Python & Text:** Harbor Python (new), Python Turtle.
   - **AI Engineer crew** (new).
   - **In-site labs:** Harbor Code, Moon Gate, Space Blob.
   - **Robotics & Physical Computing:** a link to the Snowplow Robot lab and the Moxie course (`alsoIn`).
   - **Web Development stays hidden:** it has no reviewed content, and empty groups are never shown.
4. **Gaps:**
   - **Revise:** all 23 activities get PRIMM, career, and explain fields.
   - **Fix:** add grades 2–3 anchors for stages 4–7.
   - **New:** the Python ramp and the AI Engineer crew (this release).
   - **Future:** Game Dev crew, Cyber Defender crew, web (HTML/CSS).
5. **Browsing design:** the Coding category page shows the groups as sections. The 7-stage Coding Foundations plan, readiness statements, and every activity id stay unchanged.
6. **Phases and acceptance checks:** below.

## Step 1: Foundations, for all 23 coding activities
- **New fields**, required for coding activities by the linter:
  - **`primm: { predict, investigate: [2–3 questions], modify, make }`.** It's shown as a "Think like a coder" block before the steps, with Predict first.
  - **`career: { role, industry, what }`**: roles and industries only. For example: "Software tester · Maine shipbuilding · checks that ship-control programs do what they should." Shown as a **"Who does this in Maine"** card.
  - **`explain`**: the "Explain your build" prompt, which asks for three sentences: what it does, one bug you fixed, and what you'd add next. It's an optional second box in the debrief, saved as `explain` in the existing `mission_completed` event. My log (`#/me`) lists these as **My portfolio**.
- **Grades 2–3 through every stage:** a new template `tpl-coding-foundations-23` ("Coding Foundations: Grades 2–3") built from existing labs, so there's no new content to verify:
  1. Robot Chef
  2. Dance Party
  3. Harbor Code levels 4–6
  4. Moon Gate
  5. Space Blob
  6. Harbor Code level 11 (functions)
  7. Dance Party Choreographer and the Harbor Code "Create" levels

  Each step has a note naming its levels. Marked `reviewed: false` until the user reviews it.
- **Coding browsing groups** (item 3): the `group` field plus sections on `#/activities/coding`. Educators see a "Coding Foundations" link and a link for each crew.
- The linter rule list grows for coding (`primm`, `career`, `explain`, `group`), and the to-do ratchet tracks the 23 activities until they're done.

## Step 2: The Python ramp ("Harbor Python")
Built on Harbor Code's engine (`SE.harbor`: `parseGrid`, `run`, and the block model in `lab-coding.js`).

- **`assets/js/labs/minipy.js`, a new file of pure functions:** `SE.minipy.parse(src) → { program, errors }` compiles a small Python subset into Harbor's block program, so the **same `run()` executes it**.
  - **Supported:** `move()`, `turn_left()`, `turn_right()`, `pick()`, `drop()`, `for i in range(n):`, `while not at_goal():`, `if/elif/else` with `wall_ahead()` / `gem_ahead()` / `on_spot()`, variables (`x = 0`, `x += 1`, comparisons), `def name():` and calls, and `#` comments.
  - **Errors are kind and name the line:** "Line 3: `for` lines end with a colon (:)." "Line 5: this line should be indented under the `if` above it." "Line 2: Python doesn't know `mov`; did you mean `move()`?"
  - **Safety:** a step limit (no infinite loops), no `eval`, and nothing outside the subset.
- **`SE.harbor.toPython(program)`:** a **Python view** toggle in the existing Harbor Code lab shows any block program as Python, live.
- **A new lab `harbor-python`** (`lab-python.js`, registered with the shared shell): 12 levels in 4 chapters, grades 4–8.
  1. **Read it** (PRIMM predict): predict where the boat ends up from Python you're given.
  2. **Parsons**: tap lines into order, with Indent and Outdent buttons. No dragging.
  3. **Fix it**: debug buggy Python.
  4. **Write it**: type your own, with loops, `if`, and `def`.
  - The editor is a monospace textarea with line numbers. **Tab moves focus** (no keyboard trap), and there are Indent and Outdent buttons. Errors highlight their line.
- **New activity `lab-harbor-python`:** Coding Foundations stage 6 (functions), plus the **Python & Text** group. Its `bridge` hands off to `python-turtle-bridge`.
- **Tests:**
  - `tests/tools/test_minipy.js`: the parser, every error message, and **equivalence**: each Harbor level's reference solution written in Python produces the same result as its blocks.
  - `tests/labs/test_harbor_python.py`.

## Step 3: AI Engineer crew (the first crew)
"Engineers who build with AI have to check its work." Every AI-written program in the crew is **made up for the lesson and labeled as a simulation** (CLAUDE.md rule). No real AI is called.

- **A new lab `code-review`** (`lab-review.js`), 8 levels on minipy and Harbor. Each level gives a task, a short "AI-generated" program, and an AI comment claiming it works. Students **predict, run, find the bug's line, fix it, and choose a test case** (a harbor map) that proves the fix. The bugs:
  1. off-by-one loop
  2. wrong condition
  3. a missing `else` case
  4. a loop that never ends (caught by the step limit)
  5. a comment that lies about what the code does
  6. code that works on one map but not another
  7. a vague prompt that produced the wrong program (choose the clearer prompt)
  8. challenge: review a program and write the bug report (what's wrong, the line, a test, the fix)
- **Two unplugged or teacher-led activities** (full lesson shape plus PRIMM and career fields):
  - **Prompt Precision:** write instructions an "AI" (a classmate) follows literally; connects to Robot Chef.
  - **Trust but Verify:** sort AI answers into checked and unchecked, and decide when a human must review. Mapped to AI4K12's Societal Impact and to CSTA `2-IC-21` / `1B-AP-15` (codes added to `standards.js` only after checking the official source).
- **A crew Learning Plan template `tpl-crew-ai-engineer`:**
  - Pattern Machine → AI Detectives → Prompt Precision → Harbor Python (chapter 3) → Code Review lab → Trust but Verify;
  - `group: "crew"`, `reviewed: false`.
- **A crew patch** (`progression.js`): **AI Engineer**, earned by passing 4 crew activities (a new patch rule `crew`). It's shown on Me and in My harbor.
- The crew's career cards cover AI/ML engineering, software testing, and data roles across Maine industries (health and biotech, finance, ocean technology), roles only.

## Later releases (designed now, built later)
- **Game Dev crew:** levels and scoring in depth, playtesting with a feedback form, release notes, a game-design document. Built on Score Keeper, Capstone Studio, and the Harbor "Create" levels.
- **Cyber Defender crew:**
  - passwords (a strength meter that runs on the device, with nothing sent anywhere);
  - phishing (sort made-up messages);
  - ciphers (Caesar and substitution puzzles in-site);
  - privacy choices.
  - Mapped to the NICE K-12 cybersecurity work.
- **Web Builder:** a sandboxed live HTML/CSS editor (an `iframe srcdoc` with no scripts allowed). The Web Development group appears only once it has reviewed content.

## Critical files
- **Content:**
  - `assets/js/data/activities.js` (23 coding activities gain `primm`, `career`, `explain`, `group`; 3 new activities);
  - `pathway.js` (stage 6 gets Harbor Python);
  - `templates.js` (`tpl-coding-foundations-23`, `tpl-crew-ai-engineer`, `group: "crew"`);
  - `progression.js` (the crew patch rule);
  - `standards.js` (any new codes, verified first).
- **Engine and labs:**
  - new: `assets/js/labs/minipy.js`, `lab-python.js`, `lab-review.js`;
  - changed: `lab-coding.js` (`toPython`, Python view);
  - `index.html` (script tags);
  - `labs.css` (`.py-` and `.cr-` prefixes, reduced-motion support).
- **Views:**
  - `views-library.js` (Think like a coder, the Who does this in Maine card, coding groups on the category page);
  - `views-student.js` (the Explain your build box, My portfolio);
  - `game.js` (the crew patch progress).
- **Tests:**
  - new: `tests/tools/test_minipy.js`, `tests/labs/test_harbor_python.py`, `tests/labs/test_code_review.py`;
  - the linter's coding rules;
  - `test_categories.py` (baseline counts);
  - `test_a11y.py` (the new labs, the editor, the career card);
  - `test_chromebook.py` (the new labs fit 1366×650).
- **Docs:** `planning/CODING_PLAN.md`, `docs/content.md` (coding fields, minipy, crews), `README.md` (the lab table), and the CLAUDE.md doc table.
- **Reuse:**
  - `SE.harbor` (`run`, `parseGrid`, the block model);
  - `SE.labs.register` with chapters and the win panel's `extra` slot;
  - the `bridge` field;
  - `SE.speech` (Read it to me on the new labs' briefs);
  - `addfields`-style batches, with the linter's to-do ratchet;
  - `SE.modal`.

## Verification
- **Step 1:**
  - The linter requires `primm`, `career`, `explain`, and `group` on coding activities (the to-do list empties).
  - Coding sections render.
  - The grades 2–3 template has an anchor at every stage.
  - Explain your build saves and shows in My portfolio.
  - `tests/run.sh local` is green.
- **Step 2:**
  - `test_minipy.js`: every Harbor level's Python solution equals its block solution. Each error type gives its friendly message with the right line. The step limit stops an endless loop.
  - The lab test plays read, Parsons, fix, and write levels by keyboard only.
  - a11y stays at 0 findings, and the Chromebook test passes.
- **Step 3:**
  - The code-review lab test checks each bug level: the wrong line is refused with feedback that names the student's choice; the right fix plus a test case wins.
  - The crew patch is earned after 4 passes.
  - Every AI program carries its "simulation" label.
- **Each step ships** with `/ship`: the full local suite, the build, then commit and push.

## Appendix: coding inventory (October 28, 2026, before this plan)

| id | Title | Grades | Level | Stage | Launch | Skills | Standards |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `robot-maze-mission` | Robot Maze | 2-3, 4-5 | beginner | 1 | Blockly Games | sequencing | 1A-AP-10, 1A-AP-14 |
| `event-party` | Click, Tap, Go! Event Party | 2-3, 4-5 | beginner | 2 | Scratch (MIT) | events | 1B-AP-10 |
| `loop-dance` | Loop Dance Choreographers | 2-3, 4-5 | beginner | 3 | Scratch (MIT) | loops | 1A-AP-10, 1B-AP-10 |
| `debug-animation` | Debug the Broken Animation | 4-5, 6-8 | intermediate | 3 | Scratch (MIT) | debugging, loops | 1B-AP-15, 2-AP-17 |
| `interactive-story` | Build an Interactive Story | 4-5, 6-8 | intermediate | 4 | Scratch (MIT) | logic, communication | 1B-AP-10 |
| `score-keeper` | Score Keeper: Catch the Stars | 4-5, 6-8 | intermediate | 5 | Scratch (MIT) | data | 1B-AP-09, 2-AP-11 |
| `my-blocks-patterns` | Pattern Studio with My Blocks | 4-5, 6-8 | advanced | 6 | Scratch (MIT) | functions | 2-AP-14 |
| `capstone-game` | Capstone: Design Your Own Game | 4-5, 6-8 | advanced | 7 | Scratch (MIT) | debugging, design-iteration, communication | 1B-AP-13, 2-AP-15, 2-AP-17 |
| `fix-the-recipe` | Bug Hunt: Fix the Sandwich Algorithm | 2-3, 4-5 | beginner | 1 | hands-on | sequencing, debugging | 1A-AP-08, 1A-AP-14 |
| `lab-robot-chef` | Robot Chef | 2-3, 4-5 | beginner | 1 | lab robot-chef | sequencing, debugging | 1A-AP-08, 1A-AP-14 |
| `sort-the-catch` | Sort the Catch: Race Two Algorithms | 6-8 | intermediate (6-8 track) | 1 | hands-on | sequencing | 1B-AP-08, 2-AP-10 |
| `lighthouse-network` | Lighthouse Network: Broadcast Messages | 6-8 | intermediate (6-8 track) | 2 | Scratch (MIT) | events | 1B-AP-10, 2-AP-13 |
| `snowstorm-clones` | Snowstorm Simulator: Clones and Loops | 6-8 | intermediate (6-8 track) | 3 | Scratch (MIT) | loops | 2-AP-12 |
| `noreaster-alerts` | Nor'easter Alert Station: Compound Conditions | 6-8 | intermediate (6-8 track) | 4 | Scratch (MIT) | logic, design-iteration | 2-AP-12, 2-AP-17 |
| `catch-log-lists` | Catch Log: Lists and Averages | 6-8 | intermediate (6-8 track) | 5 | Scratch (MIT) | loops, data | 2-AP-11 |
| `snowflake-functions` | Snowflake Studio: Custom Blocks with Inputs | 6-8 | advanced (6-8 track) | 6 | Scratch (MIT) | functions | 2-AP-14 |
| `capstone-studio` | Capstone Studio: Design, Playtest, Ship | 6-8 | advanced (6-8 track) | 7 | Scratch (MIT) | design-iteration, communication | 2-AP-15, 2-AP-17, 2-AP-18 |
| `python-turtle-bridge` | From Blocks to Python: Turtle Patterns | 6-8 | advanced (6-8 track) | 6 | Raspberry Pi Foundation | loops, functions | 2-AP-12, 2-AP-14 |
| `lobster-trap-logic` | Lobster Trap Logic | 2-3, 4-5, 6-8 | beginner | 4 | hands-on | sequencing, logic | 1A-AP-08, 2-AP-10 |
| `lab-rover` | Harbor Code Lab | 2-3, 4-5, 6-8 | beginner | – | lab rover | sequencing, debugging, loops, logic, data, functions | 1A-AP-10, 1B-AP-10, 2-AP-14 |
| `lab-dance-party` | Robot Dance Party | 2-3, 4-5, 6-8 | beginner | – | lab dance-party | sequencing, debugging | 1A-AP-10, 1A-AP-14 |
| `lab-space-blob` | Feed the Space Blob | 2-3, 4-5, 6-8 | beginner | – | lab space-blob | debugging, events, data | 1B-AP-09 |
| `lab-moon-gate` | Moon Base Gatekeeper | 2-3, 4-5, 6-8 | beginner | – | lab moon-gate | logic, debugging | 1B-AP-10, 1B-AP-15 |

Labs: Harbor Code (36 levels in 3 voyages: sequence, debugging, loops, actions, conditionals, variables, functions, create), Robot Dance Party (8), Robot Chef (5), Moon Base Gatekeeper (5), Feed the Space Blob (4). All are tap-only, with no typed code. 13 of 23 activities run on Scratch, one on Blockly Games, and one on the Raspberry Pi Code Editor.
