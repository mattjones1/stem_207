# Site: brand, Chromebooks, wording, and donations

Site-wide presentation rules. CLAUDE.md has the short versions; this is the detail.

## Brand (co-branded with STEM Coliseum)
- STEM Coliseum and Learning Center is the parent; STEM 207, LLC is a program offered exclusively through it. Read `brand/BRAND.md` before any branding work. The parent guide and all its logo files are in `brand/coliseum/`.
- Every page: a white `.cobrand-bar` brand row (STEM 207 logo linking home, "powered by", and the Coliseum logo at 300px linking to https://stem-coliseum.odoo.com/ in a new tab), the navigation in `.site-header`, and the parent block in the footer. The sign-in card and certificates also show the Coliseum logo. The Coliseum logo always sits on white and is never recolored or redrawn.
- Palette: Dark Teal `#012d2b` (`--navy`, `--fg`), Teal `#03968f` (`--brand-teal`, large type and graphics), text teal `#037872` (`--teal`, small text and buttons, for 4.5:1 contrast), Green 2 `#94c93d` (`--orange`, CTAs). Fonts: Montserrat and Open Sans. The STEM 207 logo is STEM in Dark Teal and 207 in Green 2.
- Approved kit files (unchanged originals): `brand/logos/stem-207/` (logo, reverse, mark; SVG and PNG), `brand/logos/lockups/` ("powered by" lockups), `brand/colors/` (palette CSS and text). The old indigo/lime `brand/marketing-kit/` is retired (in git history).
- Marketing images show no people. AI-generated concept art is illustrative only, so never present it as real equipment or programs.

## Chromebook target
- The target device is a school Chromebook at 1366×768, 100% scaling: about **1366×650** of page. Design and test there; other sizes must not break.
- Short-screen mode is `@media (max-height: 760px) and (min-width: 1000px)` in `styles.css` and `labs.css` (compact brand row, see `brand/BRAND.md`; tighter page tops; 5-column sign-in pictures; compact lab header and a sticky, scrolling brief). `SE.labs.shortScreen()` is the same test in JS.
- **Every lab:** at 1366×650 the stage and its main button (Run / Test / Check) are visible on load without scrolling. On short screens the lab shell scrolls the lab body under the menu after the route renders, through the one-time `SE.afterRoute({ fresh })` hook in `main.js`. Trim a tall stage with a `max-height` in the short-screen block. In short mode the brief shows the goal and **Need a hint?** first, then the steps, then What you'll learn / Why it matters (CSS `order`), so the hint button is on screen too.
- **Activity pages (students):** What you'll learn, Why it matters, and Before you begin are folded `<details>` after the first visit (`stem207.seen.<id>`), and a sticky `.act-bar` jumps to the launch or steps and to the debrief. Moxie sessions have the same bar.
- Route scrolls use `behavior: "instant"` (CSS smooth scrolling would animate them).
- Moxie on ChromeOS: the Cloud Editor doesn't list ESP32 boards, so students use Copy my code / Download .ino and the teacher uploads (validation item 16).
- Outside domains for school web filters: `node tools/list_domains.js --write` regenerates `planning/CHROMEBOOK_IT_ALLOWLIST.md`. Run it after adding launch or Go deeper links.
- Test: `python3 tests/site/test_chromebook.py`.

## Wording
- Use these names everywhere:
  - An **Activity** is one thing a student does. Never "mission" in UI text. Internal ids, routes, and event names like `mission_completed` stay as they are.
  - A **Learning Plan** is an ordered set of activities assigned to a whole class.
  - A **Class** is a roster with a sign-in code.
  - A **Category** is one of the seven areas.
  - Never "expedition".
- Home (`#/`) is "Home" for students and guests and "Dashboard" for educators. Use `SE.homeLabel()`, which is the default for `SE.backLink`.
- Menus:
  - Educators: Dashboard · Learning Plans · Activities · Classes · Checks.
  - Students: Home · My Learning Plans · Activities · My harbor.
  - Guests: Home · Activities.
  - There's no Projector button.
- `#/activities` is the shared category view, and `#/activities/<category>` is one category.
- Old addresses redirect (`MOVED` in `main.js`): `#/library`, `#/area/<id>`, `#/explore`, `#/teach/pathways`, `#/teach/class`, `#/teach/reflections`, `#/teach/missions`, and `#/my/pathways/<id>`.
- A page for another role never sends a signed-in person to another role's sign-in. Students at teacher pages go Home with "That page is for teachers."; guests at `#/plans` go to the student sign-in, and at `#/me` / `#/base` go Home, each with a toast saying why. A page that exists but isn't open yet uses `SE.views.notOpen({ title, text, href, label })` (Moxie for students and guests), not "not found".
- Teacher notes show only to educators (not guests). Every `#/teach/*` page has its own tab title.
- Test: `node tests/tools/test_wording.js` (activity, category, rank, patch, and view text never says mission, expedition, or pathway; student steps aren't written to the teacher) and `python3 tests/site/test_roles.py`.
- Class rewards are the "class journey".

## Free site and donations
- **The whole site is free.** A paid version (Family and Educator subscriptions) is a future goal and is **shelved** on the `paid-site` branch (tag `paid-shelved-2026-10`). Its plan and the must-fix list for resuming are at the top of `planning/STEM 207 PAID.md` on that branch. Don't bring paid code (access.js, tiers, locks, pricing, families) to `main` unless the user asks to resume it.
- **"Support STEM 207"** (`SE.donateCard({ compact })` in `views-library.js`): a Venmo donate card for **grown-ups only**: the guest Home, the educator Dashboard side column, and the footer link `#donate-open` (opens it in `SE.modal`; hidden for students by `body[data-role="student"]`). **Never show it on a student screen.**
  - `config.js` `donate: { venmo, qr }`. With `venmo` empty, it shows a "QR coming soon" placeholder and no button. Set the Venmo **Business** username (no @) to show "Donate with Venmo" (`https://venmo.com/u/<name>`), and put the Venmo app's QR at `assets/img/donate-venmo.png`. A QR that won't load falls back to the placeholder.
  - Donations go to STEM 207, LLC. They aren't tax-deductible, so the wording is "Support", never "tax-deductible".
  - Test: `python3 tests/site/test_donate.py`.
