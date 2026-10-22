# Categories and educator pathways: audit

October 21, 2026. Phase 1 of the brief in `planning/STEM207_Categories_Pathways_Claude_Build_Plan.md`. This audit comes from reading the repository: data files, views, store, Supabase SQL, and tests. **No application code changed in this phase.** Nothing here is a classroom or end-to-end resource test.

## 1. What the app is today (verified in code)

- **Stack:** static vanilla JS and CSS on GitHub Pages, with no build step. A hash router lives in `assets/js/main.js`. Data is `window.STEM`; the app is `window.SE`.
- **Storage:** one API (`SE.store`, `assets/js/store.js`) with two modes.
  - *Local:* localStorage, used for demos.
  - *Cloud:* Supabase, used when `assets/js/config.js` has a URL and key, which the live site has. Educators use Supabase Auth. Students sign in with picture codes through security-definer RPCs (`student_sign_in`, `student_state`, `student_log`). Row-level security limits educators to their own classes (`owns_class`).
  - So the sign-in copy ("saved in the school's database") is accurate for the live site. **Cross-school isolation** comes from RLS per educator; there's no school entity.
- **Progress is an event log** (the `events` table: type plus JSON data). XP, statuses, stages, and the class journey are all computed from it (`assets/js/game.js`).
- **Tests:** Playwright scripts in `tests/site/` and `tests/labs/`, plus a Postgres-backed Supabase stand-in (`tests/backend/mock-supabase.js`), run with `tests/run.sh`. This Windows machine has no Python, Playwright, or Postgres, so those tests can't run here. A Node harness that loads the app with a fake page does run.

## 2. Canonical mission inventory (matches the brief's live snapshot)

**53 published missions:** coding 23, VR 4, AI 8, engineering 7, science 6, creative 5. **11 are in-site labs.** 2 have a missing resource: `notice-and-wonder-360` and `stop-motion-studio`, both `launch.status: "coming-soon"`.

Every mission's route is `#/activity/<id>`. Labs also have `#/lab/<labId>/<level>`. "Min" is student time: `time.core` where it's set, otherwise `duration`. "Stage" is the coding pathway stage.

Not counted: 16 Moxie session drafts (`assets/js/data/moxie.js`), which only educators see.

### Coding & Computer Science (23)

| id | Title | Grades | Min | Readiness | Stage |
| --- | --- | --- | --- | --- | --- |
| `robot-maze-mission` | Robot Maze Mission | 2-3, 4-5 | 15–20 | external: Blockly Games | 1 |
| `event-party` | Click, Tap, Go! Event Party | 2-3, 4-5 | 15–20 | external: Scratch (MIT) | 2 |
| `loop-dance` | Loop Dance Choreographers | 2-3, 4-5 | 25–30 | external: Scratch (MIT) | 3 |
| `debug-animation` | Debug the Broken Animation | 4-5, 6-8 | 30 | external: Scratch (MIT) | 3 |
| `interactive-story` | Build an Interactive Story | 4-5, 6-8 | 45 | external: Scratch (MIT) | 4 |
| `score-keeper` | Score Keeper: Catch the Stars | 4-5, 6-8 | 45 | external: Scratch (MIT) | 5 |
| `my-blocks-patterns` | Pattern Studio with My Blocks | 4-5, 6-8 | 45 | external: Scratch (MIT) | 6 |
| `capstone-game` | Mission Capstone: Design Your Own Game | 4-5, 6-8 | 45 | external: Scratch (MIT) | 7 |
| `fix-the-recipe` | Bug Hunt: Fix the Sandwich Algorithm | 2-3, 4-5 | 20 | hands-on | 1 |
| `lab-robot-chef` | Robot Chef | 2-3, 4-5 | 15–20 | in-site lab | 1 |
| `sort-the-catch` | Sort the Catch: Race Two Algorithms | 6-8 | 25–30 | hands-on | 1 |
| `lighthouse-network` | Lighthouse Network: Broadcast Messages | 6-8 | 25–30 | external: Scratch (MIT) | 2 |
| `snowstorm-clones` | Snowstorm Simulator: Clones and Loops | 6-8 | 30–40 | external: Scratch (MIT) | 3 |
| `noreaster-alerts` | Nor'easter Alert Station: Compound Conditions | 6-8 | 25–35 | external: Scratch (MIT) | 4 |
| `catch-log-lists` | Catch Log: Lists and Averages | 6-8 | 30–40 | external: Scratch (MIT) | 5 |
| `snowflake-functions` | Snowflake Studio: Custom Blocks with Inputs | 6-8 | 35–45 | external: Scratch (MIT) | 6 |
| `capstone-studio` | Capstone Studio: Design, Playtest, Ship | 6-8 | 90–135 | external: Scratch (MIT) | 7 |
| `python-turtle-bridge` | From Blocks to Python: Turtle Patterns | 6-8 | 35–45 | external: Raspberry Pi Foundation | 6 |
| `lobster-trap-logic` | Lobster Trap Logic | 2-3, 4-5, 6-8 | 30 | hands-on | 4 |
| `lab-rover` | Harbor Code Lab | 2-3, 4-5, 6-8 | 45 | in-site lab |  |
| `lab-dance-party` | Robot Dance Party | 2-3, 4-5, 6-8 | 10–15 | in-site lab |  |
| `lab-space-blob` | Feed the Space Blob | 2-3, 4-5, 6-8 | 15–20 | in-site lab |  |
| `lab-moon-gate` | Moon Base Gatekeeper | 2-3, 4-5, 6-8 | 20 | in-site lab |  |

### Virtual Reality (4)

| id | Title | Grades | Min | Readiness | Stage |
| --- | --- | --- | --- | --- | --- |
| `ecosystem-field-trip` | Explore a Virtual Ecosystem | 2-3, 4-5, 6-8 | 45 | external: Google Earth |  |
| `notice-and-wonder-360` | 360° Notice & Wonder Challenge | 2-3, 4-5 | 30 | **missing resource** |  |
| `acadia-from-above` | Acadia from Above | 2-3, 4-5, 6-8 | 30 | external: Google Earth |  |
| `lab-field-station` | Field Station 360 | 2-3, 4-5, 6-8 | 45 | in-site lab |  |

### Artificial Intelligence (8)

| id | Title | Grades | Min | Readiness | Stage |
| --- | --- | --- | --- | --- | --- |
| `how-ai-sorts` | How Does an AI Sort? | 2-3, 4-5 | 15–20 | hands-on |  |
| `teachable-machine-classroom` | Train a Classroom Model | 4-5, 6-8 | 45 | external: Google Teachable Machine |  |
| `ai-secret-signals` | Teach the Computer Your Secret Signals | 2-3, 4-5, 6-8 | 45 | external: Google Teachable Machine |  |
| `ai-for-oceans` | Clean the Ocean with AI | 2-3, 4-5, 6-8 | 45 | external: Code.org |  |
| `ai-limits-detectives` | AI Detectives: When Is the Computer Wrong? | 6-8 | 30 | hands-on |  |
| `pattern-predictors` | Pattern Predictors | 2-3, 4-5, 6-8 | 10–20 | hands-on |  |
| `blueberry-sorter` | Blueberry Sorting Machine | 2-3, 4-5 | 30 | hands-on |  |
| `lab-pattern-machine` | Pattern Machine Lab | 4-5, 6-8 | 45 | in-site lab |  |

### Engineering & Robotics (7)

| id | Title | Grades | Min | Readiness | Stage |
| --- | --- | --- | --- | --- | --- |
| `paper-bridge` | Paper Bridge Challenge | 2-3, 4-5, 6-8 | 45 | hands-on |  |
| `sense-think-act` | Sense–Think–Act: Human Robot Game | 2-3, 4-5 | 20 | hands-on |  |
| `marble-run-iteration` | Marble Run Iteration Lab | 4-5, 6-8 | 45 | hands-on |  |
| `lighthouse-beam` | Lighthouse Beam Challenge | 2-3, 4-5, 6-8 | 45 | hands-on |  |
| `float-a-turbine` | Float a Wind Turbine | 6-8 | 45 | hands-on |  |
| `lab-launcher` | Pumpkin Launcher Lab | 4-5, 6-8 | 45 | in-site lab |  |
| `lab-line-follower` | Snowplow Robot Lab | 4-5, 6-8 | 30 | in-site lab |  |

### Science & Discovery (6)

| id | Title | Grades | Min | Readiness | Stage |
| --- | --- | --- | --- | --- | --- |
| `sink-or-float` | Sink or Float: Predict, Test, Explain | 2-3, 4-5 | 30 | hands-on |  |
| `paper-helicopter` | Paper Helicopter Investigation | 4-5, 6-8 | 45 | hands-on |  |
| `melting-race` | Ice Melt Race | 2-3, 4-5, 6-8 | 20 | hands-on |  |
| `tide-watchers` | Tide Watchers: Portland vs. Eastport | 4-5, 6-8 | 45 | hands-on |  |
| `sap-run-detectives` | Sap Run Detectives | 4-5, 6-8 | 30 | hands-on |  |
| `lab-ramp-racers` | Sled Hill Science | 4-5, 6-8 | 45 | in-site lab |  |

### Creative STEM (5)

| id | Title | Grades | Min | Readiness | Stage |
| --- | --- | --- | --- | --- | --- |
| `pixel-art-code` | Pixel Art Code | 2-3, 4-5 | 20 | hands-on |  |
| `animate-your-name` | Animate Your Initials | 2-3, 4-5, 6-8 | 30 | external: Scratch (MIT) |  |
| `stop-motion-studio` | Stop-Motion Story Studio | 2-3, 4-5, 6-8 | 45 | **missing resource** |  |
| `maine-postcard` | Animated Maine Postcard | 4-5, 6-8 | 45 | external: Scratch (MIT) |  |
| `lab-pixel-studio` | Pixel Animation Studio | 2-3, 4-5, 6-8 | 45 | in-site lab |  |

**Delivery mode vs. category.** All four VR missions currently run in a browser.

| Mission | What it actually is | Proposed `delivery` label |
| --- | --- | --- |
| `lab-field-station` | In-site 360° page; says "not an immersive headset experience" | Browser 360° (not headset VR) |
| `ecosystem-field-trip` | Google Earth; "a headset experience hasn't been chosen yet" | Browser (Google Earth); headset version not chosen |
| `acadia-from-above` | Google Earth | Browser (Google Earth) |
| `notice-and-wonder-360` | No resource chosen; teachers can use their own 360° media | Missing resource |

The VR category therefore has **no confirmed headset experience** today. The `vr` equipment tag on these records means "a headset is optional", which is easy to misread.

**Teacher prep time** is recorded (`time.prep`) only on the six pilot missions. A pathway preview can't add up prep reliably until more missions have it, so it must say "prep not recorded" rather than show 0.

## 3. Existing pieces to reuse

| Brief need | Already in the repo | File |
| --- | --- | --- |
| Data-driven categories | `STEM.areas`, `SE.areaById`; area pages, filters, and cards render from it | `assets/js/data/areas.js`, `assets/js/core.js` |
| Hide unready content | `launch.status: "coming-soon"` and `SE.hiddenForUser` | `assets/js/views-library.js` |
| Draft vs. published, content version | `pub` and `version` on Moxie records. Drafts sit in `SE.activityById` but not `STEM.activities`, so every list and count skips them | `assets/js/data/moxie.js`, `assets/js/core.js` |
| Block assigning drafts | `SE.store.assignable(a)` | `assets/js/store.js` |
| "Updated since" label | `versionNote` (work done on vN; current is vM) | `assets/js/views-moxie.js` |
| Curated sequence | `STEM.pathway` (7 stages, I-can checks) and `STEM.aiRoute` (6 steps) | `assets/js/data/pathway.js` |
| Cross-category sequence precedent | The coding pathway already links Creative and Engineering missions | `assets/js/data/pathway.js` |
| Assign to a class with instructions | `assignments` table, `SE.store.assign`, `setAssignmentNote`, due dates | `store.js`; `supabase/update-2`, `update-3` |
| Evidence and teacher check | Mission debrief (written, or show the teacher), `teacher_confirmed` / `teacher_try_again` with notes; Try again reopens on Today | `assets/js/views-student.js`; Batch 4 |
| Group work with individual reflection | `class_teams` and `team_events` (shared types vs. individual) | `supabase/update-5-moxie-teams.sql` |
| Completion ≠ launch | `launched` events never complete a mission; statuses are separate | `assets/js/game.js` (`statusFor`) |
| Student home | Today with My class / On my own | `assets/js/views-student.js` |
| Teacher Missions tab (assign by area, filters) | `SE.views.teachMissions` | `assets/js/views-teacher.js` |

## 4. Gaps against the brief (in dependency order)

1. **One content-status layer.** Today only Moxie has `pub` and `version`. Generalize it into `SE.content` (published, version, readiness, visible-to, assignable), with defaults so the 53 records need no edits. Keep editorial status (`pub`) separate from delivery readiness (ready, missing-resource, needs-review).
2. **Seventh category, 3D Printing.** Code that assumes six areas:
   - the expedition map (`art.js`: positions per area);
   - the homepage buoys and their label "Six lobster buoys…" (`views-library.js`);
   - "Six areas to explore" (`views-library.js`);
   - recommendations per area (`game.js`);
   - area counts and tabs (`views-teacher.js`).
   - Area patches in `progression.js` are per area and don't need a 3D one yet.
   - A new icon is needed in `core.js`.
3. **Five placeholders**, educator-only, with nothing to launch, assign, or count.
4. **Metadata:** `alsoIn` (secondary categories, with unique counts), `skills` (a controlled vocabulary), and `delivery`.
5. **Import route:** none exists. Missions are hand-edited in `activities.js`.
6. **Educator-authored pathways:** none exist. Assignments are per mission only, so new tables are needed.
7. **Pathway versions pinned to assignments.**
8. **Pathway evidence, synthesis, review and revision, and a portfolio view.**
9. **Public template previews and a homepage story.** The current hero is "From the coast to Katahdin, big ideas start here."

## 5. Supabase updates and rollback

| Update | Adds | Rollback |
| --- | --- | --- |
| `update-6-pathways.sql` | `pathways`, `pathway_versions` (immutable snapshots), `pathway_assignments`, with RLS by owner / `owns_class`. Redefines `student_state` to also return the class's assigned pathway snapshots (keeping everything update-3 returns) | Drop the three tables, then re-run `update-3-class-messages.sql` to restore the previous `student_state` |
| `update-7-pathway-teams.sql` (Phase 4) | Adds `pathway_artifact` to the shared types in `team_events` | Re-run `update-5-moxie-teams.sql` |

Each update is safe to re-run and is also folded into `schema.sql`. Until an update is run, the app falls back the same way Batch 9 did: features show a toast and nothing breaks.

**Regression plan:** `tests/fixtures/catalog-baseline.json` records every mission id, area, and route, plus the counts. After each phase, check that every baseline id and route still resolves and that counts are unchanged, except where the plan changes them deliberately. Then run the existing test suite on a machine that has Python, Playwright, and Postgres.

## 6. Curriculum decisions that need a person (not guessed approval)

### 6a. Proposed skill vocabulary and tags

Vocabulary: sequencing, debugging, events, loops, logic, data, functions, observation, fair-testing, design-iteration, training-data, responsible-use, encoding-art, communication.

The tags below come from each mission's own keywords, with obvious misreads corrected by hand. **They're proposals.** Approve or edit them before they go into `activities.js`.

| id | Title | Proposed skills |
| --- | --- | --- |
| `robot-maze-mission` | Robot Maze Mission | sequencing |
| `event-party` | Click, Tap, Go! Event Party | events |
| `loop-dance` | Loop Dance Choreographers | loops |
| `debug-animation` | Debug the Broken Animation | debugging, loops |
| `interactive-story` | Build an Interactive Story | logic, communication |
| `score-keeper` | Score Keeper: Catch the Stars | data |
| `my-blocks-patterns` | Pattern Studio with My Blocks | functions |
| `capstone-game` | Mission Capstone: Design Your Own Game | debugging, design-iteration, communication |
| `fix-the-recipe` | Bug Hunt: Fix the Sandwich Algorithm | sequencing, debugging |
| `lab-robot-chef` | Robot Chef | sequencing, debugging |
| `sort-the-catch` | Sort the Catch: Race Two Algorithms | sequencing |
| `lighthouse-network` | Lighthouse Network: Broadcast Messages | events |
| `snowstorm-clones` | Snowstorm Simulator: Clones and Loops | loops |
| `noreaster-alerts` | Nor'easter Alert Station: Compound Conditions | logic, design-iteration |
| `catch-log-lists` | Catch Log: Lists and Averages | loops, data |
| `snowflake-functions` | Snowflake Studio: Custom Blocks with Inputs | functions |
| `capstone-studio` | Capstone Studio: Design, Playtest, Ship | design-iteration, communication |
| `python-turtle-bridge` | From Blocks to Python: Turtle Patterns | loops, functions |
| `ecosystem-field-trip` | Explore a Virtual Ecosystem | observation |
| `notice-and-wonder-360` | 360° Notice & Wonder Challenge | observation |
| `how-ai-sorts` | How Does an AI Sort? | data, training-data |
| `teachable-machine-classroom` | Train a Classroom Model | training-data |
| `ai-secret-signals` | Teach the Computer Your Secret Signals | data, training-data |
| `ai-for-oceans` | Clean the Ocean with AI | data, training-data, responsible-use |
| `ai-limits-detectives` | AI Detectives: When Is the Computer Wrong? | responsible-use |
| `pattern-predictors` | Pattern Predictors | training-data |
| `paper-bridge` | Paper Bridge Challenge | data, design-iteration |
| `sense-think-act` | Sense–Think–Act: Human Robot Game | logic |
| `marble-run-iteration` | Marble Run Iteration Lab | data, design-iteration |
| `sink-or-float` | Sink or Float: Predict, Test, Explain | fair-testing |
| `paper-helicopter` | Paper Helicopter Investigation | data, fair-testing |
| `melting-race` | Ice Melt Race | observation, fair-testing |
| `pixel-art-code` | Pixel Art Code | data, encoding-art |
| `animate-your-name` | Animate Your Initials | encoding-art |
| `stop-motion-studio` | Stop-Motion Story Studio | encoding-art, communication |
| `lobster-trap-logic` | Lobster Trap Logic | sequencing, logic |
| `tide-watchers` | Tide Watchers: Portland vs. Eastport | data |
| `lighthouse-beam` | Lighthouse Beam Challenge | data, design-iteration |
| `float-a-turbine` | Float a Wind Turbine | design-iteration |
| `blueberry-sorter` | Blueberry Sorting Machine | data, training-data, responsible-use |
| `sap-run-detectives` | Sap Run Detectives | data |
| `acadia-from-above` | Acadia from Above | observation |
| `maine-postcard` | Animated Maine Postcard | encoding-art, communication |
| `lab-rover` | Harbor Code Lab | sequencing, debugging, loops, logic, data, functions |
| `lab-dance-party` | Robot Dance Party | sequencing, debugging |
| `lab-space-blob` | Feed the Space Blob | debugging, events, data |
| `lab-moon-gate` | Moon Base Gatekeeper | logic, debugging |
| `lab-field-station` | Field Station 360 | observation |
| `lab-pattern-machine` | Pattern Machine Lab | data, training-data, responsible-use |
| `lab-launcher` | Pumpkin Launcher Lab | data, fair-testing, design-iteration |
| `lab-line-follower` | Snowplow Robot Lab | debugging, logic |
| `lab-ramp-racers` | Sled Hill Science | data, fair-testing |
| `lab-pixel-studio` | Pixel Animation Studio | encoding-art |

### 6b. Seed pathway templates (proposals from the brief; review before teaching)

| Template | Steps (ids) | Student time | Notes from the records |
| --- | --- | --- | --- |
| Maine Coast Explorers (grades 6–8) | `lab-field-station` → `tide-watchers` → `lighthouse-beam` → `lighthouse-network` → `maine-postcard` → synthesis | 205–210 min plus 20–30 min synthesis | Matches the brief's total. `lighthouse-network` is 6–8 only. Optional readiness step: `event-party` (15–20 min). Equipment: computer or tablet, projector, building materials. No headset needed. |
| How Machines Make Decisions (grades 6–8) | `lab-moon-gate` → `lab-pattern-machine` → `ai-limits-detectives` → `interactive-story` → synthesis (a story in which a character checks a computer's recommendation) | 140 min plus synthesis | Pattern Machine Lab is long; the brief says to name a segment (for example, its levels) and a teacher estimate rather than inherit the whole lab's time |
| From Instructions to Invention (grades 2–5) | `fix-the-recipe` → `sense-think-act` → `pixel-art-code` → synthesis (revised instruction cards, a peer-decoded picture) | 60 min plus synthesis | Unplugged; no coding prerequisites or headset |
| Coding Foundations | The 7 stages of `STEM.pathway` (24 mission slots) | — | Seeded from the existing pathway. `#/pathway` and stage checks stay as they are |

**Approved on October 21, 2026.** Maine Coast Explorers uses the brief's evidence wording. The other templates use each mission's own check plus the brief's goal and final product. Templates are marked `reviewed: true` in `assets/js/data/templates.js`.

### 6c. Other decisions
- The delivery labels in section 2.
- Whether the `vr` equipment filter should be renamed "VR headset optional".
- The 3D Printing card text. The placeholder default is "Coming soon. No exercises yet."
