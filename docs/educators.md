# Educators: Dashboard, classes, and Learning Plans

The teacher side. Read before changing the Dashboard, classes, Learning Plans, templates, or the quick-task dialogs.

## Classes and the Dashboard
- `#/teach` (`SE.views.teach`) is the **Dashboard** for every class: quick actions, Checks waiting, your classes, current Learning Plans with progress (`planProgress`), and "Needs a check-in" (`attentionFor`). There's no per-class dropdown and no 14-day chart.
- `#/teach/classes` (`teachClasses`): class cards, Add a class, and Archived with Restore.
- `#/teach/classes/<id>` (`teachClassPage`):
  - rename, archive, and delete (only after typing the class name);
  - KPIs, roster, Learning Plans, check-ins, class journey, labs, messages, add a student, sign-in steps, login cards, and the live log.
  - The page header shows the class code (`frame(..., { code: true })`).
- Store:
  - `renameClass`, `archiveClass(id, on)`, and `deleteClass` (removes the students and their work).
  - `classesFor` returns active classes only; `archivedClassesFor` returns archived ones.
  - `classByCode`/`findClass` skip archived classes.
  - Cloud mode needs `supabase/update-9-classes.sql` (`classes.archived_at`, and `class_roster`/`student_sign_in` skip archived classes).
- After sign-up, a new educator lands on their class page.
- Test: `python3 tests/site/test_classes.py`.

## Learning Plans
- A **Learning Plan** is an ordered list of activities assigned to a whole class. Internally it's still a "pathway" (store API, tables from `update-6`).
- Views and rules live in `assets/js/views-plans.js`:
  - `#/teach/plans` (`SE.views.teachPlans`): Current / Finished toggle, drafts, templates, and a one-time banner that moves a class's old single assignments into a plan (`SE.plans.migrateLegacy`).
  - `#/teach/plans/new[/<activityId>]`, `/<templateId>` (preview + Use this template), `/<id>[/students|checks]` (tabs Activities, Students, Checks), and `/<id>/edit`.
  - Plan page actions: Edit, Assign to a class, **Update for students** (`SE.store.updatePlanForStudents`: publishes and moves every assigned class), Duplicate, Finish/Reopen (`archivePathway`).
  - `SE.planPicker(user, a)` ("Add to a Learning Plan") on educator activity pages. There's no per-activity assign anymore; `#/teach/missions` redirects to `#/teach/plans`.
  - Students: `SE.views.myPlan` (`#/plans/<assignmentId>`; `#/my/pathways/<id>` redirects) and `SE.views.myPlans` (`#/plans`). Home's Up next card reads plans through `SE.plans.progress`.
  - Pure rules: `SE.plans.stepsOf`, `totals`, `warnings` (advice only), `blockers`, `unpublished`, `progress` (passed of required, and the next activity), `template`.
- Step shape: `{ id, kind: "mission", activityId, required, note }`. `stepsOf` drops old synthesis steps and reads an old `bridge` as the note.
- Status: `SE.store.planStatus(p)` → draft · current (assigned) · finished (archived). `SE.store.planFinished(asg)` uses `asg.finished` from `student_state` (`supabase/update-10-plan-status.sql`) or the plan in local mode.
- Rules: a required activity must be published and have a resource (`blockers`). Grade fit, accounts, cost, and supervision are shown as advice, never bypassed.
- Templates are in `assets/js/data/templates.js`. Copies are the educator's own; never edit a template through a copy.
- The Phase 4 step-evidence events (`pathway_*`) stay in the log but aren't shown or counted.
- "New Learning Plan" reopens the educator's blank draft (untitled, no activities, never edited) instead of making another (`isBlank`), so drafts never pile up. Plan, template, and editor pages use the plan's title as the h1. An activity with no time yet (Moxie) shows "Time pending" and is left out of plan totals.
- Test: `python3 tests/site/test_plans.py`.

## Educator QA round: modal, à la carte plans, workshops, dashboard, notes
- **Shared modal** (`SE.modal.open({ title, body, wide, onOpen(dlg), onClose })`, `SE.modal.close()` in `core.js`): a native `<dialog>` with a Dark Teal header. Esc, Close, or a backdrop click closes it, and focus returns to the opener. The router closes it on navigation. Use it only for quick tasks; full work stays on pages. Styles: `.modal`.
- **Quick tasks** (`views-teacher.js`, delegated clicks, any page): `data-add-students="<classId>"`, `data-message-class="<classId or empty>"`, `data-note-student="<studentId>"`. Also `SE.teachQuick.addStudents / message / note`.
  - **Add students:** paste names, one per line, with a live check (`SE.roster.checkNames(text, existing)` → `[{ name, ok, reason }]`: email/number, too long (24), already in class, listed twice). One grade band for the batch. Afterward it shows the new login cards with Print these cards (`body.modal-printing`). The inline add form is gone.
  - **Send a note:** `teacher_note { note }` (up to 200 characters) via `SE.store.teacherLog`. The student sees the newest one from the last 14 days on Home as **Just for you** (`.home-note`); all notes are on Me (`.notes-list`); `prof.notes` is newest first. No other student sees it. No SQL needed.
- **Dashboard** (`SE.views.teach`): a greeting band (`.dash-hello`), palette KPI tiles (`.kpi--green` Checks, `.kpi--teal` Classes, `.kpi--blue` plans; `--brand-blue` only for borders and icons), class cards with Add students and Message, and a side column with **Recent activity** (last 8 sent, passed, try again, help, and note events) and Needs a check-in with a Note button.
- **À la carte picker** in the plan editor: category tabs (`.pk-tab`, `data-pick-area`, `aria-pressed`, 3D Printing included) list **every** activity in the category. Search (`#pw-q`) looks across every category; grade (`#pw-fgrade`) and time (`#pw-ftime`) filter. "Your mix" (`#pw-mix`) counts activities per category. The plan list offers **Build your own** and **Start from a template**.
- **Courses and workshops:** `group: "course"` (Moxie, listed first under Courses) or `group: "workshop"`, with `workshop: { format, sessions: [{ title, steps: [step numbers] }] }`, and `future: [text]` (content not ready yet; text only, never a step): `tpl-ws-sampler` (Maine Tech Sampler), `tpl-ws-robots` (Robots & Smart Machines), `tpl-ws-katahdin` (Coast to Katahdin Explorers). All `reviewed: false`. Copies keep `basedOn`, so a copied plan's page still shows the workshop format.
- 2.0 depth analysis: `planning/STEM207_2.0_Analysis.md`.
- Test: `python3 tests/site/test_educator_qa.py`.
