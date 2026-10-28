# STEM 207: working notes for Claude

STEM learning site for grades 2–8, branded **STEM 207** (Maine theme), co-branded with STEM Coliseum. Mission, exact wording: **"Keep the humanity in technology."**
Live: https://mattjones1.github.io/stem_207/ (GitHub Pages from `main` of `mattjones1/stem_207`). **Pushing `main` deploys in about a minute.**

## Rules that always apply
- **The site is free.** A paid version is shelved on the `paid-site` branch (tag `paid-shelved-2026-10`). Don't bring paid code (access, tiers, locks, pricing, families) to `main` unless the user asks to resume it.
- **Children's privacy:** collect no student personal information. Students have a display name and picture codes only. Camera activities frame hands or objects, never faces.
- **Never sell to children:** no prices, ads, or donation asks on student screens. The "Support STEM 207" card is for grown-ups only.
- **Never put a secret in the repo.** `config.js` holds only the Supabase URL and the **publishable** key; never a `service_role` key.
- **Outside platforms:** verify facts against the official site before writing steps. Mark anything unverified "check before class" in `teacherNotes`. Don't build custom apps for outside-platform activities.
- **AI content:** label simulations as simulations, and present scores as model outputs, never guarantees.
- **Standards:** use only codes in `assets/js/data/standards.js`, and check any new code against the official CSTA or NGSS source first.
- **Wording in the UI:** say "Activity", never "mission"; never "expedition" or "pathway". A **Learning Plan** is an ordered set of activities for a class; a **Category** is one of the seven areas. Student steps speak to the student, not the teacher. Internal ids and event names (`mission_completed`) stay as they are.

## How to work
- Read the relevant code, tests, and the matching `docs/` file before changing behavior. Keep changes focused, and preserve unrelated work.
- Make the smallest complete change, update directly related docs, and run the narrowest relevant test. Report what changed and any check that couldn't run.
- Ask before a significant product or teaching-design choice the request doesn't settle. Decide copy, layout, and implementation details yourself.
- Prioritize learning: grade-appropriate language and real student choices. Check what students actually do, never a "Done" click.
- **SQL:** when a change needs `supabase/update-N-*.sql`, paste the full SQL in the reply; the user runs it in the Supabase SQL Editor.

## Where things are
- Static vanilla JS/CSS, no framework and no build step. Hash router in `assets/js/main.js`. Globals: `window.SE` (app) and `window.STEM` (data). Script order is set in `index.html`, and **every new JS file needs its own `<script>` tag there.**
- `assets/js/data/`: `activities.js` (the library), `pathway.js`, `areas.js` (categories, skills, equipment), `progression.js` (XP, ranks, patches), `templates.js`, `standards.js`, `moxie*.js`, `deeper.js`.
- `assets/js/store.js`: `SE.store`, with the same API in local mode (localStorage) and cloud mode (Supabase through `cloud.js`). `game.js`: the event log becomes a progress profile (`SE.game.profile`). `labs/`: in-site labs on the shared `lab-shell.js`.
- `supabase/schema.sql` plus `update-N-*.sql` for changes. `planning/` holds plans and audits. `missions/` holds Markdown teaching packs.

**Read the matching doc before working on:**

| Area | Doc |
|---|---|
| Activities, labs, the content linter, standards, simple words, Go deeper, the importer | `docs/content.md` |
| Student checks (Pass / Try again), XP, Home, class rewards | `docs/students.md` |
| Dashboard, classes, Learning Plans, templates, the shared modal | `docs/educators.md` |
| The Moxie ESP32 course | `docs/moxie.md` |
| Brand, Chromebook layout, wording, donations | `docs/site.md` (and `brand/BRAND.md` for brand work) |
| Coding categories (**planning only by default**) | `planning/CODING_CATEGORIES.md` |

When a change adds a field, route, rule, or test, update that doc in the same commit.

## Design rules (grades 2–8, Chromebooks)
- Short sentences, large controls (44px for main buttons, 24px minimum targets), buttons instead of dragging, keyboard access, and a visible focus outline. Never rely on color or sound alone. Support `prefers-reduced-motion`.
- The target device is a school Chromebook at about **1366×650** of page: every lab's stage and main button, and Home's Start button, stay on the first screen.
- `tests/site/test_a11y.py` (names, labels, ARIA, headings, contrast in light and dark, targets) stays at **0 findings**.
- Use the theme tokens (`var(--teal)`, `var(--surface)`, …). The Coliseum logo always sits on white and is never recolored.

## Run and test
- **Local:** `LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js`, then http://localhost:8767. Sample class code `MOOSE7` (Ava R.: pine, lighthouse, moon); educators use "Fill demo" on `#/signin/educator`.
- **Tests:** `tests/run.sh <files>` (it starts the servers and finds a Python with Playwright by itself), `tests/run.sh` (the quick set), and `tests/run.sh local` (everything, about 10–15 minutes). Run narrow tests while working, and the full local run once before pushing.
- `node tests/tools/test_content.js` must stay green: every activity has its full lesson shape (see `docs/content.md`).
- Lab tests must navigate away before revisiting the same `#/lab/...` hash, or the lab won't re-mount.
- `python3 tools/build_single_file.py` refreshes the offline copy (`dist/STEM 207.html`, not committed). Run it before pushing so the offline copy matches the site.

## Ship
`/ship` runs the routine. By hand: full local tests → `build_single_file.py` → commit on `main` with a message that says what changed and why → push (this deploys).
- The remote is `https://github.com/mattjones1/stem_207.git` (if it ever shows `stem_explorer`, `git remote set-url origin` with that URL).
