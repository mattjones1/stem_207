# Train the Machine: instructor guide

**STEM Coliseum AI workshop 1 · Grades 4–8 (Explorer mode supports grades 2–3) · 45-minute, 90-minute, or extended formats · A Chromebook, laptop, or tablet per student or pair · Open it at `#/lab/pattern-machine`**
A STEM Coliseum AI workshop, built for STEM 207 (2026). On the site it's the Pattern Machine Lab.

## At a glance

| | |
| --- | --- |
| **Big idea** | A machine can find patterns. People decide whether those patterns are useful, fair, and trustworthy. |
| **What students do** | Become AI trainers: build a training set, train a real machine-learning model on made-up creatures (Glims and Norps), catch it learning the wrong lesson, and decide when people should check its answers. |
| **What they make** | An AI Research Notebook and a printable **AI Research Report**. |
| **What they earn** | The **Responsible AI Explorer** certificate. It needs stages 3–6, a pass in stage 7, and stage 8. |
| **Grades 2–3** | Can stop after Bias Detective (stage 5). Use Explorer mode. |
| **Early finishers** | The extension investigations (below), then Teachable Machine in the Classroom. |
| **Prep** | About 10 minutes. |

## Learning objectives
Students will:
- Describe AI, machine learning, and classification, and how a learned model differs from a rule-based program.
- Explain how training examples shape what a machine-learning model predicts, and trace one real prediction (features → distance → nearest neighbors → vote).
- Test how sensitive a prediction is by changing one trait, without treating that as proof of what causes the label.
- Build, label, and change a training set, then train and test a real model.
- Compare repetitive and varied examples using accuracy on a separate test set.
- Find a group a model gets wrong, explain the biased data behind it, and fix it with evidence.
- Explain why a confidence score is not a guarantee, and choose a threshold for a job.
- Decide when AI should help, help with a person reviewing, or not decide at all.

**Standards (CSTA):**

| Code | In this workshop |
| --- | --- |
| 1B-DA-07 | Using data to make predictions and spot patterns |
| 2-DA-09 | Refining a model based on data |
| 2-IC-21 | The effects of computing on people, including bias |

## Course map

Every stage has a goal, steps, three hints (notice, then an idea, then a small example), and a "What you learned" line. The lab checks the model's real results, so students can't finish a stage just by clicking Done. The AI Research Notebook records the real numbers at key moments.

| # | Stage | Concept | What students do | How the lab checks it | Minutes |
| --- | --- | --- | --- | --- | --- |
| | **Part 1: Learn like a machine** | | | | **25** |
| 1 | Be the Machine | Learning from examples | Predict a new creature from labeled examples, then revise a color rule when a blue Norp breaks it. Play the rule game, on their own or with a partner. | A rule that fits every example, and one solved game round | |
| 2 | Build the Training Set | Examples and labels | Pick a secret rule the machine never sees, then label creatures to build a training set. Optional: design creatures in the **Creature Studio**; the dataset dashboard shows coverage, missing combinations, and contradictions. | At least 8 examples (6 in Explorer), both labels, labels that match their rule, and a reason for the mix | |
| | **Part 2: Train and test** | | | | **28** |
| 3 | Train and Inspect | How the model predicts | Train and test 3 new creatures. Step through **Inside the Machine** (features → distances → nearest neighbors → the vote → predict right or wrong, then reveal). Try **Change One Thing** (change one trait, ask again). Then change a training example so a prediction flips. | All four tasks: 3 tests, the walkthrough with a prediction before the reveal, one Change One Thing, and a real flip with the example responsible tapped. Training edits are saved. | |
| 4 | The Accuracy Experiment | Data quality and generalization | Predict, then run "More of the same" and "More variety" in batches of 3 on the same 16 test creatures. Compare the two lines. | Both runs finished, and an explanation that matches their measured numbers | |
| | **Part 3: When it goes wrong** | | | | **27** |
| 5 | Bias Detective | Bias in data | Group the error log by one or two traits (with sample sizes and training counts), find the problem group, inspect the training data, fix it, and test again. Before/after bars and an evidence panel. Optional: **Fix One Problem, Create Another** (a budget swap). | Group accuracy really improves, or, after 2 attempts that didn't help, an explanation and a next step | |
| 6 | When the Machine Doesn't Know | Confidence and uncertainty | Predict whether to trust a 5-of-5 answer (then see it's wrong). On the **Trust Dashboard**, try the possible settings (always answer, 60, 80, 100%) and watch accuracy and coverage together. Find a confident mistake, and pick a threshold for a game and for a pet shop. | The trust prediction, 3 settings tried, a confident mistake found, and a threshold with a reason for each job | |
| | **Part 4: People decide** | | | | **20** |
| 7 | The Human Decision Room | Responsible use | For 10 real-world situations, choose a decision and a reason. | 7 of 10 sound choices to pass | |
| 8 | The Responsible AI Challenge | Build, test, explain, decide | Choose an investigation question and a hypothesis **before** testing. On a new rule: build, train and test on 20 creatures, investigate a mistake (Inside the Machine), improve and retest on the same creatures, set a threshold, and explain. If the score didn't rise, explain why and name a next experiment. | Every task ticks itself from the real work. Then **My AI Research Report**: question, hypothesis, first and new results, group changes, a mistake discovered, what it still struggles with, and when a person should review. | |

**The model, in plain words.** It's a real k-nearest-neighbors classifier running in the browser.
- **Distance** is the number of traits, out of 6, that differ between two creatures. The traits are color, shape, eyes, horns, antennae, and tail.
- **Voting:** the 3 closest examples vote (5 in stage 6). Ties at the same distance go to the example added first.
- **The confidence score** is the share of neighbors that agree, so with 3 neighbors it can only be 67% or 100%. It is the model's own number, **not** a probability of being right.
- **The secret rule is never given to the model.**

**Modes, not grade labels.** Students pick a mode on the landing screen and can switch any time. Nothing asks their grade.

| Mode | Suggested for | What changes |
| --- | --- | --- |
| Explorer | Grades 4–5 (and 2–3) | Fewer cards, simpler rules and wording, a 6-example training set |
| Investigator (default) | Grades 5–6 | The full workshop |
| Researcher | Grades 7–8 | Choose the number of neighbors (1, 3, or 5); a K comparison in stage 4; feature selection in stages 3 and 8 (an advanced setting: the model ignores unchecked traits); a confusion matrix and training vs. test accuracy in stage 8; the "never seen anything like it" check; written reasons |

**Optional extensions** are marked **Optional** in the lab and never block a stage: the Creature Studio (stage 2), the Experiment bench with snapshots and challenges (stage 3), and Fix One Problem, Create Another (stage 5). The **AI Field Guide** (a button beside Notebook) holds 8 concept cards that unlock as students reach each stage.

**The eight ideas and where they live**

| Idea | Field Guide card | Hands-on in |
| --- | --- | --- |
| What is AI? (AI → machine learning → classification; rule-based vs. learned) | A | Stage 1 |
| Training data: features, labels, training vs. test examples | B | Stages 2–3 |
| Pattern recognition: a pattern in a few examples vs. one that holds up | C | Stage 1 |
| Classification and prediction: the real comparison and vote | D | Stage 3 (Inside the Machine) |
| Accuracy and generalization | E | Stage 4 |
| Bias and representation | F | Stage 5 |
| Confidence and uncertainty (agreement isn't probability) | G | Stage 6 |
| Human judgment | H | Stages 7–8 |

## Before class

**Setup checklist**
- [ ] Make a class and print login cards so work saves on each student's device. Guests can work ("Look around as a guest"), but their work lasts only for the browser session.
- [ ] Open stages 3, 5, and 6 on the projector so you can demo **Inside the Machine**, the error log, and the **Trust Dashboard**.
- [ ] Read the answer guide below so you know what each experiment is built to show.
- [ ] Print the cards in [02-printable-cards.md](02-printable-cards.md): the Be the Machine card, the Decision Room discussion card, and the exit ticket.

**STEM 207 privacy rule:**
- Everything is made up: no cameras, microphones, photos, accounts, or personal information.
- The model runs in the browser and nothing is sent anywhere.
- Training sets, notebook notes, and the report stay on the device. Only numbers (accuracy, counts, thresholds) are logged.

**AI honesty rule:** every score on screen is a real output of the model, and the report says "improved" only if accuracy actually rose.

## Lesson formats

Every format uses only the required work in each stage. The optional extensions (Studio, Experiment bench, budget swap, Researcher tools) are for early finishers and the extended session; don't try to fit them into 45 or 90 minutes.

**45-minute introduction** (what AI is, examples and labels, patterns, one model investigation)

| Time | Activity | What happens |
| --- | --- | --- |
| 0:00–0:05 | Welcome | The big idea. Open Field Guide card A together: AI → machine learning → classification, and the rule-based vs. learned sort. |
| 0:05–0:15 | Be the Machine (stage 1) | **Group moment:** why did the color rule seem right? Several rules can fit a few examples. |
| 0:15–0:25 | Build the Training Set (stage 2) | Students label at least 8 creatures. Ask: what's missing from your set? |
| 0:25–0:40 | Train and Inspect (stage 3) | Demo one prediction with **Inside the Machine** on the projector, then students do their own, plus one **Change One Thing**. |
| 0:40–0:45 | Exit ticket | "How did examples help the machine predict? What would change its answer?" Stop after stage 3; no certificate in this format. |

**90-minute flagship workshop**

| Time | Activity | What happens |
| --- | --- | --- |
| 0:00–0:05 | Welcome | Introduce the AI Research Crew and the big idea. Students choose a mode. |
| 0:05–0:15 | Be the Machine (stage 1) | **Group moment** after the tricky example: why did the color rule seem right? Several rules can fit a few examples. |
| 0:15–0:30 | Build and train (stages 2–3) | Demo **Inside the Machine** on the projector: step through one prediction. **Group moment** after students first classify a creature: the machine compares; it doesn't understand. |
| 0:30–0:43 | The Accuracy Experiment (stage 4) | **Group moment:** compare charts. Did anyone's accuracy go down? Why isn't training accuracy proof? |
| 0:43–0:58 | Bias Detective (stage 5) | **Group moment:** the Talk about it questions. Who should notice and fix a model that fails one group? |
| 0:58–1:10 | Confidence (stage 6) | Poll the room before the reveal: "Five out of five agree. Would you trust it?" Then demo the **Trust Dashboard**: did the 100% setting make it more accurate, or just answer less? Why were the purple creatures wrong? |
| 1:10–1:25 | The Human Decision Room (stage 7) | Before students start, read two cases aloud and model a reason. Discuss the judgment calls afterward, using the discussion card. |
| 1:25–1:30 | Report and recognition (stage 8) | Students choose their question and hypothesis and start the challenge. Most classes finish stage 8 (10–15 minutes) and print the report in a second session. |

**Extended research session** (a second 45–60 minutes, or a full 2–2.5 hour block)
- Finish stage 8 and print **My AI Research Report** (15 minutes).
- Open investigations (20–30 minutes), in pairs: the stage 3 **Experiment bench** (save a Baseline snapshot, then try More examples, Better variety, and a Wrong label, measuring each), **Fool the Machine**, and **Fix One Problem, Create Another** in stage 5. Researcher mode: compare K = 1, 3, 5 in stage 4 and try feature selection in stage 8.
- Peer explanations (10–15 minutes): each pair explains one experiment from their snapshots to another pair, with the numbers.

Times are targets and haven't been tested with classes yet. Nothing times students out.

## Stage-by-stage facilitation

| Stage | Ask the class | Evidence you should see | Watch for |
| --- | --- | --- | --- |
| 1 | "Which rule fits every card? How do you know it's right?" | The color rule breaks on the blue Norp; the horns rule fits all six. | Students who stop at the first rule that fits four cards. |
| 2 | "What kinds of creatures are missing from your training set?" | 8+ labeled examples, both labels, labels matching their rule; the dashboard shows what's missing. | Equal Glims and Norps treated as "done". |
| 3 | "Which examples did it compare? What would change its answer?" | Inside the Machine's distances and votes; one Change One Thing; a training edit that flips a prediction. | "It knows horns matter." It doesn't; it counts differences. |
| 4 | "Did more examples always help?" | More of the same: 69 → 63 → 75 → 69%. More variety: 69 → 81 → 81 → 88%. | Reading training accuracy as proof. |
| 5 | "Which group fails? What in the training data explains it?" | Blue Glims and orange Norps 0 of 6; blue + pointy horns 0 of 3 with no training examples like it; after the fix, 5 of 6. | Conclusions from groups with 1–2 creatures ("too few to tell"). |
| 6 | "Five out of five agree. Would you trust it?" | The purple creature is wrong at 5 of 5; at 100% the model answers half and still misses the purple ones. | "A higher threshold is always safer." |
| 7 | "Who could be hurt by a mistake? Who should decide?" | 7 of 10 sound decisions; fitting reasons for the firm cases. | Choosing "AI can help" for discipline, medical, scholarship, or emergency cases. |
| 8 | "What did you predict, what changed, and what's still weak?" | A question and hypothesis before testing; first and new results on the same 20 creatures; a mistake traced to its neighbors. | Claiming improvement the numbers don't show. |

## Running it
- **Say it early and often:** "This machine doesn't understand creatures. It counts different traits and lets the closest examples vote." k-NN is only one kind of AI.
- **"Why did it say that?"** Send the student to **Inside the Machine** (stage 3, or Inspect in stage 8). Step 2 shows each training example's distance, step 3 the nearest neighbors, step 4 their votes. Ask: which example misled it? Then try **Change One Thing**.
- **"It's broken."** It's not. The model only knows the examples. Ask: what's in your training set, and what's missing?
- **Stage 4:** both runs use the same 16 test creatures, so the chart is a fair comparison. Turn on training accuracy to show why it's nearly always 100%.
- **Stage 5:** have students group the results by color before they guess. The overall score hides the problem.
- **Stage 7:** written sentences are never scored by the computer. They're marked "for your teacher" and printed in the report.
- **The Notebook button** opens the AI Research Notebook on every stage. Students add "My prediction / What surprised me / What I learned".

## Answer guide

**What each experiment is built to show.** Each result is measured by automated tests against the real model.

| Stage | Dataset | What happens |
| --- | --- | --- |
| 1 | A, B | Rule A is pointy horns → Glim. In B, every early Glim is blue **and** has pointy horns, so "blue" fits at first. A blue Norp with round horns breaks the color rule. |
| 4 | C, D | Same 16 test creatures. **More of the same:** 69% → 63% → 75% → 69%. **More variety:** 69% → 81% → 81% → 88%. |
| 5 | E | The true rule is about horns, but the training Glims are orange and the Norps blue, so color becomes a shortcut. Typical creatures score 10 of 10, but blue Glims and orange Norps score 0 of 6 (63% overall). Grouped by color and horns, blue + pointy horns is 0 of 3 with no training examples like it. Adding the six blue-Glim and orange-Norp candidates brings it to 94%. The green candidates change nothing. **Budget swap (optional):** keeping 14 slots, swapping out 4 blue Norps for 4 candidates lifts the problem group to 5 of 6 (88% overall), but a blue Norp with round horns goes from right to wrong. |
| 6 | F | Always answer (or 60%): the model answers everything: 58% accuracy. At 80%: 67% accuracy, 75% answered. At 100%: 50% accuracy, 50% answered. Three purple creatures, a kind the training data never had, are wrong with 5 of 5 agreeing. |
| 8 | G | The rule is two antennae **and** a long tail → Glim. Training on a lopsided 8 of the pool scores 60%. Training on the full pool reaches 90%. |

**Stage 6 job choices.** Either threshold passes if the reason fits it:
- **The game:** a wrong answer just costs a point, so a low threshold that answers more is reasonable.
- **The pet shop:** a wrong answer could mean a bite, so a higher threshold that hands unsure cases to a person is reasonable.

Make sure students notice that even 100% didn't catch the purple creatures.

**Stage 7 rubric. This is a draft for your review.** A case is sound when the decision is allowed and the reason fits.
- **Firm cases:** for these four, "AI can help with this" on its own is never sound. "A person must review" or "AI should not decide" passes with a fitting reason.

  | Case | Reasons that fit |
  | --- | --- |
  | Deciding whether a student should be disciplined | harm, unfair, can't know, missing cases |
  | Helping a doctor review X-rays and other medical images | harm, saves time, a person decides, missing cases |
  | Deciding who receives a scholarship | unfair, harm, missing cases, private |
  | Deciding whether a person should receive emergency assistance | harm, unfair, can't know, missing cases |

- **Judgment calls:** for these six, any decision with a fitting reason passes, and the case is flagged for discussion.

  | Case | Reasons that fit |
  | --- | --- |
  | Counting puffins in wildlife photos from a Maine seabird island | small mistake, saves time, missing cases |
  | Sorting Maine wild blueberries by size and quality | small mistake, saves time |
  | Helping a school library sort books by subject | small mistake, saves time, a person decides |
  | Recommending music based on what someone likes | small mistake, a person decides, private |
  | Helping a scientist spot unusual weather patterns | saves time, a person decides, missing cases, harm |
  | Helping translate town information into other languages | saves time, harm, a person decides |

- **To pass:** 7 of 10.

## Common mistakes and misconceptions

| What students say | What's really going on | What to ask |
| --- | --- | --- |
| "More data always helps." | Stage 4: copies can make accuracy dip. | "Follow the More of the same line. Does it ever go down?" |
| "The machine understands." | It counts different traits. | "Open Inside the Machine. What did it actually compare?" |
| "High confidence means right." | Stage 6: 5 of 5 agreed, and it was still wrong. | "Were any purple creatures in the training data?" |
| "Equal numbers of each label makes it fair." | Covering different kinds of creatures matters too. | "Which kinds aren't in your training set yet?" |
| "A higher threshold is always safer." | It also answers less, and it doesn't catch new kinds of cases. | "What happens to the people the machine won't answer?" |
| "100% on training means it works." | Training accuracy only checks examples it already has. | "How does it do on creatures it has never seen?" |

**Keep fairness in proportion.** Creature colors don't capture real-world fairness. Ask afterward: what could happen if a real AI system worked better for some people than others, and who should catch it?

## Differentiation
- **Explorer mode** (grades 4–5, and 2–3): fewer cards, simpler rules, and a 6-example training set. Grades 2–3 can stop after stage 5.
- **Investigator mode** (grades 5–6): the full workshop.
- **Researcher mode** (grades 7–8):
  - change the number of neighbors and compare K = 1, 3, 5 on the stage 4 test set;
  - turn traits off with feature selection (stages 3 and 8) and see which predictions change;
  - read the confusion matrix and training vs. test accuracy in stage 8;
  - use the "never seen anything like it" check;
  - write reasons in stage 7.
- **Early finishers** (the library entry's extension; these are open investigations the lab doesn't check):
  - in Researcher mode, change the number of neighbors in stage 3 and see which predictions change;
  - make the machine say "I'm not sure" a lot in stage 6;
  - try **Fix One Problem, Create Another** in stage 5, then find a different swap of your own that does the same;
  - in the stage 3 Experiment bench, save snapshots for More examples, Better variety, and a Wrong label, then explain the differences.
- **After the workshop:** Teachable Machine in the Classroom applies the same ideas to a real outside tool.

## Assessment
- **Check (from the library entry):** "Show your AI Research Report. Point to one mistake your model made, the examples that caused it, what you changed, and whether the test score really went up."
- **What the AI Research Report shows:**
  - the student's real numbers (first and latest accuracy, training examples, threshold);
  - their notebook entries from stages 4–6;
  - their explanations and written reasons.
- **Developmental rubric.** Use it to describe where a student is now and what to try next, not to rank students. Open-ended explanations are always the teacher's call; the lab never scores them.

  | Dimension | Beginning | Developing | Secure | Extending |
  | --- | --- | --- | --- | --- |
  | **1. How the model uses examples** | Says the machine "knows" or "understands". | Says it uses examples, but not how. | Traces a real prediction: distance → nearest neighbors → vote. | Predicts how changing one example or one trait will move a prediction, then checks it. |
  | **2. Conducting and interpreting experiments** | Runs the lab steps without predicting. | Predicts, but reads training accuracy as proof. | Predicts, tests on held-out creatures, and compares fairly (same test set). | Designs their own comparison (snapshots, K, features) and explains a surprising result. |
  | **3. Diagnosing limitations and improving data** | Says "add more data". | Names a missing kind of creature. | Finds the failing group with enough creatures to judge, changes the data, and shows the before/after. | Explains a tradeoff: a change that helped one group and hurt another. |
  | **4. The role of human judgment** | Trusts any confident answer. | Says people should check "sometimes". | Ties who should decide to the cost of a mistake, with a fitting reason. | Weighs coverage against accuracy and names who is responsible for checking. |

- **Certificate vs XP:** the Responsible AI Explorer certificate is separate from Pass / Try again. Activity XP still comes from your teacher check. The certificate uses the display name only, and it's blank for guests.

## Troubleshooting
1. **A student's work is gone.**
   - **They were a guest:** guest work lasts only for the browser session. Sign them in.
   - **They switched devices:** work stays on the device they used.
2. **The certificate won't unlock.** The stage 8 panel lists the missing stages as links: finish stages 3–6, pass stage 7, and finish stage 8.
3. **"My accuracy didn't go up."** That's a valid result. The report says so honestly. Ask what they'd try next. Stage 5 accepts an explanation after 2 attempts.
4. **A student can't see the main button.** Reset the Chromebook zoom to 100% (Ctrl + 0).
5. **There's no printer.** Print the AI Research Report or certificate to "Save as PDF".
6. **"My stage 3 changes came back."** That's on purpose: training edits are saved. **Start again from my stage 2 set** resets them.
7. **A Field Guide card says Locked.** Cards unlock when the student reaches the stage that uses them.
8. **Stage 8's Train and test button is grayed out.** Choose a question and a hypothesis first (the lab asks scientists to predict before testing).
9. **The Studio won't add a creature.** It's an exact copy of one of the held-out test creatures. Change one trait; testing on training examples wouldn't be fair.

## Classroom pilot checklist
Run through this the first time you teach it, and send notes to STEM 207.
- [ ] **Devices:** the lab opens at 100% zoom on a school Chromebook. In every stage the main action is visible without scrolling, and the Field Guide and Notebook open.
- [ ] **Saving:** a signed-in student leaves stage 3 after changing a training example, comes back, and the change is still there. A guest's work clears when the browser closes.
- [ ] **Inside the Machine:** a student completes all 5 steps by keyboard only (Tab, Enter).
- [ ] **Timing:** note the real minutes for each stage against the 90-minute plan. Did stage 8 fit, or did it need a second session?
- [ ] **Reading load:** Explorer-mode students (grades 4–5) can follow each stage's goal without adult help. Note words they asked about.
- [ ] **The 5-of-5 moment:** how many students said they'd trust it before the reveal? Did the discussion land?
- [ ] **Stage 7 rubric:** do the firm cases and judgment calls match your school's values? (It's a draft.)
- [ ] **Reports:** three printed AI Research Reports show real numbers, a hypothesis, and a mistake traced to its neighbors.
- [ ] **Rubric check:** place five students on the four rubric dimensions. Was the evidence you needed on screen or in the report?
- [ ] **Privacy:** no names, photos, or personal details went into any field. Written lines stay on the device.

## Materials
A device per student or pair · a projector for the group moments · login cards · the printed Be the Machine card, Decision Room discussion card, and exit tickets · pencils

## Things to check before the first run
- **Timing.** The 90-minute plan hasn't been timed in a STEM 207 class yet. Stage 8 often needs a second session.
- **The stage 7 rubric is a draft.** Review the firm and judgment-call cases above before students use them.
- **No workshop template yet.** Unlike the other two workshops, Train the Machine has no workshop Learning Plan template. Assign the activity on its own, or add it to a plan.
