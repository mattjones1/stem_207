# STEM 207 Categories and Educator Pathways

Implementation brief for Claude Code • October 21, 2026

## Product direction

STEM 207 is a growing library of short, practical STEM missions. Educators connect missions across categories into pathways toward an explicit learning goal. Students collect creations, observations, explanations, and revisions that show what they learned.

Keep the humanity in technology.

Categories organize content. Missions are reusable activities. Pathways express an educator's teaching intent. Portfolios show a student's connected body of work. A mission must remain usable on its own.

Preserve the existing six categories and seven-stage coding pathway. Add 3D Printing as the seventh category, initially with five unpublished exercise placeholders. The earlier proposed four-category model is not a migration requirement. Do not merge Science & Discovery or Creative STEM into other categories simply to fit that model. Explorer, Builder, and Creator may later describe scaffolding or project independence; do not add a mandatory global progression or replace the current difficulty labels in this release.

## Observed live site and limits of this review

Reviewed the guest homepage/library, existing coding pathway, Lighthouse Network mission detail, and Field Station 360 mission detail through the live UI. The library displayed 53 listings: Coding & Computer Science 23; Virtual Reality 4; Artificial Intelligence 8; Engineering & Robotics 7; Science & Discovery 6; Creative STEM 5. Eleven interactive labs were listed. These are catalog observations, not a claim that every activity and external destination was tested end to end.

The site already offers search and filters for topic, experience, grade, time, and equipment; descriptions, materials, teacher notes, and learning checks; guest exploration; and links to student/educator sign-in. The coding pathway includes seven stages, readiness statements, prerequisites, debugging habits, and linked missions. It already includes activities from Creative STEM and Engineering & Robotics: cross-category composition has an existing precedent.

Sign-in/footer copy now says records are saved in the school's database. Verify the actual backend, migrations, permissions, and persistence in the repository. Do not rely on earlier browser-storage-only descriptions, and do not infer working production security from UI copy. Authenticated educator dashboards were not inspected in this review; extend existing capabilities if found.

Two listings explicitly say Resource coming soon: 360° Notice & Wonder Challenge and Stop-Motion Story Studio. They must not be selectable as ready-to-teach required steps until their missing resources are resolved. Field Station 360 explicitly describes itself as a flat browser experience, not immersive headset VR. Separate category from delivery mode and hardware support.

## Added category — 3D Printing

This is an approved addition to the implementation plan, not an observation of the current live catalog. The target is seven Categories, preserving all six existing Categories.

- Category name: 3D Printing.
- Proposed stable category key: `3d-printing` (check repository conventions before implementing).
- Public category state: Coming soon; no launchable exercises yet.
- Create exactly five editor-visible draft records with generic labels only:
  1. Exercise 1 — placeholder
  2. Exercise 2 — placeholder
  3. Exercise 3 — placeholder
  4. Exercise 4 — placeholder
  5. Exercise 5 — placeholder
- Leave objectives, descriptions, instructions, grades, duration, equipment, prerequisites, deliverables, and assessments unfilled. Do not invent exercise themes or content.
- Suggested draft identifiers: `3d-printing-exercise-01` through `3d-printing-exercise-05`; use existing ID conventions if different. Ensure repeat seeding cannot create duplicates.
- The category may appear in public category navigation with a Coming soon message. The five records remain unpublished and excluded from ready-to-teach search results, assignable pathway steps, XP/completion flows, and published activity totals.
- Show 0 available exercises for this category; show 5 drafts only to authorized content editors. Do not describe the live library as 58 available activities.
- Reuse the same content review/versioning workflow as other Categories when the user supplies content. Publishing one completed exercise should make only that exercise available.
- Update category navigation, the home-page category illustration or equivalent navigation, filters, and any hard-coded six-category copy without disturbing existing category IDs or mission routes.

Acceptance: seven category records, exactly five draft placeholders under 3D Printing, no invented exercise content, no launch/assignment controls on placeholders, and accurate public counts. The previously observed 53-listing inventory below remains a historical snapshot.

## Observed mission inventory

Retain existing identifiers and routes; resolve all titles below to canonical repository records before making changes.

### Coding & Computer Science — 23

- Bug Hunt: Fix the Sandwich Algorithm
- Robot Chef
- Robot Maze Mission
- Sort the Catch: Race Two Algorithms
- Click, Tap, Go! Event Party
- Lighthouse Network: Broadcast Messages
- Loop Dance Choreographers
- Debug the Broken Animation
- Snowstorm Simulator: Clones and Loops
- Lobster Trap Logic
- Nor'easter Alert Station: Compound Conditions
- Build an Interactive Story
- Score Keeper: Catch the Stars
- Catch Log: Lists and Averages
- Pattern Studio with My Blocks
- Snowflake Studio: Custom Blocks with Inputs
- From Blocks to Python: Turtle Patterns
- Mission Capstone: Design Your Own Game
- Capstone Studio: Design, Playtest, Ship
- Robot Dance Party
- Feed the Space Blob
- Moon Base Gatekeeper
- Harbor Code Lab

### Virtual Reality — 4

- 360° Notice & Wonder Challenge — resource coming soon
- Acadia from Above
- Explore a Virtual Ecosystem
- Field Station 360 — browser exploration, not immersive VR

### Artificial Intelligence — 8

- Pattern Predictors
- How Does an AI Sort?
- Blueberry Sorting Machine
- Teach the Computer Your Secret Signals
- Clean the Ocean with AI
- Train a Classroom Model
- Pattern Machine Lab
- AI Detectives: When Is the Computer Wrong?

### Engineering & Robotics — 7

- Sense–Think–Act: Human Robot Game
- Paper Bridge Challenge
- Lighthouse Beam Challenge
- Snowplow Robot Lab
- Marble Run Iteration Lab
- Pumpkin Launcher Lab
- Float a Wind Turbine

### Science & Discovery — 6

- Ice Melt Race
- Sink or Float: Predict, Test, Explain
- Sap Run Detectives
- Paper Helicopter Investigation
- Tide Watchers: Portland vs. Eastport
- Sled Hill Science

### Creative STEM — 5

- Pixel Art Code
- Animate Your Initials
- Pixel Animation Studio
- Stop-Motion Story Studio — resource coming soon
- Animated Maine Postcard

## Vocabulary and information structure

| Concept | Purpose | Example |
| --- | --- | --- |
| Category | Stable browsing area; expandable without new application code | Science & Discovery |
| Mission | A self-contained activity with a learning objective and evidence prompt | Tide Watchers |
| Skill | Reusable learning concept spanning categories | Observation; sequencing; fair testing |
| Pathway template | Reusable, curated sequence with a goal and final demonstration | Maine Coast Explorers |
| Educator pathway | An educator-owned version with context, order, and evidence requirements | My class's harbor exhibit |
| Assignment | A specific published pathway version assigned to a class or learner | October coastal unit |
| Portfolio | Linked evidence and reflection across the assignment | Graph, prototype tests, animation, explanation |

Give a mission one primary category for navigation and additional category/skill tags when useful. Never duplicate a mission merely to make it visible under a second category. Category counts must identify whether they count primary assignments or all tagged appearances; the all-library count must count unique missions.

Preserve the seven coding stages as a domain-specific progression and seed a curated Coding Foundations template from them. A universal pathway builder must not require seven stages, all categories, or a fixed difficulty ladder.

## The educator workflow

1. Start with a goal: what should students understand or be able to do?
2. Name the expected final artifact or demonstration.
3. Set grade range, approximate session length, available equipment, and prior skills.
4. Search the mission library and add activities from any category.
5. Reorder activities with both drag-and-drop and keyboard-accessible move controls.
6. Add a short bridge between steps: why this activity follows the previous one and what students should carry forward.
7. Specify required or optional steps and appropriate evidence. Allow a reflection or synthesis step without requiring a newly published library mission.
8. Preview the student view, estimated duration range, equipment union, and prerequisite warnings.
9. Save a draft, publish a version, and assign using the existing class system.
10. Review student evidence and the final synthesis; duplicate/adapt the pathway for the next group.

MVP composition is a linear sequence with optional steps. Reserve alternative choices and complex branching for later. Keep readiness advice distinct from hard safety, licensing, or account restrictions. An educator may acknowledge a readiness gap with planned support; a note must not bypass a platform age restriction.

Time estimates must distinguish student activity time from teacher preparation and transition/showcase time. Use duration ranges where supplied. Multi-session activities need session information. The 90–135 minute Capstone Studio should not be presented as a single quick hitter. A selected subset of a long lab needs an explicit segment and teacher estimate; do not inherit the whole lab's duration or completion claim.

## Pilot pathway using existing missions

### Maine Coast Explorers — Understand and Explain a Working Coast

Audience: grades 6–8, with basic Scratch event experience. Deliverable: a small coastal exhibit consisting of a field log, tide graph, reflector prototype/test notes, animated lighthouse signal, and explanation connecting evidence to design choices.

| Step | Existing mission | Current category | Proposed evidence and bridge |
| --- | --- | --- | --- |
| Observe | Field Station 360 | Virtual Reality | Field log separating observations from inferences; identify questions about coastal conditions |
| Investigate | Tide Watchers: Portland vs. Eastport | Science & Discovery | Tide graph and explanation of why conditions differ across locations |
| Engineer | Lighthouse Beam Challenge | Engineering & Robotics | Prototype image or instructor observation plus before/after test notes |
| Program | Lighthouse Network: Broadcast Messages | Coding & Computer Science | Scratch project and explanation of event/message coordination |
| Communicate | Animated Maine Postcard | Creative STEM | Reuse the lighthouse scene as the postcard base where practical; explain one accurate observation and one creative choice |
| Synthesize | Educator-authored exhibit reflection | Pathway step, not an existing mission | Explain how observation, data, physical design, and code contributed to the exhibit |

Listed mission times sum to about 205–210 minutes (45 + 45 + 45 + 25–30 + 45). Add a proposed 20–30 minutes for synthesis and sharing, plus transitions/preparation. Budget 225–240 minutes of activity and synthesis, spread over multiple sessions. Students without event experience can add Click, Tap, Go! Event Party (15–20 minutes) as a readiness activity. That additional time is not included above.

The evidence prompts and connections above are new pathway design proposals. Confirm each with an educator before publishing. Completing all five activities does not automatically establish mastery of five disciplines. Assess the stated pathway goal.

### Two further seed templates

- How Machines Make Decisions, grades 6–8: Moon Base Gatekeeper → Pattern Machine Lab → AI Detectives → Build an Interactive Story. Goal: distinguish explicit rules from learned patterns and explain when human review matters. Existing missions; new synthesis assignment: create a story in which a character checks a computer's recommendation.
- From Instructions to Invention, grades 2–5: Bug Hunt → Sense–Think–Act → Pixel Art Code. Goal: communicate precise instructions, test them with another person, and improve an ambiguous step. Deliverable: revised instruction cards and a peer-decoded picture. No coding prerequisites or headset required.

Do not insert AI or immersive VR into every pathway just to fill categories. Connections must serve the learning goal.

## Content model for a living repository

Use the existing stack and database. The entities below describe responsibilities, not a mandate to replace architecture or choose a vendor.

Mission identity: stable ID, slug, title, primary category, secondary tags, author/provenance, license where applicable.

Mission version: objectives, skills, suggested grades, current difficulty, duration min/max, session structure, prerequisites, materials, delivery mode, equipment, launch target, student steps, teacher notes, adaptations, deliverable, evidence/check prompts, resource status, review state, reviewer and review date.

Separate editorial status (draft, in review, published, archived) from delivery readiness (ready, missing resource, link needs review). Published descriptions with unavailable resources must not silently appear as ready-to-teach activities. Label unpublished material as drafts in educator planning and block publication of required unavailable steps.

Pathway identity/version: owner and scope, title, essential question, learning goals, intended audience, expected final product, review criteria, version, status, and ordered step records. A step references a mission version or contains an educator-authored reflection/synthesis prompt. Keep teacher adaptations separate from the canonical mission.

Assignments: reference a published pathway version and the actual assigned students/classes. Editing the template later must not silently alter an active assignment.

Evidence: student, assignment step, mission version when applicable, attempt, artifact reference or observation note, reflection, submission status, review, timestamps. Allow several steps to contribute revisions to one project. Group artifacts should support individual reflections without copying the same file for every student.

Reviews: reviewer identity, criteria demonstrated, feedback, revision requested/accepted, evidence version reviewed. Participation, submission, activity completion, and demonstrated skill remain separate.

Sharing: private by default, with explicit educator-controlled audience. Public sample showcases use clearly labeled demonstration work until real student work has appropriate permission. Publishing a pathway template never publishes its students' evidence.

Search and growth: controlled category and skill vocabularies, aliases for common search terms, indexed metadata, pagination at scale, filter result counts, and defined empty states. Do not add a heavyweight search service until actual data volume or profiling justifies it.

## Content workflow

Provide an admin/editor mission form and a structured import route for incoming content. Start with a documented JSON/Markdown mapping compatible with the existing repository. Imports must support dry-run validation, stable-ID upsert, duplicate detection, and a report of rejected records; never silently overwrite a published mission. Validate URLs and allowed formats, sanitize rendered content, and preserve attribution. Uploaded files need type and size limits and protected access.

Workflow: draft → preview → educator/content review → publish → scheduled or reported resource review → revise/archive. Each revision creates a new published version; active assignments keep the prior version unless the educator deliberately migrates them with an impact summary. Retiring a mission preserves historical evidence and explains unavailability to existing assignments.

Provide dashboards for missing assets, broken or changed external resources, unreviewed curriculum, and affected pathways. A successful URL response is not proof that an activity remains usable; record human verification for accounts, devices, grade fit, and instructional content. Make it easy to add an activity without editing navigation or writing a new page component.

## Showcase and positioning

Proposed hero: “Small missions. Bigger discoveries.”

Proposed supporting copy: “Explore a growing library of hands-on STEM activities. Connect missions across coding, AI, science, engineering, virtual exploration, and creative design into learning pathways built around your students and your goals.”

Primary action: Explore missions. Secondary action: See a sample pathway. Educator action when available: Build a pathway. Do not present an unimplemented action as live functionality.

Homepage sequence: immediate mission discovery; seven category choices, with 3D Printing clearly marked coming soon; a concrete example of a cross-category journey; the final body of work; how educators adapt it; the mission statement and parent-brand attribution.

A sample pathway page should show the essential question, audience, prerequisites, sequence with category labels, activity and total time estimates, equipment, proposed evidence, final product, and “Use this template” when functional. Preview public templates without requiring an account; require an authorized educator session to save/assign.

A student learning story should answer: What was the question? What did I try? What did I make? What changed after testing? What can I explain now? Select meaningful evidence rather than showing only XP or percentage complete. Retain existing motivational systems, but do not let them stand in for evidence.

## Delivery phases and acceptance gates

1. Audit and preserve. Inventory records, routes, seven-stage coding data, labs, auth, storage, and educator features. Map reuse versus gaps with file references. Capture baseline routing and relevant tests. Do not rebuild components that already solve the problem.
2. Content foundation. Add compatible metadata, versions, editorial/readiness statuses, import validation, and category/skill records. Migrate without changing mission IDs or losing progress. Existing routes and labs continue to work. An editor can add one new mission through the documented workflow without changing page rendering code.
3. Pathway builder. Implement goal, final product, mission selection, sequence, bridge notes, optional flags, checks, preview, duplication, and draft/published versions. A teacher can combine at least three categories and publish without duplicating mission content. Keyboard operation works. Required unavailable resources block publish. Existing coding pathway becomes a reusable template with legacy route preserved.
4. Assignment and portfolio. Extend existing educator/student surfaces. Build start/resume, evidence submission, reflection, review/revision, and final synthesis. A learner cannot review their own evidence as a teacher or access another class's work. Test authorized staff access and cross-school isolation against the real persistence layer. Clicking an external launch link does not complete an activity.
5. Tell the story. Add public sample templates and labeled demonstration portfolios. Make the library-to-pathway-to-body-of-work relationship visible on the homepage. Do not invent testimonials, outcomes, or student identities. Private assignments and artifacts stay private.
6. Pilot and improve. Observe teachers assembling and assigning a pathway, and students producing evidence. Record time-to-first-assignment, confusing filters, abandoned steps, resource failures, and whether students can explain connections. Agree on success thresholds after a small baseline pilot, rather than inventing precise conversion targets.

Defer AI-generated pathways, public community publishing, marketplaces, complex branching, automatic mastery decisions, and a new badge system until the core workflow is useful and stable. Their future extension points can be represented in the model without building them now.

## Claude Code master prompt

Paste this prompt into Claude Code with this brief available in the repository.

```text
You are extending the existing STEM 207 application as a senior product
engineer working with an elementary/middle-school curriculum designer.

Read this implementation brief and the repository's instructions first.
Our mission is “Keep the humanity in technology.”

Product objective:
STEM 207 is a living repository of short STEM missions. Educators assemble
missions across Categories into goal-driven Pathways. Students accumulate
a connected body of evidence, creations, reflections, and revisions.
Standalone quick activities remain a first-class use case.

Preserve the six current Categories, existing mission IDs/routes, labs,
brand assets, and seven-stage coding progression. Add 3D Printing as a
seventh Category with exactly five unpublished placeholders. Use only
Exercise 1 through Exercise 5 as labels; do not generate exercise content.
Treat the coding pathway
as an existing curated template to generalize, not something to replace.
Do not force all content into four categories or add mandatory global
Explorer/Builder/Creator levels.

First inspect the actual repository, database schema, migrations, auth,
storage, teacher dashboard, progress tracking, and test commands.
Do not assume the old browser-storage demo is still current. Verify what
is implemented; the live UI's database claim is not sufficient evidence.

Create docs/categories-pathways-audit.md with:
- Canonical mission inventory, categories, IDs, routes, resource readiness.
- Existing reusable components and data structures with file references.
- Gaps against this brief and recommendations in dependency order.
- Proposed migrations, authorization rules, rollback and regression plan.
- Curriculum mappings requiring human review rather than guessed approval.

Create docs/categories-pathways-backlog.md with small implementation
tasks, dependencies, affected files, and observable acceptance criteria.
Do not modify application code during this initial audit task.

Plan for:
- Data-driven categories and mission metadata; controlled skills/tags.
- Draft/review/publish/archive, content versions, and safe bulk import.
- Goal-first cross-category pathway building, adaptations and bridge notes.
- Explicit final deliverables and evidence requirements.
- Assignment versions that remain stable when library content changes.
- Student portfolios and instructor review extending existing features.
- Private-by-default evidence and deliberate audience controls.
- Search, filters, count consistency, and growth without hard-coded cards.
- Public sample journeys and clearly labeled demonstration work.

Keep activity completion distinct from skill demonstration. External
launches do not auto-complete missions. Separate category from actual
delivery mode: Field Station 360 is not immersive VR. Resolve coming-soon
resources before allowing them as required steps in published pathways.
Preserve student progress, original content, and existing URLs.

Do not deploy, purchase services, change frameworks, or create a new
backend merely because a feature needs extending. Report the smallest
useful implementation sequence and the checks that will prove it works.
```

## Follow-up implementation prompts

Run one at a time after reviewing the audit and supplying any unresolved curriculum decisions.

### Prompt 2 — Build the content foundation

```text
Implement the reviewed content-foundation backlog items only. Extend the
existing schema and APIs. Preserve IDs, routes, and progress. Add mission
versions, Category and skill references, editorial/readiness states, and
the documented safe import flow. Add the 3D Printing Category and five
unpublished placeholders as specified in this brief. Never mark generated content reviewed.
Use fixtures for test content; do not publish them into the live library.
Verify imports reject duplicates/invalid records safely, existing routes
work, and a new mission can appear without a new page component. Report
tests run, migration steps, rollback, and any unverified assumptions.
```

### Prompt 3 — Build educator pathways

```text
Implement the reviewed pathway-builder tasks using existing UI patterns.
Start with a goal and expected final product. Support library selection
across all Categories, ordered required/optional steps, bridge notes,
evidence prompts, teacher adaptations, preview, duplicate, and publish.
Allow an educator-authored synthesis step. Use keyboard-accessible order
controls. Show duration ranges, equipment and prerequisite warnings.
Preserve the existing coding route and seed its reviewed content as a
curated template. Published assignments must pin their versions. Verify
that editing one teacher's pathway does not change a shared mission or
another teacher's pathway. Do not add AI generation or complex branching.
```

### Prompt 4 — Connect learning evidence

```text
Extend current assignment and student-progress features to support the
reviewed pathway versions. Add private evidence and reflections, teacher
observation, revision requests, and a final synthesis view. Support reuse
of an evolving project across steps. Keep launch, completion, submission,
and instructor assessment distinct. Enforce authorization server-side.
Test student/teacher role boundaries, class and school isolation, artifact
access, version stability, resume behavior, and unavailable resources.
Do not expose private portfolios through public template sharing.
```

### Prompt 5 — Show the product story

```text
Implement the reviewed public storytelling changes while preserving the
brand and fast access to standalone missions. Show Categories → selected
missions → educator pathway → student body of work through one concrete
sample. Use the reviewed Maine Coast Explorers template. Label all demo
artifacts as examples; do not fabricate student outcomes or testimonials.
Add public template previews and functional educator calls to action only
where implemented. Check mobile layouts, keyboard access, empty states,
counts/readiness labels, and the boundary between public and private data.
```

## Initial release definition

An educator can find existing missions, assemble and assign a coherent pathway across three or more categories, and review a student's connected evidence. A second educator can adapt the template without changing the original. A content editor can add or revise a mission without breaking an active assignment. A prospective family can understand the experience from a public sample without seeing private student data.

## Source scope

Live UI reviewed October 21, 2026: https://mattjones1.github.io/stem_207/#/signin ; guest homepage/library; existing /#/pathway; /#/activity/lighthouse-network; /#/activity/lab-field-station. Inventory titles and times are observed catalog values. Proposed mappings, sequence, evidence requirements, product copy, and development phases are recommendations, not existing features. Repository and authenticated teacher workflow verification remain Claude Code audit tasks.
