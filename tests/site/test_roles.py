# Pages for another role: a guest or student who opens a teacher (or student-only) page is sent somewhere useful
# with a reason, never to the educator sign-in while signed in. Also: teacher notes are for educators only, Moxie
# says why it's closed, blank Learning Plan drafts don't pile up, and every teacher page has its own tab title.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js ; python3 tests/site/test_roles.py [url]
import asyncio, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
async def go(pg, h, wait=500):
    await pg.goto(S + "#/activities"); await pg.wait_for_timeout(150); await pg.goto(S + h); await pg.wait_for_timeout(wait)
async def toast(pg):
    return await pg.evaluate("[...document.querySelectorAll('.toast')].map(t => t.textContent).join(' ')")

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    pg = await b.new_page(viewport={"width": 1366, "height": 650})
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)

    # Guest
    await pg.evaluate("SE.store.startGuest()")
    await go(pg, "#/plans")
    ok("guest at My Learning Plans goes to the student sign-in, with a reason", pg.url.endswith("#/signin/student") and "Sign in to see your Learning Plans" in await toast(pg), pg.url)
    for h, word in [("#/me", "profile"), ("#/base", "harbor")]:
      await go(pg, h)
      ok(f"guest at {h} goes Home and is told why", pg.url.endswith("#/") and word in await toast(pg), pg.url)
    await go(pg, "#/activity/robot-maze-mission")
    ok("guest doesn't see teacher notes", await pg.locator(".teacher-notes").count() == 0)
    await go(pg, "#/moxie")
    ok("guest at Moxie sees what it is, not 'not found'", "Moxie: build with an ESP32" in await pg.inner_text("#app") and "couldn’t find" not in await pg.inner_text("#app"))

    # Student
    await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(300)
    await go(pg, "#/signin/student", 300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(800)
    for h in ["#/teach", "#/teach/checks", "#/moxie/teach"]:
      await go(pg, h)
      ok(f"student at {h} goes Home with 'That page is for teachers.', menu kept", pg.url.endswith("#/") and "for teachers" in await toast(pg) and await pg.locator("#site-nav a").count() > 0, pg.url)
    await go(pg, "#/activity/sort-the-catch")
    ok("student doesn't see teacher notes", await pg.locator(".teacher-notes").count() == 0)
    await go(pg, "#/moxie")
    ok("student at Moxie (not assigned) is told the teacher opens it", "Your teacher will open Moxie" in await pg.inner_text("#app"))

    # Educator
    await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(300)
    await go(pg, "#/signin/educator", 300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(900)
    await go(pg, "#/activity/sort-the-catch")
    ok("educator sees teacher notes", await pg.locator(".teacher-notes").count() == 1)
    n0 = await pg.evaluate("SE.store.pathwaysFor(SE.store.currentUser().id).length")
    for _ in range(2):
      await go(pg, "#/teach/plans/new"); await go(pg, "#/teach")
    await go(pg, "#/teach/plans")
    ok("visiting New Learning Plan again reuses the blank draft (one, not a pile)", await pg.evaluate("SE.store.pathwaysFor(SE.store.currentUser().id).length") == n0 + 1)
    await go(pg, "#/teach/plans/new")
    ok("a new plan's back link goes to Learning Plans", "Back to Learning Plans" in await pg.inner_text(".pw-back"))
    await pg.fill("#pw-name", "Room 4 Plan"); await pg.wait_for_timeout(900)
    await go(pg, "#/teach/plans")
    ok("a plan the educator named is kept", await pg.evaluate("SE.store.pathwaysFor(SE.store.currentUser().id).some(p => p.title === 'Room 4 Plan')"))
    titles = {}
    cid = await pg.evaluate("SE.store.classesFor(SE.store.currentUser().id)[0].id")
    for h in ["#/teach", "#/teach/classes", "#/teach/checks", "#/teach/plans", f"#/teach/classes/{cid}"]:
      await go(pg, h, 400); titles[h] = await pg.title()
    ok("teacher pages each have their own tab title", len(set(titles.values())) == len(titles) and not any("Educator dashboard" in t for t in titles.values()), titles)
    await go(pg, "#/teach/plans/tpl-moxie")
    ok("Moxie template: time pending, never 'null min'", "null" not in await pg.inner_text("#app") and "Time pending" in await pg.inner_text("#app"))
    ok("Moxie template's title is the page heading", "Moxie" in await pg.inner_text("#app h1"))

    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
