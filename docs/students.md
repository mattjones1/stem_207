# Students: checks, Home, and rewards

How students send work, how teachers check it, how XP and class rewards are earned, and what students see on Home. Read before changing student screens, XP, or the check flow.

## One check for every activity
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

## Student Home and My Learning Plans
- Home (`SE.views.today`, `#/`) is one column: greeting and rank chip (`.home-rank` → `#/me`), exactly one **Up next** card (`.upnext`, `#upnext-title`, with `#help-btn`), one "Waiting for your teacher" line (`.home-waiting`), the newest message (`.home-msg`, older ones in `details`), one class journey line (`SE.classJourneyLine`), and two buttons (`.home-actions`).
- `SE.home.upNext(user, prof)` picks the card: a Try again, then the next activity in a current plan (`SE.plans.progress`), then an older single assignment, then the student's own work in progress, then a suggestion. Its `kind` is `tryagain | plan | assigned | own | suggested`.
- My Learning Plans (`SE.views.myPlans`, `#/plans`, in `views-plans.js`): Current / All (`SE.store.planFinished`), plan cards, and an "Earlier assignments" card for old single assignments. `#/explore` redirects here.
- Me (`#/me`) has the rank ladder, patches, the full class journey with badges (`#class-journey`), creations, labs, and the log of what was sent (`#log-title`) with status chips.
- Messages: `SE.store.messagesFor / postMessage / deleteMessage` (table `class_messages`, `update-3`). Old assignment notes (`setAssignmentNote`) still show on the Up next card for an older single assignment.
- In cloud mode, students only load their own events; class totals come from `class_journey`.
- Tests: `python3 tests/site/test_today_pilot.py`, `python3 tests/site/test_batch9.py [local] [cloud|skip]`, and `test_plans.py`.

## Separate rewards
- **Personal rewards** (XP, ranks, patches, harbor) come from passes on any activity. **Class rewards:**
  - `P.classPoints.passed` (100) for each pass on class work: an assigned activity, or one in an assigned Learning Plan.
  - `P.classGoal` stops are in `pts`.
  - `P.classBadges`: First Haul is the first pass; All Hands is everyone passing class work; Pathfinders is everyone passing 3; Right on Tide is unchanged; Steady Crew is 10 passes.
- `SE.game.classCounts(classId)` → `{ students, passed, passedAll, withPassed, withThree, onTime }`; `journeyFrom(counts)` → `{ points, goal, badges }`.
  - `classJourney(classId)` uses `SE.store.journeyCounts(classId)` (the `class_journey(p_token)` RPC on a cloud student device) or counts locally.
  - Keep the JS and `supabase/update-8-class-journey-passes.sql` rules identical.
- Test: `python3 tests/site/test_batch10.py [local] [cloud|skip]` (cloud needs Postgres with update-8 + the mock on 8787).
