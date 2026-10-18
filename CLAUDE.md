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
   - Levels: `{ title, concept, goal, steps?, hints: [h1, h2] (progressive), learned }`.
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

## Classroom and design rules
- Grades 2–8: short sentences, large controls, buttons instead of dragging, keyboard access, and a visible focus outline. Never rely on color or sound alone.
- Collect no student personal information. Students have a display name and picture codes only. Camera activities frame hands or objects, never faces.
- External platforms: verify against official docs or the live site before writing steps, and mark anything unverified for the teacher. Don't build custom apps for external-platform missions.
- AI content: label simulations as simulations, and present scores as model outputs rather than guarantees.

## Run and test
- Local mode: `LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js`, then open http://localhost:8767. The sample class code is `MOOSE7` (Ava R.: pine, lighthouse, moon). For an educator, use "Fill demo" on `#/signin/educator`.
- Cloud mock: Postgres plus `node tests/backend/mock-supabase.js` on port 8787 (see `tests/backend/README.md`).
- Lab tests (Playwright, Chromium preinstalled): `python3 tests/labs/test_<lab>.py [url]`. A test must not revisit the same `#/lab/...` hash without navigating away first, or the lab won't re-mount.
- Effort guide: use a quick smoke check for drafts. Before pushing, run the full lab test plus `test_dance_party.py` as a regression.
- Single-file build: `python3 tools/build_single_file.py` writes `dist/STEM 207.html`. Run it before committing.

## Git
- Work on `main`, then commit and push. The push deploys the site.
- If the remote reports "repository moved", the remote is `https://github.com/mattjones1/stem_207.git`.
