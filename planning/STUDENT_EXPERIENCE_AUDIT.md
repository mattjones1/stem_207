# STEM 207 student experience: attention-to-detail audit

*October 22, 2026. Written for the STEM 207 team. It covers every student screen at phone width (390 px) and desktop (1366 px).*

## How it was checked
A scripted walk signed in as the sample student and visited every student screen:
- **Sign-in:** a wrong class code, a wrong picture, and the right pictures.
- **Main pages:** Home, My Learning Plans, Activities, every category, and activity pages from five categories.
- **Labs:** three labs, including all eight Robot Dance Party levels.
- **The send loop:** the debrief (empty, then written) and the celebration.
- **Other pages:** Me, My harbor, and not-found.

On every screen it measured sideways scroll and console errors and captured the full text. The accessibility test (names, labels, headings, contrast in light and dark, 24 px targets) ran across 30+ pages, including each dialog while open.

**Result:**
- No screen scrolls sideways, and no screen has a script error.
- The accessibility test stays at 0 findings.
- The issues below are about trust, clarity, and polish.

**Ranks:** **P1** blocks or confuses, or would embarrass us in a demo. **P2** is polish students will notice. **P3** is nice to have.

## Fixed in this round

| # | Rank | What was wrong | Fix |
|---|---|---|---|
| F1 | P1 (integrity) | A student device could write teacher-only events (a Pass, a Try again, a teacher note) through `student_log`. A student could pass their own work and earn XP and class points. | `game.js` ignores teacher-only events that don't carry a teacher id. `supabase/update-11-teacher-only-events.sql` makes `student_log` refuse them, and `class_journey` counts only teacher-written passes. **Run update 11 before this is live.** |
| F2 | P1 | Adding a seventh live category would have crashed the sign-in page's star map and the guest home's buoy picture. Both had six fixed slots. | A seventh slot in each, plus guards so an eighth category can't crash them. |
| F3 | P1 (demo) | Since XP moved to teacher passes, every sample student showed 0 XP and Deckhand, and the class journey sat at 0. Demos looked empty. | The sample teacher now passes most work older than three days. Recent work still waits for a check. |
| F4 | P2 | Activity pages showed students the teacher's setup list ("Make 20 lobster cards…", "Write the rules on the board"). | Setup is hidden for students. "Prerequisites" reads "Good to know first". |
| F5 | P2 | "Before you launch" used teacher language for students ("Students can work with light guidance", "Teacher supervision"). | Student wording: "You can do this on your own or with a partner" and "An adult helps with this one". |
| F6 | P2 | Leftover words: category pages said "N missions"; category cards said "complete" where they mean passed; My harbor said "Finish N activities" (it counts passes); a patch still said "Take it further"; the related section was called "Explore the lab". | All reworded: "activities", "passed", "Pass N activities", "Go deeper", "More activities like this". |
| F7 | P2 | "Take it further" sat at the bottom of the debrief, repeating text the student had already passed. | Replaced by the **Go deeper** section, with one optional question in the debrief. |
| F8 | P3 | The not-found page had no page title (screen readers and browser tabs just said "STEM 207"). | "Page not found · STEM 207". |
| F9 | P3 | On phones, Robot Dance Party's repeat count controls wrapped apart. | They stay together. |

## Still open (ranked)

### P1: confuses students
1. **Activity pages are too long for a student on a phone.** Lobster Trap Logic is roughly 4,000 px of text before "Send it". The page includes: the mission, why it matters, key words, materials, steps, the launch, Go deeper, how checks work, the debrief, the aside, and more activities. A grade 4 student loses the thread.
   **Suggested fix:** a student "focus" layout:
   - the steps first, with a sticky bottom bar (Start / Send it);
   - Why it matters and Key words folded;
   - the aside facts folded into one line.

   This is the single biggest student-experience improvement left.
2. **Reading level for grades 2–3.** Many activity texts read at grade 5–7 (long sentences and terms like "carapace" and "consistent").
   **Suggested fix:**
   - a **Read it to me** button (browser speech, no account, no data sent);
   - a short "simple words" version of `mission` and `steps` for activities tagged 2–3.

### P2: polish students will notice
3. **The phone menu wraps to two rows**, with an icon-only sign-out. Suggested: a compact menu button under 480 px, or shorter labels ("Plans").
4. **Activities marked "Resource coming soon"** (360° Notice & Wonder, Stop-Motion Story Studio) open for students by link and still say "Worth 150 XP". Suggested: show "Not ready yet. Your teacher will tell you when." and hide the XP line.
5. **XP shows before any work.** Cards say "+150 XP" and pages say "Worth 150 XP", but XP comes only when the teacher passes the work. Suggested: "150 XP when your teacher passes it", or move XP below the steps. (It matters for confidence: the reward should follow the learning.)
6. **The step list repeats the number** (a "1" badge, then "Step 1:"). Keep one.
7. **Me is long**, and the log of what you sent is at the very bottom. Suggested: tabs or jump links (Rank · Patches · Class · Sent).
8. **No due dates on Learning Plans,** so students can't see "this week" vs. "later". (Roadmap item in the 2.0 analysis.)

### P3: nice to have
9. **Picture sign-in has no audio** for pre-readers: name the picture aloud on tap.
10. **The Go deeper label says "Grades 4–6 and up"** even on activities only for grades 2–3. Suggested: "Ready for more?"
11. **The celebration after sending** could show which plan the activity belongs to and what's next in it.
12. **Empty states** (no messages, no plans) are correct but plain. A small illustration and one next step would help.

## Themes that affect growth
- **Trust:** F1 shows that every new teacher-only feature needs a server-side check, not just a UI check. Add it to the review checklist.
- **Demo readiness:** sample data must look like a real class at week three (F3). Funders and principals judge from the sample.
- **Student voice:** the copy is mostly warm and clear. The leftovers were all in older, lesser-used corners, which argues for a wording linter in CI that flags "mission", "expedition", and "complete" in UI strings.
