# STEM 207: working notes for Claude

STEM learning site for grades 2–8, branded **STEM 207** (Maine theme). Mission, exact wording: **"Keep the humanity in technology."**
Live: https://mattjones1.github.io/stem_207/ (GitHub Pages from `main` of `mattjones1/stem_207`; pushes deploy in about a minute).

## Working with Claude Code
- Work in this repository and read the relevant code and tests before changing behavior. Keep changes focused and preserve unrelated work.
- Prioritize learning: use grade-appropriate language and meaningful student choices; check what students actually do rather than a completion click.
- Keep the experience accessible, privacy-preserving, and teacher-ready. Follow the classroom and design rules below.
- Make the smallest complete change, update directly related documentation, and run the narrowest relevant test. Report what changed and any checks that could not run.
- Ask before making a significant product or teaching-design choice that the request does not settle.

## Stack and layout
- Static vanilla JS/CSS. No build step and no framework. Hash router in `assets/js/main.js`. Globals are `window.SE` (app) and `window.STEM` (data).
- Script order is set in `index.html`. Any new JS file needs its own `<script>` tag there.
- `assets/js/data/`: `activities.js` (library), `pathway.js` (7 coding stages), `areas.js`, `progression.js` (XP, ranks, patches).
- `assets/js/store.js`: `SE.store`, with the same API in local mode (localStorage) and cloud mode (Supabase via `cloud.js`). `config.js` holds the Supabase URL and **publishable** key. Never add a secret or service_role key.
- `assets/js/game.js`: turns the event log into a progress profile with `SE.game.profile`.
- `assets/js/labs/`: in-site labs. `lab-shell.js` provides the shared layout, hints, win panel, and logging.
- `assets/js/base.js`: avatars and My harbor. Student choices are saved as `profile_custom` events.
- `missions/<area>/<slug>/`: Markdown teaching packs for missions that run on outside platforms (e.g. `missions/ai/secret-signals`).
- `supabase/schema.sql`: tables, RLS, and student RPCs. Incremental updates go in `supabase/update-N-*.sql`, which the user runs in the SQL Editor.

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

## Pilot mission fields (optional on any activity)
- `pilot: true` puts it in the teacher "Pilot missions" filters.
- `time: { prep, core: [min, max], verified }`: shown as student time and teacher prep, and used by the time filters. Keep `duration` (20/30/45) for XP. Set `verified: true` only after classroom timing.
- `stopAt` ("You're done when"), `check` (the "Show what you know" prompt; spoken, shown, or written), `stuck` (student-visible hints), `next` (activity id).
- Student home is **Home** (`SE.views.today`, route `#/`); see "Student Home and My Learning Plans" below.
- Pilot materials are in `pilot/` (rehearsal checklist, observation sheet). Test: `python3 tests/site/test_today_pilot.py`.

## One check for every activity (usability Stage 2)
- The student sends a reflection, which is the deliverable. The debrief needs `evidence: "written"` (non-empty) or `"show"` (show or tell the teacher). The teacher marks:
  - **Pass**: `teacher_confirmed` `{ activityId, how: oral|demo|work, note }`.
  - **Try again**: `teacher_try_again` `{ activityId, note }`. The note is required, and the activity reopens on the student's Home until they send it again.
- **XP comes only from a Pass:** `baseXp(activity)` (`P.xp.mission` plus the level bonus), plus `P.xp.newSector` for the first pass in a category.
  - Sending, lab levels, and old `ican_*` stage events earn nothing.
  - XP is recalculated from the log, so past work counts only if it was passed.
  - Patches count passes. Lab patches still count lab levels.
- `SE.game.statusFor` → `confirmed` "Passed" · `tryagain` "Try again" · `submitted` "Sent" · `started` "In progress" · `none` "Not started" (plus `legacy` for old one-click records).
  - `prof.completedIds` = passed; `prof.sentIds` = sent at least once; `prof.passes` = first passes with their XP.
- `#/teach/checks` (`SE.views.teachChecks`) is one queue across classes with Pass / Try again inline. `SE.teachChecksWaiting(user)` drives the badge in the top menu.
- `SE.checksGuide("teacher" | "student")` is the one "How checks work" guide: open on Checks, folded on every activity page. Keep it in step with the real flow.
- Tests: `python3 tests/site/test_batch8.py` (the check model) and `python3 tests/site/test_evidence.py [local] [cloud|skip]`.

## Learning-route fields and pages (Batch 5)
- `starter: { file, label, how }`: a downloadable starter project (built by `python3 tools/build_starters.py` into `assets/starters/`). `figure: "<key>"`: a drawn block picture from `FIGURES` in `views-library.js` (with a text version). `bridge: { from, text }`: "You've seen this idea before" link from a lab to a platform activity.
- `STEM.aiRoute` in `pathway.js` builds the "AI Learning Route" Learning Plan template (`tpl-ai-route`, not yet reviewed). The separate route and "Start here" pages are retired, and `#/pathway` and `#/ai-route` redirect (to the template for educators, `#/plans` for students, the category for guests). Test: `python3 tests/site/test_batch5.py`.

## Coding categories and progression (planning)
- Read `planning/CODING_CATEGORIES.md` before any work on coding categories, coding missions, or educator coding pathways.
- **Planning only by default.** The first pass inspects the repo and returns a plan (the six items listed in that file). Don't edit app code, create mission records, rename categories, write exercises, run migrations, or deploy until the user asks for implementation.
- Keep **Coding & Computer Science** as the top-level category. The proposed groups (Coding Foundations, Scratch & Block Coding, Game & Interactive Story, Python & Text Coding, Web Development, Robotics & Physical Computing) are browsing groups inside it.
- A category (browse) is not a pathway (sequence). Keep one canonical mission record and use references or tags for overlap. Store concept, tool/language, and category as separate metadata.
- Keep the seven-stage pathway, routes, readiness statements, and mission IDs. Category browsing sits alongside them.
- Map only reviewed content. Never show empty or draft groups as available curriculum. The candidate mappings in that file are unverified.
- Use `CS curriculum.pptx` only as a reference. Don't copy Skill Samurai branding, prices, age bands, or certification claims.
- Don't change AI, VR, Science & Discovery, Creative STEM, the Moxie pathway, or 3D Printing as part of coding-category work.

## Brand (co-branded with STEM Coliseum)
- STEM Coliseum and Learning Center is the parent; STEM 207, LLC is a program offered exclusively through it. Read `brand/BRAND.md` before any branding work. The parent guide and all its logo files are in `brand/coliseum/`.
- Every page: a white `.cobrand-bar` brand row (STEM 207 logo linking home, "powered by", and the Coliseum logo at 300px linking to https://stem-coliseum.odoo.com/ in a new tab), the navigation in `.site-header`, and the parent block in the footer. The sign-in card and certificates also show the Coliseum logo. The Coliseum logo always sits on white and is never recolored or redrawn.
- Palette: Dark Teal `#012d2b` (`--navy`, `--fg`), Teal `#03968f` (`--brand-teal`, large type and graphics), text teal `#037872` (`--teal`, small text and buttons, for 4.5:1 contrast), Green 2 `#94c93d` (`--orange`, CTAs). Fonts: Montserrat and Open Sans. The STEM 207 logo is STEM in Dark Teal and 207 in Green 2.
- Approved kit files (unchanged originals): `brand/logos/stem-207/` (logo, reverse, mark; SVG and PNG), `brand/logos/lockups/` ("powered by" lockups), `brand/colors/` (palette CSS and text). The old indigo/lime `brand/marketing-kit/` is retired (in git history).
- Marketing images show no people. AI-generated concept art is illustrative only, so never present it as real equipment or programs.

## Mission context and certificates (Batch 6)
- Activity fields: `why`, `realWorld`, `vocab: [{ term, def }]` render as "Why it matters" with key words (all 10 coding missions have them). `board: { title, lines, note }` shows a card students read in the mission block (Bug Hunt's buggy algorithm).
- `SE.certificate.open(info)` / `SE.certificate.button(info, label)` in `assets/js/certificate.js`: a printable certificate on white paper, co-branded with STEM Coliseum. `info = { award, course, detail, name, className, at }`. Use the display name and class name only. Pattern Machine Level 6 awards "Responsible AI Explorer" at 7 of 10 (`SE.patternMachine.scoreUses`, `PASS`).
- Test: `python3 tests/site/test_batch6.py`.

## Grades 6–8 track and Robot Chef (Batch 7)
- `track: "6-8"` marks a mission written for grades 6–8. Each pathway stage lists one (stage 6 also has `python-turtle-bridge`). `SE.game.recommendations` picks the student's own track first, then anything in their band. The pathway page tags them.
- `board.code: true` renders board lines as code (the Scratch → Python card).
- Robot Chef lab (`lab-chef.js`, `.rc-`): `SE.robotChef.run(stepIds)` → `{ ok, trace, bug: { index, kind: unclear|order|missing|end, need } }`.
- Starters: `tools/build_starters.py` also builds `dance-crew.sb3`. It rebuilds every starter; revert the unchanged ones (zip timestamps change).
- Tests: `python3 tests/labs/test_robot_chef.py`, `python3 tests/site/test_batch7.py`.

## Coding pathway → Coding Foundations template
- The seven stages in `STEM.pathway` (`pathway.js`) are data for the "Coding Foundations" Learning Plan template (`tpl-coding-foundations`). Each stage's first activity is required; the others are optional practice.
- The stage pages and "I can" checks are gone. `pathwayStage` on activities still orders and suggests them.
- On the Coding and AI category pages, educators get a link to the matching template.

## Student Home and My Learning Plans (usability Stage 5)
- Home (`SE.views.today`, `#/`) is one column: greeting and rank chip (`.home-rank` → `#/me`), exactly one **Up next** card (`.upnext`, `#upnext-title`, with `#help-btn`), one "Waiting for your teacher" line (`.home-waiting`), the newest message (`.home-msg`, older ones in `details`), one class journey line (`SE.classJourneyLine`), and two buttons (`.home-actions`).
- `SE.home.upNext(user, prof)` picks the card: a Try again, then the next activity in a current plan (`SE.plans.progress`), then an older single assignment, then the student's own work in progress, then a suggestion. Its `kind` is `tryagain | plan | assigned | own | suggested`.
- My Learning Plans (`SE.views.myPlans`, `#/plans`, in `views-plans.js`): Current / All (`SE.store.planFinished`), plan cards, and an "Earlier assignments" card for old single assignments. `#/explore` redirects here; the expedition page and star map on it are gone.
- Me (`#/me`) has the rank ladder, patches, the full class journey with badges (`#class-journey`), creations, labs, and the log of what was sent (`#log-title`) with status chips.
- Messages: `SE.store.messagesFor / postMessage / deleteMessage` (table `class_messages`, `update-3`). Old assignment notes (`setAssignmentNote`) still show on the Up next card for an older single assignment.
- In cloud mode, students only load their own events; class totals come from `class_journey` (Batch 10).
- Tests: `python3 tests/site/test_today_pilot.py`, `python3 tests/site/test_batch9.py [local] [cloud|skip]`, and `test_plans.py`.

## Separate rewards (Batch 10)
- **Personal rewards** (XP, ranks, patches, harbor) come from passes on any activity. **Class rewards:**
  - `P.classPoints.passed` (100) for each pass on class work: an assigned activity, or one in an assigned Learning Plan.
  - `P.classGoal` stops are in `pts`.
  - `P.classBadges`: First Haul is the first pass; All Hands is everyone passing class work; Pathfinders is everyone passing 3; Right on Tide is unchanged; Steady Crew is 10 passes.
- `SE.game.classCounts(classId)` → `{ students, passed, passedAll, withPassed, withThree, onTime }`; `journeyFrom(counts)` → `{ points, goal, badges }`.
  - `classJourney(classId)` uses `SE.store.journeyCounts(classId)` (the `class_journey(p_token)` RPC on a cloud student device) or counts locally.
  - Keep the JS and `supabase/update-8-class-journey-passes.sql` rules identical.
- Test: `python3 tests/site/test_batch10.py [local] [cloud|skip]` (cloud needs Postgres with update-8 + the mock on 8787).

## Moxie course (physical computing, pilot)
- **Plans:** `planning/MOXIE_PLAN.md`, `MOXIE_AUDIT.md`, and `MOXIE_VALIDATION.md`.
- **Data:** `assets/js/data/moxie.js` holds `STEM.moxie` and `STEM.moxieSessions` (`moxie-01` … `16`).
- **Views:** `assets/js/views-moxie.js` (`#/moxie`, `#/moxie/teach`). The activity view hands `a.moxie` records to `SE.views.moxieSession`.
- **Course material** comes from the 16 student sheets.
  - `python -I tools/import_moxie_sheets.py <folder> [--check]` writes `assets/js/data/moxie-content.js` (`STEM.moxieContent`, generated, loaded before `moxie.js`) and `assets/img/moxie/session-NN-{board,wiring}.png`.
  - `withSheet()` in `moxie.js` merges it onto each session: mission, need, setup, wiring `{head, rows}`, diagram (hand-written `ALT`, text version from the wiring table), concept, `planSheet`, code `{intro, lines, remember}`, tests, stuck, stretch and hint, think, checkoff, explain, signoffs, and `moxie.sheet` (the raw sheet for capstone pages and print).
  - Reuse permission was confirmed October 22, 2026 (validation item 12). **Never add answer keys:** the sheets' blanks stay blanks.
- **`pub`:** draft → review → hardware → pilot → published. All 16 are **pilot v1.0**.
  - Pilot sessions reach students only through an assigned Learning Plan (the **`tpl-moxie`** template has all 16 in 4 units). Pilot steps can be required.
  - `SE.moxie.readyToPublish(a, "pilot" | "publish")`: publishing to everyone also needs grades and minutes, which the pilot sets. Don't guess them.
- **The session page follows the sheet,** section by section with its headings: Name / Partner / Kit #, mission, what you need, before you wire, build (diagram, notes, table), how it works, plan, code, test, stuck, stretch, think, and the checkoff.
  - Code blanks: every run of `___` becomes an input (`SE.moxieCode.codeModel`), saved as `moxie_code {blanks}`. Students use Copy my code and Download .ino; blanks aren't graded on screen.
  - Lists save as `moxie_checklist {list: test|checkoff|present, items}`. Other student saves: `moxie_think`, `moxie_plan {lines, text}`, and `moxie_kit` (team).
  - **Print this sheet** builds a paper version from the same data (`printSheet`, `body.mx-printing`).
- **Sign-offs:** "Core challenge" is the teacher's Pass. The others are `moxie_gate`: `stretch` (sessions 1–12), `plan` (8), `wiring` (11), `design` (13), `subsystem` (14), `card` (15), `pitch` (16).
  - `#/moxie/teach` has a checkoff grid (students × sessions, with a ★ stretch toggle) and team review cards.
  - Checks show the student's blanks, Think about it, and checkoff list (`SE.moxie.checkDetails`).
- **Capstone (13–16)** follows the sheets.
  - **13:** the problem, three criteria with "how we will test", a parts and pin table (`designCheck` refuses pins 0, 2, 6–11, 12, and 15 and names the part), a sketch-on-paper box, and the code plan.
  - **14:** `moxie_standup` (sessions 14 and 15), `moxie_subsystem`, the bug log (what went wrong / what we tried / fixed), and `moxie_change`.
  - **15:** tests (Pass yes/no), cards, improve, the showcase card with 7 fields, and `moxie_pitch`.
  - **16:** the present checklist, cards, a 5-prompt reflection, and 4 "I can" ratings (1–3).
- **Feedback cards:** `moxie_feedback_card {toTeam, toNames, fromNames, session, star1, star2, wish}` go to another team in the class.
  - The receiving team reads them through `SE.store.feedbackCards`. Senders pick from `SE.store.classTeams`.
  - Cloud mode needs `supabase/update-12-moxie-feedback.sql` (`team_events` returns `cards` and `classTeams`).
- **Team-shared work** is `SE.store.TEAM_TYPES`: design, codecheck, buglog, test, feedback_got, improve, card, kit, standup, subsystem, change, and pitch. Plans, code, think, checklists, and reflections stay individual. Keep the SQL type list identical.
  - Teacher events: `moxie_gate {activityId, gate, ok}` and `moxie_rubric {activityId, dimension, note}`. There are no rubric scores.
- Tests: `python3 tests/site/test_moxie.py [local] [cloud|skip]` and `python3 tests/site/test_moxie_course.py`.

## Categories, content status, and import (categories-pathways Phase 2)
- Plan: `planning/STEM207_Categories_Pathways_Claude_Build_Plan.md` (the brief), `CATEGORIES_PATHWAYS_AUDIT.md`, and `CATEGORIES_PATHWAYS_BACKLOG.md`. Phases 3–5 (pathway builder, evidence, public story) are next.
- `SE.content` (`assets/js/content.js`) holds the rules: `isPublished` (missing `pub` = published), `version` (missing = "1"), `readiness` (ready / missing-resource / needs-review, separate from `pub`), `visibleTo`, `assignable`, and `draftsIn`.
  - Unpublished records go in `STEM.drafts`: they're in `SE.activityById`, never in `STEM.activities`.
  - The activity view sends anything not `visibleTo` the user to not-found.
- 3D Printing is the seventh area, **live since October 22, 2026** (the user asked for real exercises), with three Tinkercad activities (see "3D Printing" below). An area with `status: "coming-soon"` is left out of `SE.liveAreas`.
  - Use `SE.liveAreas` (not `STEM.areas`) for filters, the buoy hero, suggestions, and teacher area tabs. The category grid shows all areas. The buoy hero (`BUOYS`) and star map (`SECTORS`) have seven slots; add one before adding an eighth area.
  - Two placeholders (`3d-printing-exercise-04`, `-05` in `data/drafts-3d-printing.js`) stay generic and hidden. Replace one only with a complete, reviewed record.
- Optional mission fields: `alsoIn` (counted once, in the primary area), `skills` (from `STEM.skills`), and `delivery`.
  - Apply skill tags and delivery labels only after the proposals in audit section 6 are approved.
- Import: `node tools/import_missions.js <file.json> [--write] [--new-version]` writes `data/imported.js` (generated). Test: `node tests/tools/test_import_missions.js`.
  - `tests/run.sh` runs `.js` tests with Node.
- Baseline: `tests/fixtures/catalog-baseline.json`. Test: `python3 tests/site/test_categories.py`.

## Learning Plans (usability Stage 4)
- A **Learning Plan** is an ordered list of activities assigned to a whole class. Internally it's still a "pathway" (store API, tables from `update-6`).
- Views and rules live in `assets/js/views-plans.js`:
  - `#/teach/plans` (`SE.views.teachPlans`): Current / Finished toggle, drafts, templates, and a one-time banner that moves a class's old single assignments into a plan (`SE.plans.migrateLegacy`).
  - `#/teach/plans/new[/<activityId>]`, `/<templateId>` (preview + Use this template), `/<id>[/students|checks]` (tabs Activities, Students, Checks), and `/<id>/edit`.
  - Plan page actions: Edit, Assign to a class, **Update for students** (`SE.store.updatePlanForStudents`: publishes and moves every assigned class), Duplicate, Finish/Reopen (`archivePathway`).
  - `SE.planPicker(user, a)` ("Add to a Learning Plan") on educator activity pages. There's no per-activity assign anymore; `#/teach/missions` redirects to `#/teach/plans`.
  - Students: `SE.views.myPlan` (`#/plans/<assignmentId>`; `#/my/pathways/<id>` redirects) and `SE.views.myPlans` (`#/plans`). Home's Up next card reads plans through `SE.plans.progress`.
  - Pure rules: `SE.plans.stepsOf`, `totals`, `warnings` (advice only), `blockers`, `unpublished`, `progress` (passed of required, and the next activity), `template`.
- Step shape: `{ id, kind: "mission", activityId, required, note }`. `stepsOf` drops old synthesis steps and reads an old `bridge` as the note.
- Status: `SE.store.planStatus(p)` → draft · current (assigned) · finished (archived). `SE.store.planFinished(asg)` uses `asg.finished` from `student_state` (`supabase/update-10-plan-status.sql`) or the plan in local mode.
- Rules: a required activity must be published and have a resource (`blockers`). Grade fit, accounts, cost, and supervision are shown as advice, never bypassed.
- Templates are in `assets/js/data/templates.js`. Copies are the educator's own; never edit a template through a copy.
- The Phase 4 step-evidence events (`pathway_*`) stay in the log but aren't shown or counted.
- Test: `python3 tests/site/test_plans.py`.

## Educator QA round: modal, à la carte plans, workshops, dashboard, notes
- **Shared modal** (`SE.modal.open({ title, body, wide, onOpen(dlg), onClose })`, `SE.modal.close()` in `core.js`): a native `<dialog>` with a Dark Teal header. Esc, Close, or a backdrop click closes it, and focus returns to the opener. The router closes it on navigation. Use it only for quick tasks; full work stays on pages. Styles: `.modal`.
- **Quick tasks** (`views-teacher.js`, delegated clicks, any page): `data-add-students="<classId>"`, `data-message-class="<classId or empty>"`, `data-note-student="<studentId>"`. Also `SE.teachQuick.addStudents / message / note`.
  - **Add students:** paste names, one per line, with a live check (`SE.roster.checkNames(text, existing)` → `[{ name, ok, reason }]`: email/number, too long (24), already in class, listed twice). One grade band for the batch. Afterward it shows the new login cards with Print these cards (`body.modal-printing`). The inline add form is gone.
  - **Send a note:** `teacher_note { note }` (up to 200 characters) via `SE.store.teacherLog`. The student sees the newest one from the last 14 days on Home as **Just for you** (`.home-note`); all notes are on Me (`.notes-list`); `prof.notes` is newest first. No other student sees it. No SQL needed.
- **Dashboard** (`SE.views.teach`): a greeting band (`.dash-hello`), palette KPI tiles (`.kpi--green` Checks, `.kpi--teal` Classes, `.kpi--blue` plans; `--brand-blue` only for borders and icons), class cards with Add students and Message, and a side column with **Recent activity** (last 8 sent, passed, try again, help, and note events) and Needs a check-in with a Note button.
- **À la carte picker** in the plan editor: category tabs (`.pk-tab`, `data-pick-area`, `aria-pressed`, 3D Printing included) list **every** activity in the category. Search (`#pw-q`) looks across every category; grade (`#pw-fgrade`) and time (`#pw-ftime`) filter. "Your mix" (`#pw-mix`) counts activities per category. The plan list offers **Build your own** and **Start from a template**.
- **Workshops:** templates with `group: "workshop"`, `workshop: { format, sessions: [{ title, steps: [step numbers] }] }`, and `future: [text]` (content not ready yet; text only, never a step): `tpl-ws-sampler` (Maine Tech Sampler), `tpl-ws-robots` (Robots & Smart Machines), `tpl-ws-katahdin` (Coast to Katahdin Explorers). All `reviewed: false`. Copies keep `basedOn`, so a copied plan's page still shows the workshop format.
- 2.0 depth analysis: `planning/STEM207_2.0_Analysis.md`.
- Test: `python3 tests/site/test_educator_qa.py`.

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

## Classes and the Dashboard (usability Stage 3)
- `#/teach` (`SE.views.teach`) is the **Dashboard** for every class: quick actions, Checks waiting, your classes, current Learning Plans with progress (`planProgress`), and "Needs a check-in" (`attentionFor`). There's no per-class dropdown and no 14-day chart.
- `#/teach/classes` (`teachClasses`): class cards, Add a class, and Archived with Restore.
- `#/teach/classes/<id>` (`teachClassPage`):
  - rename, archive, and delete (only after typing the class name);
  - KPIs, roster, Learning Plans, check-ins, class journey, labs, messages, add a student, sign-in steps, login cards, and the live log.
  - The page header shows the class code (`frame(..., { code: true })`).
- Store:
  - `renameClass`, `archiveClass(id, on)`, and `deleteClass` (removes the students and their work).
  - `classesFor` returns active classes only; `archivedClassesFor` returns archived ones.
  - `classByCode`/`findClass` skip archived classes.
  - Cloud mode needs `supabase/update-9-classes.sql` (`classes.archived_at`, and `class_roster`/`student_sign_in` skip archived classes).
- After sign-up, a new educator lands on their class page.
- Test: `python3 tests/site/test_classes.py`.

## Wording
- Use these names everywhere:
  - An **Activity** is one thing a student does. Never "mission" in UI text. Internal ids, routes, and event names like `mission_completed` stay as they are.
  - A **Learning Plan** is an ordered set of activities assigned to a whole class.
  - A **Class** is a roster with a sign-in code.
  - A **Category** is one of the seven areas.
  - Never "expedition".
- Home (`#/`) is "Home" for students and guests and "Dashboard" for educators. Use `SE.homeLabel()`, which is the default for `SE.backLink`.
- Menus:
  - Educators: Dashboard · Learning Plans · Activities · Classes · Checks.
  - Students: Home · My Learning Plans · Activities · My harbor.
  - Guests: Home · Activities.
  - There's no Projector button.
- `#/activities` is the shared category view, and `#/activities/<category>` is one category.
- Old addresses redirect (`MOVED` in `main.js`): `#/library`, `#/area/<id>`, `#/explore`, `#/teach/pathways`, `#/teach/class`, `#/teach/reflections`, `#/teach/missions`, and `#/my/pathways/<id>`.
- Class rewards are the "class journey".

## Classroom and design rules
- Accessibility test: `python3 tests/site/test_a11y.py [--report]` checks names, labels, ARIA ids, aria-hidden focus, headings, contrast (light and dark), 24px targets, and lang/title on ~28 pages. Keep it at 0 findings. (axe-core can't be downloaded in this sandbox; this is the stand-in.)
- Grades 2–8: short sentences, large controls, buttons instead of dragging, keyboard access, and a visible focus outline. Never rely on color or sound alone.
- Collect no student personal information. Students have a display name and picture codes only. Camera activities frame hands or objects, never faces.
- External platforms: verify against official docs or the live site before writing steps, and mark anything unverified for the teacher. Don't build custom apps for external-platform missions.
- AI content: label simulations as simulations, and present scores as model outputs rather than guarantees.

## Chromebook target
- The target device is a school Chromebook at 1366×768, 100% scaling: about **1366×650** of page. Design and test there; other sizes must not break.
- Short-screen mode is `@media (max-height: 760px) and (min-width: 1000px)` in `styles.css` and `labs.css` (compact brand row, see `brand/BRAND.md`; tighter page tops; 5-column sign-in pictures; compact lab header and a sticky, scrolling brief). `SE.labs.shortScreen()` is the same test in JS.
- **Every lab:** at 1366×650 the stage and its main button (Run / Test / Check) are visible on load without scrolling. On short screens the lab shell scrolls the lab body under the menu after the route renders, through the one-time `SE.afterRoute({ fresh })` hook in `main.js`. Trim a tall stage with a `max-height` in the short-screen block.
- **Activity pages (students):** What you'll learn, Why it matters, and Before you begin are folded `<details>` after the first visit (`stem207.seen.<id>`), and a sticky `.act-bar` jumps to the launch or steps and to the debrief. Moxie sessions have the same bar.
- Route scrolls use `behavior: "instant"` (CSS smooth scrolling would animate them).
- Moxie on ChromeOS: the Cloud Editor doesn't list ESP32 boards, so students use Copy my code / Download .ino and the teacher uploads (validation item 16).
- Outside domains for school web filters: `node tools/list_domains.js --write` regenerates `planning/CHROMEBOOK_IT_ALLOWLIST.md`. Run it after adding launch or Go deeper links.
- Test: `python3 tests/site/test_chromebook.py`.

## Run and test
- Local mode: `LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js`, then open http://localhost:8767. The sample class code is `MOOSE7` (Ava R.: pine, lighthouse, moon). For an educator, use "Fill demo" on `#/signin/educator`.
- Cloud mock: Postgres plus `node tests/backend/mock-supabase.js` on port 8787 (see `tests/backend/README.md`).
- Lab tests (Playwright, Chromium preinstalled): `python3 tests/labs/test_<lab>.py [url]`. A test must not revisit the same `#/lab/...` hash without navigating away first, or the lab won't re-mount.
- **Test runner:** `tests/run.sh` (quick: Dance Party + Home + rewards), `tests/run.sh all` (every test, plus cloud checks when the test Postgres exists), `tests/run.sh local`, or `tests/run.sh <files>`. It starts and stops the mock servers and prints one line per test. Use it instead of hand-written loops.
- Effort guide: use a quick smoke check for drafts. Before pushing, run the tests the change touches plus the quick set.
- Single-file build: `python3 tools/build_single_file.py` writes `dist/STEM 207.html`. Run it before committing.

## Git
- Work on `main`, then commit and push. The push deploys the site.
- The remote is `https://github.com/mattjones1/stem_207.git` (if it ever shows `stem_explorer`, run `git remote set-url origin` with that URL).
