# STEM 207 PAID 2.0: execution plan (Family + Educator subscriptions, and cleanup)

_Approved October 23, 2026. Executed on the `paid-site` branch; `main` stays live until the go-live gate. v1 is in git history._

## Context
STEM 207 is built out and live. The goal is **revenue**: a free public demo of about 20%, and two subscriptions for the rest.
- **Family:** children learn at home and earn XP.
- **Educator:** classes, Learning Plans, and student tracking.

The v1 plan (October 23, 2026) set the architecture: content split, server delivery, and Stripe. This 2.0 plan folds in the business decisions made since then, cuts what they made unnecessary, and turns the rest into an execution order. It also adds the fixes from two sweeps of the educator and student views at 1366×650. The sweeps found no page errors and no sideways scroll, but about 12 real bugs.

### Decisions (all from the user)
| Topic | Decision |
|---|---|
| **Family plan** | **$20/month or $200/year.** A parent subscribes for **up to 4 children**. Children do **every activity** on their own (no classroom features) and **earn and track XP, ranks, patches, and My harbor**. |
| **Educator plan** | **$40/month or $400/year.** Adds classes, Learning Plans, checks, and student tracking. **Includes Family:** a teacher can also add their own children as a family. A Family plan never unlocks classroom features. |
| Pricing model | Subscriptions only. No per-activity purchases anywhere. |
| Home XP | **Automatic on send.** A home child earns an activity's XP when they send their reflection; no parent Pass. Classroom students still need the teacher's Pass. |
| Child sign-in at home | **Family code + 3 pictures**, the same as the classroom. No child email or password. |
| Trial | **None.** The free tier is the trial. |
| Free accounts | **Browse only** for both parents and educators: the 11 free activities, lab previews, and the read-only sample class. Adding children or classes needs a subscription. |
| Free content | `assets/js/data/tiers.js` (on `paid-site`, test passing): 11 of 56 activities; Dance Party, Ramp Racers, and Pixel Studio in full; level 1 of the other 8 labs; no free templates; no free Moxie. |
| Schools | **By hand** for now: you send a Stripe invoice, then grant access on an owner page. |
| Payments | Stripe Checkout + Customer Portal + Stripe Tax through Supabase Edge Functions. **Built and tested in Stripe test mode.** Live keys come once STEM Coliseum and STEM 207, LLC settle who sells it. |
| Protection | Private repo + server delivery. Paid content never ships to GitHub Pages. |

## The model: a family is a small "class" (reuse, don't rebuild)
The student side already does almost everything a home child needs: picture sign-in (`student_sign_in` → `student_sessions` token), Home, Activities, labs, Me, My harbor, XP, and patches. So a **family is a `classes` row with `kind = 'family'`**, owned by the parent's account.
- **Kept as is:**
  - Children are `students` rows: display name, grade band, and picture code. No new personal information.
  - They sign in at `#/signin/student` with the **family code**.
  - The RPCs work unchanged: `student_sign_in`, `student_state`, `student_log`, `class_roster`.
- **Accounts:** `educators` gains `account_kind` (`educator` | `parent`), chosen at sign-up.
  - **Parent menu:** Family · Activities · Account.
  - **Educator menu:** unchanged, plus Account. An Educator subscriber can also make a family.
- **Server limits:**
  - a trigger caps a family at 4 children;
  - only an Educator plan (or grant) can create `kind = 'class'`;
  - a Family or Educator plan can create one `kind = 'family'`.
- **Home XP** (`assets/js/game.js`):
  - When the student's class `kind === 'family'`, a `mission_completed` with non-empty written evidence counts as a pass. It gives `baseXp` (plus `newSector`), and patches and ranks count it.
  - Classroom rules are unchanged: XP only from a teacher's `teacher_confirmed`.
  - `student_state` returns `class.kind` so `game.js` knows which rule applies. The kind comes from the server, so a classroom device can't claim to be a family.
  - Class-journey rewards don't apply to families.
- **Home child screens:**
  - Home's Up next uses the existing `own` / `suggested` kinds (`SE.home.upNext`).
  - The debrief says "Send it" with no "Waiting for your teacher".
  - Status chips go straight from Not started to Done.
  - No My Learning Plans in the menu.
  - Wording: "your grown-up" where the classroom says "your teacher" (for example, help requests become "Ask a grown-up").
- **Family page `#/family`** is a trimmed class page and reuses `views-teacher.js` pieces:
  - each child's card: rank, XP, recent work sent (read-only), and patches;
  - Add a child (name, grade band, pictures; reuses the Add students modal, capped at 4);
  - print sign-in cards;
  - the family code.
  - No checks queue, plans, or messages.
- **Privacy (COPPA):** the parent creates and controls each child profile, and the profile holds only a display name and picture code. The parent can delete a child, which removes the child's work (reuse `deleteClass`/student delete). Legal review of the consent wording is a go-live item.

## Who can do what
| | Guest | Free parent or educator | Family plan | Educator plan (or grant) | Classroom student / home child | After a lapse |
|---|---|---|---|---|---|---|
| Free activities, full labs, level 1 of preview labs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Paid activities, labs 2+, Moxie | Locked + Subscribe | Locked + Subscribe | ✓ | ✓ | ✓ (from the plan holder) | Locked ("Ask your teacher" / "Ask a grown-up") |
| Family: up to 4 children, XP on send | — | Subscribe prompt | ✓ | ✓ | — | **Read-only, never deleted** (children can still sign in and see their XP and work) |
| Classes, Learning Plans and templates, checks, tracking | — | Subscribe (Educator) | Upgrade to Educator | ✓ | — | **Read-only, never deleted** (roster, Pass or Try again on work already sent, export) |
| Sample class (read-only) | ✓ | ✓ | ✓ | ✓ (resettable) | — | ✓ |

**Access** comes from `plan_for(account)` → `none | family | educator`, from either:
- an `active` Stripe subscription (or `past_due` within 14 days of grace), or
- an `access_grants` row (`founding`, `school`, `comp`, `pilot`; each carries a plan) that hasn't ended.

A student's access is their class owner's plan. `educator` covers family.

## Workstreams, in execution order (all on `paid-site`)

### A. Cleanup from the sweeps (first; small and independent)
**Real bugs:**
1. `#/teach/plans/new` creates an empty draft on every visit (`views-plans.js:166`). Create it on the first save instead.
2. The Moxie template shows "null min" and "0 min" (`core.js:93` `SE.timeText`, `views-plans.js:32` `range`). Show "Time pending", and leave those out of the totals.
3. Wrong-role redirects (`main.js:95, 107, 135`):
   - A guest at `#/plans`, or a student at `#/teach*` or `#/moxie/teach`, lands on the **educator sign-in** and loses the menu.
   - Send students to `#/` with "That page is for teachers."
   - Send guests to `#/signin/student` from `#/plans`, and to `#/` from `#/me` and `#/base`, with a short reason.
4. `#/moxie` and Moxie pages show a bare not-found to students and guests (`views-moxie.js:212`).
   - Students see "Your teacher will open Moxie for your class."
   - Guests see a locked preview (Subscribe, in workstream B).
5. **Teacher notes are shown to guests** (`views-library.js:826`). Show them to educators only.
6. **Wording rules (visible text only; ids stay):**
   - "Your mission" → "What you'll do" (`views-moxie.js:432, 508, 751`).
   - "pathway" → "course" (Moxie) or "Coding Foundations" (coding), in:
     - `views-moxie.js:233, 241, 360, 927`;
     - `areas.js:17`;
     - about 7 spots in `activities.js` (including line 86);
     - `views-teacher.js:96`;
     - `game.js:230`.
   - "expedition" (`progression.js:32, 38`).
   - "missions" (`store.js:286`).
   - "Mission complete" → "Level complete" (`lab-coding.js:693`).
   - The "Code Sector" patch → "Coder" (`progression.js:58`).
7. All `#/teach/*` tab titles read "Educator dashboard" (`main.js:103`). Use the page name.
8. How Does an AI Sort? "Your steps" are written to the teacher (`activities.js:1794…`).
   - Reword them for students.
   - Add a test for teacher verbs in student steps, and list other hits for review.
   - This matters more now, because **home children read every step themselves.**

**Polish:**
- Student page h1 = the student's name. Fix "1 hints" (`views-teacher.js:441`).
- Plan and template h1 = the plan title. A new plan's back link reads "Back to Learning Plans".
- Moxie template → a "Courses" group.
- Maine Tech Sampler: fix the count text (7, not "five"), and drop "No devices needed" from combined equipment lists.
- `#/moxie`: "Grades: pending a pilot".
- Dashboard: show Checks once, with one "Classes" label.
- `#/teach/checks`: fold "How checks work" after the first visit. "· no challenge" → "didn't try Go deeper".
- `#/activities/<category>`: "All activities" for educators.
- `#/plans` with only older single assignments: say so instead of showing the empty state.
- Pattern Machine level 1 at 1366×650: bring "Need a hint?" above the fold (add it to `test_chromebook.py`).

### B. Plans and access in the browser (behind a flag, no enforcement yet)
- **`assets/js/access.js`** (new, after `content.js`):
  - `SE.access.plan(user)` → `none | family | educator`;
  - `isFree(a)`, `canOpen(a, user)`, `canOpenLab(labId, level, user)`;
  - `canTeach(user)` (Educator) and `canFamily(user)` (Family or Educator);
  - `state()` → `{ plan, source, status, renewsAt, graceUntil }`;
  - `refresh()`, and `loadPaid()` / `loadLab(id)` (wired up in C).
  - It reads `STEM.tiers`. The flag `SE.access.enforced` stays `false` until C ships.
- **`SE.content.openable(a, user) = visibleTo && canOpen`.** Use it in:
  - library cards and the activity view (`views-library.js`);
  - the lab route (`lab-shell.js` `SE.views.lab`, which has no check today);
  - Moxie;
  - the plan picker, templates, and assign (`views-plans.js`).
- **Locked UI:**
  - `.card--locked` with a lock chip.
  - A locked activity page shows the title, summary, category, grades, and "What you'll learn". It has no steps, notes, or launch.
    - Guests and free accounts see **Subscribe**, which opens a choice of Family or Educator.
    - Students and children see "Ask your teacher" / "Ask a grown-up", with no prices.
  - Preview labs: locked level chips after level 1.
  - Templates: a lock, and "Use this template" → Subscribe (Educator).
  - A Family subscriber who tries a classroom feature sees "Upgrade to Educator".
- **Sign-up:** `#/signup` asks "I'm a parent or family" or "I'm an educator" and sets `account_kind`.
  - `store.js` `createEducator` **stops auto-creating a class**. A new account lands on Family or Dashboard with Subscribe and the sample class.
  - Update the CLAUDE.md line "After sign-up, a new educator lands on their class page."
- **Free-account gating:**
  - Dashboard: "Subscribe to make your classes".
  - Classes: Add a class → Subscribe.
  - "New Learning Plan" and "Add to a Learning Plan" → Subscribe.
  - `#/family`: Add a child → Subscribe.
- **New `assets/js/views-account.js`:**
  - `#/pricing` (public): two plan cards side by side.
    - **Family: $20/month or $200/year**, up to 4 children, every activity, XP and patches at home.
    - **Educator: $40/month or $400/year**, everything in Family plus classes, Learning Plans, checks, and tracking.
    - Also: "Schools: contact us" (mailto), and the policy links.
  - `#/account`: current plan, status, renewal or grace date, **Manage billing**, Subscribe, and Upgrade to Educator.
- **Menus** (update the CLAUDE.md wording section):
  - Guests: Home · Activities · Pricing.
  - Parents: Family · Activities · Account.
  - Educators: the current five, plus Account.
  - Home children: Home · Activities · My harbor.
- **Local mode for development:** `localStorage stem207.localPlan = none|family|educator`, settable on `#/account` in local mode only. Tests use it.

### C. Families
- **`store.js`** (local and cloud):
  - `createFamily()` (one per account, `kind: 'family'`, code generated as for classes);
  - `familyOf(user)`;
  - `addChild` (reuses `addStudents`, capped at 4);
  - child delete (reuses the existing student removal).
  - `student_state` / local `currentUser` carry `classKind`.
- **`game.js`:** with `classKind === 'family'`, a `mission_completed` with non-empty `evidence` text counts as a pass (the first per activity earns `baseXp` and `newSector`; repeats don't). Classroom rules are unchanged. Unit-test both.
- **Child views** (`views-student.js`, `views-library.js` debrief):
  - family wording ("grown-up");
  - the status after sending is "Done" (`statusFor` gains `done` for family);
  - no plans menu.
- **`#/family`** (`views-family.js`, new): child cards (rank, XP, patches, recent sends), Add a child, Print sign-in cards, and the family code. It reuses the login-card and Add-students modal code from `views-teacher.js`.
- **SQL** (in update-13):
  - `classes.kind` (`class` | `family`, default `class`);
  - `educators.account_kind`;
  - the 4-child trigger;
  - `student_state` returns `class.kind`.

### D. Enforcement (the real paywall)
- **`tools/build_bundles.js`** (Node, no dependencies):
  - It splits by `STEM.tiers` and writes `dist/public/`:
    - free records;
    - `catalog.js` stubs `{id, area, title, summary, grades, learn, labId, levelCount, locked:true}`;
    - free and preview labs;
    - an `index.html` with no paid tags.
  - It writes `dist/paid/<version>/`:
    - `activities.json`, `moxie.json`, `templates.json`, `deeper.json`;
    - `labs/*`, `img/moxie/*`, `starters/*`, `missions/**`.
  - It writes `dist/content_items.sql`.
  - Paid content is the same for Family and Educator; only templates and Moxie teacher tools are Educator-only.
- **Preview labs (8):** each is split into a public engine plus level 1, and a paid `labs/<id>-levels.js` that calls a new `SE.labs.extend(id, levels)`.
  - Files: `lab-coding.js`, `lab-blob.js`, `lab-gate.js`, `lab-chef.js`, `lab-vr.js`, `lab-ai.js`, `lab-engineering.js` (2 labs).
- **`SE.access.loadLab`:** a signed URL → fetch → a blob script that still calls `register`/`extend`; cached as a promise.
- **`loadPaid`:** merges paid records **in memory only**.
- **`supabase/update-13-paid.sql`** (the full SQL is pasted in the reply; also folded into `schema.sql`):
  - **Tables:** `billing_customers`, `subscriptions` (with `plan` family|educator), `access_grants` (with `plan`), `stripe_events`, `content_items`, `content_hits`, `site_admins`.
  - **Functions:** `plan_for(account)`, `plan_for_token(token)` (token → student → class → owner), and `my_access()`.
  - **RLS and triggers:**
    - `classes` insert: `kind='class'` needs educator; `kind='family'` needs family or educator, one per account. `is_demo` is exempt.
    - `students` insert: the class owner needs a plan (family capped at 4).
    - `pathways` / `pathway_assignments` / `assignments` need educator.
    - Paid ids (from `content_items`) need a plan.
    - Billing tables are written only by the service role.
  - **Founding grants:** every existing educator gets `founding` with plan `educator` until June 30, 2027. The Moxie pilot gets `pilot`.
- **Edge Function `content`:**
  - Accepts an account JWT or `x-student-token`, and checks the plan.
  - Returns the paid JSON (with an ETag) and signed Storage URLs (10 minutes).
  - Logs `content_hits` and rate-limits.
  - Storage: a private bucket `content`.
- **Deploy:** `.github/workflows/deploy.yml`:
  1. build;
  2. upload `dist/paid`;
  3. apply `content_items`;
  4. deploy `dist/public` to Pages.
  - `SUPABASE_SERVICE_ROLE_KEY` lives **only in Actions secrets**.
- **Single-file build:** `build_single_file.py` uses `dist/public` (free only).
- **Hardening:** an "All rights reserved" `LICENSE` and a CSP meta tag (`script-src 'self' blob:`).

### E. Stripe (test mode)
- **Products and prices:** "STEM 207 Family" ($20/month, $200/year) and "STEM 207 Educator" ($40/month, $400/year).
  - Env: `STRIPE_PRICE_FAMILY_MONTHLY|YEARLY` and `STRIPE_PRICE_EDUCATOR_MONTHLY|YEARLY`.
  - Each price carries metadata `plan: family|educator`.
- **Functions** follow the pattern `supabase/functions/<name>/handler.js` (`handle(req, deps)`) plus a thin Deno `index.ts`. The Node mock imports the handlers.
  - **`create-checkout-session`:** `{plan, interval}`, checked against the allowlist; the customer carries metadata `account_id`; `automatic_tax`; it returns to `#/account?checkout=done`.
  - **`customer-portal`:**
    - cancel;
    - switch between monthly and yearly;
    - **upgrade Family → Educator** (both prices are in the portal's product list, with proration);
    - card and invoices.
  - **`stripe-webhook`:**
    - verifies the signature and is idempotent (`stripe_events`);
    - handles `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, and `invoice.payment_failed`;
    - re-fetches the subscription and upserts `plan` from the price metadata;
    - sets `grace_until` 14 days out on failure.
- **User setup steps** (written out in the reply):
  1. Stripe test products and prices.
  2. Portal settings.
  3. The webhook endpoint.
  4. `supabase secrets set`.
  5. `supabase functions deploy`.
- **Going live:** swap the keys and price ids. This is blocked on the go-live gate.

### F. Owner page and manual school deals
- **`#/owner`**, for `site_admins` only (checked by an `is_site_admin()` RPC):
  - find an account by email;
  - add or end an `access_grants` row (plan, reason `school|comp|pilot`, end date, note such as "Lincoln Middle, invoice #…");
  - list subscribers and grants with their plan.
- **School process:** a Stripe invoice ($400 per teacher per year at the Educator rate, or your quote), then grant each teacher here.

## Go-live gate (business items; not code)
Merge `paid-site` → `main` only when **all** of these are true:
- The Coliseum / STEM 207, LLC merchant decision is made, and the live Stripe account and tax registration are set up.
- **These are published and linked on `#/pricing`, at sign-up, and in the footer:**
  - Terms of Service;
  - the privacy policy (COPPA for family accounts and parental consent wording; FERPA for schools; Stripe and Supabase listed as subprocessors);
  - the refund policy.
- Content rights are confirmed:
  - whether the Moxie permission covers **commercial** sale;
  - TeachEngineering for Session 13 (likely non-commercial only);
  - the outside platforms' terms.
  - **Also:** Family plans put outside-platform activities (Code.org, Scratch, Tinkercad, Teachable Machine) in front of children at home without a teacher. Check each platform's under-13 home-use account rules, and mark activities that need a grown-up to set up an account.
- The repo is private, with GitHub Pro covering Pages. The Pages source switches to "GitHub Actions" at merge.
- Founding grants are applied, and existing teachers are told.
- **Keep in mind:** everything pushed before now stays public in clones and forks. The paid tier's value grows from new content going forward.

## Critical files
- **Change:**
  - `assets/js/main.js` (redirects, titles, routes, menus), `core.js`, `content.js`, `store.js` (signup kind, families, local plan), `game.js` (family XP rule);
  - `views-library.js`, `views-student.js`, `views-plans.js`, `views-teacher.js`, `views-moxie.js`, `views-auth.js`;
  - `labs/lab-shell.js`, plus the 7 preview-lab files;
  - `data/activities.js`, `areas.js`, `progression.js`, `templates.js`;
  - `assets/css/styles.css`;
  - `index.html`, `tools/build_single_file.py`, `tools/list_domains.js` (Stripe domains);
  - `supabase/schema.sql`, `tests/backend/mock-supabase.js` (`/functions/v1/*`);
  - `CLAUDE.md`, `README.md`.
- **New:**
  - `assets/js/access.js`, `views-account.js`, `views-family.js`;
  - `tools/build_bundles.js`;
  - `supabase/update-13-paid.sql`;
  - `supabase/functions/{content,create-checkout-session,customer-portal,stripe-webhook,_shared}`;
  - `.github/workflows/deploy.yml`;
  - `LICENSE`.
- **Reuse:**
  - `SE.content.visibleTo/assignable` and `SE.labs.register`;
  - `SE.modal`;
  - `SE.home.upNext` (`own`/`suggested`);
  - `SE.game.statusFor`, `baseXp`, `trusted`;
  - the Add students modal and login cards (`views-teacher.js`);
  - `student_sign_in` / `student_state`;
  - the outbox in `store.js`;
  - `cloud.js` `rpc()` (add `fn()` for `/functions/v1`);
  - `installDemoCloud`.

## Verification
- **Per workstream:** narrow tests, then `tests/run.sh local` before each push to `paid-site`.
- **A:**
  - `test_classes.py`: no draft on visiting New, and tab titles.
  - `test_plans.py`: Moxie time pending.
  - A new `test_roles.py`: wrong-role redirects, and teacher notes hidden from guests.
  - `test_chromebook.py`: the Pattern Machine hint.
  - A wording test that greps visible strings for mission/expedition/pathway.
- **B / C:**
  - A new `test_access.py` matrix, for both `localPlan` values and the lapsed state:
    - Accounts: guest, free parent, free educator, Family, Educator, granted, lapsed, a classroom student, and a home child.
    - Items: a free activity, a paid activity, a full lab, a preview lab at levels 1 and 2, a template, Moxie, creating a class, creating a family, a 5th child, and assigning a plan.
  - A new `test_family.py`:
    - sign up as a parent, add 2 children, print cards;
    - a child signs in with the family code and pictures;
    - the child sends a reflection, and XP and rank go up **without** a Pass;
    - an empty reflection earns nothing;
    - a classroom student's send still earns nothing until Pass;
    - the family page shows the child's XP.
  - `test_batch8.py` / `test_batch10.py` stay green (the classroom rules didn't change).
  - `test_a11y.py` stays at 0 findings with the pricing, account, family, and locked pages.
- **D:**
  - `tests/site/test_paywall_bundle.py`: `dist/public` has no paid bodies, level files, Moxie text or images, or paid `teacherNotes`.
  - `tests/backend/test_entitlements.py` (cloud mock): the server refuses class, student, plan, and assign inserts by plan; enforces the 4-child cap; `content` serves only a plan holder; founding grants work.
- **E:**
  - Webhook tests: a real HMAC signature, a replay, out-of-order events, and the plan taken from price metadata.
  - Stripe test mode, end to end:
    1. sign up as a parent (browse only);
    2. Family monthly with card 4242;
    3. add a child;
    4. the child earns XP on a paid activity;
    5. upgrade to Educator in the portal, and classes unlock;
    6. cancel, and the account goes read-only.
  - Also yearly, and a failing card (4000 0000 0000 0341) leading to grace.
- **F:** a non-admin is refused by `#/owner` and its RPC. A grant unlocks, and an ended grant locks again.
- **Chromebook:** the pricing, account, and family pages at 1366×650.

## Out of scope for 2.0
Self-serve school seats and invites, trials, coupons, more than 4 children, an offline paid edition, parent review of home work (XP is automatic), and usage dashboards and sharing alerts beyond `content_hits` logging.
