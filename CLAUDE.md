# STEM 207: working notes for Claude

STEM learning site for grades 2–8, branded **STEM 207** (Maine theme). Mission, exact wording: **"Keep the humanity in technology."**
Live: https://mattjones1.github.io/stem_207/ (GitHub Pages from `main` of `mattjones1/stem_207`; pushes deploy in about a minute).

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

## Brand
- Read `brand/BRAND.md` before any branding, marketing, or visual-identity work. The marketing kit (social posts, banner, flyer and partner templates, concept artwork) is in `brand/marketing-kit/`.
- The logo master is `assets/img/brand/stem207-logo.svg`, the same file as the kit's approved logo. Indigo `#302568` = `--navy`, lime `#8CC832` = `--orange`.
- Marketing images show no people. The kit artwork is AI-generated concept art, so never present it as real equipment or programs.

## Mission context and certificates (Batch 6)
- Activity fields: `why`, `realWorld`, `vocab: [{ term, def }]` render as "Why it matters" with key words (all 10 coding missions have them). `board: { title, lines, note }` shows a card students read in the mission block (Bug Hunt's buggy algorithm).
- `SE.certificate.open(info)` / `SE.certificate.button(info, label)` in `assets/js/certificate.js`: a printable certificate on warm paper. `info = { award, course, detail, name, className, at }`. Use the display name and class name only. Pattern Machine Level 6 awards "Responsible AI Explorer" at 7 of 10 (`SE.patternMachine.scoreUses`, `PASS`).
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

## Wording
- Home (#/) is "Today" for students, "Educator dashboard" for teachers, and "Home" for guests: use `SE.homeLabel()` (the default for `SE.backLink`). The browse page is "Missions" in the student nav and "Mission library" elsewhere. Class rewards are the "class journey" (never "class expedition").

## Classroom and design rules
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
