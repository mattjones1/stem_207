# STEM 207 growth plan: from conception to "run"

*October 22, 2026. Written for the STEM 207 / STEM Coliseum team. It pairs with `STEM207_2.0_Analysis.md` (the technical roadmap) and `STUDENT_EXPERIENCE_AUDIT.md` (quality).*

## The goal, stated plainly
Build STEM 207 into a living product: fresh Maine-rooted content every month, many subscribing classrooms, and the evidence and organization to win about **$1M in grant funding** (or to be valued at that level by a grant-funded buyer).

Funders don't pay for features. They pay for four things:
- **reach:** how many students, and where;
- **learning outcomes:** evidence students got better;
- **equity:** rural Maine, cost, access;
- **a credible plan to sustain it** after the grant.

Every stage below is built to produce one more piece of that evidence.

> Grant programs, amounts, and deadlines change every year. Before writing a proposal, check the current federal, state, and foundation STEM programs and their rules. Nothing in this plan assumes a specific program.

## Where we are: conceived (October 2026)
**What we have:**
- 56 activities in 7 categories, 11 in-site labs, Learning Plans, and one check for every activity.
- A teacher dashboard, a privacy-first student sign-in (picture codes, no student email), and a live cloud back end.
- Three packaged workshops.

**What we don't have yet:**
- any real classroom data;
- pilot timing;
- outcome measures;
- paying customers;
- a content calendar.

## The lifecycle

| Stage | When | Goal | What ships | Who uses it | Evidence it produces |
|---|---|---|---|---|---|
| **Incubation** | Months 1–9 (Nov 2026 – Jul 2027) | Prove it works in real classrooms | Fixes from the audit (P1s first), the 2.0 groundwork (CI, migrations, real-time), pre/post confidence check-ins, Skill Passport v1, and the monthly content drop starting in month 3 | 3–5 pilot teachers, 1–2 STEM Coliseum workshop cohorts | Pass rates, try-again → pass rates, before/after confidence, activity timing (set `time.verified`), teacher interviews |
| **Newborn** | Months 10–12 | First real customers | Workshop packages for sale, school onboarding (Classes, Add students, a starter Learning Plan), a family-friendly certificate | 10–20 classrooms; summer camps | Retention (classes active after 30 and 60 days), student outcomes report v1, 3 teacher testimonials |
| **Crawl** | Year 2, first half | One region, repeatable | Google Classroom rostering, co-teachers, standards alignment (CSTA, NGSS, Maine Learning Results), the teacher email digest | One district or a group of rural districts | District-level outcomes, cost per student, a partner letter |
| **Walk** | Year 2, second half | Statewide Maine | School admin role, analytics, 3D Printing and Moxie at full depth, a facilitator network | Schools in every Maine county with a STEM Coliseum partner | Statewide reach map, equity data (rural vs. urban, free vs. paid), a sustainability model |
| **Run** | Year 3+ | New England and licensing | Licensed content packs, train-the-trainer, a family view, more regions' "home state" content | Other states' programs | The grant-scale story: reach, outcomes, cost, and a revenue mix |

## The fresh-content engine ("a living, breathing application")
- **Monthly Maine STEM Drop.** On the first school Monday each month, publish:
  - one new activity (or a new lab level set);
  - Go deeper links for it;
  - a one-paragraph teacher note.

  Each drop is announced on student Home and the educator Dashboard.
- **Seasonal calendar.** Activities already tied to Maine seasons get a timed spotlight:

  | Month | Spotlight |
  |---|---|
  | September | Fall fair (Pumpkin Launcher) |
  | October | Leaf and harvest data |
  | November | Nor'easter Alerts |
  | January | Snowstorm Simulator, Sled Hill Science |
  | March | Sap Run Detectives (Maine Maple Sunday) |
  | May | Tide Watchers, lobster season |
  | June | Lighthouse Beam (Open Lighthouse Day prep) |

- **Link care.** Every Go deeper link has a `verified` date. Each term:
  - run `node tests/tools/test_deeper.js --list`;
  - re-fetch the links;
  - replace or remove any that moved.
- **Contributor workflow.** Teachers propose activities through `tools/import_missions.js`. Every activity passes the same review: a real check, teacher notes, grade-appropriate copy, and verified outside steps. It goes in as a draft, then pilot, then published (the `SE.content` states that already exist).
- **Workshops as content.** Each new workshop becomes a template, so every workshop day also seeds classroom use.

## Subscribers: what's free and what's paid
| Free | Paid (school or program plan) |
|---|---|
| Every activity and lab, one class, Learning Plans, the checks, the student harbor and patches | Unlimited classes and co-teachers, rostering, analytics and exports, standards reports, priority content drops, workshop packages with facilitator guides |

- **Onboarding:**
  1. A teacher signs up and lands on their class.
  2. They add students in one paste.
  3. They pick a workshop template.
  4. Students are on Up next the same day.

  The target is under 10 minutes from sign-up to the first student sign-in.
- **What to measure each month:** active teachers, active students, sends per student, pass rate, try-again → pass rate, and teachers still active after 60 days.

## Three value adds (design only)
Each one fits the current app: it reuses the event log, the one-check model, Home, Me, and the activity page.

### 1. Skill Passport (competence and confidence)
**User value:**
- **Students** see skills grow, not just XP: "Loops: Apprentice".
- **Teachers** see who can do what, across activities.
- **Funders** get a competence measure tied to teacher-verified work.

**How it fits:**
- Each activity lists 1–3 skills (the optional `skills` field already exists).
- A skill levels up **only from teacher passes**: Novice (1 pass), Apprentice (3), Pro (5 passes, including one Go deeper).
- Before starting and after sending, students tap one of three faces: "I can't yet / I think I can / I can teach it". That's a confidence pre/post with no typing.

**Screens:**
- **Me:** a "Skill Passport" page with skill stamps and levels; it's printable.
- **Activity page:** "This builds: Loops, Debugging".
- **Teacher:** a class skills grid (students × skills).

**Data:** `skills` on activities (proposals in `CATEGORIES_PATHWAYS_AUDIT.md`, section 6, need approval first) and a new `confidence_check {activityId, when: before|after, level}` event. No database change.

**Effort:** M (2–3 weeks). **Measure:** share of students reaching Apprentice in one skill per term; average confidence growth before vs. after.

### 2. Maine STEM at Work (context)
**User value:** students see where the idea lives in Maine, and why it matters to them. "Engineers at the University of Maine test floating wind turbines in the Gulf of Maine." Teachers get ready-made career talks and field-trip hooks.

**How it fits:**
- An optional `atWork: [{ role, place, what, link }]` per activity, shown under "Why it matters" as a card.
- It is described by **role and organization, never by a private person**. Links are verified like Go deeper links.
- **Teacher notes add:** a 5-minute career talk prompt, plus "invite a guest" and "plan a visit" hooks.

**Screens:**
- **Activity page:** one "Maine STEM at Work" card.
- **Category page:** a strip of roles.
- **Educator:** a printable career poster per category.

**Data:** content only (no events). Build it with partners (STEM Coliseum, Maine employers, the University of Maine System), and get their permission before naming any organization.

**Effort:** S to build, M for content (1 card per activity). **Measure:** teacher use of the career prompts (a "used it" tap), and student "I could see myself doing this" taps.

### 3. Know It cards (knowledge and learning that sticks)
**User value:**
- One shared library of the key ideas: loops, conditionals, variables, buoyancy, tolerance, training data, and so on.
- Each card is a kid-sized explanation with a picture, used everywhere the idea appears.
- **Spaced recall:** a few days after a pass, Home asks one "Remember this?" question. Remembering is a learning outcome funders value.

**How it fits:**
- It's built from the existing `vocab` entries (10 coding activities have them, plus the 3D activities), de-duplicated into `STEM.concepts`.
- Each key word on an activity page links to its card.
- **Home:** a small "Remember this?" card below Up next. It shows at most one a day, can be skipped, and never affects XP.

**Screens:** a Know It library on Me; the card opens in the shared dialog; the recall card on Home.

**Data:**
- `STEM.concepts` (content);
- a `recall_answered {concept, correct}` event.

No database change.

**Effort:** M. **Measure:** recall accuracy at 3 and 14 days; how many concepts each student has seen.

## What the audit means for growth
- **Fix the P1s before pilots:** the student focus layout on activity pages, and Read it to me for grades 2–3. Pilot teachers judge in the first five minutes.
- **Keep the sample class realistic:** it's the demo every funder and principal sees.
- **Every teacher-only action needs a server-side check** (as with update 11) before anything handles real student data at scale.

## Next decisions for the team
1. Which pilot teachers and STEM Coliseum cohorts start in incubation month 1?
2. Approve the skill tags (audit section 6) so the Skill Passport can start.
3. Who owns the monthly content drop (writer, reviewer, publish day)?
4. Which Maine organizations will we ask to be featured in Maine STEM at Work?
5. The free vs. paid line: is one class free forever, or a trial?
