# STEM 207 PAID: free demo + paid tier (plan)

_Written October 23, 2026. Status: plan only, nothing built. Phase 0 decisions come first._

## Context
STEM 207 is built out: 56 published activities in 7 categories (11 in-site labs and 45 guides for outside platforms), 16 Moxie sessions, 9 Learning Plan templates, classes, checks, and rewards. The goal now is **revenue**. About 20% stays free as a public demo, and the rest is sold to educators and schools.

**Decided with the user:**
- **Buyers:** individual educators (card) **and** schools or districts (a multi-teacher license, paid by invoice or PO). Students never pay and never see prices.
- **Payments:** **Stripe** (Checkout, subscriptions, invoices, Customer Portal, Stripe Tax), run through Supabase Edge Functions.
- **Free tier:** a **sampler per category**:
  - 1–2 activities in each category;
  - 3 of the 11 labs in full, and level 1 of the others;
  - the read-only sample class.
  - Every title stays visible; paid items show as locked previews.
- **Protection:** a **private repo plus server delivery**. Paid content is served only to accounts with access.

**What exploration found (this shapes everything):**
- **All content is public JavaScript today.**
  - `index.html` loads every data file (`activities.js` 207KB, `moxie-content.js`, `templates.js`, …) and all 11 labs (about 349KB) as `<script>` tags.
  - Guests can open every activity and lab.
  - Local mode (an empty `config.js`) and `tools/build_single_file.py` run everything offline.
- **The repo is public, with no LICENSE.**
- **A private repo alone is not enough.** GitHub Pages serves every file in the published branch. The live site has to be deployed from a **built artifact** (GitHub Actions) that contains only free content.
- **There is no server code yet:** no Edge Functions, no org/school entity, and no billing fields.
  - The model is educators (Supabase Auth) → classes → students (class code + pictures → `student_sessions` token).
  - The database stores only ids and events; no RPC returns content.
- **What can be reused:**
  - `SE.content.visibleTo/assignable` (`assets/js/content.js`) already branches on role and assignment.
  - `SE.labs.register` (`lab-shell.js`) lets a lab file register itself whenever it loads.
  - `cloud.js` has `rpc()`/`rest()`.
  - `mock-supabase.js` runs real RLS on Postgres.

## Architecture (the recommendation)
```
                       PUBLIC (GitHub Pages, built by Actions)        PRIVATE (Supabase)
source repo (private) ─► tools/build_bundles.js ─┬─► dist/public: app code, free activities,     ─► Pages
                                                 │   catalog.js (teaser stubs for paid items),
                                                 │   3 full labs + level-1 lab engines
                                                 └─► dist/paid/<version>/: paid records (JSON),  ─► Storage bucket "content" (private)
                                                     paid labs/levels, Moxie, images, .sb3, missions   + content_items table (id, kind, tier)
browser ─► Edge Function `content` (educator JWT or student token) ─► has_paid_access() ─► paid JSON + 10-min signed URLs
Stripe ─► Edge Function `stripe-webhook` ─► subscriptions / organizations ─► has_paid_access()
```

## 1. The content split
- **One tier manifest:** `assets/js/data/tiers.js` (`STEM.tiers`) lists what's free:
  - activity ids;
  - labs as `full` or `1` (level 1 only);
  - template ids;
  - the sample class.
  - **Anything not listed is paid.** New content is locked by default.
  - Moxie is all paid (session 1 shows a teaser).
  - Starters, `missions/` packs, and Go deeper follow their activity's tier.
- **The build tool:** `tools/build_bundles.js` (Node, no dependencies).
  - It loads the data scripts in a `vm` sandbox and splits them by tier.
  - It writes `dist/public/`:
    - the free records;
    - `catalog.js`, with stubs for paid items: `{id, area, title, summary, grades, duration, labId, levelCount, locked:true}`;
    - free labs and assets;
    - a rewritten `index.html` with no paid script tags.
  - It writes `dist/paid/<version>/`:
    - `activities.json` (with `teacherNotes`);
    - `moxie.json`, `templates.json`, `deeper.json`;
    - `labs/*.js`, `img/moxie/*`, `starters/*`, and `missions/**`.
  - It writes `dist/content_items.sql`.
  - Authoring doesn't change: the source `index.html` still runs everything locally.
- **Deploy:** `.github/workflows/deploy.yml`:
  1. build;
  2. upload `dist/paid` to Storage and sync `content_items`;
  3. deploy `dist/public` to Pages.
  - The Pages source becomes "GitHub Actions".
  - **The `SUPABASE_SERVICE_ROLE_KEY` lives only in Actions secrets**, never in the repo. This keeps CLAUDE.md's no-secrets rule.
- **Paid labs load on demand:**
  - In `SE.views.lab`, a miss on a catalog stub calls `SE.access.loadLab(id)`.
  - That fetches a signed URL from `content`, then injects the script from a blob URL.
  - The file still calls `SE.labs.register`, and the view re-renders. Loads are cached as a Map of promises.
- **Level-1 previews (8 labs):**
  - Levels are defined inline in each lab file, so each preview lab is split:
    - a public engine plus level 1;
    - a paid `labs/<id>-levels.js` that calls a new `SE.labs.extend(id, levels)`.
  - Trade-off: the engine code is public, while the puzzles, hints, and checks for levels 2+ stay private.
  - Fallback: make the whole lab paid and show a static preview.

## 2. Who has access: `supabase/update-13-billing.sql`
- **Tables:**
  - `organizations` (school or district, `stripe_customer_id`, `seat_limit`, status);
  - `org_members` (admin or teacher; invited, active, or removed; a hashed invite token);
  - `billing_customers`;
  - `subscriptions` (educator **or** org; plan, status, seats, `current_period_end`, `trial_end`, `grace_until`);
  - `access_grants` (trial, founding, comp, pilot, or coliseum; with start and end dates);
  - `stripe_events` (for idempotency);
  - `content_items`;
  - `quote_requests`;
  - `content_hits`.
- **Functions** (SECURITY DEFINER, with a pinned `search_path`):
  - `has_paid_access(educator)`: true for an active or trialing subscription, past_due within grace, an active org membership whose org has one of those, or a valid grant.
  - `access_for_token(token)` follows the path token → student → class → educator.
  - `my_access()` gives the UI the tier, source, trial or grace end, org, and role.
  - `student_state` adds `access`, re-declared from update-10.
- **RLS:** an educator reads only their own billing rows, and an org admin reads their org's. **Only the service role writes billing tables** (through the webhook).
- **Lifecycle:**
  - **Trial:** an `access_grants` row is created at signup, with no card needed. The length is a business decision.
  - **Failed payment:** 14 days of grace, while Stripe retries.
  - **Lapse = read-only, never delete.**
    - Students still sign in and see their work and certificates. Paid steps say "Not available right now. Ask your teacher." with no prices.
    - Teachers keep rosters, checks on work already sent, messages, and an export. They can't assign or open paid content.
- **Server-side guards:** a trigger on `pathway_versions` / `pathway_assignments` and the assignment inserts refuses paid activity ids (checked against `content_items`) unless `has_paid_access`.
  - Plan snapshots hold step ids and teacher notes only, never activity bodies (add a test for this).

## 3. Edge Functions (`supabase/functions/`)
**Structure:** each function is a plain-JS `handler.js` (`handle(req, deps)`) with a thin Deno `index.ts`. The Node mock can import the same handler.
- `_shared/` holds stripe, access, cors, and ratelimit.
- `config.toml`: `verify_jwt=false` only for `stripe-webhook`, `content`, and `school-quote`, which handle auth themselves.

**The functions:**
- **`create-checkout-session`:**
  - Needs the educator's JWT. The plan maps to a price id through an environment allowlist.
  - It gets or creates the customer (metadata `educator_id`) and uses subscription mode with `automatic_tax`.
  - It returns to `#/account?checkout=done`.
- **`customer-portal`:** a portal URL for the educator, or for an org admin.
- **`stripe-webhook`:**
  - Verifies the signature on the raw body.
  - Inserts into `stripe_events` on conflict do nothing, which makes repeats idempotent.
  - On `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`, and `quote.accepted`, it **re-fetches the subscription from Stripe** (safe against out-of-order events), upserts it, and marks it processed.
- **`content`:**
  - Accepts an educator JWT or an `x-student-token`, and checks access.
  - Returns the paid JSON (with an ETag/version) and signed URLs (10 minutes).
  - Logs `content_hits` and rate-limits each account.
- **`school-quote`:**
  - **Phase A:** a form saves `quote_requests` and emails you. You send a Stripe Quote or invoice (net 30, PO number in metadata), and the webhook turns on the org.
  - **Phase B:** the quote is created automatically.
- **`org-invite` / `accept-invite`:** the admin invites teachers by email. The seat limit is checked in the function and by a trigger. The invite token is single-use and binds to `auth.uid()`.

## 4. Client changes
- **New `assets/js/access.js`**, loaded after `content.js`:
  - `SE.access.{tierOf, state, refresh, canOpen(a,user), canOpenLab(id,level,user), loadPaid(), loadLab(id)}`.
  - `loadPaid()` merges paid records into `STEM.activities` / `SE.activityById` **in memory only**.
  - Add `SE.content.openable = visibleTo && canOpen`, used by the library, Moxie, plans, and lab views. Today labs skip `visibleTo` entirely.
- **`core.js`:** merge the `catalog.js` stubs into `SE.activityById`, flagged `locked`.
- **`views-library.js`:**
  - `.card--locked` cards with a lock badge.
  - A locked activity page shows the title, summary, category, and grades.
    - Educators and guests see an upsell.
    - Students see "Ask your teacher".
- **New `views-account.js`:**
  - `#/pricing` (public);
  - `#/account` (plan, status, trial and grace banners, Manage billing, school seats and invites);
  - `#/school` (the quote form).
- **Where upsells appear:** locked cards, the win panel after a free lab's level 1, template cards, and the Dashboard banner. **Never on student screens.**
- **`views-plans.js`:** paid templates and steps show a lock. Publishing or assigning paid steps is blocked in the UI, and also by the server trigger.
- **Guests** get the free tier only. **Local mode and the single-file build** use `dist/public`, so they're automatically free-only.
- **Menus:** educators gain Account; guests gain Pricing. The CLAUDE.md wording section is updated.

## 5. Security, abuse, and sharing
- The boundary is the server: there are no paid bytes on Pages, Storage is private, and the triggers block paid assignments.
- Anything an entitled browser receives can be copied. Mitigations: short signed URLs, per-account logs and anomaly alerts, and the Terms of Service.
- **Account sharing:** an individual plan has caps (for example 5 classes and 150 students). Student tokens are limited by roster size.
- Add an "All rights reserved" `LICENSE` now. Add a CSP `script-src 'self' blob:`.

## 6. Business and legal before charging (flagged; these are your decisions, not code)
- **STEM Coliseum:** STEM 207 is offered exclusively through Coliseum. Who is the merchant of record, whose Stripe account is used, what's the revenue split, and does the Odoo store also sell it?
- **Prices:** the individual plan price, school seat tiers, and trial length.
- **Policies:** Terms of Service, privacy policy, refund policy, COPPA (school consent), FERPA, Maine student-privacy agreements (SDPC/NDPA), with Stripe and Supabase listed as subprocessors.
- **Tax:** Stripe Tax registration and nexus, and school tax-exempt certificates.
- **Content rights:**
  - Does the Moxie sheet permission (October 22, 2026) cover **commercial** sale?
  - Session 13 is based on TeachEngineering, which is likely licensed for non-commercial use only. Check this.
  - Check the terms of the outside platforms the guides point to.
- **What's already out:** everything pushed so far stays public through clones, forks, and archives, so making the repo private protects only future content. Check forks with `gh api repos/mattjones1/stem_207/forks`. Put new paid value into the paid tier going forward.

## 7. Migration of today's users
- Every existing educator gets a `founding` grant (for example, until June 30, 2027). Moxie pilot schools get `pilot` grants. No live class breaks on switch-over day.

## 8. Phases
| Phase | Ships | Paywall real? |
|---|---|---|
| 0 Decide | Coliseum/merchant terms, prices, policies, content-rights check, LICENSE, GitHub Pro, the free list in `tiers.js` (draft for your review) | — |
| 1 Look | `access.js`, catalog stubs, locked cards and pages, pricing page. Behind a flag, everyone is treated as entitled. | No |
| 2 Enforce | `build_bundles.js`, Actions deploy, private bucket, the `content` function, update-13 (grants plus `content_items`), lab lazy-loading and `SE.labs.extend`, founding grants, **repo goes private** | **Yes** |
| 3 Sell to teachers | Checkout, portal, webhook, trial, grace, `#/account` | Yes |
| 4 Sell to schools | Orgs, quotes and invoices, seats, invites | Yes |
| 5 Harden | Rate limits, sharing alerts, usage dashboard | Yes |

Phases 2 and 3 can ship together if you want to charge on day one. Phase 2 alone already protects the content, with access granted by hand.

## Critical files
- **Change:**
  - `assets/js/content.js`, `core.js`, `labs/lab-shell.js` (`loadLab`, `extend`);
  - `views-library.js`, `views-plans.js`, `views-moxie.js`, `views-auth.js` (guest), `main.js` (routes, menus);
  - `store.js` (`student_state.access`);
  - `index.html`, `tools/build_single_file.py`;
  - `supabase/schema.sql` (fold update-13 in);
  - `tests/backend/mock-supabase.js`;
  - `CLAUDE.md`, `README.md`.
  - The 8 preview labs (`lab-ai.js`, `lab-vr.js`, …) are split into an engine plus levels.
- **New:**
  - `assets/js/data/tiers.js`, `assets/js/access.js`, `assets/js/views-account.js`;
  - `tools/build_bundles.js`;
  - `.github/workflows/deploy.yml`;
  - `supabase/update-13-billing.sql`;
  - `supabase/functions/{content,stripe-webhook,create-checkout-session,customer-portal,school-quote,org-invite,accept-invite,_shared}`;
  - `LICENSE`.

## Verification
- **`tests/site/test_paywall_bundle.py`:** `dist/public` contains no paid id's body, no paid lab file or levels, no `teacherNotes`/steps of paid records, no Moxie text, and no `img/moxie`.
- **`tests/backend/test_entitlements.py`:** a matrix where the client (`SE.access`) and the server must agree.
  - Accounts: guest, free educator, trial, active, past_due in grace, past grace, canceled, org teacher, removed member, and a student of each.
  - Items: free activity, paid activity, full lab, preview lab level 1 and level 2, Moxie, paid template.
  - Also: the assignment trigger refuses paid ids without access.
- **Mock:** `mock-supabase.js` serves `/functions/v1/*` by importing the `handler.js` modules, with a fake Stripe client and a local folder as Storage.
- **Webhook tests:** a real HMAC signature with a test secret, a replayed event, and `updated` arriving before `created`.
- **Staging:** Stripe test mode with `stripe trigger`, and the end-to-end flow: sign up → trial → checkout → paid lab loads → cancel → read-only.
- **Existing suites:** `tests/run.sh all` stays green, with the free/paid split applied in the tests' fixtures. `test_a11y.py` stays at 0 findings with the locked cards and the pricing and account pages.
- **SQL:** every update-13 change is pasted in full in the reply, per the user's standing preference.
