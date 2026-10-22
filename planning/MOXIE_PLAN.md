> **Repo note (October 21, 2026).** This is the Moxie planning brief as supplied. Decisions made since:
> - **Outline edition.** The repo is public (GitHub Pages), so the 16 source DOCX files and the full lesson text, wiring, and code stay out of it until reuse permissions for the STEM Coliseum and TeachEngineering material are confirmed. Session records hold the structure, learning focus, evidence, and teacher notes from this brief only.
> - **Draft visibility.** Educators see every draft. Students and guests see nothing until a session reaches "pilot" (assigned classes only) or "published".
> - **Scope.** The software for the whole brief is built (overview, units, 16 session pages with capstone variants, educator support, partner and individual evidence, capstone records, rubric feedback, versions). Phases E–F (pilot, publication) are run by people.
> - **Answer keys** never go in this repo. They live in the private Moxie teacher kit.
>
> Where it lives: `assets/js/data/moxie.js`, `assets/js/views-moxie.js`, `supabase/update-5-moxie-teams.sql`. Audit: `planning/MOXIE_AUDIT.md`. Validation backlog: `planning/MOXIE_VALIDATION.md`.

# Moxie — A STEM 207 Physical Computing Pathway

**Planning brief | October 21, 2026 | Draft for curriculum and product review**

> **Moxie: Code it. Build it. Make it matter.**  
> A STEM 207 pathway where students turn code into working devices that help people.

**Status:** Planning only. This document proposes curriculum organization, content preparation, platform behavior, and future Claude Code tasks. It does not authorize application changes, content publication, database migrations, or deployment.

## 1. Recommendation

Create **Moxie** as a distinct, branded STEM 207 pathway built around the supplied 16-session ESP32 curriculum. Give it its own overview, ordered learning journey, instructor resources, and student project collection. Keep it within STEM 207’s shared mission library, accounts, and educator workflow.

The central promise is a progression from a first blinking light to an original, tested device that solves a problem for someone. The final deliverable is both a physical prototype and evidence of the student’s thinking: a design, code, test results, an improvement, a demonstration, and reflection.

Moxie should demonstrate the larger STEM 207 model: educators connect activities into a meaningful body of work. It should not become an isolated collection of downloadable worksheets or a separate application.

**Brand relationship:** “Moxie — a STEM 207 pathway.” Retain the STEM 207 mission, **“Keep the humanity in technology.”** Use the existing approved STEM 207 visual system; develop a Moxie wordmark treatment later if wanted. No new logo or palette is specified here.

**Proposed introduction:**

> Start with a blinking light. Finish with something that matters. In Moxie, students learn to code, connect circuits, and bring their ideas to life with lights, buttons, displays, sensors, and movement. Working with a partner, they test ideas, track down bugs, and build a device for a real person’s problem. Every project tells a story: who it helps, how it works, and what changed along the way.

## 2. Evidence and boundaries

This analysis covers the text, code scaffolds, tables, and checkoffs in all 16 supplied DOCX files. The embedded board and circuit illustrations in Sessions 1–12 were also inspected at overview scale. This is a curriculum and publication-readiness review, not an electrical validation, code-compilation review, or classroom trial.

The companion `STEM207_Categories_Pathways_Claude_Build_Plan.md` supplies the existing platform direction and previously recorded site observations. No new site or repository audit was performed for this document. Its inventory and observations must be rechecked during future implementation planning.

Throughout this brief:

- **Source requirements** come from the supplied lessons.
- **Proposals** describe how to present and support them in STEM 207.
- **Validation items** are unresolved and must not be advertised as working capabilities.

The documents do **not** establish a grade range, minutes per session, total instructional hours, supported operating systems, exact board revision, or software version set. Do not inherit the 90-minute or grades 4–8 specifications from earlier, unrelated workshop discussions.

## 3. What the curriculum already does well

The sequence has a clear instructional progression. Sessions 1–4 introduce outputs; Sessions 5–8 connect inputs to decisions and a checkpoint; Sessions 9–12 add displays, time, sensing, and motion; Sessions 13–16 transfer those skills into an original device.

The recurring **mission → build → code → test → explain** structure gives students a recognizable routine. Fill-in code reduces the initial typing burden, while stretch goals provide additional challenge. Pseudocode, truth tables, calibration, subsystem testing, and bug logs make engineering habits visible.

The partner structure is explicit: Driver and Builder alternate. Preserve that expectation digitally, while checking each student’s understanding individually. A shared circuit should not automatically mean identical individual mastery.

The capstone is particularly aligned with STEM 207’s mission. Students identify who has a problem, write three measurable criteria, work within kit constraints, seek feedback, make at least one improvement, and present a one-minute pitch. The device is a means to serve someone, not simply a demonstration of components.

## 4. Pathway structure and session map

Preserve all 16 sessions and their order in the initial curriculum edition. Use four unit sections. Session IDs below are proposed stable keys; actual IDs must follow repository conventions.

Evidence in this table is a proposed digital representation of the source activities, not a requirement to photograph every lesson.

| ID | Source session | Learning focus | Evidence to retain |
| --- | --- | --- | --- |
| moxie-01 | Hello, ESP32! | Upload; setup/loop; heartbeat LED; Serial Monitor | Working heartbeat checkoff, saved sketch, explanation of setup and loop |
| moxie-02 | Double Blink | External LEDs; resistors; alternating outputs; timing variable | Opposite blink pattern and explanation of a timing change |
| moxie-03 | Traffic Light | Pseudocode; ordered sequence; timing variables | Completed plan, working cycle, timing observation |
| moxie-04 | Fading & Color Mixing | PWM; counted loops; gradual output changes | Working single-LED fade and explanation; RGB remains optional stretch |
| moxie-05 | I Control the Lights | Digital inputs; pull-downs; if/else | Three button/LED behaviors and explanation of a pull-down |
| moxie-06 | Too Many Switches | Four input cases; AND; else-if; helper function | Truth-table checks and explanation of case order |
| moxie-07 | Knobs & Numbers | Analog input; mapping; serial values | Knob-controlled brightness and explanation of map() |
| moxie-08 | Smart Crosswalk | Combine outputs, a remembered request, and sound | Approved pseudocode, demonstrated crosswalk behavior, explanation of request memory |
| moxie-09 | Talking Displays | Libraries; OLED rendering; live values | Live knob value on OLED and explanation of the display sequence |
| moxie-10 | Stopwatch | Elapsed time; state; button-edge detection | Start/stop demonstration, phone comparison, timing explanation |
| moxie-11 | Parking Assistant | Distance sensing; thresholds; calibration | Instructor wiring check, three distance readings, zone behavior |
| moxie-12 | Making Things Move | Servo positioning; map(); problem brainstorming | Controlled movement and three capstone problem ideas |
| moxie-13 | Capstone: Define & Design | User need; criteria; parts/pins; circuit and code plan | Instructor-approved design and three measurable criteria |
| moxie-14 | Capstone: Build Sprint | Subsystem testing; integration; debugging | Working subsystem, build checklist, bug log, plan changes |
| moxie-15 | Capstone: Test & Improve | Criteria-based testing; feedback; revision | Three test results, peer feedback, improvement, showcase card and pitch plan |
| moxie-16 | Capstone Showcase | Demonstration; explanation; reflection | One-minute pitch, device demo, feedback, individual reflection and self-rating |

### Units and progression

| Unit | Sessions | Proposed student-facing question | Progression evidence |
| --- | --- | --- | --- |
| 1. Outputs | 1–4 | How can code change something in the physical world? | Explain and intentionally change an output pattern |
| 2. Inputs & Decisions | 5–8 | How can a device respond to a person? | Show the Smart Crosswalk and explain its remembered request |
| 3. Displays, Time, Sensors & Motion | 9–12 | How can a device sense, communicate, and move? | Demonstrate components needed for the proposed capstone |
| 4. Capstone | 13–16 | What could we build that helps someone? | Design approval, working subsystems, tested improvement, showcase |

Keep the default journey sequential. Later, allow instructors to recognize equivalent prior experience through a demonstration rather than forcing repeated lessons. A learner’s age or a completed Scratch activity alone should not waive physical-circuit readiness.

## 5. Fit within STEM 207 Categories

**Moxie is a pathway, not an additional Category.** Its primary category association should be **Engineering & Robotics**, with appropriate **Coding & Computer Science** tags or secondary associations supported by the existing content model. Add other category associations only when a particular activity warrants them.

The previous plan preserves the existing Categories and adds **3D Printing** with exactly five unpublished placeholders. Moxie does not replace those Categories, fill those placeholders, or require 3D printing. An enclosure extension could be considered later through a separate content decision.

Use one canonical activity record for each Moxie session, referenced by its pathway step. Educators should eventually be able to include a suitable Moxie activity in another pathway without duplicating its lesson content. Display the needed kit and prerequisite skills wherever it appears.

### Optional connections to existing missions

The companion plan lists the following relevant missions. Confirm their canonical records and review their actual content before creating links. These are optional conceptual bridges, not extra required Moxie sessions.

| Existing mission | Possible connection | Limit |
| --- | --- | --- |
| Robot Chef / Bug Hunt: Fix the Sandwich Algorithm | Precise instructions and debugging before text-based code | Does not establish electronics readiness |
| Click, Tap, Go! Event Party | An input triggers a response | Distinguish event-driven blocks from the ESP32 polling examples |
| Sense–Think–Act Human Robot Game | Explain input → decision → output before capstone planning | A conceptual warm-up, not sensor validation |
| Snowplow Robot Lab | Discuss responsive systems and testing | Review its actual mechanics before using it as a prerequisite bridge |

Do not hold Moxie publication hostage to a complete educator pathway-builder rebuild. A curated pathway using existing components is a reasonable first release; richer composition can follow.

## 6. Preserve the course while supporting quick activities

These are cumulative hardware lessons. Calling every session a “quick hitter” would hide setup, wiring, testing, and cleanup. Keep the complete sessions intact initially and publish durations only after observation.

Later, expose useful segments—such as a timing experiment, a truth-table check, or a calibration task—as reusable activities when each has a clear starting state. Every extracted segment must identify:

- Required circuit or prepared kit, code starting point, and prerequisite skills.
- A single objective, realistic duration, and evidence of success.
- Its parent session and source version.
- Whether it can stand alone or requires a prepared station.

Do not generate dozens of thin mission records simply to enlarge the catalog. Preserve the distinction between an independent activity and a step within a longer session.

## 7. Proposed student and educator experience

### Moxie overview

Show the promise, four-unit map, final-project expectations, required hardware, partner model, and teacher preparation requirements. Clearly label grade range and duration as pending validation until decided. Show sample projects only when real, approved examples exist; do not fabricate student work.

Give a clear entry to the first session and, for enrolled students, a way to resume. Guest viewing should follow existing site policy. Do not imply that guest work is saved unless persistence is actually supported.

### Session pages

Use a consistent layout based on the source worksheets:

1. **Your mission:** goal, required prior work, equipment, and completion evidence.
2. **Before you wire:** relevant setup instructions and instructor inspection points.
3. **Build it:** enlarged diagram plus a readable pin/wiring table.
4. **Plan it:** prediction, pseudocode, or truth table when the source calls for it.
5. **Code it:** selectable scaffold with blanks preserved, plus a downloadable sketch when prepared and tested.
6. **Test it:** source checks, troubleshooting, and a place to record observations.
7. **Explain it:** source checkoff question and teacher review.
8. **Stretch:** optional challenge, visibly separate from core completion.

Use source-appropriate variants for capstone pages instead of forcing them into a wiring-lesson template. Session 13 needs a design worksheet; 14 needs a reusable build log; 15 needs criteria, feedback, and revision; 16 needs presentation and reflection.

Keep downloadable/printable worksheets available. Code, wiring instructions, and checkoffs must also be accessible as page content rather than image-only material. Diagrams need zoom, meaningful alternative descriptions, and text equivalents; color alone must not convey wire function.

### Educator support

Provide a pathway preparation guide, kit checklist, tested setup instructions, lesson notes, answer sketches, common faults, and evidence criteria. Keep answer keys separate from student scaffolds through existing role permissions where available.

Support teacher-observed demonstrations as an alternative to media uploads. Preserve partner-level project evidence and individual explanations. A proposed progress vocabulary is **Not started / In progress / Ready for review / Verified**, with stretch completion tracked separately. Reuse equivalent existing statuses instead of introducing a competing system.

## 8. Capstone and assessment

### Preserve these source requirements

The device must address a real problem for someone at home, school, or the Coliseum and use:

- At least one input.
- At least two outputs of different types.
- Code containing a variable, an if/else, and comments.
- Parts from the kit and an instructor-approved circuit plan.
- Three measurable criteria and test results.
- Peer feedback and at least one improvement.
- A one-minute pitch and demonstration with both partners contributing.

Session 13 sets the expectation of build time in Sessions 14, 15, and part of 16. Preserve that expectation when scheduling the showcase; do not assume Session 16 is entirely presentation time.

### Proposed final project collection

Retain the problem statement, intended user, criteria, parts/pin plan, circuit sketch, pseudocode, final code, bug/build log, test results, improvement, showcase card, and individual reflection. Link shared artifacts to both partners rather than requiring redundant copies.

The source rubric identifies six dimensions: Function, Code & comments, Circuit, Design process, Communication, and Teamwork. It describes only **“Meets” at 3 out of 4**. Complete the missing performance descriptors before implementing numeric scores. Until then, use criterion-level feedback and teacher checkoffs; do not invent a final grade formula.

Assess whether students can explain and change their code, not just fill blanks or produce a working circuit. Do not equate checking a box, downloading a file, or opening a page with demonstrated completion.

A public showcase is a later, educator-controlled publication step. Keep drafts and student evidence private by default; use the platform’s existing school permissions and consent process. Offer a non-public showcase option.

## 9. Content and hardware readiness findings

The following issues are grounded in the supplied lessons. They are a review queue, not corrected circuit instructions. A qualified instructor should validate the selected kit, diagrams, and completed code before student release.

| Priority | Finding | Required planning response |
| --- | --- | --- |
| Before pilot | Session 1 assumes a USB-C ESP32 Dev Module with a built-in LED on pin 2; later sheets use specific D/RX2/TX2 labels | Identify the exact supported board and connector, reconcile diagrams with physical kits, document any variants |
| Before pilot | IDE board-package installation, drivers, library versions, and device restrictions are not fully specified | Produce a tested instructor setup guide and record a known-working software/hardware combination |
| Before pilot | Sessions 4, 8, 9, and 12 depend on PWM, tone, display, and servo functionality | Compile and run completed core and stretch sketches with the selected ESP32 package and libraries; test combined capstone components too |
| Before pilot | Session 4’s RGB stretch infers wiring changes from brightness behavior | Replace the ambiguous shortcut with instructions for the confirmed RGB part and matching code; have an instructor validate both |
| Before pilot | Session 11 explicitly requires an Echo voltage divider and instructor check; Session 12 allows a power-module fallback | Preserve the inspection gate and prepare exact, validated sensor/servo power instructions, including the fallback configuration |
| Before pilot | Most lessons rely on “copy it hole for hole” diagrams | Verify each connection against the wiring table and real breadboard; do not treat this overview review as a circuit signoff |
| Before publication | Session 6 asks for a press-and-release sequence, but its stretch hint only describes setting an armed flag on press | Add explicit release/state handling to the teacher solution and test the intended sequence |
| Before publication | Session 8 checks buttons during some waiting periods but uses ordinary delays during chirps | Define expected behavior for requests during green, yellow, red, and WALK; test and explain what happens to each request |
| Before publication | Session 10 uses button-edge detection and a short loop delay; its troubleshooting attributes double counts to lastButton | Test real-button behavior and add a validated debounce explanation if required; edge detection and debounce should not be conflated |
| Before publication | Session 11 comments describe zones whose exact boundaries need clarification; a missing echo is represented by 999 | Document expected behavior at 10 and 30 cm and on no echo; distinguish “no measurement” from a verified safe distance |
| Before publication | Session 13 excludes pin 2 in capstone planning while Session 1 uses its built-in LED | Explain the distinction between the introductory onboard-LED example and the approved capstone pin list |
| Before publication | Source references name STEM Coliseum challenges and TeachEngineering materials without complete citations | Record exact provenance and confirm reuse permissions for adapted text, diagrams, and code before public distribution |
| Before publication | Timing, grade range, complete rubric descriptors, and teacher answer keys are absent | Produce these through educator review and a pilot; retain uncertainty until resolved |

Also review the simplified analog voltage examples, expected servo travel, OLED address troubleshooting, and all optional extensions against the chosen hardware. These examples should be taught with the limits of the actual classroom kit rather than universal promises.

### Kit planning baseline

The documents collectively call for an ESP32, data-capable USB cable, computer with Arduino IDE, breadboard and jumpers, colored LEDs, 220 Ω and 10 kΩ resistors, buttons, 10 kΩ potentiometer, passive buzzer, 128×64 OLED using the named Adafruit libraries, HC-SR04, 1 kΩ and 2 kΩ divider resistors, SG90 servo, and a ruler. Optional parts include an RGB LED, light/temperature sensors and matching resistors, and an instructor-managed power module.

Prepare an exact bill of materials per pair after reconciling the lessons with the owned kit. Include quantities, component models, spares, storage, and whether circuits are retained between sessions. Do not infer a purchasing list or budget from these worksheets alone.

## 10. Content model and maintainability

Use the smallest extension of the current repository that supports this structure. These are conceptual records, not a demand for particular database tables or a new backend.

| Record | Proposed information |
| --- | --- |
| Pathway | Stable ID, Moxie name/slug, promise, audience once validated, equipment profile, ordered units, completion expectations, publication state, version |
| Pathway step | Canonical activity reference, order, unit, required/optional status, prerequisite guidance, checkpoint |
| Activity | Objectives, starting state, steps, code scaffold, wiring table, resources, tests, explanation prompt, stretch, instructor notes |
| Asset | Source DOCX, diagram, accessible description, code/download, audience visibility, version, provenance |
| Evidence/review | Student/team reference, activity version, artifact or observation, individual explanation, reviewer, date, status |
| Capstone | Shared design, criteria, code, tests, feedback, revision, showcase card, individual reflections |

Proposed pathway key: `moxie`; proposed session keys: `moxie-01` through `moxie-16`. Avoid hard-coded indexes or duplicated lesson bodies. Content changes should not require rewriting navigation components.

Retain original DOCX files as source assets and track adaptations. Separate source version from publication state: **draft → curriculum review → hardware validation → pilot → published**, with revision history. Mark which reviews are applicable to capstone-only pages.

For assigned cohorts, retain the assigned curriculum version or explicitly record an approved update. Do not silently change the requirements behind previously verified work. Urgent corrections need an instructor notice and a clear affected-version record.

## 11. Future implementation phases

No phase below is executed or authorized by this brief.

| Phase | Work | Reviewable outcome / exit condition |
| --- | --- | --- |
| A. Repository and content audit | Inspect routes, schemas, existing coding pathway, authoring, roles, persistence, and asset support; map all sources | File-by-file change proposal, reusable components, uncertainties; no application changes |
| B. Curriculum preparation | Resolve audience/timing, software/kit profile, technical review queue, rubric, teacher resources, provenance | Instructor-approved content package ready for a pilot |
| C. Curated pathway | After implementation authorization, add Moxie overview, four units, 16 draft sessions, shared-library references, accessible assets | Reviewable private implementation with accurate draft states and no regressions to existing pathways |
| D. Evidence and review | Extend existing progress and submission capabilities only where needed | Partner project evidence, individual checks, teacher approval, and persistence verified with appropriate roles |
| E. Classroom pilot | Observe upload/setup, wiring, pacing, checks, and capstone completion | Recorded issues, revised timing and support, validated core lessons and kit |
| F. Publication | Publish approved content and explanatory overview; optionally curate approved examples | Accurate catalog counts, working resources, approved audience/timing, and a clear Moxie story |
| G. Growth | Add reviewed extensions and reusable segments; enable educator composition as platform support matures | New content can be added without breaking assigned versions or duplicating canonical activities |

The minimum useful release is a complete, curated Moxie pathway with dependable teaching resources. A browser IDE, live device telemetry, simulator, AI tutor, automatic circuit grading, public gallery, and custom hardware uploader are outside this initial scope. The supplied lessons use Arduino IDE; keep that workflow unless a separate decision changes it.

## 12. Claude Code planning prompt

Use this prompt for a future read-only planning pass with repository access. It is deliberately not an implementation instruction.

```text
Plan a new STEM 207 pathway branded Moxie using
MOXIE_STEM207_Curriculum_Pathway_Plan.md and the 16 supplied session DOCX files.

PLAN ONLY. Do not edit application code, install packages, write migrations,
seed records, publish content, or deploy. Return the proposed plan for review.

Inspect the existing repository and any applicable project instructions.
Identify the current Category, mission, pathway, progress, role, asset, and
content-authoring structures. Verify persistence from code, not UI copy.

Preserve existing categories and the current coding pathway. Moxie is a separate
pathway referencing canonical activities, primarily associated with Engineering
& Robotics. Do not create a Moxie Category or fill the five 3D Printing drafts.

Preserve all 16 sessions and four units. Distinguish source requirements from
proposed enhancements. Do not invent durations, grades, completed assessments,
working simulations, or student artifacts. Keep code blanks in student scaffolds.

Return:
1. Current architecture findings with actual repository file paths.
2. A source-to-content map covering every session and its assets.
3. Proposed Moxie navigation, page structure, and content relationships.
4. Existing features that can be reused and verified gaps that need work.
5. A minimal phased change plan, including any persistence and permission needs.
6. The curriculum/hardware validation backlog and proposed responsible reviewers.
7. Acceptance checks, unresolved decisions, and the smallest useful first release.

Separate content preparation from software work. Do not claim any circuit or
sketch is tested unless a test was actually performed and recorded. Stop after
presenting the plan; implementation requires a separate instruction.
```

## 13. Acceptance criteria for a later release

- Moxie has its own branded overview and clear final-project promise within STEM 207.
- All 16 sessions are present in the correct four-unit order and traceable to their sources.
- Existing Categories and pathways remain intact; the five 3D Printing placeholders remain untouched.
- Student pages provide usable text, code, wiring tables, and accessible diagram support.
- Core requirements and optional stretches are distinct; source checks and explanation prompts survive conversion.
- Supported board, kit, software, preparation, grade guidance, and durations are explicit and validated.
- Instructor-only resources and student evidence follow verified permissions; guest saving is not assumed.
- Progress reflects demonstrated work and teacher review, with individual understanding visible within pair projects.
- Capstone records include the intended user, criteria, testing, improvement, presentation, and reflection.
- Drafts are excluded from ready-to-teach availability; existing library totals remain accurate.
- Future revisions retain provenance and do not silently rewrite completed student work.

## 14. Decisions to settle before implementation

1. **Audience and pacing:** Which students will pilot Moxie, how long is each meeting, and how much setup/build time is available?
2. **Supported kit:** Which exact ESP32 board and component set should the diagrams, code, and teacher guide support?
3. **Publishing scope:** Start with an instructor-led curated pathway, or require cohort assignment and review tools at launch?
4. **Evidence:** Which work must be saved digitally, and which demonstrations can teachers verify in person?
5. **Content ownership:** Who approves technical corrections, pedagogy, adaptations, and future versions?
6. **Showcase visibility:** Private classroom exhibition initially, or an optional reviewed public collection later?

These questions do not prevent planning. They determine the final content specifications and implementation scope.

## Appendix — Source register

All files below were supplied for this review. Session numbering is preserved so future adaptations can be traced directly to their source.

| Session | Source filename |
| --- | --- |
| 01 | Session_01_Hello_ESP32.docx |
| 02 | Session_02_Double_Blink.docx |
| 03 | Session_03_Traffic_Light.docx |
| 04 | Session_04_Fading_Color_Mixing.docx |
| 05 | Session_05_I_Control_the_Lights.docx |
| 06 | Session_06_Too_Many_Switches.docx |
| 07 | Session_07_Knobs_Numbers.docx |
| 08 | Session_08_Smart_Crosswalk.docx |
| 09 | Session_09_Talking_Displays.docx |
| 10 | Session_10_Stopwatch.docx |
| 11 | Session_11_Parking_Assistant.docx |
| 12 | Session_12_Making_Things_Move.docx |
| 13 | Session_13_Capstone_Define_Design.docx |
| 14 | Session_14_Capstone_Build_Sprint.docx |
| 15 | Session_15_Capstone_Test_Improve.docx |
| 16 | Session_16_Capstone_Showcase.docx |

Related planning reference: `STEM207_Categories_Pathways_Claude_Build_Plan.md`. This Moxie brief supplements that document; it does not replace it or represent changes already made to the site.
