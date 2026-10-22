# Categories and content status (categories-pathways Phase 2): the 3D Printing category and its five
# placeholders, unchanged library counts, educator-only drafts, and delivery/skills display, in local mode.
#   LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js
#   python3 tests/site/test_categories.py [url]
import asyncio, json, pathlib, sys
from playwright.async_api import async_playwright
S = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8767/")
BASE = json.loads((pathlib.Path(__file__).resolve().parent.parent / "fixtures" / "catalog-baseline.json").read_text(encoding="utf-8"))
R = []
def ok(n, c, x=""): R.append(bool(c)); print(("PASS " if c else "FAIL ") + n, x)
NOT_FOUND = "couldn’t find that page"
async def go(pg, h):
    await pg.goto(S + "#/library"); await pg.wait_for_timeout(150); await pg.goto(S + h); await pg.wait_for_timeout(450)
async def student(pg):
    await pg.goto(S + "#/signin/student"); await pg.wait_for_timeout(300)
    await pg.fill("#class-code", "MOOSE7"); await pg.click("#code-form button[type=submit]"); await pg.wait_for_timeout(400)
    await pg.click("text=Ava R."); await pg.wait_for_timeout(200)
    for x in ["pine", "lighthouse", "moon"]: await pg.click(f"[data-pic={x}]")
    await pg.wait_for_timeout(700)
async def educator(pg):
    await pg.evaluate("SE.store.signOut()"); await pg.wait_for_timeout(200)
    await pg.goto(S + "#/signin/educator"); await pg.wait_for_timeout(300); await pg.click("#fill-demo"); await pg.click("#edu-form button[type=submit]"); await pg.wait_for_timeout(800)

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    ctx = await b.new_context(viewport={"width": 1280, "height": 900}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(f"{pg.url}: {e}"))
    await pg.goto(S); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(400)
    await pg.evaluate("SE.store.startGuest()"); await go(pg, "#/")

    # Counts and ids are the baseline: nothing lost, nothing added by the placeholders.
    ok("library total is the baseline", await pg.evaluate("STEM.activities.length") == BASE["total"])
    ok("every baseline mission still resolves", await pg.evaluate(f"{json.dumps([m['id'] for m in BASE['missions']])}.every((id) => SE.activityById[id])"))
    ok("7 categories, 6 live", await pg.evaluate("STEM.areas.length === 7 && SE.liveAreas.length === 6"))
    ok("home shows 7 category cards", await pg.locator("a.area-card").count() == 7)
    ok("3D Printing card says Coming soon · 0 missions", "Coming soon · 0 missions" in await pg.inner_text("a.area-card--soon"))
    ok("topic filter has no 3D Printing option", await pg.locator('#f-area option[value="3d-printing"]').count() == 0)
    ok("the buoy hero still has 6 buoys", await pg.locator(".coast .buoy").count() == 6)

    # Guests and students never see placeholders.
    await go(pg, "#/area/3d-printing")
    t = await pg.inner_text("#app")
    ok("guest: 3D Printing says coming soon, lists no drafts", "Coming soon." in t and await pg.locator("#area-drafts").count() == 0)
    await go(pg, "#/activity/3d-printing-exercise-01")
    ok("guest: a placeholder is not found", NOT_FOUND in await pg.inner_text("#app"))
    await pg.evaluate("SE.store.signOut()"); await student(pg)
    await go(pg, "#/activity/3d-printing-exercise-02")
    ok("student: a placeholder is not found", NOT_FOUND in await pg.inner_text("#app"))
    await go(pg, "#/explore")
    ok("student: expedition map still renders", await pg.locator("#app svg").count() > 0)

    # Educators see the five drafts, labeled, and can't assign them.
    await educator(pg)
    await go(pg, "#/area/3d-printing")
    links = await pg.eval_on_selector_all("#area-drafts ~ * a, .draft-list a", "els=>els.map(e=>e.textContent)")
    ok("educator: exactly 5 placeholders, Exercise 1–5", links == [f"Exercise {n} — placeholder" for n in range(1, 6)], links)
    await go(pg, "#/activity/3d-printing-exercise-03")
    t = await pg.inner_text("#app")
    ok("educator: placeholder page says it has no content", "Exercise 3 — placeholder" in t and "no content yet" in t)
    ok("educator: no assign button on a placeholder", await pg.locator('[data-assign="3d-printing-exercise-03"]').count() == 0)
    ok("store refuses to assign a placeholder", await pg.evaluate("(() => { const c = SE.store.classesFor(SE.store.currentUser().id)[0]; const n = SE.store.assignmentsFor(c.id).length; SE.store.assign(c.id, ['3d-printing-exercise-01']); return SE.store.assignmentsFor(c.id).length === n; })()"))
    await go(pg, "#/teach/missions")
    ok("teacher Missions tab has no 3D Printing tab", "3D Printing" not in await pg.inner_text("#app"))

    # Optional metadata shows when set (set in memory for the check).
    await pg.evaluate("Object.assign(SE.activityById['lab-field-station'], { delivery: 'Browser 360° (not headset VR)', skills: ['observation'] })")
    await go(pg, "#/activity/lab-field-station")
    t = await pg.inner_text(".facts")
    ok("delivery and skills show in the facts", "Browser 360° (not headset VR)" in t and "Observation" in t)

    m = await ctx.new_page(); await m.set_viewport_size({"width": 390, "height": 844})
    await m.goto(S + "#/"); await m.wait_for_timeout(500)
    ok("phone: home has no sideways scroll", await m.evaluate("document.documentElement.scrollWidth") <= 390)
    await m.close()
    ok("no page errors", not errs, errs)
    print(f"\n{sum(R)}/{len(R)} passed"); await b.close()
asyncio.run(main())
