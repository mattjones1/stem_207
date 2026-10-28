# Moxie: the ESP32 physical computing course

Read before any Moxie work.

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
