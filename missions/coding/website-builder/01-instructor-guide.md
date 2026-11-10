# STEM 207 Website Builder: instructor guide

## At a glance

| | |
| --- | --- |
| **Big idea** | A program can write a first draft of a website by following rules. People decide what it should say, test it, fix it, and make it good for real visitors. |
| **What students do** | Answer seven questions, read the HTML and CSS the builder writes, then change, extend, debug, and finish it in 8 activities. |
| **What they make** | Their own website (`index.html` and `styles.css`), saved on their device. |
| **What they earn** | Website Created (the builder made Version 1), Code Explorer (activities 1–3), Website Developer (all 8, with a certificate). |
| **Grades 4–5** | Aim for Discover CSS (activity 3). |
| **Early finishers** | Make a Change with Teach Me, then the Web Builder Lab. |
| **Prep** | About 5 minutes. |

## Learning objectives

Students will:
- read an HTML document and find the code that makes each part of a page;
- change HTML content, and CSS colors, fonts, and spacing;
- add new HTML: a list, a picture with alt text, a link, or a section;
- find and fix HTML and CSS bugs;
- explain what a person adds that a rule-following program can't.

Standards (CSTA): 1B-AP-15 (test and debug), 2-AP-15 (feedback and user needs), 2-AP-17 (test and refine).

## How the builder works (no AI)

The builder is a program in STEM 207 that follows rules. It:
- reads the student's answers and matches keywords (for example, "moose" or "hike") to built-in pictures;
- turns lists in the student's words ("hiking, kayaking and camping") into list items or cards;
- picks one of 8 style themes, one of 3 hero layouts, and a layout for each section;
- adjusts colors until every word has at least 4.5 to 1 contrast;
- never invents facts: anything it can't know becomes a placeholder like "Write your About words here."

Nothing is sent to any outside service. The same answers always make the same website.

**Make a Change** works the same way: it knows about 20 changes ("make the title stand out", "add more space", "add a section about…"). It shows Before → After and the exact lines it would change, and the student chooses Apply or Cancel. **Teach Me to Make This Change** turns the same change into steps the student types. Anything it doesn't know gets an honest "the builder doesn't know that one yet."

## The 8 activities

| # | Activity | What students do | What Check my work needs |
| --- | --- | --- | --- |
| 1 | Meet Your HTML | Find a heading and change its words | A heading's words changed |
| 2 | Make It Personal | Change a heading and a paragraph, and add their own words | A changed heading, a changed paragraph, and 5+ new words or a new `<p>`/`<section>` |
| 3 | Discover CSS | Change a color and a font property | A changed color and a changed typography property |
| 4 | Design the Layout | Change spacing, or move a section | A changed margin, padding, or gap, or a new section order |
| 5 | Add Something New | Add a list, picture, link, card, or section | A new element, with alt text on pictures and links that go somewhere |
| 6 | Debug Like a Developer | Fix three bugs in a practice copy | No missing semicolons, no broken links, alt text on every picture |
| 7 | The Human Touch | Answer three questions, then improve the page | Three short answers and a change of their own |
| 8 | My Website, My Creation | Test it like a visitor and finish | One `<h1>`, readable colors, the Phone preview, and their own changes |

Every check compares the code with a snapshot taken when the activity opened, so the student must make the change. Applying a Make a Change suggestion updates the snapshot: it never completes an activity by itself. Any valid way of doing it passes.

## Before class

- [ ] Make a class and print login cards. Each student's website saves on their device.
- [ ] Open the lab and press **Explore an Example** on the projector.
- [ ] Decide how far each group should go (see Differentiation).

## 75-minute plan

| Time | Activity | What happens |
| --- | --- | --- |
| 0:00–0:08 | Welcome | Show Explore an Example. Ask: who decided what this page says? Explain the builder follows rules and isn't AI. |
| 0:08–0:20 | The interview and the reveal | Students answer the seven questions and build Version 1. |
| 0:20–0:45 | Activities 1–4 | **Demo first:** tap the heading in the preview to find its code, then change it. |
| 0:45–1:00 | Activities 5–6 | Group moment before 6: what's a bug, and how do you find the first one? |
| 1:00–1:10 | Activity 7 | Pairs read each other's pages: what would a real visitor need? |
| 1:10–1:15 | Wrap-up | Exit tickets. Who did the thinking: the builder, or you? |

## Running it

- **"It's already done."** The builder wrote a draft. Ask what a visitor would still need: a real fact, a clearer link, a better sentence.
- **Tap to find.** Tapping any part of the preview selects its HTML and lists the CSS rules that style it, with **Go to rule**.
- **What does this do?** The line under the code box explains the tag, attribute, or CSS at the cursor.
- **Versions.** Every applied change saves the page before it. Restore saves the current page first, so nothing is lost.

## Common mistakes and misconceptions

- **"The computer understood my idea."** It matched keywords. Activity 7 makes this visible.
- Deleting a `<` or `>` by accident: Undo (Ctrl+Z) brings it back.
- A missing semicolon in CSS makes the next line stop working too.
- Moving only part of a section: move from `<section>` to `</section>`.

## Differentiation

- **Grades 4–5:** aim for activity 3. Pairs work well: one reads the code, one types.
- **Grades 6–8:** all 8 activities, then Make a Change with Teach Me for two new CSS tricks.
- **Larger text:** use the browser zoom (Ctrl and +).

## Assessment

- Activities check real code changes, not clicks.
- Activity 7's answers stay on the device: read them over the student's shoulder, or ask them to share out loud.
- Exit ticket: on the printable card.

## Troubleshooting

1. **"My website is gone."** It's saved on the device they built it on.
2. **The page looks blank.** The message under the preview says why: no words in `<body>`, a tag that never closed, or a missing `{` or `}`.
3. **Make a Change says it doesn't know.** That's honest: it only knows a list of changes. Try one of the examples, or make the change by hand.
