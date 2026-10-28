# Who can open what (assets/js/access.js, planning/STEM 207 PAID.md): guests and free accounts get the free
# tier (data/tiers.js) and level 1 of every lab; a Family or Educator plan opens everything; only the
# Educator plan makes classes and Learning Plans; students get their class owner's plan; students never
# see prices. Local mode, plans simulated on #/account.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_access.py [url]
import asyncio, sys, time
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, h, wait=500):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(120); await pg.goto(S + h); await pg.wait_for_timeout(wait)
FREE, PAID, FULL_LAB, PREVIEW_LAB = "sort-the-catch", "loop-dance", "dance-party", "rover"

async def opens(pg):
    return await pg.locator(".locked__box").count() == 0 and "couldn’t find" not in await pg.inner_text("#app")
async def lab_open(pg, lab, level):
    await go(pg, f"#/lab/{lab}/{level}", 800); return await pg.locator(".lab-locked").count() == 0

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    pg = await b.new_page(viewport={"width": 1366, "height": 650})
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    ok("the free tier is loaded (11 activities)", await pg.evaluate("SE.access.tiers.activities.length") == 11)

    # Guest: free tier only
    await pg.evaluate("SE.store.startGuest()")
    await go(pg, f"#/activity/{FREE}"); ok("guest: free activity opens", await opens(pg))
    await go(pg, f"#/activity/{PAID}"); ok("guest: paid activity is locked, with See plans", await pg.locator(".locked__box").count() == 1 and await pg.locator('.locked__box a[href="#/pricing"]').count() == 1)
    ok("guest: the locked page has no steps or teacher notes", await pg.locator("#s-steps, .teacher-notes, #s-launch").count() == 0)
    ok("guest: full lab, every level", await lab_open(pg, FULL_LAB, 6))
    ok("guest: preview lab level 1 opens", await lab_open(pg, PREVIEW_LAB, 1))
    ok("guest: preview lab level 2 is locked", not await lab_open(pg, PREVIEW_LAB, 2))
    await go(pg, "#/activities/coding")
    ok("guest: cards say Free or show a lock", await pg.locator(".free-tag").count() >= 1 and await pg.locator(".lock-tag").count() >= 1)
    ok("guest menu has Pricing", "Pricing" in await pg.inner_text("#site-nav"))
    await go(pg, "#/pricing")
    t = await pg.inner_text("#app")
    ok("pricing: Family $200/year and Educator $400/year", "$200" in t and "$400" in t)
    await pg.click("[data-interval=month]"); await pg.wait_for_timeout(200)
    t = await pg.inner_text("#app")
    ok("pricing monthly: $20 and $40", "$20" in t and "$40" in t)
    ok("pricing: no per-activity purchase", "per activity" not in t.lower() or "nothing to buy one activity" in t.lower())

    # Free educator: browse only
    await pg.evaluate("localStorage.removeItem('stem207:session')")
    await go(pg, "#/signup", 300)
    await pg.fill("#su-name", "Mr. Free"); await pg.fill("#su-email", f"free{int(time.time())}@school.org"); await pg.fill("#su-pw", "Harbor2077"); await pg.fill("#su-pw2", "Harbor2077")
    await pg.click("#su-form button[type=submit]"); await pg.wait_for_timeout(800)
    ok("free educator lands on the Dashboard, no class made", pg.url.endswith("#/teach") and await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id).length") == 0)
    ok("free educator sees the Educator plan pitch", "Educator plan" in await pg.inner_text("#app") and await pg.locator("#new-class").count() == 0)
    await go(pg, "#/teach/classes"); ok("free educator: no Add a class form", await pg.locator("#new-class").count() == 0)
    await go(pg, "#/teach/plans/new"); ok("free educator: New Learning Plan goes to Pricing", pg.url.endswith("#/pricing"))
    await go(pg, f"#/activity/{PAID}"); ok("free educator: paid activity is locked", await pg.locator(".locked__box").count() == 1)
    await go(pg, f"#/activity/{FREE}"); ok("free educator: Add to a Learning Plan says Educator plan", "part of the Educator plan" in await pg.inner_text(".plan-picker"))
    ok("free educator menu chip says Free account", "Free account" in await pg.inner_text("#site-nav"))

    # Family plan: content opens, classes don't
    await go(pg, "#/account"); await pg.click("[data-sim=family]"); await pg.wait_for_timeout(300)
    await go(pg, f"#/activity/{PAID}"); ok("Family plan: paid activity opens", await opens(pg))
    ok("Family plan: preview lab level 2 opens", await lab_open(pg, PREVIEW_LAB, 2))
    await go(pg, "#/teach/classes"); ok("Family plan: still no classes", await pg.locator("#new-class").count() == 0)
    await go(pg, "#/pricing"); ok("Family plan: pricing offers Upgrade to Educator", "Upgrade to Educator" in await pg.inner_text("#app"))

    # Educator plan: classes and plans
    await go(pg, "#/account"); await pg.click("[data-sim=educator]"); await pg.wait_for_timeout(300)
    await go(pg, "#/teach/classes"); ok("Educator plan: Add a class", await pg.locator("#new-class").count() == 1)
    await pg.fill("#nc-name", "Room 7"); await pg.click("#new-class button[type=submit]"); await pg.wait_for_timeout(500)
    ok("Educator plan: the class is made", "#/teach/classes/" in pg.url)
    await go(pg, "#/teach/plans/new"); ok("Educator plan: New Learning Plan opens the editor", pg.url.endswith("/edit"))
    cid = await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].id")
    sid = await pg.evaluate(f"SE.store.addStudent('{cid}', {{ displayName: 'Kai M.', gradeBand: '4-5' }}).student.id")
    ok("student's plan comes from the class owner (Educator)", await pg.evaluate(f"SE.access.plan({{ role: 'student', cls: SE.store.classById('{cid}') }})") == "educator")
    await go(pg, "#/account"); await pg.click("[data-sim=none]"); await pg.wait_for_timeout(300)
    ok("a lapsed owner's student is back to the free tier", await pg.evaluate(f"!SE.access.canOpen(SE.activityById['{PAID}'], {{ role: 'student', cls: SE.store.classById('{cid}') }})"))
    ok("a lapsed educator keeps the class (read-only, never deleted)", await pg.evaluate(f"!!SE.store.classById('{cid}') && SE.store.studentsIn('{cid}').length === 1"))
    await go(pg, "#/teach"); ok("lapsed: Dashboard says read-only", "read-only" in await pg.inner_text("#app"))

    # Founding educators (accounts from before plans) keep full access; their students too.
    await pg.evaluate("localStorage.removeItem('stem207:session')")
    await go(pg, "#/signin/student", 300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    await go(pg, f"#/activity/{PAID}"); ok("founding educator's student opens paid content", await opens(pg))
    await go(pg, "#/pricing"); ok("students never see Pricing", not pg.url.endswith("#/pricing"))
    ok("student cards never show prices", "$" not in await pg.inner_text("#app"))

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
