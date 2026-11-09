# Build Your First Website: instructor guide

**STEM 207 web workshop · Grades 2–8 · 90 minutes · A Chromebook or laptop with a keyboard per student · Open it at `#/lab/build-your-first-website`**
An original STEM 207 workshop (2026).

## At a glance

| | |
| --- | --- |
| **Big idea** | Websites are built by people, for people. Plan with a real person, write clear HTML, and check that everyone can read and use the page. |
| **What students do** | Plan, code, test, and ship a web page for a made-up Maine business in real HTML and CSS. |
| **What they make** | A finished web page and a printed project summary. |
| **What they earn** | The **First Website Shipped** certificate, for finishing stage 8. |
| **Grades 2–3** | Aim for stage 5 (Give Your Website Style), with Extra help on. |
| **Early finishers** | Challenge mode goals, then the Web Builder Lab. |
| **Prep** | About 10 minutes. |

## Learning objectives
Students will:
- Plan a web page with a wireframe, and improve it from what a tester noticed.
- Write HTML for headings, paragraphs, lists, pictures, and links.
- Write CSS rules that change colors and spacing.
- Check and fix headings, alt text, link words, and color contrast.

**Standards (CSTA):**

| Code | In this workshop |
| --- | --- |
| 1B-AP-15 | Testing and debugging a program |
| 2-AP-15 | Seeking feedback from users to improve a design |

## Course map

Every stage has a goal, steps, three hints (notice, then an idea, then a small example), and a "What you learned" line. **Check my page** reads the real rendered page, so students can't finish a stage just by clicking Done. Any valid page passes; nothing is compared against an answer.

Students pick one of three made-up businesses:
- **Casco Bay Bakery** (`muffins.svg`)
- **Pine Coast Kayak Rentals** (`kayak.svg`)
- **Harbor Bait & Tackle** (`tackle.svg`)

Stages 2–6 grow one project.

| # | Stage | Concept | What students do | What Check my page needs | Minutes |
| --- | --- | --- | --- | --- | --- |
| | **Part 1: Plan** | | | | **12** |
| 1 | Meet Your Maine Business | Plan before you code | Pick a business, sketch a wireframe on paper, run a five-second test with a partner, and write what they noticed and one change. | A business picked, at least 4 wireframe sections ticked, what the tester noticed, and one change | |
| | **Part 2: Build with HTML** | | | | **17** |
| 2 | Build the Bones | HTML structure | Type an `<h1>` and a `<p>`. | `h1`, `p` | |
| 3 | Tell Your Story | Paragraphs and lists | Add an `<h2>` and a `<ul>` with `<li>` items. | adds `h2`, a list | |
| 4 | Connect and Illustrate | Links and images | Add an `<img>` with alt text, and a link that jumps to the `<h2>`'s id. | adds a picture, alt text, and a link | |
| | **Part 3: Style and access** | | | | **22** |
| 5 | Give Your Website Style | CSS | In the CSS tab: background color, text color, and one more style. | a style choice | |
| 6 | Build for Everyone | Accessibility | Fix what Check finds, and raise contrast to at least 4.5 to 1. Then open the **Screen reader** view and confirm each alt text and link out loud (**Yes, it's clear** or **Change it**). | `h1`, alt text, link words, contrast, plus each alt text and link confirmed by the student | |
| | **Part 4: Debug and ship** | | | | **26** |
| 7 | Fix the Broken Website | Debugging | Find and fix four bugs on another developer's page (Puffin Point Ice Cream). The first Check names the kinds of problems; the button then reads **Show where they are**. | All four bugs fixed | |
| 8 | Ship Your First Website | Create | Choose **Start from my page** or **Start blank (challenge)**, look at it on the Phone preview, press **Check my page**, and when every check passes, press **Mark ready for review**. | Every check, plus it fits a phone, the Phone preview was used, and 20+ of their own words | |

**Check my page** gives each check one of three results:
- **Looks good**
- **Needs a fix**
- **Check with a person:** the computer can tell that alt text and link words exist and aren't generic, but only a person can judge whether they're good. Students read these aloud to a partner, then press **Yes, it's clear** or **Change it**. On stage 6, every one must be confirmed. A confirmation resets if the words change.

The feedback line sums up what to fix ("2 things to fix: Alt text, Link"). The full message for each check is in the list, with fixes and person checks first and the passed checks folded into one line. The **Screen reader** view (next to Desktop and Phone) lists the page the way a screen reader moves through it, with **Read it to me**.

**The helpers.** Each one puts real code in front of the student:
- **Tag Shelf:** types a real tag pair at the cursor, so the browser's Undo works.
- **Find it:** tap part of the preview to select the code that made it.
- **Code Coach:** one line about the tag or property at the cursor.
- **Color helper:** color pickers that rewrite the value in the CSS.
- **Desktop / Phone preview.**

## Before class

**Setup checklist**
- [ ] Make a class and print login cards so drafts save on each student's device. Students sign in to use the lab.
- [ ] Check keyboards. `<` and `>` are Shift + comma and Shift + period.
- [ ] Open stage 2 and stage 7 on the projector computer.
- [ ] Print the cards in [02-printable-cards.md](02-printable-cards.md): the wireframe sheet, the five-second test card, and the exit ticket.
- [ ] Paper and pencils for the wireframe.

**STEM 207 privacy rule:**
- Every business is made up: no real addresses, phone numbers, or people.
- The preview can't run scripts or reach the internet.
- Student code and plans stay on the device, and only check names and stage numbers are logged.
- To review a page, look at the student's screen, or use the printed project summary. When they send the activity, students can choose "will show you".

## 90-minute plan

| Time | Activity | What happens |
| --- | --- | --- |
| 0:00–0:08 | Welcome: what is a website? | Show a real local website. Ask: who built it, and who is it for? Introduce the three businesses. |
| 0:08–0:20 | Wireframe and five-second test (stage 1) | Students sketch on the wireframe sheet, then test with a partner using the five-second test card. **Group moment:** what did your tester notice first? |
| 0:20–0:37 | HTML (stages 2–4) | **Demo first:** type `<h1>`, the business name, `</h1>`, and watch the preview. Then show the Tag Shelf. |
| 0:37–0:49 | CSS (stage 5) | Demo a `body { }` rule and the color helper. |
| 0:49–0:59 | Accessibility and contrast (stage 6) | **Group moment:** who can't read low-contrast text? (Someone on a sunny screen, or someone with low vision.) |
| 0:59–1:09 | Debug the broken page (stage 7) | Students find the four bugs. Remind them to fix one at a time and check again. |
| 1:09–1:25 | Build and ship (stage 8) | Students start from their page (or blank, as a challenge), check the Phone preview, and mark it ready. |
| 1:25–1:30 | Showcase and reflection | Two or three students show their page. Exit tickets. |

Times are targets and haven't been tested with classes yet. Nothing times students out.

## Running it
- **No web experience is needed to teach it.** Every stage's third hint is a small working example. Extra help adds **Show an example** for the student's own business.
- **"It's broken."** Ask the student to tap the part that looks wrong with **Find it**. The code that made it is selected.
- **The rest of the page went big or bold.** A closing tag is missing. Ask them to find the tag that opens and doesn't close.
- **Read the first Needs a fix.** Students fix one thing, then check again. Don't let them try to fix everything at once.
- **Stage 8 asks how to start.** **Start from my page** brings in the stages 2–6 page to improve and ship. That's the right choice for most grades 4–5 students and for anyone short on time. **Start blank (challenge)** is the independent build; **Show my earlier page** lets them look back. The checks are the same either way, and the project summary says which they chose.

## Answer guide

**Stage 7: the four bugs on Puffin Point Ice Cream.** Any valid fix passes.

| Bug | Check area | One fix |
| --- | --- | --- |
| The title is `<p class="title">` styled to look big | Heading | Change it to `<h1>` (or `<h1 class="title">`) |
| The picture has no alt text | Picture | Add alt text, like `alt="A lighthouse by the harbor"` |
| The link says "click here" | Link | Use words that say where it goes, like "See all our flavors" |
| The body text is light gray (`#b8b8b8`) on white | Colors | Make the text darker, like `color: #333333` |

Stage 7 reveals the bugs in three steps: the first Check names the kinds of problems, the next shows where each one is, and then it verifies the fixes.

**What each check reads:**

| Check | What it looks for |
| --- | --- |
| Heading (`h1`) | One main heading made with `<h1>` |
| Paragraph (`p`) | At least one paragraph |
| Section heading (`h2`) | An `<h2>` |
| List | A `<ul>` or `<ol>` with at least 2 items |
| Picture (`img`) | One of the workshop's pictures (`muffins.svg`, `kayak.svg`, `tackle.svg`) |
| Alt text | Alt text on every picture, at least 8 letters and not generic like "image" (then **Check with a person**) |
| Link | Link words that aren't generic (then **Check with a person**). The link jumps to an `#id` on the page, or to an `https://` address. |
| Style | A background that isn't white, a text color that isn't black, and one more style (like padding or a font) on a rule that matches part of the page |
| Contrast | Every piece of text has at least **4.5 to 1** against its background (WCAG's formula) |
| Fits a phone | The page doesn't scroll sideways at phone width |
| Phone preview | The student looked at the Phone preview |
| Own words | 20 or more words on the page |

**About contrast:** WCAG allows 3 to 1 for large text, but this workshop asks 4.5 to 1 for all text. Passing these checks doesn't mean a page is fully accessible.

## Common mistakes and misconceptions

| What you see | What's going on | What to say |
| --- | --- | --- |
| The rest of the page changes style | A missing closing tag | "Every opening tag needs its closing partner. Which one is missing?" |
| The picture doesn't show | The file name is wrong | "Use `muffins.svg`, `kayak.svg`, or `tackle.svg` exactly." |
| The CSS doesn't apply | A wrong selector name, or a missing `{ }` or `;` | "Read your rule out loud: selector, curly brace, property, colon, value, semicolon." |
| The colors are backwards | `color` and `background-color` mixed up | "`color` is the words. `background-color` is behind them." |
| A link says "click here" | Generic link words | "If you only heard the link words, would you know where it goes?" |
| Low contrast | The text and background are too close | "Make the words darker or the background lighter, and watch the meter." |

**Misconceptions to listen for**
- "Alt text is the file name." It describes what's in the picture.
- "Colors that look OK to me are OK for everyone." The contrast number checks for people who see differently.
- "Bigger words make a heading." An `<h1>` tells browsers and screen readers what the page is about. Big text in a `<p>` doesn't.

## Differentiation
- **Extra help:** **Show an example** for the student's business, and a nudge toward Need a hint? after two tries.
- **Bigger code** (next to Extra help): a larger Tag Shelf and code text for anyone, with no other change.
- **Grades 2–3:** aim for stage 5, with Extra help on. Plan stage 1 together as a class.
- **Challenge mode** (grades 5–8 and early finishers). Its goals never block a stage:
  - two sections with `<h2>` headings;
  - a second link that jumps to another section;
  - a business hours section;
  - a second picture with alt text;
  - a theme where all text has 7 to 1 contrast;
  - fitting a phone screen.
- **After the workshop:** the Web Builder Lab gives self-paced practice with the same ideas.

## Assessment
- **Check (from the library entry):** "Show your finished page. Point to its main heading, its alt text, its link, and its contrast number, and say who each one helps."
- **Explain prompt:** "In three sentences: what your website helps people do, one bug Check my page found and how you fixed it, and how you made the page easier for more people to use."
- **Rubric for the final page:**

  | Area | What to look for |
  | --- | --- |
  | Structure | One `<h1>`, a paragraph, a list |
  | Media | A picture with meaningful alt text, a link with clear words |
  | Style | A background, a text color, and one more choice |
  | Access | Readable contrast; fits a phone |
  | Process | A plan, tester feedback, and fixes the student can explain |

- **Evidence:** the printed project summary, or the student showing you their screen.
- **Certificate vs XP:** the certificate comes from finishing stage 8. Activity XP still comes from your teacher check (Pass / Try again).

## Troubleshooting
1. **A student's draft is gone.**
   - **They switched devices:** drafts stay on the device they used.
2. **A student can't see the preview and code together.** Reset the Chromebook zoom to 100% (Ctrl + 0).
3. **The student typed something and the page didn't change.** The preview drops anything unsafe, like scripts, frames, forms, and outside links or pictures. Point them back to the tags on the Tag Shelf.
4. **A link "doesn't work".** Links never open in the preview, by design. A jump link works when its `#id` matches an id on the page.
5. **There's no printer.** Print the summary or certificate to "Save as PDF".

## Materials
A Chromebook or laptop with a keyboard per student · paper and pencils · a projector · login cards · the printed wireframe sheet, five-second test card, and exit tickets

## Things to check before the first run
- **Timing.** The 90-minute plan hasn't been timed in a STEM 207 class yet.
- **The workshop template** (Build Your First Website Workshop, `tpl-ws-first-website`) is marked not yet reviewed. Look it over before you assign it as a Learning Plan.
- **Typing speed.** Younger students may need the Tag Shelf for most tags. That's expected.
