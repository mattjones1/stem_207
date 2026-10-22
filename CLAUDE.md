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
- Student home is the **Today** view (`SE.views.today`, route `#/`). `#/explore` is the expedition page (map, patches, class goal). `#/library` is the mission finder.
- Pilot materials are in `pilot/` (rehearsal checklist, observation sheet). Test: `python3 tests/site/test_today_pilot.py`.

## Completion statuses (Batch 4)
- `SE.game.statusFor(prof, activity)` → `confirmed` · `tryagain` · `checked` (lab core levels passed; `coreLevels` on the activity, else all) · `submitted` · `started` · `none`, plus `legacy` for old one-click records. All derived from the event log; no database change.
- Student debrief needs evidence: `evidence: "written"` (non-empty) or `"show"` (show or tell the teacher, no typing). Repeats add no XP. Base XP is flat (`P.xp.mission`); `teacher_confirmed` adds `P.xp.teacherConfirmed` once.
- Teachers record checks with `teacher_confirmed` `{ activityId, how: oral|demo|work, note }` or `teacher_try_again` `{ activityId, note }` (note required). Try again reopens the mission on the student's Today until they send it again.
- Test: `python3 tests/site/test_evidence.py [local] [cloud|skip]` (cloud needs Postgres + the mock on 8787).

## Learning-route fields and pages (Batch 5)
- `starter: { file, label, how }`: a downloadable starter project (built by `python3 tools/build_starters.py` into `assets/starters/`). `figure: "<key>"`: a drawn block picture from `FIGURES` in `views-library.js` (with a text version). `bridge: { from, text }`: "You've seen this idea before" link from a lab to a platform activity.
- `STEM.startHere` and `STEM.aiRoute` live in `pathway.js`. Pages: the pathway's "New to coding? Start here" and `#/ai-route`. Test: `python3 tests/site/test_batch5.py`.

## Coding categories and progression (planning)
- Read `planning/CODING_CATEGORIES.md` before any work on coding categories, coding missions, or educator coding pathways.
- **Planning only by default.** The first pass inspects the repo and returns a plan (the six items listed in that file). Don't edit app code, create mission records, rename categories, write exercises, run migrations, or deploy until the user asks for implementation.
- Keep **Coding & Computer Science** as the top-level category. The proposed groups (Coding Foundations, Scratch & Block Coding, Game & Interactive Story, Python & Text Coding, Web Development, Robotics & Physical Computing) are browsing groups inside it.
- A category (browse) is not a pathway (sequence). Keep one canonical mission record and use references or tags for overlap. Store concept, tool/language, and category as separate metadata.
- Keep the seven-stage pathway, routes, readiness statements, and mission IDs. Category browsing sits alongside them.
- Map only reviewed content. Never show empty or draft groups as available curriculum. The candidate mappings in that file are unverified.
- Use `CS curriculum.pptx` only as a reference. Don't copy Skill Samurai branding, prices, age bands, or certification claims.
- Don't change AI, VR, Science & Discovery, Creative STEM, the Moxie pathway, or the five 3D Printing placeholders.

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

## Educator pathway and checks guide (Batch 8)
- `#/teach/pathway` (tab "Coding pathway") renders `STEM.pathway` for teachers: class status per stage, inline Confirm / Not yet (`ican_verified` / `ican_returned`), `teach: { lookFor, misconception }` per stage, mission rows with assign + prep, and the readiness map. Educators opening `#/pathway` are sent there; `#/pathway/student` previews the student page.
- `SE.checksGuide("teacher" | "student")` in `views-library.js` is the "How checks work" guide. Keep it in step with the real flow if checks change.
- Test: `python3 tests/site/test_batch8.py`.

## My class / On my own, messages, instructions (Batch 9)
- Today (`SE.views.today`) has two sides: `.today-col--class` (messages, try-again, assigned missions with `note`, waiting checks) and `.today-col--own` (unassigned in-progress work, suggestions, links). Assigned missions never appear on the own side.
- `SE.store.messagesFor / postMessage / deleteMessage` (table `class_messages`) and `SE.store.setAssignmentNote` (`assignments.note`). Students get both through `student_state`. Needs `supabase/update-3-class-messages.sql`; before it runs, the app still works and posting a message shows a toast.
- In cloud mode, students only load their own events; class totals come from `class_journey` (Batch 10).
- Test: `python3 tests/site/test_batch9.py [local] [cloud|skip]` (cloud needs Postgres with update-3 + the mock on 8787).

## Separate rewards (Batch 10)
- Personal: XP, ranks, patches, harbor (unchanged; everything counts). Class: `P.classPoints` (assigned mission sent 100, mission confirmed 50, stage confirmed 100), `P.classGoal` stops in `pts`, and `P.classBadges`.
- `SE.game.classCounts(classId)` → counts; `journeyFrom(counts)` → `{ points, goal, badges }`; `classJourney(classId)` uses `SE.store.journeyCounts(classId)` (from the `class_journey(p_token)` RPC on a cloud student device) or counts locally. Keep the JS and `supabase/update-4-class-journey.sql` rules identical.
- UI: `SE.classJourneyBlock(journey, { compact })` on Today (class side), My expedition, and the teacher Overview; "My rewards" on Today's own side; the celebration shows "+100 class points" for a first send of an assigned mission.
- Test: `python3 tests/site/test_batch10.py [local] [cloud|skip]` (cloud needs Postgres with update-4 + the mock on 8787).

## Moxie pathway (physical computing, draft)
- Plan: `planning/MOXIE_PLAN.md`, `MOXIE_AUDIT.md`, `MOXIE_VALIDATION.md`. Data: `assets/js/data/moxie.js` (`STEM.moxie`, and `STEM.moxieSessions` `moxie-01`…`16`). Views and rules: `assets/js/views-moxie.js` (`#/moxie`, `#/moxie/teach`; the activity view hands `a.moxie` records to `SE.views.moxieSession`).
- **Outline edition.** The repo is public, so don't add lesson text, wiring, code, or the DOCX files until reuse permissions are signed off (validation item 12). **Never** commit answer keys. Grades and time stay null/"pending" until a pilot sets them.
- `pub`: draft → review → hardware → pilot → published. Only published sessions are in `STEM.activities`; every session is in `SE.activityById`. Educators see every state, and pilot sessions reach students only when assigned. `SE.store.assign` refuses anything earlier than pilot. `SE.moxie.readyToPublish(a)` must be empty before a pilot.
- Evidence uses `moxie_*` events with `v` (the content version). Partners share `SE.store.TEAM_TYPES` (design, codecheck, buglog, test, feedback_got, improve, card); plan, observe, and reflect stay individual. Teacher events: `moxie_gate {activityId, gate, ok}` and `moxie_rubric {activityId, dimension, note}`. There are no rubric scores.
- Teams: `SE.store.teamsFor / teamOf / teammates / teamEvents / saveTeam / deleteTeam`. In cloud mode, `class_teams` plus `team_events(p_token)` come from `supabase/update-5-moxie-teams.sql`, and its type list must match `TEAM_TYPES`.
- Test: `python3 tests/site/test_moxie.py [local] [cloud|skip]`.

## Wording
- Home (#/) is "Today" for students, "Educator dashboard" for teachers, and "Home" for guests: use `SE.homeLabel()` (the default for `SE.backLink`). The browse page is "Missions" in the student nav and "Mission library" elsewhere. Class rewards are the "class journey" (never "class expedition").

## Classroom and design rules
- Accessibility test: `python3 tests/site/test_a11y.py [--report]` checks names, labels, ARIA ids, aria-hidden focus, headings, contrast (light and dark), 24px targets, and lang/title on ~28 pages. Keep it at 0 findings. (axe-core can't be downloaded in this sandbox; this is the stand-in.)
- Grades 2–8: short sentences, large controls, buttons instead of dragging, keyboard access, and a visible focus outline. Never rely on color or sound alone.
- Collect no student personal information. Students have a display name and picture codes only. Camera activities frame hands or objects, never faces.
- External platforms: verify against official docs or the live site before writing steps, and mark anything unverified for the teacher. Don't build custom apps for external-platform missions.
- AI content: label simulations as simulations, and present scores as model outputs rather than guarantees.

## Run and test
- Local mode: `LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js`, then open http://localhost:8767. The sample class code is `MOOSE7` (Ava R.: pine, lighthouse, moon). For an educator, use "Fill demo" on `#/signin/educator`.
- Cloud mock: Postgres plus `node tests/backend/mock-supabase.js` on port 8787 (see `tests/backend/README.md`).
- Lab tests (Playwright, Chromium preinstalled): `python3 tests/labs/test_<lab>.py [url]`. A test must not revisit the same `#/lab/...` hash without navigating away first, or the lab won't re-mount.
- **Test runner:** `tests/run.sh` (quick: Dance Party + Today + rewards), `tests/run.sh all` (every test, plus cloud checks when the test Postgres exists), `tests/run.sh local`, or `tests/run.sh <files>`. It starts and stops the mock servers and prints one line per test. Use it instead of hand-written loops.
- Effort guide: use a quick smoke check for drafts. Before pushing, run the tests the change touches plus the quick set.
- Single-file build: `python3 tools/build_single_file.py` writes `dist/STEM 207.html`. Run it before committing.

## Git
- Work on `main`, then commit and push. The push deploys the site.
- The remote is `https://github.com/mattjones1/stem_207.git` (if it ever shows `stem_explorer`, run `git remote set-url origin` with that URL).
