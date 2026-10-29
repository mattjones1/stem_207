# Activities and labs: the content model

How an activity record is shaped, how labs are built, and the rules that keep every activity complete. Read before adding or editing an activity, a lab, standards, or Go deeper links.

## Coding activities (Coding 2.0, planning/CODING_PLAN.md)
- Every coding activity also has (the linter requires them):
  - `primm: { predict, investigate: [2–3], modify, make }`: shown as **Think like a coder** before the steps (Run is a fixed line).
  - `career: { role, industry, what }`: shown as **Who does this in Maine**. Roles and industries only; **never name a company** without permission.
  - `explain`: the **Explain your build** prompt, an optional box in the debrief saved as `explain` on `mission_completed`. Me lists these as **My portfolio**.
  - `group`: one of `STEM.codingGroups` (`areas.js`). The Coding page shows activities by group; a group with no activities is hidden (Web development until it has reviewed content). An activity from another category joins with `alsoIn: ["coding"]` plus a `group` (the Snowplow lab and Sense–Think–Act are in robotics).
- Templates: `tpl-coding-foundations-23` (Coding Foundations: Grades 2–3) reaches all seven stages with labs and hands-on activities, each activity once (`reviewed: false`).
- Test: `python3 tests/site/test_coding.py`.

## Python ramp: mini-Python and the Harbor Python Lab
- **`assets/js/labs/minipy.js`** (`SE.minipy`, loaded before `lab-coding.js`): a small Python subset that compiles to Harbor Code's block programs, so `SE.harbor.run` runs it. No eval, no library.
  - `parse(src) → { main, fn, fnName, errors: [{ line, message }] }`. Supported: `move()`, `turn_left()`, `turn_right()`, `haul()`, `set_trap()`, `for i in range(n|steps):`, `while not at_wharf():`, `if at_buoy()/at_spot()/ledge_ahead():` (only `ledge_ahead()` has `else`), `steps = n` / `+=` / `-=`, one `def name():`, `pass`, and comments. Tabs count as 4 spaces.
  - Errors are for students: they name the line and say what to try (a missing colon, indenting, an unknown name with a "did you mean", elif, a second function).
  - `toPython(main, fn, fnName)`: Harbor Code's **See it in Python** (a folded panel under the program).
- **Harbor Python Lab** (`lab-python.js`, id `harbor-python`, `.py-` styles): 12 levels in 4 chapters (Read it, Put it in order, Fix it, Write it). Level kinds: `read` (marks A/B/C and an `answer`), `parsons` (`lines`, tap to add, Indent/Outdent buttons, no dragging), `fix` (`code`), `write` (`starter`, `maxLines`, `mustUse`). Tab leaves the editor (no keyboard trap); Indent/Outdent buttons do the indenting.
  - Pure rules: `SE.harborPython.check(levelIndex, src)` and `predictEnd(levelIndex)`.
  - Activity `lab-harbor-python` is in Coding Foundations stage 6 and the Python group.
## Crews: AI Engineer (the first workforce track)
- A **crew** is a Learning Plan template with `group: "crew"` (listed under **Crews: workforce tracks** on Learning Plans) plus a crew patch. `tpl-crew-ai-engineer`: Pattern Machine → AI Detectives → Prompt Precision → Harbor Python (chapters 1–3) → AI Code Review → Trust but Verify (`reviewed: false`).
- **Patch rule `crewPass`** (`progression.js`, `game.js`): count passes among the crew template's activities (`prof.counts.passedIds`). AI Engineer needs 4.
- **AI Code Review Lab** (`lab-review.js`, id `code-review`, `.cr-` styles): 8 levels. Each shows a task, a program an "AI" wrote, and its confident claim. Students run it, choose the bug's line (refused with their choice named if wrong), choose what's wrong and the test map that proves it where asked, then fix it (it must pass every map). One level is about rewriting a vague prompt.
  - **It's a simulation**: no AI is called; every program and claim is written for the lesson and says so on screen (`lab.simulation` and `.cr-sim`).
  - Pure rules: `SE.codeReview.check(levelIndex, { line, what, map, prompt, src })`, `runOn`, `failingMaps`.
- Unplugged crew activities: `prompt-precision` (grades 2–8, with simple words) and `trust-but-verify` (grades 4–8; every answer card is made up for the lesson).
## Crews: Game Dev
- `tpl-crew-game-dev`: Score Keeper → Interactive Story → Harbor Level Designer → Capstone Studio → Playtest Lab (`reviewed: false`). Patch **Game Developer** (`crewPass`, 4). Its activities are in the `games` group ("Game Dev crew: games and stories").
- **Harbor Level Designer** (`lab-builder.js`, id `level-designer`, `.ld-` styles): 6 levels. Students pick a tool (Ledge, Water, Trap buoy, Boat start, Wharf) and tap squares; every square is a labeled button, with no dragging. A route finder (`SE.levelDesigner.route`, breadth-first over position and traps collected) shows whether the level is possible and its best route in moves. Levels: fix an impossible level (keep 5 inner ledges), make the route 10+, place 3 reachable traps, tune into 12–16 moves with 2 traps, design then solve your level in Python (`solves`), and order 3 levels into a difficulty curve (`curve`).
- **Playtest Lab** (`playtest-lab`, unplugged, works with any playable project): watch without helping, I noticed / I wondered / I'd change, one fix, release notes.
- Next crew: Cyber Defender.
- Tests: `node tests/tools/test_level_designer.js` and `python3 tests/labs/test_level_designer.py`.
- Tests: `node tests/tools/test_code_review.js` (every AI program really fails; every fix passes) and `python3 tests/labs/test_code_review.py`.

- Tests: `node tests/tools/test_minipy.js` (parser, every error, round trips, and Python steering the boat exactly like blocks on all 36 Harbor levels), `node tests/tools/test_harbor_python.js` (every level solvable; Fix it programs fail as given), and `python3 tests/labs/test_harbor_python.py`.

## Every activity is complete (content linter)
- `node tests/tools/test_content.js` checks every published activity for the full lesson shape: `learn` (2–6), `why`, `realWorld`, `vocab` (2–5 `{term, def}`), `check`, `stopAt`, `stuck` (2–4), `next` (a published id), `time { prep, core }`, `teacherNotes` (3+), `steps`, a `simple { mission, steps }` version for grades 2–3 (same steps, in order), and `standards` (codes from `data/standards.js` only). It also checks skills, standards, and Coding Foundations listings.
- Known gaps from October 28, 2026 are in `tests/fixtures/content-todo.json`. That list only shrinks: a new gap fails, and so does a fixed gap still on the list. **A new activity must be complete.** `--report` prints the gaps.

## Standards (CSTA + NGSS)
- `assets/js/data/standards.js` (`STEM.standards`, loaded after `templates.js`) lists every code we use, `{ set, text, url }`, verified against the official sources on October 28, 2026: CSTA 2017 (Levels 1A, 1B, 2, from CSTA's progression chart) and NGSS (nextgenscience.org). **Only codes in that file may be used**, and a new code must be checked against the official source first.
- Each activity has `standards: [codes]` (1–4, conservative), or `[]` when it was reviewed and nothing fits well (360° Notice & Wonder, Stop-Motion Studio).
- **Educators only:** a Standards row in the activity facts (`standardsRow`, `SE.standardsList`) and "Standards covered" on plan and template pages (`standardsBox`). Library search matches codes. Students and guests never see codes.
- The importer validates `standards` and `simple`.

## Young readers (grades 2–3)
- Every activity that includes grades 2–3 has `simple: { mission, steps }`: the same steps in the same order, short sentences (12 words or fewer, checked by the linter).
- **Simple words** (`#simple-toggle` on the activity page) is on by default for students in the 2–3 band; anyone can switch, and the choice is remembered (`localStorage stem207.simple`).
- **Read it to me** (`SE.speech` in `core.js`): the browser's own voice, only when a button is pressed (never autoplay). The same button stops it, it highlights the part being read (`.is-reading`), and changing pages stops it. It's on the mission, the steps, and a lab's goal and steps. The button is hidden when the browser has no speech support. Nothing leaves the device.
- Test: `python3 tests/site/test_young_readers.py` (it stubs `speechSynthesis`).

## Adding an in-site lab
1. Create `assets/js/labs/lab-<name>.js`. Register it with `SE.labs.register({ id, area, title, tagline, levels, mount })`.
   - Levels: `{ title, concept, learn, why, goal, steps?, hints: [h1, h2] (progressive), learned }`. Every level needs `learn` ("What you'll learn") and `why` ("Why it matters", repeated on the win panel); `SE.labs.goals(levels, [[learn, why], ...])` adds them by index.
   - `api.win(data, { title, extra })` can replace the win heading and add HTML at the top of the win panel.
   - `mount(el, idx, api)` uses `api.win(data)`, `api.say(text, "info"|"good"|"warn")`, `api.log(type, data)`, and `api.saved()`, and returns a cleanup function.
   - Check the student's **actual** work, never a "Done" click. Feedback names the mistake using the student's own values and doesn't reveal the answer.
   - Expose pure rules for tests, e.g. `SE.<name>.check(level, …)`.
2. Add a `<script>` tag after the other labs in `index.html`.
3. Add styles to `assets/css/labs.css` under a unique prefix (e.g. `.dp-`, `.sb-`, `.mg-`). Use the theme tokens (`var(--teal)`, `var(--surface)`, …), and support `prefers-reduced-motion`.
4. Add a library entry to `activities.js` with `launch: { status: "lab", labId }`. Put the teacher note in `teacherNotes`, covering the objective, common misconceptions, and a question to ask afterward.
5. If the lab practices a pathway stage, add its activity id to that stage in `pathway.js`.
6. Add a row to the lab table in `README.md`.

## Pilot fields
- `pilot: true` puts an activity in the teacher "Pilot activities" filter.
- `time: { prep, core: [min, max], verified }`: shown as student time and teacher prep, and used by the time filters. Keep `duration` (20/30/45) for XP. Set `verified: true` only after classroom timing.
- `stopAt` ("You're done when"), `check` (the "Show what you know" prompt; spoken, shown, or written), `stuck` (student-visible hints), `next` (activity id).
- Student home is **Home** (`SE.views.today`, route `#/`); see "Student Home and My Learning Plans" below.
- Pilot materials are in `pilot/` (rehearsal checklist, observation sheet). Test: `python3 tests/site/test_today_pilot.py`.

## Learning-route fields and pages
- `starter: { file, label, how }`: a downloadable starter project (built by `python3 tools/build_starters.py` into `assets/starters/`). `figure: "<key>"`: a drawn block picture from `FIGURES` in `views-library.js` (with a text version). `bridge: { from, text }`: "You've seen this idea before" link from a lab to a platform activity.
- `STEM.aiRoute` in `pathway.js` builds the "AI Learning Route" Learning Plan template (`tpl-ai-route`, not yet reviewed). The separate route and "Start here" pages are retired, and `#/pathway` and `#/ai-route` redirect (to the template for educators, `#/plans` for students, the category for guests). Test: `python3 tests/site/test_batch5.py`.

## Mission context and certificates
- Activity fields: `why`, `realWorld`, `vocab: [{ term, def }]` render as "Why it matters" with key words (all 10 coding missions have them). `board: { title, lines, note }` shows a card students read in the mission block (Bug Hunt's buggy algorithm).
- `SE.certificate.open(info)` / `SE.certificate.button(info, label)` in `assets/js/certificate.js`: a printable certificate on white paper, co-branded with STEM Coliseum. `info = { award, course, detail, name, className, at }`. Use the display name and class name only. Pattern Machine Level 6 awards "Responsible AI Explorer" at 7 of 10 (`SE.patternMachine.scoreUses`, `PASS`).
- Test: `python3 tests/site/test_batch6.py`.

## Grades 6–8 track and Robot Chef
- `track: "6-8"` marks a mission written for grades 6–8. Each pathway stage lists one (stage 6 also has `python-turtle-bridge`). `SE.game.recommendations` picks the student's own track first, then anything in their band. The pathway page tags them.
- `board.code: true` renders board lines as code (the Scratch → Python card).
- Robot Chef lab (`lab-chef.js`, `.rc-`): `SE.robotChef.run(stepIds)` → `{ ok, trace, bug: { index, kind: unclear|order|missing|end, need } }`.
- Starters: `tools/build_starters.py` also builds `dance-crew.sb3`. It rebuilds every starter; revert the unchanged ones (zip timestamps change).
- Tests: `python3 tests/labs/test_robot_chef.py`, `python3 tests/site/test_batch7.py`.

## Coding pathway → Coding Foundations template
- The seven stages in `STEM.pathway` (`pathway.js`) are data for the "Coding Foundations" Learning Plan template (`tpl-coding-foundations`). Each stage's first activity is required; the others are optional practice.
- The stage pages and "I can" checks are gone. `pathwayStage` on activities still orders and suggests them.
- On the Coding and AI category pages, educators get a link to the matching template.

## Categories, content status, and import
- Plan: `planning/STEM207_Categories_Pathways_Claude_Build_Plan.md` (the brief), `CATEGORIES_PATHWAYS_AUDIT.md`, and `CATEGORIES_PATHWAYS_BACKLOG.md`.
- `SE.content` (`assets/js/content.js`) holds the rules: `isPublished` (missing `pub` = published), `version` (missing = "1"), `readiness` (ready / missing-resource / needs-review, separate from `pub`), `visibleTo`, `assignable`, and `draftsIn`.
  - Unpublished records go in `STEM.drafts`: they're in `SE.activityById`, never in `STEM.activities`.
  - The activity view sends anything not `visibleTo` the user to not-found.
- 3D Printing is the seventh area, **live since October 22, 2026** (the user asked for real exercises), with three Tinkercad activities (see "3D Printing" below). An area with `status: "coming-soon"` is left out of `SE.liveAreas`.
  - Use `SE.liveAreas` (not `STEM.areas`) for filters, the buoy hero, suggestions, and teacher area tabs. The category grid shows all areas. The buoy hero (`BUOYS`) and star map (`SECTORS`) have seven slots; add one before adding an eighth area.
  - Two placeholders (`3d-printing-exercise-04`, `-05` in `data/drafts-3d-printing.js`) stay generic and hidden. Replace one only with a complete, reviewed record.
- Optional mission fields: `alsoIn` (counted once, in the primary area), `skills` (from `STEM.skills`), and `delivery`.
  - Skill tags (audit 6a) and the VR delivery labels (6c) were approved and applied on October 28, 2026. New activities pick skills from `STEM.skills`. The library and the plan picker have a Skill filter (`SE.skillName`), and search matches skill names.
- Import: `node tools/import_missions.js <file.json> [--write] [--new-version]` writes `data/imported.js` (generated). Test: `node tests/tools/test_import_missions.js`.
  - `tests/run.sh` runs `.js` tests with Node.
- Baseline: `tests/fixtures/catalog-baseline.json`. Test: `python3 tests/site/test_categories.py`.

## Go deeper, Dance Party levels 5–8, 3D Printing, and teacher-only events
- **Go deeper** (`assets/js/data/deeper.js`, loaded after `imported.js`): every activity gets `a.deeper = { challenge, links }`.
  - The challenge is the activity's `extend` unless `CHALLENGE` overrides it. Links come from the `LINKS` library through `MAP`.
  - **Rules:** up to two links; https; an approved provider; `verified` date; `account: none|teacher|student`; never the activity's own launch.
  - **Fetch every new URL before adding it.** Leave out anything that won't load. Camera tools say "hands or objects, not faces".
  - **Rendering:** `deeperSection(a, user)` in `views-library.js` replaces "Take it further". Links open through `SE.modal` (Go / Stay here), log `deeper_opened {activityId, url, provider}`, and show a welcome-back line on `visibilitychange`.
  - The debrief's optional field is "Did you try Go deeper?" (`extensionNote`, which counts toward the Past the Breakwater patch).
  - Test: `node tests/tools/test_deeper.js [--list]` (`--list` prints every URL for the term re-check).
- **Robot Dance Party** (`lab-dance.js`) has chapters: Dance basics (1–4) and Go deeper (5–8, grades 4–6).
  - A program is a list of moves or repeats `{ repeat: 2–4, body: [≤4 moves] }`. `SE.dance.expand`, `blocks` (a repeat is 1 block plus its body), and `check(level, program)` are exposed.
  - Levels: 5 Repeat it (target plus a repeat), 6 Fix the bug (feedback names the first differing move), 7 Fewest blocks (5 or fewer), 8 Choreographer (12+ moves in 6 or fewer blocks; the win panel hands off to Loop Dance and `dance-crew.sb3`).
  - Runs are capped at 24 moves.
- **3D Printing:** `3d-buoy-charm`, `3d-trail-marker`, and `3d-fix-it-clip` in `activities.js`.
  - Each is grades 4–8, `time.core` [80, 90], equipment `printer3d`, supervised, Tinkercad Classes (class code and nickname), printer-agnostic STL steps, and print settings in the teacher notes.
  - Tinkercad facts came from school guides (October 22, 2026), so each record says to check them in Tinkercad before class.
  - The Maine Tech Sampler and Coast to Katahdin workshops include them as optional add-on steps.
  - Test: `python3 tests/site/test_3d_printing.py` (also covers the Go deeper punch-out).
- **Teacher-only events** (`teacher_confirmed`, `teacher_try_again`, `teacher_note`, reviews, stage and Moxie checks) count in `game.js` only with a teacher id (`e.by`).
  - `supabase/update-11-teacher-only-events.sql` makes `student_log` refuse them and `class_journey` count only teacher-written passes.
  - Any new teacher-only event type goes in both lists.
- **Sample class:** the sample teacher passes most work older than three days, so demos show real XP, ranks, and class points.
- **Planning docs from this round:** `planning/STUDENT_EXPERIENCE_AUDIT.md` (fixed and open findings, ranked) and `planning/STEM207_Growth_Plan.md` (the lifecycle, the content engine, and the three value adds: Skill Passport, Maine STEM at Work, Know It cards, all design only).

## Coding categories and progression (planning)
- Read `planning/CODING_CATEGORIES.md` before any work on coding categories, coding missions, or educator coding pathways.
- **Planning only by default.** The first pass inspects the repo and returns a plan (the six items listed in that file). Don't edit app code, create mission records, rename categories, write exercises, run migrations, or deploy until the user asks for implementation.
- Keep **Coding & Computer Science** as the top-level category. The proposed groups (Coding Foundations, Scratch & Block Coding, Game & Interactive Story, Python & Text Coding, Web Development, Robotics & Physical Computing) are browsing groups inside it.
- A category (browse) is not a pathway (sequence). Keep one canonical mission record and use references or tags for overlap. Store concept, tool/language, and category as separate metadata.
- Keep the seven-stage pathway, routes, readiness statements, and mission IDs. Category browsing sits alongside them.
- Map only reviewed content. Never show empty or draft groups as available curriculum. The candidate mappings in that file are unverified.
- Use `CS curriculum.pptx` only as a reference. Don't copy Skill Samurai branding, prices, age bands, or certification claims.
- Don't change AI, VR, Science & Discovery, Creative STEM, the Moxie pathway, or 3D Printing as part of coding-category work.
