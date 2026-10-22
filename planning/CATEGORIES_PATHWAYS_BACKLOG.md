# Categories and educator pathways: backlog

Small tasks in dependency order. The brief is `planning/STEM207_Categories_Pathways_Claude_Build_Plan.md` and the audit is `planning/CATEGORIES_PATHWAYS_AUDIT.md`. Each phase is checked before the next one starts, and pushing to `main` deploys the site.

**Decisions so far:**
- Missions stay in the repo, and there's no in-browser mission editor.
- Any signed-in educator counts as a content editor.
- When a mission changes after a pathway is assigned, students see the current mission with an "updated since assigned" note.

**Needed from a person before the task that uses it:** see audit section 6.
- Skill tags are needed for C5.
- Template evidence prompts are needed for P3.
- Delivery labels are needed for C5.

## Phase 2: Content foundation

**Status (October 21, 2026):** C1–C4, C6, and C7 are done. C5 is done as display support only (fields, chips, facts, and the "Also fits here" listing): no skill tags or delivery labels are applied yet, pending approval of audit 6a and 6c. Checks: the import tool tests pass (18 of 18), and so does a Node harness that loads the app with a fake page (88 checks, or 90 with an imported mission). `tests/site/test_categories.py` and the a11y pages are written but not run here (no Python or Playwright on this machine).

| # | Task | Depends on | Files | Done when |
| --- | --- | --- | --- | --- |
| C1 | `SE.content`: `isPublished` (missing `pub` = published), `version` (missing = "1"), `readiness` (ready / missing-resource / needs-review), `visibleTo(a, user)`, `assignable(a)`. `STEM.drafts` collects unpublished records. Move Moxie onto it | — | new `assets/js/content.js`, `core.js`, `store.js`, `data/moxie.js`, `views-moxie.js`, `index.html` | All 53 missions are published at v1. The Moxie harness checks still pass. `SE.store.assignable` uses `SE.content` |
| C2 | 3D Printing area: `status: "coming-soon"`, a `cube` icon, and `SE.liveAreas` | C1 | `areas.js`, `core.js` | `STEM.areas.length === 7`. Ids of the existing six are unchanged |
| C3 | Replace the six-area assumptions with `SE.liveAreas`, and show a Coming soon card | C2 | `art.js`, `views-library.js` (buoys, aria-label, "Six areas" copy, category grid), `game.js`, `views-teacher.js` | The homepage shows 7 categories, with 3D Printing as "Coming soon · 0 missions". The expedition map, recommendations, and teacher counts are unchanged for the six |
| C4 | Five placeholders `3d-printing-exercise-01`…`05`, titled "Exercise N — placeholder", with every content field empty and `pub: "draft"`. A duplicate-id guard | C1, C2 | new `assets/js/data/drafts-3d-printing.js`, `index.html` | Educators see 5 drafts on `#/area/3d-printing`. Students and guests see 0 and get not-found on the draft routes. Library total stays 53. Placeholders can't be assigned and earn no XP |
| C5 | Optional metadata: `alsoIn`, `skills` (vocabulary `STEM.skills`), `delivery` (chip on cards and the activity page). Apply only the approved tags and labels | C1, audit 6a and 6c approved | `areas.js`, `activities.js`, `views-library.js` | Field Station 360 shows "Browser 360° (not headset VR)". A mission with `alsoIn` shows under the second area but counts once in the library total |
| C6 | Import tool `tools/import_missions.js` (Node). Dry run by default, `--write` to save. Validates fields, areas, https URLs, and allowed values. Sanitizes text, keeps attribution, upserts by id into `assets/js/data/imported.js`. Rejects duplicates and changes to a published mission unless `--new-version`. Prints a report | C1 | new tool, new `imported.js` (empty to start), `index.html`, `README.md` | Fixture runs reject a duplicate id, a bad URL, an unknown area, and an unflagged change to a published mission. A valid new mission imports and renders at `#/activity/<id>` with no new view code |
| C7 | Tests for the content layer: harness checks, plus `tests/site/test_categories.py` (local) and a11y pages `#/area/3d-printing` | C1–C6 | tests | The harness passes. The Playwright tests are written to repo conventions and run on a machine that has Python |

## Phase 3: Pathway builder

**Status (October 21, 2026):** P1–P6 are done. The template prompts were approved on October 21, 2026: Maine Coast Explorers uses the brief's wording, and the other templates use each mission's own check plus the brief's goal and final product. The Node harness passes (119 checks). `tests/site/test_pathways.py` (local and cloud) and the a11y pages are written but not run here. `update-6-pathways.sql` hasn't been run on a real database yet. Students see assigned pathways in Phase 4.

| # | Task | Depends on | Files | Done when |
| --- | --- | --- | --- | --- |
| P1 | `supabase/update-6-pathways.sql`: `pathways`, `pathway_versions`, `pathway_assignments`, RLS, and `student_state` plus `pathways`. Fold it into `schema.sql` | — | SQL | Re-runnable. An educator can't read another educator's pathways. A student gets only their class's assigned snapshots |
| P2 | Store API (local and cloud): `pathwaysFor`, `savePathway`, `publishPathway` (snapshot plus version++), `duplicatePathway`, `archivePathway`, `assignPathway(classId, id)` (pins the version), `pathwayAssignmentsFor` | P1 | `store.js` | The same API works in both modes. Before update-6 is run, the app shows a toast and nothing breaks |
| P3 | Templates in `assets/js/data/templates.js`: Coding Foundations (from `STEM.pathway`), Maine Coast Explorers, How Machines Make Decisions, From Instructions to Invention. Each has `reviewed: false` | audit 6b | new data file | The templates render as "Proposed: review before teaching" |
| P4 | Pure rules `SE.pathways`: `totals(steps)` (time range, prep or "not recorded", equipment, multi-session flag), `warnings(steps, audience)` (grades, prerequisites, readiness), `publishBlockers(steps)` (required step that's a draft, coming-soon, or has a missing resource), `staleSteps(snapshot)` (mission version moved on) | C1 | new `assets/js/views-pathways.js` | Unit checks in the harness |
| P5 | Educator UI: `#/teach/pathways` (mine and templates), `/new`, `/<id>/edit` (goal, final product, audience, library search across categories, synthesis step, Move up/down plus drag, bridge, required/optional, evidence, adaptation, live preview), and Publish, Duplicate, Archive, Assign. Add a Pathways tab in the teacher nav | P2–P4 | `views-pathways.js`, `views-teacher.js` (tab), `main.js`, `styles.css` | An educator combines 3 or more categories, publishes, and assigns. Keyboard-only reordering works. Publish is blocked with a reason |
| P6 | Tests: `tests/site/test_pathways.py` (local and cloud) and a11y pages | P5 | tests, `run.sh` | Editing one pathway never changes a mission, a template, or another educator's pathway |

## Phase 4: Assignment, evidence, portfolio

| # | Task | Depends on | Files | Done when |
| --- | --- | --- | --- | --- |
| E1 | Student pathway page `#/my/pathways/<assignmentId>`: goal, steps with status (`statusFor`), bridges, evidence prompts, start/resume, and the synthesis. A Today card on the class side | P5 | `views-pathways.js`, `views-student.js` | A student sees only their class's assignments, and resume lands on the first unfinished step |
| E2 | Events `pathway_evidence` (text, show, or observation) and `pathway_synthesis`, each with `assignmentId`, `stepId`, `v`. Mission steps keep the debrief | E1 | `views-pathways.js` | A launch never counts as evidence |
| E3 | Group artifacts: `pathway_artifact` in `TEAM_TYPES`, plus `supabase/update-7-pathway-teams.sql` | E2 | `store.js`, SQL | Partners see the shared artifact. Reflections stay private |
| E4 | Teacher review `/review`: a students-by-steps grid, `pathway_review` (accepted or revise, criteria, note), revise reopens on Today, a portfolio view per student, and "Accept new version" for stale steps | E2 | `views-pathways.js`, `views-student.js` | Teachers can't review another teacher's class (cloud test). Participation, submission, completion, and demonstrated skill show separately |

## Phase 5: Tell the story

| # | Task | Depends on | Files | Done when |
| --- | --- | --- | --- | --- |
| S1 | Hero "Small missions. Bigger discoveries." with the brief's supporting copy. Explore missions and See a sample pathway; Build a pathway for educators only | P3 | `views-library.js` | No button points to something that doesn't work |
| S2 | Public template previews `#/pathways`, `#/pathways/<id>` (guests allowed). "Use this template" asks the visitor to sign in as an educator | P3, P5 | `views-pathways.js`, `main.js` | Guests see no private data |
| S3 | Homepage story section and a demonstration portfolio labeled "Example" | S1, S2 | `views-library.js` | No invented students, outcomes, or testimonials. Mobile, keyboard, and a11y checks pass |

## Deferred (per the brief)
AI-generated pathways, community publishing, marketplaces, branching, automatic mastery decisions, new badges, a school entity, artifact file uploads (Supabase Storage), and sharing templates across schools.
