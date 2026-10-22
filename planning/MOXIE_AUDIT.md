# Moxie: repository and source audit

October 21, 2026. Phase A of `planning/MOXIE_PLAN.md`. This audit comes from reading the repository and opening the 16 source files. **Nothing here is an electrical check, a code compile, or a classroom trial.**

## Source register

The source files are kept outside the repo, in `OneDrive/Desktop/STEM_207/ESP32_Student_Sheets/Student_Sheets/`, and none are committed: the repo is public, and reuse permissions aren't confirmed yet. "Diagrams" counts the embedded images in each file. The word count is approximate.

| Session | Record | Source file | Diagrams | Words | Page kind |
| --- | --- | --- | --- | --- | --- |
| 1 | `moxie-01` | Session_01_Hello_ESP32.docx | 3 | ~570 | build |
| 2 | `moxie-02` | Session_02_Double_Blink.docx | 3 | ~620 | build |
| 3 | `moxie-03` | Session_03_Traffic_Light.docx | 3 | ~520 | build, pseudocode plan |
| 4 | `moxie-04` | Session_04_Fading_Color_Mixing.docx | 3 | ~600 | build |
| 5 | `moxie-05` | Session_05_I_Control_the_Lights.docx | 3 | ~640 | build |
| 6 | `moxie-06` | Session_06_Too_Many_Switches.docx | 3 | ~680 | build, truth-table plan |
| 7 | `moxie-07` | Session_07_Knobs_Numbers.docx | 3 | ~610 | build |
| 8 | `moxie-08` | Session_08_Smart_Crosswalk.docx | 3 | ~720 | build, pseudocode plan, plan gate |
| 9 | `moxie-09` | Session_09_Talking_Displays.docx | 3 | ~600 | build |
| 10 | `moxie-10` | Session_10_Stopwatch.docx | 3 | ~660 | build |
| 11 | `moxie-11` | Session_11_Parking_Assistant.docx | 3 | ~770 | build, wiring gate |
| 12 | `moxie-12` | Session_12_Making_Things_Move.docx | 3 | ~600 | build |
| 13 | `moxie-13` | Session_13_Capstone_Define_Design.docx | 2 | ~430 | design worksheet, design gate |
| 14 | `moxie-14` | Session_14_Capstone_Build_Sprint.docx | 2 | ~200 | build log, code checklist |
| 15 | `moxie-15` | Session_15_Capstone_Test_Improve.docx | 2 | ~280 | tests, feedback, improvement, showcase card |
| 16 | `moxie-16` | Session_16_Capstone_Showcase.docx | 2 | ~260 | checklist, reflection, self-rating, pitch gate |

Each source sheet has: a header (session, unit, credit line), Name / Partner / Kit # fields, Your mission, What you need, a build section with diagrams, Code it (a fill-in sketch with `____` blanks), test checks, a checkoff, and a stretch. Session 1 credits "the STEM Coliseum Arduino Introduction". Session 13 credits "TeachEngineering: An Arduino Warning System". Both need provenance and permission before anything goes public.

## What the repo already had (reused)

| Need | Existing piece | How Moxie uses it |
| --- | --- | --- |
| A curated route over canonical activities | `STEM.aiRoute` + `SE.views.aiRoute` + `#/ai-route` | The same pattern: `STEM.moxie.units` reference session ids, and `#/moxie` renders them |
| Hiding unready content | `SE.hiddenForUser` (coming-soon) | Not needed: draft sessions stay out of `STEM.activities` entirely, so every list and count skips them with no new filters |
| Progress statuses | `SE.game.statusFor` | Mapped to the brief's words: Not started, In progress, Ready for review, Verified (plus Try again) |
| Student explanation and teacher check | Mission debrief (`SE.views.debrief`), `teacher_confirmed` / `teacher_try_again` | Explain it on every session page |
| Assigning | `SE.store.assign`, global `[data-assign]` handler | Assign buttons on the session page and on Teach Moxie; the store refuses drafts |
| Evidence storage | `events` table (any type, JSON data) | New `moxie_*` types; no schema change for students' own work |
| Teacher timeline | `describe()` in `views-teacher.js` | Moxie events read as sentences (`SE.moxie.describe`) |
| Class journey, XP | `game.js` | Unchanged; a completed Moxie session counts like any mission once it's visible |

## Gaps that needed new work

- **Partners in cloud mode.** A student's device loads only that student's events, so a partner couldn't see shared capstone work. Added `class_teams` (teacher-only) and `team_events(p_token)`, which returns teammates' shared types only, in `supabase/update-5-moxie-teams.sql`.
- **Publication states and versions.** Activities had no draft state or content version. Moxie records carry `pub` and `version`; each student event saves `v`.
- **Gates.** There was no teacher "stop and check" step. Added `moxie_gate` events (wiring 11, plan 8, design 13, pitch 16).
- **Rubric feedback without scores.** Added `moxie_rubric` (dimension + note).
- **Session layout.** A new page in `views-moxie.js` with the brief's 8 sections, plus capstone variants.

## Not changed

- The six areas, the 7-stage coding pathway, `STEM.aiRoute`, and every existing mission id and route.
- 3D Printing: there is no 3D Printing area in the repo yet, and Moxie doesn't add or fill one.
- Coding categories (`planning/CODING_CATEGORIES.md`): Moxie is a pathway, not a category. A published session can later carry coding tags.

## Decisions still open (brief section 14)

Pilot audience and meeting length · exact board and kit · which evidence must be saved digitally · who approves content and owns versions · showcase visibility · reuse permissions for the source material.
