# STEM 207 Website Builder: instructor guide

## At a glance

| | |
| --- | --- |
| **Big idea** | A program can write a first draft of a website by following rules. People decide what it should say, test it, fix it, and make it good for real visitors. |
| **What students do** | Answer seven questions while a live preview shows their site taking shape, read the HTML and CSS the builder writes, then predict, change, extend, debug, and finish it in 8 activities, ending with a partner test. |
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
- predict what a change to code will do, then test the prediction;
- find and fix HTML and CSS bugs, and record how they fixed one;
- document a change with a code comment;
- test a page with a real visitor and improve it from their feedback;
- explain what a person adds that a rule-following program can't.

Standards (CSTA): 1B-AP-15 (test and debug), 2-AP-15 (feedback from users, through the partner test), 2-AP-19 (document programs, through the CSS comment in activity 4), 2-IC-21 (accessibility in design: alt text, contrast, and the phone view).

## How the builder works (no AI)

The builder is a program in STEM 207 that follows rules. It:
- reads the student's answers and matches keywords (for example, "moose" or "hike") to built-in pictures;
- turns lists in the student's words ("hiking, kayaking and camping") into list items or cards;
- puts the student's chosen main picture at the top (the picture question lists matching pictures first, but the student decides);
- picks one of 8 style themes, one of 3 hero layouts, and a layout for each section;
- adjusts colors until every word has at least 4.5 to 1 contrast;
- never invents facts: anything it can't know becomes a placeholder like "Write your About words here."

Nothing is sent to any outside service. The same answers always make the same website.

**Make a Change** works the same way: it knows about 20 changes ("make the title stand out", "add more space", "make the background blue", "add a section about…"). It shows Before → After and the exact lines it would change. The main button is **Teach Me to Make This Change**, which turns the change into steps the student types, then asks for **Your turn**: the same kind of change somewhere else, with no steps. **Apply it for me** works at most 3 times per activity, so the builder is a scaffold that fades, not a shortcut. Anything it doesn't know gets an honest "the builder doesn't know that one yet."

## The 8 activities

| # | Activity | What students do | What Check my work needs |
| --- | --- | --- | --- |
| 1 | Meet Your HTML | Find a heading and change its words | A heading with a new real word of their own, and no heading deleted |
| 2 | Make It Personal | Change a heading and a paragraph, and add their own sentence | A changed heading and paragraph, and a new sentence of 5+ real words |
| 3 | Discover CSS | Change a color and a font property | A changed color and typography property that style something on the page, with every word still 4.5 to 1 |
| 4 | Design the Layout | Change spacing, or move a section, and explain it in a comment | A changed margin, padding, or gap (or a new section order), and a new CSS comment of 3+ words |
| 5 | Add Something New | Add a list, picture, link, card, or section | A new element, with alt text, link words, links that go somewhere, and lists of 2+ items |
| 6 | Debug Like a Developer | Fix three bugs in a practice copy, and log one | No bugs left, and one bug log entry: what they saw, their guess, and what fixed it |
| 7 | The Human Touch | Answer three questions, then improve the page | Three short answers and a change of their own |
| 8 | My Website, My Creation | Test it with a partner and finish | A partner test (three tasks, each Easy / Hard / I got lost) and one change they'll make, no placeholders left, one `<h1>`, readable colors, the Phone preview, and their own changes |

Each activity's lesson is three steps: **Learn**, **Predict** (a question about the student's own code, answered before they change it), and **Do it**. Every check compares the code with a snapshot taken when the activity opened, so the student must make the change, and it looks for quality: "asdf asdf" isn't a sentence, and an unreadable color doesn't pass. Applying a Make a Change suggestion updates the snapshot: it never completes an activity by itself. Any valid way of doing it passes.

**Debug (activity 6)** picks three bugs from a pool of ten (CSS: a missing semicolon or `}`, a misspelled property, hard-to-read colors; HTML: a broken link, a missing alt, a misspelled picture name, a tag that never closes, a skipped heading level, a duplicate id), so neighbors have different bugs. Students see the kind of bug first, then **Where is it?**, and only then **Find it**. **More tools → New practice copy** gives three new bugs for more practice.

## Before class

- [ ] Make a class and print login cards. Each student's website saves on their device.
- [ ] Open the lab and press **Explore an Example** on the projector.
- [ ] Decide how far each group should go (see Differentiation).

## 75-minute plan

| Time | Activity | What happens |
| --- | --- | --- |
| 0:00–0:08 | Welcome | Show Explore an Example. Ask: who decided what this page says? Explain the builder follows rules and isn't AI. |
| 0:08–0:20 | The interview and the reveal | Students answer the seven questions, watching the live preview change, and build Version 1. |
| 0:20–0:45 | Activities 1–4 | **Demo first:** answer a Predict question out loud with the class, then tap the heading in the preview to find its code and change it. |
| 0:45–1:00 | Activities 5–6 | Group moment before 6: what's a bug, and how do you find the first one? Model a bug log entry: what I saw, my guess, what fixed it. |
| 1:00–1:10 | Activities 7–8 | Pairs read each other's pages: what would a real visitor need? Then partners run each other's three-task test in activity 8. |
| 1:10–1:15 | Wrap-up | Exit tickets. Who did the thinking: the builder, or you? |

## Running it

- **"It's already done."** The builder wrote a draft. Ask what a visitor would still need: a real fact, a clearer link, a better sentence.
- **Tap to find.** Tapping any part of the preview selects its HTML and lists the CSS rules that style it, with **Go to rule**.
- **What does this do?** The line under the code box explains the tag, attribute, or CSS at the cursor.
- **Predict first.** Each activity's lesson asks one question about the student's own code before they change it. A wrong guess is fine: the explanation and **Show me in my code** follow.
- **More tools.** Tag Explorer and Versions live in the More tools menu. Every applied change saves the page before it, and Restore asks first and saves the current page, so nothing is lost.
- **The partner test.** In activity 8, a classmate (or you) tries three tasks on the page and taps Easy, Hard, or I got lost. If a student is working alone, be the partner.

## Common mistakes and misconceptions

- **"The computer understood my idea."** It matched keywords. Activity 7 makes this visible.
- Deleting a `<` or `>` by accident: Undo (Ctrl+Z) brings it back.
- A missing semicolon in CSS makes the next line stop working too, and browsers never show an error message for CSS.
- Moving only part of a section: move from `<section>` to `</section>`.

## Differentiation

- **Grades 4–5:** aim for activity 3. Pairs work well: one reads the code, one types.
- **Grades 6–8:** all 8 activities, then Make a Change with Teach Me and Your turn for two new CSS tricks, or a New practice copy in activity 6 for more debugging.
- **Larger text:** use the browser zoom (Ctrl and +).

## Assessment

- Activities check real code changes, not clicks: real words, readable colors, and an explaining comment.
- Look for evidence over the student's shoulder: the Predict answer, the bug log in activity 6, the three answers in activity 7, and the partner test in activity 8. They stay on the device.
- Exit ticket: on the printable card.

## Troubleshooting

1. **"My website is gone."** It's saved on the device they built it on.
2. **The page looks blank.** The message under the preview says why: no words in `<body>`, a tag that never closed, or a missing `{` or `}`.
3. **Make a Change says it doesn't know.** That's honest: it only knows a list of changes. Try one of the examples, or make the change by hand.
